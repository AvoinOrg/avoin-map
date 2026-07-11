const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const {
  createAppletSelectionContract,
  normalizeAppletSelectionInput,
} = require('../../src/common/routing/appletSelectionContract/index.js')

const MAIN_APPLET = 'main'
const TEMP_WORKSPACE_MARKER = '.avoin-map-build-tmp.json'
const TEMP_WORKSPACE_ENV = 'AVOIN_MAP_PRUNE_TEMP_WORKSPACE'

const parseCompiledApplets = (raw) => normalizeAppletSelectionInput(raw)

const readAppletConf = (projectRoot) => {
  const appletConfPath = path.join(projectRoot, 'appletConf.json')

  try {
    return JSON.parse(fs.readFileSync(appletConfPath, 'utf8'))
  } catch (error) {
    throw new Error(
      `failed to read appletConf.json at ${appletConfPath}: ${error.message}`
    )
  }
}

const loadProjectEnv = (projectRoot) => {
  dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true })
}

const getAppletSourceRoot = (projectRoot) =>
  path.join(projectRoot, 'src', 'applets')

const resolveCompiledAppletConfig = ({
  appletConf,
  raw,
  scriptName = 'appletBuildConfig',
}) => {
  let selection
  try {
    selection = createAppletSelectionContract(appletConf).resolveStrictSelection(
      raw
    )
  } catch (error) {
    throw new Error(
      `${scriptName}: invalid NEXT_PUBLIC_COMPILED_APPLETS: ${error.message}`
    )
  }

  return {
    appletConf,
    compiledApplets: [...selection.compiledApplets],
    compiledNonMain: [...selection.selectedNonMainApplets],
    includesMain: selection.includesMain,
    isStandalone: selection.isStandalone,
    keepOnlyApplet: selection.standaloneApplet,
    selectedApplets: new Set(selection.selectedNonMainApplets),
    standaloneApplet: selection.standaloneApplet,
    mode: selection.mode,
  }
}

const getCompiledAppletConfig = (options = {}) => {
  const {
    projectRoot,
    raw,
    scriptName = 'appletBuildConfig',
  } = options

  if (!projectRoot) {
    throw new Error(`${scriptName}: projectRoot is required`)
  }

  loadProjectEnv(projectRoot)

  const appletConf = readAppletConf(projectRoot)
  return resolveCompiledAppletConfig({
    appletConf,
    raw: raw ?? process.env.NEXT_PUBLIC_COMPILED_APPLETS,
    scriptName,
  })
}

module.exports = {
  MAIN_APPLET,
  TEMP_WORKSPACE_ENV,
  TEMP_WORKSPACE_MARKER,
  getAppletSourceRoot,
  getCompiledAppletConfig,
  loadProjectEnv,
  parseCompiledApplets,
  readAppletConf,
  resolveCompiledAppletConfig,
}
