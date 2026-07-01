const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const {
  DEFAULT_MASK_SELECTORS,
  DEFAULT_WAIT_FOR_SELECTOR,
} = require('./constants')

const CARBON_MOCK_SCENARIO_SET = 'carbon-mocks'
const CARBON_MOCK_APPLET = 'hiilikartta'
const CARBON_MOCK_LOCALE = 'fi'
const CARBON_MOCK_ROUTE_BASE = `/${CARBON_MOCK_LOCALE}/carbon`
const CARBON_MOCK_SCENARIO_ID_PREFIX = 'carbon-mocks'

const CARBON_MOCK_MASK_SELECTORS = [
  '[data-visual-mask="plan-report-spinner"]',
  '[data-visual-mask="zone-calculate-spinner"]',
]

const CARBON_MOCK_IDS_SOURCE_PATH = path.resolve(
  __dirname,
  '../../src/applets/hiilikartta/common/mockScenarios/ids.ts'
)

const REQUIRED_CARBON_MOCK_ID_EXPORTS = [
  'MOCK_LOCAL_PLAN_ID',
  'MOCK_SERVER_PLAN_ID',
  'MOCK_INVALID_PLAN_ID',
  'MOCK_COMPARISON_PLAN_ID',
  'MOCK_EXTERNAL_PLAN_ID',
  'MOCK_LOCAL_PLAN_SERVER_ID',
  'MOCK_SERVER_PLAN_SERVER_ID',
  'MOCK_INVALID_PLAN_SERVER_ID',
  'MOCK_COMPARISON_PLAN_SERVER_ID',
  'MOCK_EXTERNAL_REPORT_SERVER_ID',
  'MOCK_EXTERNAL_REPORT_ERROR_SERVER_ID',
]

let cachedCarbonMockIds

const joinUrl = ({ baseUrl, path }) => {
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/+$/, '')
  if (!normalizedBaseUrl) {
    return path
  }
  return `${normalizedBaseUrl}${path}`
}

const isExportedVariableStatement = (node) =>
  ts.isVariableStatement(node) &&
  node.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
  )

const isStringLiteralInitializer = (node) =>
  node != null &&
  (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))

const readStringLiteralExportsFromTypeScript = ({ filePath, exportNames }) => {
  const sourceText = fs.readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  const expectedNames = new Set(exportNames)
  const values = {}

  sourceFile.forEachChild((node) => {
    if (!isExportedVariableStatement(node)) {
      return
    }

    for (const declaration of node.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) {
        continue
      }

      const exportName = declaration.name.text
      if (!expectedNames.has(exportName)) {
        continue
      }

      if (!isStringLiteralInitializer(declaration.initializer)) {
        throw new Error(
          `Expected ${exportName} in ${filePath} to be an exported string literal.`
        )
      }

      values[exportName] = declaration.initializer.text
    }
  })

  const missingExports = exportNames.filter(
    (exportName) => values[exportName] == null
  )
  if (missingExports.length > 0) {
    throw new Error(
      `Missing required carbon mock id exports in ${filePath}: ${missingExports.join(
        ', '
      )}`
    )
  }

  return values
}

const getCarbonMockIds = () => {
  if (cachedCarbonMockIds == null) {
    cachedCarbonMockIds = readStringLiteralExportsFromTypeScript({
      filePath: CARBON_MOCK_IDS_SOURCE_PATH,
      exportNames: REQUIRED_CARBON_MOCK_ID_EXPORTS,
    })
  }

  return cachedCarbonMockIds
}

const buildCarbonMockQuery = ({ state, queryParams = {} }) => {
  const searchParams = new URLSearchParams()
  searchParams.set('mockReset', '1')
  searchParams.set('mockCarbonState', state)

  for (const [key, value] of Object.entries(queryParams)) {
    if (value == null) {
      continue
    }

    searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }

  return `?${searchParams.toString()}`
}

const buildCarbonMockScenario = ({
  baseUrl,
  id,
  routePath,
  state,
  surface,
  queryParams,
}) => {
  const pathWithQuery = `${routePath}${buildCarbonMockQuery({
    state,
    queryParams,
  })}`

  return {
    id: `${CARBON_MOCK_SCENARIO_ID_PREFIX}-${id}`,
    applet: CARBON_MOCK_APPLET,
    locale: CARBON_MOCK_LOCALE,
    path: pathWithQuery,
    url: joinUrl({ baseUrl, path: pathWithQuery }),
    requiresWebGL: true,
    waitFor: DEFAULT_WAIT_FOR_SELECTOR,
    maskSelectors: [...DEFAULT_MASK_SELECTORS, ...CARBON_MOCK_MASK_SELECTORS],
    tags: [
      CARBON_MOCK_SCENARIO_SET,
      `applet:${CARBON_MOCK_APPLET}`,
      `state:${state}`,
      `surface:${surface}`,
    ],
  }
}

