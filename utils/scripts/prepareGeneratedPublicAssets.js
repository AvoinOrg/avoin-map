// Generate public assets for the Start build from source-of-truth inputs.

const fs = require('fs')
const path = require('path')
const {
  getAppletSourceRoot,
  getCompiledAppletConfig,
} = require('./appletBuildConfig')

const copyDirectoryContents = ({ from, to }) => {
  if (!fs.existsSync(from)) return

  fs.mkdirSync(to, { recursive: true })
  fs.cpSync(from, to, { recursive: true })
}

const getPublicFilesDir = ({ appletConf, namespace }) =>
  appletConf[namespace]?.publicFilesDir || namespace

const createGeneratedPublicAssetPlan = ({ projectRoot, buildConfig }) => {
  const publicRoot = path.join(projectRoot, 'public')
  const filesOut = path.join(publicRoot, 'files')
  const libOut = path.join(publicRoot, 'lib')
  const appletsRoot = getAppletSourceRoot(projectRoot)

  return {
    filesOut,
    libOut,
    directoryCopies: [
      { from: path.join(projectRoot, 'src', 'public'), to: filesOut },
      ...buildConfig.compiledNonMain.map((namespace) => ({
        from: path.join(appletsRoot, namespace, 'public'),
        to: path.join(
          filesOut,
          getPublicFilesDir({ appletConf: buildConfig.appletConf, namespace })
        ),
      })),
    ],
    wasmFrom: path.join(
      projectRoot,
      'node_modules',
      'rtree-sql.js',
      'dist',
      'sql-wasm.wasm'
    ),
    wasmTo: path.join(libOut, 'sql-wasm.wasm'),
  }
}

const prepareGeneratedPublicAssets = ({
  projectRoot = process.cwd(),
  raw,
} = {}) => {
  const buildConfig = getCompiledAppletConfig({
    projectRoot,
    raw,
    scriptName: 'prepareGeneratedPublicAssets',
  })
  const plan = createGeneratedPublicAssetPlan({ projectRoot, buildConfig })

  if (!fs.existsSync(plan.wasmFrom)) {
    throw new Error(
      `prepareGeneratedPublicAssets: required WASM source is missing at ${plan.wasmFrom}`
    )
  }

  fs.rmSync(plan.filesOut, { recursive: true, force: true })
  fs.rmSync(plan.libOut, { recursive: true, force: true })

  for (const copy of plan.directoryCopies) {
    copyDirectoryContents(copy)
  }

  fs.mkdirSync(path.dirname(plan.wasmTo), { recursive: true })
  fs.copyFileSync(plan.wasmFrom, plan.wasmTo)

  console.log(
    `prepareGeneratedPublicAssets: generated public/files and public/lib for ${buildConfig.mode}`
  )

  return { buildConfig, plan }
}

const main = () => {
  try {
    prepareGeneratedPublicAssets()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  createGeneratedPublicAssetPlan,
  prepareGeneratedPublicAssets,
}
