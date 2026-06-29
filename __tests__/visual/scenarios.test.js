const {
  CARBON_MOCK_SCENARIO_SET: REGISTERED_CARBON_MOCK_SCENARIO_SET,
  COMPONENT_FIXTURE_SCENARIO_SET,
  SUPPORTED_SCENARIO_SETS,
  buildVisualScenarios,
  getCompiledApplets,
  isStandaloneAppletBuild,
  resolveScenarioSet,
} = require('../../utils/visual/scenarios')
const {
  CARBON_MOCK_MASK_SELECTORS,
  CARBON_MOCK_SCENARIO_SET,
} = require('../../utils/visual/carbonMockScenarios')
const { DEFAULT_MASK_SELECTORS } = require('../../utils/visual/constants')
const { componentFixtureMetadata } = require('../../src/common/component-fixtures/metadata')
const packageJson = require('../../package.json')
const {
  MOCK_COMPARISON_PLAN_SERVER_ID,
  MOCK_EXTERNAL_PLAN_ID,
  MOCK_EXTERNAL_REPORT_ERROR_SERVER_ID,
  MOCK_EXTERNAL_REPORT_SERVER_ID,
  MOCK_INVALID_PLAN_ID,
  MOCK_INVALID_PLAN_SERVER_ID,
  MOCK_LOCAL_PLAN_ID,
  MOCK_LOCAL_PLAN_SERVER_ID,
  MOCK_SERVER_PLAN_ID,
} = require('../../src/applets/hiilikartta/common/mockScenarios/ids')

const CARBON_MOCK_BASE_URL = 'http://127.0.0.1:3000'
const CARBON_MOCK_ENV = {
  NEXT_PUBLIC_COMPILED_APPLETS: 'main,hiilikartta',
}

const buildCarbonMockScenarios = () =>
  buildVisualScenarios({
    env: CARBON_MOCK_ENV,
    baseUrl: CARBON_MOCK_BASE_URL,
    scenarioSet: CARBON_MOCK_SCENARIO_SET,
  })

const getScenarioById = ({ scenarios, id }) =>
  scenarios.find((scenario) => scenario.id === id)

const getScenarioUrl = (scenario) => new URL(scenario.url)

const getScenarioPathname = (scenario) => getScenarioUrl(scenario).pathname

