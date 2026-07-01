const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const {
  DEFAULT_MASK_SELECTORS,
  DEFAULT_WAIT_FOR_SELECTOR,
} = require('./constants')

const LUONNONMETSAKARTAT_MOCK_SCENARIO_SET = 'luonnonmetsakartat-mocks'
const LUONNONMETSAKARTAT_MOCK_APPLET = 'luonnonmetsakartat'
const LUONNONMETSAKARTAT_MOCK_LOCALE = 'fi'
const LUONNONMETSAKARTAT_MOCK_ROUTE_BASE = `/${LUONNONMETSAKARTAT_MOCK_LOCALE}/${LUONNONMETSAKARTAT_MOCK_APPLET}`
const LUONNONMETSAKARTAT_MOCK_SCENARIO_ID_PREFIX =
  'luonnonmetsakartat-mocks'
const LUONNONMETSAKARTAT_MOCK_MASK_SELECTORS = [
  ...DEFAULT_MASK_SELECTORS,
  '[role="progressbar"]',
]

const LUONNONMETSAKARTAT_MOCK_IDS_SOURCE_PATH = path.resolve(
  __dirname,
  '../../src/applets/luonnonmetsakartat/common/mockScenarios/ids.ts'
)
const LUONNONMETSAKARTAT_MOCK_CONFIG_SOURCE_PATH = path.resolve(
  __dirname,
  '../../src/applets/luonnonmetsakartat/common/mockScenarios/config.ts'
)
const MOCK_AUTH_SOURCE_PATH = path.resolve(
  __dirname,
  '../../src/common/auth/mock.ts'
)

const REQUIRED_LUONNONMETSAKARTAT_MOCK_ID_EXPORTS = [
  'MOCK_VISIBLE_LAYER_ID',
]
const REQUIRED_LUONNONMETSAKARTAT_MOCK_CONFIG_EXPORTS = [
  'MOCK_RESET_QUERY_PARAM',
  'MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM',
]
const REQUIRED_MOCK_AUTH_EXPORTS = ['MOCK_AUTH_QUERY_PARAM']

let cachedSourceLiterals

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
      `Missing required string literal exports in ${filePath}: ${missingExports.join(
        ', '
      )}`
    )
  }

  return values
}

const getLuonnonmetsakartatMockSourceLiterals = () => {
  if (cachedSourceLiterals == null) {
    cachedSourceLiterals = {
      ...readStringLiteralExportsFromTypeScript({
        filePath: LUONNONMETSAKARTAT_MOCK_IDS_SOURCE_PATH,
        exportNames: REQUIRED_LUONNONMETSAKARTAT_MOCK_ID_EXPORTS,
      }),
      ...readStringLiteralExportsFromTypeScript({
        filePath: LUONNONMETSAKARTAT_MOCK_CONFIG_SOURCE_PATH,
        exportNames: REQUIRED_LUONNONMETSAKARTAT_MOCK_CONFIG_EXPORTS,
      }),
      ...readStringLiteralExportsFromTypeScript({
        filePath: MOCK_AUTH_SOURCE_PATH,
        exportNames: REQUIRED_MOCK_AUTH_EXPORTS,
      }),
    }
  }

  return cachedSourceLiterals
}

const buildLuonnonmetsakartatMockQuery = ({
  queryParams = {},
  sourceLiterals = getLuonnonmetsakartatMockSourceLiterals(),
  state,
}) => {
  const searchParams = new URLSearchParams()
  searchParams.set(sourceLiterals.MOCK_RESET_QUERY_PARAM, '1')
  searchParams.set(
    sourceLiterals.MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM,
    state
  )

  for (const [key, value] of Object.entries(queryParams)) {
    if (value == null) {
      continue
    }

    searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }

  return `?${searchParams.toString()}`
}

const buildLuonnonmetsakartatMockScenario = ({
  baseUrl,
  id,
  queryParams,
  routePath,
  sourceLiterals,
  state,
  surface,
}) => {
  const pathWithQuery = `${routePath}${buildLuonnonmetsakartatMockQuery({
    queryParams,
    sourceLiterals,
    state,
  })}`

  return {
    id: `${LUONNONMETSAKARTAT_MOCK_SCENARIO_ID_PREFIX}-${id}`,
    applet: LUONNONMETSAKARTAT_MOCK_APPLET,
    locale: LUONNONMETSAKARTAT_MOCK_LOCALE,
    path: pathWithQuery,
    url: joinUrl({ baseUrl, path: pathWithQuery }),
    requiresWebGL: true,
    waitFor: DEFAULT_WAIT_FOR_SELECTOR,
    maskSelectors: [...LUONNONMETSAKARTAT_MOCK_MASK_SELECTORS],
    tags: [
      LUONNONMETSAKARTAT_MOCK_SCENARIO_SET,
      `applet:${LUONNONMETSAKARTAT_MOCK_APPLET}`,
      `state:${state}`,
      `surface:${surface}`,
    ],
  }
}

const buildAdminAuthQueryParams = ({ sourceLiterals, state }) => ({
  [sourceLiterals.MOCK_AUTH_QUERY_PARAM]: state,
})