const buildCarbonMockScenarioDefinitions = (ids) => [
  {
    id: 'home',
    routePath: CARBON_MOCK_ROUTE_BASE,
    state: 'home',
    surface: 'home',
  },
  {
    id: 'plans-empty',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans`,
    state: 'plans-empty',
    surface: 'plans',
  },
  {
    id: 'plans-seeded',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans`,
    state: 'plans-seeded',
    surface: 'plans',
  },
  {
    id: 'import-placeholder',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_LOCAL_PLAN_ID}`,
    state: 'import-placeholder',
    surface: 'plan',
  },
  {
    id: 'draw-empty-plan',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_LOCAL_PLAN_ID}`,
    state: 'draw-empty-plan',
    surface: 'plan',
  },
  {
    id: 'plan-valid',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_LOCAL_PLAN_ID}`,
    state: 'plan-valid',
    surface: 'plan',
  },
  {
    id: 'plan-invalid-zoning',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_INVALID_PLAN_ID}`,
    state: 'plan-invalid-zoning',
    surface: 'plan',
  },
  {
    id: 'plan-invalid-land-use',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_INVALID_PLAN_ID}`,
    state: 'plan-invalid-land-use',
    surface: 'plan',
  },
  {
    id: 'calc-not-started',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_SERVER_PLAN_ID}`,
    state: 'calc-not-started',
    surface: 'plan',
  },
  {
    id: 'calc-initializing',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_SERVER_PLAN_ID}`,
    state: 'calc-initializing',
    surface: 'plan',
  },
  {
    id: 'calc-calculating',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_SERVER_PLAN_ID}`,
    state: 'calc-calculating',
    surface: 'plan',
  },
  {
    id: 'calc-errored',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_SERVER_PLAN_ID}`,
    state: 'calc-errored',
    surface: 'plan',
  },
  {
    id: 'calc-finished',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_SERVER_PLAN_ID}`,
    state: 'calc-finished',
    surface: 'plan',
  },
  {
    id: 'areas-valid',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_LOCAL_PLAN_ID}/areas`,
    state: 'areas-valid',
    surface: 'areas',
  },
  {
    id: 'areas-invalid-zoning',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_INVALID_PLAN_ID}/areas`,
    state: 'areas-invalid-zoning',
    surface: 'areas',
  },
  {
    id: 'areas-invalid-land-use',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/plans/${ids.MOCK_INVALID_PLAN_ID}/areas`,
    state: 'areas-invalid-land-use',
    surface: 'areas',
  },
  {
    id: 'report-single-local',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/report`,
    state: 'report-single-local',
    surface: 'report',
    queryParams: {
      planIds: ids.MOCK_LOCAL_PLAN_SERVER_ID,
      prevPageId: ids.MOCK_LOCAL_PLAN_ID,
      prevPageStep: 'areas',
    },
  },
  {
    id: 'report-comparison',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/report`,
    state: 'report-comparison',
    surface: 'report',
    queryParams: {
      planIds: [
        ids.MOCK_LOCAL_PLAN_SERVER_ID,
        ids.MOCK_COMPARISON_PLAN_SERVER_ID,
      ],
      prevPageId: ids.MOCK_LOCAL_PLAN_ID,
      prevPageStep: 'areas',
    },
  },
  {
    id: 'report-external',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/report`,
    state: 'report-external',
    surface: 'report',
    queryParams: {
      planIds: ids.MOCK_EXTERNAL_PLAN_ID,
    },
  },
  {
    id: 'report-invalid-id',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/report`,
    state: 'report-invalid-id',
    surface: 'report',
    queryParams: {
      planIds: ids.MOCK_INVALID_PLAN_ID,
    },
  },
  {
    id: 'report-no-data',
    routePath: `${CARBON_MOCK_ROUTE_BASE}/report`,
    state: 'report-no-data',
    surface: 'report',
    queryParams: {
      planIds: ids.MOCK_INVALID_PLAN_SERVER_ID,
      prevPageId: ids.MOCK_INVALID_PLAN_ID,
      prevPageStep: 'plan',
    },
  },
]

const buildCarbonMockVisualScenarios = ({ baseUrl = '' } = {}) => {
  const ids = getCarbonMockIds()

  return buildCarbonMockScenarioDefinitions(ids).map((definition) =>
    buildCarbonMockScenario({ baseUrl, ...definition })
  )
}

module.exports = {
  CARBON_MOCK_APPLET,
  CARBON_MOCK_IDS_SOURCE_PATH,
  CARBON_MOCK_LOCALE,
  CARBON_MOCK_MASK_SELECTORS,
  CARBON_MOCK_ROUTE_BASE,
  CARBON_MOCK_SCENARIO_SET,
  REQUIRED_CARBON_MOCK_ID_EXPORTS,
  buildCarbonMockQuery,
  buildCarbonMockVisualScenarios,
  getCarbonMockIds,
  readStringLiteralExportsFromTypeScript,
}
