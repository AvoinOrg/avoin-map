const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const MAIN_APPLET = 'main'
const TEMP_WORKSPACE_MARKER = '.avoin-map-build-tmp.json'
const TEMP_WORKSPACE_ENV = 'AVOIN_MAP_PRUNE_TEMP_WORKSPACE'

const parseCompiledApplets = (raw) => {
  const seen = new Set()

  return (raw || '')
    .toLowerCase()
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item)) return false
      seen.add(item)
      return true
    })
}

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
  const compiledApplets = parseCompiledApplets(
    raw ?? process.env.NEXT_PUBLIC_COMPILED_APPLETS
  )

  if (compiledApplets.length === 0) {
    throw new Error(
      `${scriptName}: NEXT_PUBLIC_COMPILED_APPLETS is empty. Refusing to continue.`
    )
  }

  const unknown = compiledApplets.filter((applet) => !appletConf[applet])
  if (unknown.length > 0) {
    throw new Error(
      `${scriptName}: unknown applet(s) in NEXT_PUBLIC_COMPILED_APPLETS: ${unknown.join(
        ', '
      )}. Add them to appletConf.json or fix the env var.`
    )
  }

  const includesMain = compiledApplets.includes(MAIN_APPLET)
  const compiledNonMain = compiledApplets.filter(
    (applet) => applet !== MAIN_APPLET
  )

  if (!includesMain && compiledNonMain.length !== 1) {
    throw new Error(
      `${scriptName}: unsupported NEXT_PUBLIC_COMPILED_APPLETS=${JSON.stringify(
        compiledApplets.join(',')
      )}. Without "main", exactly one applet must be listed.`
    )
  }

  return {
    appletConf,
    compiledApplets,
    compiledNonMain,
    includesMain,
    keepOnlyApplet: includesMain ? null : compiledNonMain[0],
    selectedApplets: new Set(compiledNonMain),
    mode: includesMain ? 'main' : `standalone:${compiledNonMain[0]}`,
  }
}

module.exports = {
  MAIN_APPLET,
  TEMP_WORKSPACE_ENV,
  TEMP_WORKSPACE_MARKER,
  getAppletSourceRoot,
  getCompiledAppletConfig,
  loadProjectEnv,
  parseCompiledApplets,
}
