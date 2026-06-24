// Generate public assets for the Start build from source-of-truth inputs.

const fs = require('fs')
const path = require('path')
const {
  getAppletSourceRoot,
  getCompiledAppletConfig,
} = require('./appletBuildConfig')

const projectRoot = process.cwd()
const publicRoot = path.join(projectRoot, 'public')
const filesOut = path.join(publicRoot, 'files')
const libOut = path.join(publicRoot, 'lib')

const die = (msg) => {
  console.error(msg)
  process.exit(1)
}

const copyDirectoryContents = ({ from, to }) => {
  if (!fs.existsSync(from)) return

  fs.mkdirSync(to, { recursive: true })
  fs.cpSync(from, to, { recursive: true })
}

const assertNoStaleUiApiCopySource = () => {
  const staleUiApiRoot = path.join(projectRoot, 'src', 'app', '(ui)')
  if (!fs.existsSync(staleUiApiRoot)) return

  die(
    `prepareGeneratedPublicAssets: found stale CopyPlugin API source at ${staleUiApiRoot}. Add an explicit Start-compatible API copy mechanism before building.`
  )
}

const main = () => {
  let buildConfig
  try {
    buildConfig = getCompiledAppletConfig({
      projectRoot,
      scriptName: 'prepareGeneratedPublicAssets',
    })
  } catch (error) {
    die(error.message)
  }

  assertNoStaleUiApiCopySource()

  fs.rmSync(filesOut, { recursive: true, force: true })
  fs.rmSync(libOut, { recursive: true, force: true })

  copyDirectoryContents({
    from: path.join(projectRoot, 'src', 'public'),
    to: filesOut,
  })

  const appletsRoot = getAppletSourceRoot(projectRoot)
  for (const namespace of buildConfig.compiledNonMain) {
    copyDirectoryContents({
      from: path.join(appletsRoot, namespace, 'public'),
      to: path.join(filesOut, namespace),
    })
  }

  const wasmFrom = path.join(
    projectRoot,
    'node_modules',
    'rtree-sql.js',
    'dist',
    'sql-wasm.wasm'
  )
  const wasmTo = path.join(libOut, 'sql-wasm.wasm')

  if (!fs.existsSync(wasmFrom)) {
    die(
      `prepareGeneratedPublicAssets: required WASM source is missing at ${wasmFrom}`
    )
  }

  fs.mkdirSync(path.dirname(wasmTo), { recursive: true })
  fs.copyFileSync(wasmFrom, wasmTo)

  console.log(
    `prepareGeneratedPublicAssets: generated public/files and public/lib for ${buildConfig.mode}`
  )
}

main()
