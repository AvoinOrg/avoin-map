// Build step for the non-destructive temp-folder pipeline:
// - Reads the temp workspace path created by prebuildFolderPruneTmp.js
// - Generates public assets in the temp workspace
// - Runs the TanStack Start production build there
// - Copies .output, public/files, and public/lib back into the real workspace
// - Cleans up the temp workspace unless BUILD_TMP_KEEP is set

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const projectRoot = path.join(__dirname, '..', '..')
const statePath = path.join(projectRoot, '.applet-build-tmp.json')

const KEEP_TMP =
  process.env.BUILD_TMP_KEEP === 'true' || process.env.BUILD_TMP_KEEP === '1'

const REQUIRED_OUTPUT_PATHS = [
  path.join('.output', 'server', 'index.mjs'),
  path.join('.output', 'public'),
  path.join('.output', 'public', 'assets'),
  path.join('.output', 'public', '.vite', 'manifest.json'),
]

const TEXT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.map',
  '.mjs',
  '.txt',
])

const die = (msg) => {
  console.error(msg)
  process.exit(1)
}

const run = (cmd, args, opts) => {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts })
  if (res.status !== 0) {
    throw new Error(
      `Command failed: ${[cmd].concat(args).join(' ')} (exit ${res.status})`
    )
  }
}

const readBuildState = () => {
  if (!fs.existsSync(statePath)) {
    die(
      `buildFromFolderPruneTmp: missing ${statePath}. Run the prebuild step first (or just run \`yarn build\`).`
    )
  }

  const raw = fs.readFileSync(statePath, 'utf8')
  const state = (() => {
    try {
      return JSON.parse(raw)
    } catch {
      die(`buildFromFolderPruneTmp: invalid state JSON in ${statePath}`)
    }
  })()

  const tmpRoot = state?.tmpRoot
  if (typeof tmpRoot !== 'string' || tmpRoot.trim() === '') {
    die(`buildFromFolderPruneTmp: invalid tmp state in ${statePath}`)
  }

  if (!fs.existsSync(tmpRoot)) {
    die(
      `buildFromFolderPruneTmp: tmp workspace not found at ${tmpRoot}. Re-run the prebuild step.`
    )
  }

  if (
    !Array.isArray(state.compiledApplets) ||
    state.compiledApplets.length === 0 ||
    state.compiledApplets.some((applet) => typeof applet !== 'string')
  ) {
    die(
      `buildFromFolderPruneTmp: invalid compiled applet state in ${statePath}. Re-run the prebuild step.`
    )
  }

  return state
}

const getBuildEnv = ({ state, extra = {} }) => ({
  ...process.env,
  NEXT_PUBLIC_COMPILED_APPLETS: state.compiledApplets.join(','),
  ...extra,
})

const verifyStartOutputContract = (tmpRoot) => {
  const missing = REQUIRED_OUTPUT_PATHS.filter(
    (relativePath) => !fs.existsSync(path.join(tmpRoot, relativePath))
  )

  if (missing.length > 0) {
    die(
      `buildFromFolderPruneTmp: Start build output is missing required path(s): ${missing.join(
        ', '
      )}`
    )
  }
}

const copyGeneratedPublicBack = (tmpRoot) => {
  const fromPublic = path.join(tmpRoot, 'public')
  const toPublic = path.join(projectRoot, 'public')

  fs.mkdirSync(toPublic, { recursive: true })

  for (const sub of ['files', 'lib']) {
    const fromSub = path.join(fromPublic, sub)
    if (!fs.existsSync(fromSub)) {
      die(`buildFromFolderPruneTmp: missing generated public/${sub} in temp build`)
    }

    const toSub = path.join(toPublic, sub)
    fs.rmSync(toSub, { recursive: true, force: true })
    fs.cpSync(fromSub, toSub, { recursive: true })
  }
}

const copyStartOutputBack = (tmpRoot) => {
  const fromOutput = path.join(tmpRoot, '.output')
  const toOutput = path.join(projectRoot, '.output')

  fs.rmSync(toOutput, { recursive: true, force: true })
  fs.cpSync(fromOutput, toOutput, { recursive: true })
}

const isTextOutputFile = (filePath) => {
  const basename = path.basename(filePath)
  if (basename === 'manifest') return true

  return TEXT_EXTENSIONS.has(path.extname(filePath))
}

const rewriteTmpPathsInStartOutput = ({ tmpRoot }) => {
  const outputDir = path.join(projectRoot, '.output')
  if (!fs.existsSync(outputDir)) return

  let rewrittenFiles = 0
  let rewrittenSymlinks = 0

  const visit = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isSymbolicLink()) {
        const target = fs.readlinkSync(fullPath)
        if (!target.includes(tmpRoot)) continue

        const rewrittenTarget = target.split(tmpRoot).join(projectRoot)
        const relativeTarget = path.relative(
          path.dirname(fullPath),
          rewrittenTarget
        )

        fs.rmSync(fullPath, { force: true })
        fs.symlinkSync(relativeTarget, fullPath)
        rewrittenSymlinks += 1
        continue
      }

      if (entry.isDirectory()) {
        visit(fullPath)
        continue
      }

      if (!entry.isFile() || !isTextOutputFile(fullPath)) continue

      let text
      try {
        text = fs.readFileSync(fullPath, 'utf8')
      } catch {
        continue
      }

      if (!text.includes(tmpRoot)) continue

      fs.writeFileSync(fullPath, text.split(tmpRoot).join(projectRoot), 'utf8')
      rewrittenFiles += 1
    }
  }

  visit(outputDir)

  if (rewrittenFiles > 0) {
    console.log(
      `buildFromFolderPruneTmp: rewrote build-time tmp paths in ${rewrittenFiles} Start output file(s)`
    )
  }

  if (rewrittenSymlinks > 0) {
    console.log(
      `buildFromFolderPruneTmp: rewrote build-time tmp paths in ${rewrittenSymlinks} Start output symlink(s)`
    )
  }
}

const cleanup = (tmpRoot) => {
  if (KEEP_TMP) return
  fs.rmSync(tmpRoot, { recursive: true, force: true })
  fs.rmSync(statePath, { force: true })
}

const main = () => {
  const state = readBuildState()
  const tmpRoot = state.tmpRoot
  console.log(`buildFromFolderPruneTmp: tmp=${tmpRoot}`)

  try {
    run(process.execPath, ['utils/scripts/prepareGeneratedPublicAssets.js'], {
      cwd: tmpRoot,
      env: getBuildEnv({ state }),
    })

    run('yarn', ['start:build'], {
      cwd: tmpRoot,
      env: getBuildEnv({ state, extra: { NODE_ENV: 'production' } }),
    })

    verifyStartOutputContract(tmpRoot)
    copyStartOutputBack(tmpRoot)
    rewriteTmpPathsInStartOutput({ tmpRoot })
    copyGeneratedPublicBack(tmpRoot)
    cleanup(tmpRoot)
  } catch (e) {
    console.error(`buildFromFolderPruneTmp: failed: ${e.message}`)
    if (KEEP_TMP) {
      console.error(`buildFromFolderPruneTmp: keeping tmp folder: ${tmpRoot}`)
    } else {
      fs.rmSync(tmpRoot, { recursive: true, force: true })
      fs.rmSync(statePath, { force: true })
    }
    process.exit(1)
  }
}

main()
