const fs = require('fs')
const os = require('os')
const path = require('path')
const appletConf = require('../../appletConf.json')
const {
  prepareGeneratedPublicAssets,
} = require('./prepareGeneratedPublicAssets')

const manifestApplets = Object.keys(appletConf)
const standaloneApplets = manifestApplets.filter((applet) => applet !== 'main')

const write = ({ root, relativePath, content = relativePath }) => {
  const filePath = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}

const makeProject = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'avoin-assets-test-'))
  write({
    root,
    relativePath: 'appletConf.json',
    content: JSON.stringify(appletConf),
  })
  write({ root, relativePath: path.join('src', 'public', 'shared.txt') })
  write({
    root,
    relativePath: path.join(
      'node_modules',
      'rtree-sql.js',
      'dist',
      'sql-wasm.wasm'
    ),
    content: 'wasm',
  })
  for (const applet of standaloneApplets) {
    write({
      root,
      relativePath: path.join('src', 'applets', applet, 'public', 'asset.txt'),
      content: applet,
    })
  }
  return root
}

describe('prepareGeneratedPublicAssets', () => {
  let roots = []

  afterEach(() => {
    for (const root of roots) fs.rmSync(root, { recursive: true, force: true })
    roots = []
  })

  it.each([
    [manifestApplets],
    ...standaloneApplets.map((applet) => [[applet]]),
  ])(
    'copies the selected asset plan for %p',
    (selection) => {
      const root = makeProject()
      roots.push(root)
      prepareGeneratedPublicAssets({ projectRoot: root, raw: selection })

      expect(fs.existsSync(path.join(root, 'public', 'files', 'shared.txt'))).toBe(
        true
      )
      expect(
        fs.readFileSync(path.join(root, 'public', 'lib', 'sql-wasm.wasm'), 'utf8')
      ).toBe('wasm')

      for (const applet of standaloneApplets) {
        const outputDir = appletConf[applet].publicFilesDir || applet
        const assetPath = path.join(
          root,
          'public',
          'files',
          outputDir,
          'asset.txt'
        )
        expect(fs.existsSync(assetPath)).toBe(selection.includes(applet))
      }
    }
  )

  it('rejects invalid selection before deleting existing generated assets', () => {
    const root = makeProject()
    roots.push(root)
    const sentinel = path.join(root, 'public', 'files', 'keep.txt')
    write({ root, relativePath: path.relative(root, sentinel), content: 'keep' })

    expect(() =>
      prepareGeneratedPublicAssets({ projectRoot: root, raw: 'main,unknown' })
    ).toThrow(/unknown applet/i)
    expect(fs.readFileSync(sentinel, 'utf8')).toBe('keep')
  })

  it('treats a missing selected applet public directory as a no-op', () => {
    const root = makeProject()
    roots.push(root)
    fs.rmSync(path.join(root, 'src', 'applets', 'energy', 'public'), {
      recursive: true,
      force: true,
    })

    expect(() =>
      prepareGeneratedPublicAssets({ projectRoot: root, raw: 'energy' })
    ).not.toThrow()
  })
})
