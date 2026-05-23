// Build step for the non-destructive temp-folder pipeline:
// - Reads the temp workspace path created by prebuildFolderPruneTmp.js
// - Runs `next build` in the temp workspace (with applet folders already pruned)
// - Copies build artifacts back into the real workspace (.next + public/files + public/lib)
// - Cleans up the temp workspace unless BUILD_TMP_KEEP is set

const fs = require('fs')
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

const readTmpRoot = () => {
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

  return tmpRoot
}

const copyArtifactsBack = (tmpRoot) => {
  const fromNext = path.join(tmpRoot, '.next')
  const toNext = path.join(projectRoot, '.next')

  if (!fs.existsSync(fromNext)) {
    die(`buildFromFolderPruneTmp: missing build output at ${fromNext}`)
  }

  fs.rmSync(toNext, { recursive: true, force: true })
  fs.cpSync(fromNext, toNext, { recursive: true })

  // Merge public outputs (only the generated subfolders are copied).
  const fromPublic = path.join(tmpRoot, 'public')
  if (!fs.existsSync(fromPublic)) return

  const toPublic = path.join(projectRoot, 'public')
  fs.mkdirSync(toPublic, { recursive: true })

  for (const sub of ['files', 'lib']) {
    const fromSub = path.join(fromPublic, sub)
    if (!fs.existsSync(fromSub)) continue

    const toSub = path.join(toPublic, sub)
    fs.rmSync(toSub, { recursive: true, force: true })
    fs.cpSync(fromSub, toSub, { recursive: true })
  }
}

const cleanup = (tmpRoot) => {
  if (KEEP_TMP) return
  fs.rmSync(tmpRoot, { recursive: true, force: true })
  fs.rmSync(statePath, { force: true })
}

const rewriteTmpPathsInNextOutput = ({ tmpRoot }) => {
  // Netlify's Next plugin reads tracing metadata from `.next` that can contain
  // absolute paths from the build-time working directory. Because we build in a
  // temp workspace, those paths would point to `/tmp/...` and break the plugin
  // after we clean up the temp folder.
  const nextDir = path.join(projectRoot, '.next')
  if (!fs.existsSync(nextDir)) return

  let rewrittenFiles = 0

  const visit = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const ent of entries) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        visit(full)
        continue
      }
      if (!ent.isFile()) continue
      if (!ent.name.endsWith('.json') && ent.name !== 'trace') continue

      let text
      try {
        text = fs.readFileSync(full, 'utf8')
      } catch {
        continue
      }

      if (!text.includes(tmpRoot)) continue
      fs.writeFileSync(full, text.split(tmpRoot).join(projectRoot), 'utf8')
      rewrittenFiles += 1
    }
  }

  visit(nextDir)

  if (rewrittenFiles > 0) {
    console.log(
      `buildFromFolderPruneTmp: rewrote build-time tmp paths in ${rewrittenFiles} .next json file(s)`
    )
  }
}

const main = () => {
  const tmpRoot = readTmpRoot()
  console.log(`buildFromFolderPruneTmp: tmp=${tmpRoot}`)

  try {
    run(
      process.execPath,
      [
        path.join(tmpRoot, 'node_modules', 'next', 'dist', 'bin', 'next'),
        'build',
        '--webpack',
      ],
      { cwd: tmpRoot, env: { ...process.env, NODE_ENV: 'production' } }
    )

    copyArtifactsBack(tmpRoot)
    rewriteTmpPathsInNextOutput({ tmpRoot })
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
