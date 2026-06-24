const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')

const {
  refreshNitroPublicAssetMetadata,
} = require('./buildFromFolderPruneTmp')

const makeTempOutput = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'avoin-build-output-test-'))

const writeAsset = ({ root, relativePath, content }) => {
  const filePath = path.join(root, '.output', 'public', relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
  return filePath
}

const writeServerEntry = ({ root, source }) => {
  const serverEntryPath = path.join(root, '.output', 'server', 'index.mjs')
  fs.mkdirSync(path.dirname(serverEntryPath), { recursive: true })
  fs.writeFileSync(serverEntryPath, source, 'utf8')
  return serverEntryPath
}

const createStrongEntityTag = (data) => {
  if (data.length === 0) return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'

  const hash = crypto
    .createHash('sha1')
    .update(data, 'utf8')
    .digest('base64')
    .substring(0, 27)

  return `"${data.length.toString(16)}-${hash}"`
}

describe('buildFromFolderPruneTmp', () => {
  let tmpRoot

  afterEach(() => {
    if (tmpRoot) fs.rmSync(tmpRoot, { recursive: true, force: true })
    tmpRoot = undefined
  })

  it('refreshes Nitro public asset metadata after copied output rewrites', () => {
    tmpRoot = makeTempOutput()
    const jsAsset = writeAsset({
      root: tmpRoot,
      relativePath: path.join('assets', 'Cross-test.js'),
      content: 'console.log("/workspace/project")\n',
    })
    const textAsset = writeAsset({
      root: tmpRoot,
      relativePath: path.join('files', 'manifest.json'),
      content: '{"name":"Avoin"}\n',
    })

    const serverEntryPath = writeServerEntry({
      root: tmpRoot,
      source:
        'const Oy={"/assets/Cross-test.js":' +
        '{type:"text/javascript; charset=utf-8",etag:\'"old-js"\',' +
        'mtime:"2020-01-01T00:00:00.000Z",size:999,' +
        'path:"../public/assets/Cross-test.js"},' +
        '"/files/manifest.json":' +
        '{type:"application/json",etag:\'"old-json"\',' +
        'mtime:"2020-01-01T00:00:00.000Z",size:1,' +
        'path:"../public/files/manifest.json"}};export default Oy',
    })

    const result = refreshNitroPublicAssetMetadata({ serverEntryPath })
    const serverEntry = fs.readFileSync(serverEntryPath, 'utf8')
    const jsStat = fs.statSync(jsAsset)
    const textStat = fs.statSync(textAsset)

    expect(result).toEqual({ checkedAssets: 2, updatedAssets: 2 })
    expect(serverEntry).toContain(
      `etag:'${createStrongEntityTag(fs.readFileSync(jsAsset))}'`
    )
    expect(serverEntry).toContain(
      `mtime:${JSON.stringify(jsStat.mtime.toJSON())}`
    )
    expect(serverEntry).toContain(`size:${jsStat.size}`)
    expect(serverEntry).toContain(
      `etag:'${createStrongEntityTag(fs.readFileSync(textAsset))}'`
    )
    expect(serverEntry).toContain(
      `mtime:${JSON.stringify(textStat.mtime.toJSON())}`
    )
    expect(serverEntry).toContain(`size:${textStat.size}`)
  })

  it('fails clearly when Nitro metadata points at a missing public asset', () => {
    tmpRoot = makeTempOutput()
    const serverEntryPath = writeServerEntry({
      root: tmpRoot,
      source:
        'const Oy={"/assets/missing.js":' +
        '{type:"text/javascript; charset=utf-8",etag:\'"old"\',' +
        'mtime:"2020-01-01T00:00:00.000Z",size:999,' +
        'path:"../public/assets/missing.js"}};export default Oy',
    })

    expect(() => refreshNitroPublicAssetMetadata({ serverEntryPath })).toThrow(
      /Nitro public asset metadata references missing file/
    )
  })
})
