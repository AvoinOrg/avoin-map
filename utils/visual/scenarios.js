const appletConf = require('../../appletConf.json')
const {
  DEFAULT_MASK_SELECTORS,
  DEFAULT_WAIT_FOR_SELECTOR,
} = require('./constants')

const MAIN_APPLET = 'main'
const DEFAULT_MAIN_LOCALE = 'en'
const DEFAULT_SCENARIO_SET = 'root'
const MIGRATION_BASELINE_SCENARIO_SET = 'migration-baseline'
const SUPPORTED_SCENARIO_SETS = [
  DEFAULT_SCENARIO_SET,
  MIGRATION_BASELINE_SCENARIO_SET,
]

const parseCompiledApplets = (raw) =>
  String(raw || '')
    .toLowerCase()
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

const unique = (values) => Array.from(new Set(values))

const uniqueScenariosById = (scenarios) => {
  const seen = new Set()
  return scenarios.filter((scenario) => {
    if (seen.has(scenario.id)) {
      return false
    }
    seen.add(scenario.id)
    return true
  })
}

const getKnownApplets = () => Object.keys(appletConf)

const getCompiledApplets = ({ env = process.env } = {}) => {
  const parsed = parseCompiledApplets(env.NEXT_PUBLIC_COMPILED_APPLETS)
  const known = new Set(getKnownApplets())

  if (parsed.length === 0) {
    return getKnownApplets()
  }

  return unique(parsed.filter((name) => known.has(name)))
}

const isStandaloneAppletBuild = ({ env = process.env } = {}) => {
  const compiled = getCompiledApplets({ env })
  return compiled.length === 1 && compiled[0] !== MAIN_APPLET
}

const getAppletLocale = (applet) => {
  const langs =
    appletConf[applet] && Array.isArray(appletConf[applet].langs)
      ? appletConf[applet].langs
      : []

  if (applet === MAIN_APPLET && langs.includes(DEFAULT_MAIN_LOCALE)) {
    return DEFAULT_MAIN_LOCALE
  }

  return langs[0] || DEFAULT_MAIN_LOCALE
}

const joinUrl = ({ baseUrl, path }) => {
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/+$/, '')
  if (!normalizedBaseUrl) {
    return path
  }
  return `${normalizedBaseUrl}${path}`
}

const buildScenario = ({
  id,
  applet,
  locale,
  path,
  baseUrl,
  requiresWebGL = false,
  tags,
}) => ({
  id,
  applet,
  locale,
  path,
  url: joinUrl({ baseUrl, path }),
  requiresWebGL,
  waitFor: DEFAULT_WAIT_FOR_SELECTOR,
  maskSelectors: [...DEFAULT_MASK_SELECTORS],
  tags: tags || ['root', `applet:${applet}`],
})

const buildRootVisualScenarios = ({ env = process.env, baseUrl = '' } = {}) => {
  const compiled = getCompiledApplets({ env })
  const standalone = isStandaloneAppletBuild({ env })

  if (standalone) {
    const applet = compiled[0]
    const locale = getAppletLocale(applet)
    return [
      buildScenario({
        id: `${applet}-root`,
        applet,
        locale,
        path: `/${locale}`,
        baseUrl,
        requiresWebGL: true,
      }),
    ]
  }

  const scenarios = []

  if (compiled.includes(MAIN_APPLET)) {
    const locale = getAppletLocale(MAIN_APPLET)
    scenarios.push(
      buildScenario({
        id: 'main-root',
        applet: MAIN_APPLET,
        locale,
        path: `/${locale}`,
        baseUrl,
        requiresWebGL: true,
      })
    )
  }

  for (const applet of compiled) {
    if (applet === MAIN_APPLET) continue
    const locale = getAppletLocale(applet)
    scenarios.push(
      buildScenario({
        id: `${applet}-root`,
        applet,
        locale,
        path: `/${locale}/${applet}`,
        baseUrl,
        requiresWebGL: true,
      })
    )
  }

  return scenarios
}

const resolveScenarioSet = ({ env = process.env, scenarioSet } = {}) => {
  const resolved = String(
    scenarioSet || env.VISUAL_SCENARIO_SET || DEFAULT_SCENARIO_SET
  ).trim()

  if (!SUPPORTED_SCENARIO_SETS.includes(resolved)) {
    throw new Error(
      `Unsupported visual scenario set: ${resolved}. Supported sets: ${SUPPORTED_SCENARIO_SETS.join(
        ', '
      )}`
    )
  }

  return resolved
}

const isMigrationBaselineScenarioAvailable = ({ compiled, scenario }) => {
  if (scenario.applet === MAIN_APPLET) {
    return compiled.includes(MAIN_APPLET)
  }

  return compiled.includes(MAIN_APPLET) && compiled.includes(scenario.applet)
}

const buildMigrationBaselineVisualScenarios = ({
  env = process.env,
  baseUrl = '',
  rootScenarios,
} = {}) => {
  if (isStandaloneAppletBuild({ env })) {
    return rootScenarios
  }

  const {
    MIGRATION_BASELINE_EXTRA_SCENARIOS,
  } = require('./migrationBaselineScenarios')
  const compiled = getCompiledApplets({ env })
  const extraScenarios = MIGRATION_BASELINE_EXTRA_SCENARIOS.filter((scenario) =>
    isMigrationBaselineScenarioAvailable({ compiled, scenario })
  ).map((scenario) => buildScenario({ ...scenario, baseUrl }))

  return uniqueScenariosById([...rootScenarios, ...extraScenarios])
}

const buildVisualScenarios = ({
  env = process.env,
  baseUrl = '',
  scenarioSet,
} = {}) => {
  const resolvedScenarioSet = resolveScenarioSet({ env, scenarioSet })
  const rootScenarios = buildRootVisualScenarios({ env, baseUrl })

  switch (resolvedScenarioSet) {
    case DEFAULT_SCENARIO_SET:
      return rootScenarios
    case MIGRATION_BASELINE_SCENARIO_SET:
      return buildMigrationBaselineVisualScenarios({
        baseUrl,
        env,
        rootScenarios,
      })
    default:
      return rootScenarios
  }
}

module.exports = {
  DEFAULT_MAIN_LOCALE,
  DEFAULT_SCENARIO_SET,
  MAIN_APPLET,
  MIGRATION_BASELINE_SCENARIO_SET,
  SUPPORTED_SCENARIO_SETS,
  buildMigrationBaselineVisualScenarios,
  buildRootVisualScenarios,
  buildScenario,
  buildVisualScenarios,
  getCompiledApplets,
  getKnownApplets,
  isStandaloneAppletBuild,
  parseCompiledApplets,
  resolveScenarioSet,
}