describe('visual scenarios', () => {
  test('builds main-mode root scenarios for compiled applets', () => {
    const env = {
      NEXT_PUBLIC_COMPILED_APPLETS: 'main,energiakartta,hiilikartta',
    }

    const scenarios = buildVisualScenarios({
      env,
      baseUrl: 'http://127.0.0.1:3000',
    })

    expect(scenarios.map((scenario) => scenario.id)).toEqual([
      'main-root',
      'energiakartta-root',
      'hiilikartta-root',
    ])

    expect(scenarios.find((s) => s.id === 'main-root').url).toBe(
      'http://127.0.0.1:3000/en'
    )
    expect(scenarios.find((s) => s.id === 'energiakartta-root').url).toBe(
      'http://127.0.0.1:3000/fi/energy'
    )
    expect(scenarios.find((s) => s.id === 'hiilikartta-root').url).toBe(
      'http://127.0.0.1:3000/fi/carbon'
    )
  })

  test('builds standalone applet root scenario', () => {
    const env = { NEXT_PUBLIC_COMPILED_APPLETS: 'hiilikartta' }

    expect(isStandaloneAppletBuild({ env })).toBe(true)

    const scenarios = buildVisualScenarios({ env, baseUrl: 'http://app' })
    expect(scenarios).toHaveLength(1)
    expect(scenarios[0]).toMatchObject({
      id: 'hiilikartta-root',
      applet: 'hiilikartta',
      path: '/fi',
      url: 'http://app/fi',
    })
  })

  test('filters unknown compiled applets', () => {
    const compiled = getCompiledApplets({
      env: { NEXT_PUBLIC_COMPILED_APPLETS: 'main,unknown,hiilikartta' },
    })

    expect(compiled).toEqual(['main', 'hiilikartta'])
  })

  test('builds component fixture scenarios in main mode', () => {
    const scenarios = buildVisualScenarios({
      env: { NEXT_PUBLIC_COMPILED_APPLETS: 'main,energiakartta' },
      baseUrl: 'http://127.0.0.1:3000',
      scenarioSet: COMPONENT_FIXTURE_SCENARIO_SET,
    })

    const expectedFixtureScenarioIds = componentFixtureMetadata.flatMap((fixture) =>
      fixture.states.map((state) =>
        `component-fixture-${fixture.id}-${state.id}`
      )
    )

    expect(scenarios.map((scenario) => scenario.id)).toEqual(
      expectedFixtureScenarioIds
    )

    const firstFixture = componentFixtureMetadata[0]
    const firstState = firstFixture.states[0]
    expect(scenarios[0]).toMatchObject({
      applet: 'component-fixtures',
      locale: 'en',
      path: `/en/dev/component-fixtures/${firstFixture.id}/${firstState.id}`,
      url: `http://127.0.0.1:3000/en/dev/component-fixtures/${firstFixture.id}/${firstState.id}`,
      requiresWebGL: false,
      waitFor: '[data-testid="component-fixture-ready"]',
      maskSelectors: [],
      sourceGlobs: firstFixture.sourceGlobs,
    })
    expect(scenarios[0].tags).toEqual([
      'component-fixture',
      `component:${firstFixture.id}`,
      `state:${firstState.id}`,
    ])
    expect(scenarios.map((scenario) => scenario.id)).toContain(
      'component-fixture-loading-feedback-spinner-size-color-variants'
    )
    expect(scenarios.map((scenario) => scenario.id)).toContain(
      'component-fixture-loading-feedback-modal-overlay'
    )
  })

  test('rejects component fixture scenarios for standalone applet builds', () => {
    expect(() =>
      buildVisualScenarios({
        env: { NEXT_PUBLIC_COMPILED_APPLETS: 'hiilikartta' },
        baseUrl: 'http://app',
        scenarioSet: COMPONENT_FIXTURE_SCENARIO_SET,
      })
    ).toThrow('requires a main-app build')
  })

  describe('carbon mock scenarios', () => {
    const expectedCarbonScenarioStates = {
      'carbon-mocks-home': 'home',
      'carbon-mocks-plans-empty': 'plans-empty',
      'carbon-mocks-plans-seeded': 'plans-seeded',
      'carbon-mocks-import-placeholder': 'import-placeholder',
      'carbon-mocks-plan-valid': 'plan-valid',
      'carbon-mocks-plan-invalid-zoning': 'plan-invalid-zoning',
      'carbon-mocks-plan-invalid-land-use': 'plan-invalid-land-use',
      'carbon-mocks-calc-not-started': 'calc-not-started',
      'carbon-mocks-calc-initializing': 'calc-initializing',
      'carbon-mocks-calc-calculating': 'calc-calculating',
      'carbon-mocks-calc-errored': 'calc-errored',
      'carbon-mocks-calc-finished': 'calc-finished',
      'carbon-mocks-areas-valid': 'areas-valid',
      'carbon-mocks-areas-invalid-zoning': 'areas-invalid-zoning',
      'carbon-mocks-areas-invalid-land-use': 'areas-invalid-land-use',
      'carbon-mocks-report-single-local': 'report-single-local',
      'carbon-mocks-report-comparison': 'report-comparison',
      'carbon-mocks-report-external': 'report-external',
      'carbon-mocks-report-invalid-id': 'report-invalid-id',
      'carbon-mocks-report-no-data': 'report-no-data',
    }

    test('registers the carbon-mocks scenario set', () => {
      expect(REGISTERED_CARBON_MOCK_SCENARIO_SET).toBe(
        CARBON_MOCK_SCENARIO_SET
      )
      expect(resolveScenarioSet({ scenarioSet: CARBON_MOCK_SCENARIO_SET })).toBe(
        CARBON_MOCK_SCENARIO_SET
      )
      expect(SUPPORTED_SCENARIO_SETS).toContain(CARBON_MOCK_SCENARIO_SET)
    })

    test('builds the expected carbon mock route-state scenarios', () => {
      const scenarios = buildCarbonMockScenarios()

      expect(scenarios.map((scenario) => scenario.id)).toEqual(
        Object.keys(expectedCarbonScenarioStates)
      )
    })

    test('uses canonical carbon URLs and deterministic seeded query params', () => {
      const scenarios = buildCarbonMockScenarios()

      for (const scenario of scenarios) {
        const url = getScenarioUrl(scenario)
        const expectedState = expectedCarbonScenarioStates[scenario.id]

        expect(scenario.path.startsWith('/fi/carbon')).toBe(true)
        expect(scenario.path).not.toContain('/hiilikartta')
        expect(scenario.path).not.toContain('/kaavat')
        expect(scenario.path).not.toContain('/raportti')
        expect(url.pathname.startsWith('/fi/carbon')).toBe(true)
        expect(scenario.url).toBe(`${CARBON_MOCK_BASE_URL}${scenario.path}`)
        expect(url.searchParams.get('mockReset')).toBe('1')
        expect(url.searchParams.get('mockCarbonState')).toBe(expectedState)
        expect(scenario.tags).toEqual(
          expect.arrayContaining([
            CARBON_MOCK_SCENARIO_SET,
            'applet:hiilikartta',
            `state:${expectedState}`,
          ])
        )
      }
    })

    test('uses stable route and report ids from the mock scenario catalog', () => {
      const scenarios = buildCarbonMockScenarios()

      expect(
        getScenarioPathname(
          getScenarioById({
            scenarios,
            id: 'carbon-mocks-plan-valid',
          })
        )
      ).toBe(`/fi/carbon/plans/${MOCK_LOCAL_PLAN_ID}`)
      expect(
        getScenarioPathname(
          getScenarioById({
            scenarios,
            id: 'carbon-mocks-calc-finished',
          })
        )
      ).toBe(`/fi/carbon/plans/${MOCK_SERVER_PLAN_ID}`)
      expect(
        getScenarioPathname(
          getScenarioById({
            scenarios,
            id: 'carbon-mocks-areas-invalid-land-use',
          })
        )
      ).toBe(`/fi/carbon/plans/${MOCK_INVALID_PLAN_ID}/areas`)

      const singleLocalUrl = getScenarioUrl(
        getScenarioById({
          scenarios,
          id: 'carbon-mocks-report-single-local',
        })
      )
      expect(singleLocalUrl.searchParams.get('planIds')).toBe(
        MOCK_LOCAL_PLAN_SERVER_ID
      )
      expect(singleLocalUrl.searchParams.get('prevPageId')).toBe(
        MOCK_LOCAL_PLAN_ID
      )
      expect(singleLocalUrl.searchParams.get('prevPageStep')).toBe('areas')

      const comparisonUrl = getScenarioUrl(
        getScenarioById({
          scenarios,
          id: 'carbon-mocks-report-comparison',
        })
      )
      expect(comparisonUrl.searchParams.get('planIds')).toBe(
        `${MOCK_LOCAL_PLAN_SERVER_ID},${MOCK_COMPARISON_PLAN_SERVER_ID}`
      )
      expect(comparisonUrl.searchParams.get('prevPageId')).toBe(
        MOCK_LOCAL_PLAN_ID
      )
      expect(comparisonUrl.searchParams.get('prevPageStep')).toBe('areas')

      const externalUrl = getScenarioUrl(
        getScenarioById({
          scenarios,
          id: 'carbon-mocks-report-external',
        })
      )
      expect(externalUrl.searchParams.get('planIds')).toBe(MOCK_EXTERNAL_PLAN_ID)
      expect(externalUrl.searchParams.get('planIds')).not.toBe(
        MOCK_EXTERNAL_REPORT_SERVER_ID
      )
      expect(externalUrl.searchParams.get('planIds')).not.toBe(
        MOCK_EXTERNAL_REPORT_ERROR_SERVER_ID
      )

      const invalidReportUrl = getScenarioUrl(
        getScenarioById({
          scenarios,
          id: 'carbon-mocks-report-invalid-id',
        })
      )
      expect(invalidReportUrl.searchParams.get('planIds')).toBe(
        MOCK_INVALID_PLAN_ID
      )

      const noDataReportUrl = getScenarioUrl(
        getScenarioById({
          scenarios,
          id: 'carbon-mocks-report-no-data',
        })
      )
      expect(noDataReportUrl.searchParams.get('planIds')).toBe(
        MOCK_INVALID_PLAN_SERVER_ID
      )
      expect(noDataReportUrl.searchParams.get('prevPageId')).toBe(
        MOCK_INVALID_PLAN_ID
      )
      expect(noDataReportUrl.searchParams.get('prevPageStep')).toBe('plan')
    })

    test('marks all carbon mock scenarios as WebGL routes and applies masks', () => {
      const scenarios = buildCarbonMockScenarios()

      for (const scenario of scenarios) {
        expect(scenario.requiresWebGL).toBe(true)
        expect(scenario.maskSelectors).toEqual(
          expect.arrayContaining([
            ...DEFAULT_MASK_SELECTORS,
            ...CARBON_MOCK_MASK_SELECTORS,
          ])
        )
      }
    })

    test('rejects carbon mock scenarios for unsupported builds', () => {
      expect(() =>
        buildVisualScenarios({
          env: { NEXT_PUBLIC_COMPILED_APPLETS: 'hiilikartta' },
          baseUrl: 'http://app',
          scenarioSet: CARBON_MOCK_SCENARIO_SET,
        })
      ).toThrow(
        'requires a main-app build with NEXT_PUBLIC_COMPILED_APPLETS including "main" and "hiilikartta"'
      )

      expect(() =>
        buildVisualScenarios({
          env: { NEXT_PUBLIC_COMPILED_APPLETS: 'main,energiakartta' },
          baseUrl: 'http://app',
          scenarioSet: CARBON_MOCK_SCENARIO_SET,
        })
      ).toThrow(
        'requires a main-app build with NEXT_PUBLIC_COMPILED_APPLETS including "main" and "hiilikartta"'
      )
    })

    test('exposes a no-start package script for carbon mock visual runs', () => {
      expect(packageJson.scripts['visual:carbon-mocks']).toContain(
        '--scenario-set=carbon-mocks'
      )
      expect(packageJson.scripts['visual:carbon-mocks']).toContain(
        '--base-url=http://127.0.0.1:3000'
      )
      expect(packageJson.scripts['visual:carbon-mocks']).toContain('--no-start')
      expect(packageJson.scripts['visual:carbon-mocks']).not.toContain(
        'NEXT_PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED'
      )
    })
  })
})
