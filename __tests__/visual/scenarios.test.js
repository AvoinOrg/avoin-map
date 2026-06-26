const {
  COMPONENT_FIXTURE_SCENARIO_SET,
  buildVisualScenarios,
  getCompiledApplets,
  isStandaloneAppletBuild,
} = require('../../utils/visual/scenarios')
const { componentFixtureMetadata } = require('../../src/common/component-fixtures/metadata')

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
})
