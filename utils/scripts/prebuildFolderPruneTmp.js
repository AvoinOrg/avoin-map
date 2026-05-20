// Non-destructive prebuild step:
// - Copies the repo into a temp folder (excluding heavy/generated dirs)
// - Prunes applet folders in the temp copy based on NEXT_PUBLIC_COMPILED_APPLETS
// - Persists the temp folder path so `yarn build` can run in it

const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const projectRoot = path.join(__dirname, '..', '..')
const statePath = path.join(projectRoot, '.applet-build-tmp.json')

const KEEP_TMP =
  process.env.BUILD_TMP_KEEP === 'true' || process.env.BUILD_TMP_KEEP === '1'

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

const shouldCopy = (srcPath) => {
  const rel = path.relative(projectRoot, srcPath)
  if (rel === '') return true

  const parts = rel.split(path.sep)
  const top = parts[0]

  // Never copy dependencies or build outputs; we link node_modules instead.
  if (top === 'node_modules' || top === '.next' || top === '.git') return false

  // Yarn berry cache can be huge, not needed for a build.
  if (top === '.yarn' && parts[1] === 'cache') return false

  // Generated at build time via CopyPlugin (and gitignored).
  if (top === 'public') return false

  return true
}

const ensureSymlinkedNodeModules = (tmpRoot) => {
  const src = path.join(projectRoot, 'node_modules')
  const dst = path.join(tmpRoot, 'node_modules')

  if (!fs.existsSync(src)) {
    die(
      `prebuildFolderPruneTmp: node_modules not found at ${src}. Run install before building.`
    )
  }

  fs.symlinkSync(src, dst, 'dir')
}

const cleanupPreviousTmp = () => {
  if (!fs.existsSync(statePath)) return

  try {
    const prev = JSON.parse(fs.readFileSync(statePath, 'utf8'))
    if (prev && typeof prev.tmpRoot === 'string') {
      fs.rmSync(prev.tmpRoot, { recursive: true, force: true })
    }
  } catch {
    // ignore; we just want to avoid leaked tmp directories when possible
  }

  fs.rmSync(statePath, { force: true })
}

const main = () => {
  cleanupPreviousTmp()

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'avoin-map-build-'))
  console.log(`prebuildFolderPruneTmp: tmp=${tmpRoot}`)

  try {
    fs.cpSync(projectRoot, tmpRoot, { recursive: true, filter: shouldCopy })
    ensureSymlinkedNodeModules(tmpRoot)

    // Prune applet folders based on NEXT_PUBLIC_COMPILED_APPLETS.
    run(process.execPath, ['utils/scripts/prebuildFolderPrune.js'], {
      cwd: tmpRoot,
      env: process.env,
    })

    fs.writeFileSync(
      statePath,
      JSON.stringify({ tmpRoot }, null, 2),
      'utf8'
    )
  } catch (e) {
    console.error(`prebuildFolderPruneTmp: failed: ${e.message}`)
    if (KEEP_TMP) {
      console.error(`prebuildFolderPruneTmp: keeping tmp folder: ${tmpRoot}`)
    } else {
      fs.rmSync(tmpRoot, { recursive: true, force: true })
    }
    process.exit(1)
  }
}

main()
