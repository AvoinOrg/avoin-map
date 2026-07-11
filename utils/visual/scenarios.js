const appletConf = require('../../appletConf.json')
const {
  createAppletSelectionContract,
} = require('../../src/common/routing/appletSelectionContract/index.js')
const { getRouteFolderForApplet } = require('../scripts/publicRoutes')
const {
  DEFAULT_MASK_SELECTORS,
  DEFAULT_WAIT_FOR_SELECTOR,
} = require('./constants')

const MAIN_APPLET = 'main'
const DEFAULT_MAIN_LOCALE = 'en'
const DEFAULT_SCENARIO_SET = 'root'
const MIGRATION_BASELINE_SCENARIO_SET = 'migration-baseline'
const COMPONENT_FIXTURE_SCENARIO_SET = 'component-fixtures'
const CARBON_MOCK_SCENARIO_SET = 'carbon-mocks'
const LUONNONMETSAKARTAT_MOCK_SCENARIO_SET = 'luonnonmetsakartat-mocks'
const SUPPORTED_SCENARIO_SETS = [
  DEFAULT_SCENARIO_SET,
  MIGRATION_BASELINE_SCENARIO_SET,
  COMPONENT_FIXTURE_SCENARIO_SET,
  CARBON_MOCK_SCENARIO_SET,
  LUONNONMETSAKARTAT_MOCK_SCENARIO_SET,
]

const appletSelectionContract = createAppletSelectionContract(appletConf)

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

const getKnownApplets = () => [...appletSelectionContract.APPLET_NAMES]

const getAppletSelection = ({ env = process.env } = {}) =>
  appletSelectionContract.resolveRuntimeSelection(
    env.NEXT_PUBLIC_COMPILED_APPLETS
  )

const getCompiledApplets = ({ env = process.env } = {}) => {
  return [...getAppletSelection({ env }).compiledApplets]
}

const isStandaloneAppletBuild = ({ env = process.env } = {}) => {
  return getAppletSelection({ env }).isStandalone
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
  const selection = getAppletSelection({ env })
  const compiled = selection.compiledApplets

  if (selection.isStandalone) {
    const applet = selection.standaloneApplet
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
        path: `/${locale}/${getRouteFolderForApplet(applet)}`,
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
  const compiled = getCompiledApplets({ env })

  switch (resolvedScenarioSet) {
    case DEFAULT_SCENARIO_SET:
      return rootScenarios
    case MIGRATION_BASELINE_SCENARIO_SET:
      return buildMigrationBaselineVisualScenarios({
        baseUrl,
        env,
        rootScenarios,
      })
    case COMPONENT_FIXTURE_SCENARIO_SET: {
      if (!compiled.includes(MAIN_APPLET)) {
        throw new Error(
          'The component-fixtures visual scenario set requires a main-app build with NEXT_PUBLIC_COMPILED_APPLETS including "main".'
        )
      }

      const {
        buildComponentFixtureVisualScenarios,
      } = require('./componentFixtureScenarios')

      return buildComponentFixtureVisualScenarios({ baseUrl })
    }
    case CARBON_MOCK_SCENARIO_SET: {
      if (
        !compiled.includes(MAIN_APPLET) ||
        !compiled.includes('carbon')
      ) {
        throw new Error(
          'The carbon-mocks visual scenario set requires a main-app build with NEXT_PUBLIC_COMPILED_APPLETS including "main" and "carbon".'
        )
      }

      const {
        buildCarbonMockVisualScenarios,
      } = require('./carbonMockScenarios')

      return buildCarbonMockVisualScenarios({ baseUrl })
    }
    case LUONNONMETSAKARTAT_MOCK_SCENARIO_SET: {
      if (
        !compiled.includes(MAIN_APPLET) ||
        !compiled.includes('luonnonmetsakartat')
      ) {
        throw new Error(
          'The luonnonmetsakartat-mocks visual scenario set requires a main-app build with NEXT_PUBLIC_COMPILED_APPLETS including "main" and "luonnonmetsakartat".'
        )
      }

      const {
        buildLuonnonmetsakartatMockVisualScenarios,
      } = require('./luonnonmetsakartatMockScenarios')

      return buildLuonnonmetsakartatMockVisualScenarios({ baseUrl })
    }
    default:
      return rootScenarios
  }
}

module.exports = {
  DEFAULT_MAIN_LOCALE,
  DEFAULT_SCENARIO_SET,
  COMPONENT_FIXTURE_SCENARIO_SET,
  CARBON_MOCK_SCENARIO_SET,
  LUONNONMETSAKARTAT_MOCK_SCENARIO_SET,
  MAIN_APPLET,
  MIGRATION_BASELINE_SCENARIO_SET,
  SUPPORTED_SCENARIO_SETS,
  buildMigrationBaselineVisualScenarios,
  buildRootVisualScenarios,
  buildScenario,
  buildVisualScenarios,
  getAppletSelection,
  getCompiledApplets,
  getKnownApplets,
  isStandaloneAppletBuild,
  resolveScenarioSet,
}