const buildLuonnonmetsakartatMockScenarioDefinitions = (sourceLiterals) => {
  const adminRoutePath = `${LUONNONMETSAKARTAT_MOCK_ROUTE_BASE}/admin`
  const layerRoutePath = `${adminRoutePath}/layer/${sourceLiterals.MOCK_VISIBLE_LAYER_ID}`
  const authenticatedQueryParams = buildAdminAuthQueryParams({
    sourceLiterals,
    state: 'authenticated',
  })

  return [
    {
      id: 'public-empty',
      routePath: LUONNONMETSAKARTAT_MOCK_ROUTE_BASE,
      state: 'public-empty',
      surface: 'public',
    },
    {
      id: 'public-layers',
      routePath: LUONNONMETSAKARTAT_MOCK_ROUTE_BASE,
      state: 'public-layers',
      surface: 'public',
    },
    {
      id: 'admin-unauthenticated',
      routePath: adminRoutePath,
      state: 'admin-unauthenticated',
      surface: 'admin',
      queryParams: buildAdminAuthQueryParams({
        sourceLiterals,
        state: 'unauthenticated',
      }),
    },
    {
      id: 'admin-rejected',
      routePath: adminRoutePath,
      state: 'admin-rejected',
      surface: 'admin',
      queryParams: buildAdminAuthQueryParams({
        sourceLiterals,
        state: 'rejected',
      }),
    },
    {
      id: 'admin-errored',
      routePath: adminRoutePath,
      state: 'admin-errored',
      surface: 'admin',
      queryParams: buildAdminAuthQueryParams({
        sourceLiterals,
        state: 'missing-token',
      }),
    },
    {
      id: 'admin-empty',
      routePath: adminRoutePath,
      state: 'admin-empty',
      surface: 'admin',
      queryParams: authenticatedQueryParams,
    },
    {
      id: 'admin-layers',
      routePath: adminRoutePath,
      state: 'admin-layers',
      surface: 'admin',
      queryParams: authenticatedQueryParams,
    },
    {
      id: 'admin-import',
      routePath: `${adminRoutePath}/import`,
      state: 'admin-layers',
      surface: 'import',
      queryParams: authenticatedQueryParams,
    },
    {
      id: 'layer-detail',
      routePath: layerRoutePath,
      state: 'layer-detail',
      surface: 'layer',
      queryParams: authenticatedQueryParams,
    },
    {
      id: 'settings-clean',
      routePath: `${layerRoutePath}/settings`,
      state: 'settings-clean',
      surface: 'settings',
      queryParams: authenticatedQueryParams,
    },
    {
      id: 'settings-unsynced',
      routePath: `${layerRoutePath}/settings`,
      state: 'settings-unsynced',
      surface: 'settings',
      queryParams: authenticatedQueryParams,
    },
    {
      id: 'settings-saving',
      routePath: `${layerRoutePath}/settings`,
      state: 'settings-saving',
      surface: 'settings',
      queryParams: authenticatedQueryParams,
    },
    {
      id: 'pictures-empty',
      routePath: `${layerRoutePath}/pictures`,
      state: 'pictures-empty',
      surface: 'pictures',
      queryParams: authenticatedQueryParams,
    },
    {
      id: 'pictures-mapped',
      routePath: `${layerRoutePath}/pictures`,
      state: 'pictures-mapped',
      surface: 'pictures',
      queryParams: authenticatedQueryParams,
    },
    {
      id: 'pictures-unmatched',
      routePath: `${layerRoutePath}/pictures`,
      state: 'pictures-unmatched',
      surface: 'pictures',
      queryParams: authenticatedQueryParams,
    },
  ]
}

const buildLuonnonmetsakartatMockVisualScenarios = ({
  baseUrl = '',
} = {}) => {
  const sourceLiterals = getLuonnonmetsakartatMockSourceLiterals()

  return buildLuonnonmetsakartatMockScenarioDefinitions(sourceLiterals).map(
    (definition) =>
      buildLuonnonmetsakartatMockScenario({
        baseUrl,
        sourceLiterals,
        ...definition,
      })
  )
}

module.exports = {
  LUONNONMETSAKARTAT_MOCK_APPLET,
  LUONNONMETSAKARTAT_MOCK_CONFIG_SOURCE_PATH,
  LUONNONMETSAKARTAT_MOCK_IDS_SOURCE_PATH,
  LUONNONMETSAKARTAT_MOCK_LOCALE,
  LUONNONMETSAKARTAT_MOCK_MASK_SELECTORS,
  LUONNONMETSAKARTAT_MOCK_ROUTE_BASE,
  LUONNONMETSAKARTAT_MOCK_SCENARIO_ID_PREFIX,
  LUONNONMETSAKARTAT_MOCK_SCENARIO_SET,
  MOCK_AUTH_SOURCE_PATH,
  REQUIRED_LUONNONMETSAKARTAT_MOCK_CONFIG_EXPORTS,
  REQUIRED_LUONNONMETSAKARTAT_MOCK_ID_EXPORTS,
  REQUIRED_MOCK_AUTH_EXPORTS,
  buildLuonnonmetsakartatMockQuery,
  buildLuonnonmetsakartatMockVisualScenarios,
  getLuonnonmetsakartatMockSourceLiterals,
  readStringLiteralExportsFromTypeScript,
}
