const {
  COMPONENT_FIXTURE_SCENARIO_SET,
  buildVisualScenarios,
  getCompiledApplets,
  isStandaloneAppletBuild,
} = require('../../utils/visual/scenarios')

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
      'http://127.0.0.1:3000/fi/energiakartta'
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

    expect(scenarios.map((scenario) => scenario.id)).toEqual([
      'component-fixture-layer-toggle-row-hidden',
      'component-fixture-layer-toggle-row-visible',
      'component-fixture-layer-toggle-row-visible-colored',
      'component-fixture-layer-toggle-row-processing',
      'component-fixture-layer-toggle-row-disabled',
      'component-fixture-layer-toggle-row-accordion-open',
    ])

    expect(scenarios[0]).toMatchObject({
      applet: 'component-fixtures',
      locale: 'en',
      path: '/en/dev/component-fixtures/layer-toggle-row/hidden',
      url: 'http://127.0.0.1:3000/en/dev/component-fixtures/layer-toggle-row/hidden',
      requiresWebGL: false,
      waitFor: '[data-testid="component-fixture-ready"]',
      maskSelectors: [],
      sourceGlobs: [
        'src/components/common/LayerToggleRow.tsx',
        'src/components/common/LayerToggleRow.test.tsx',
      ],
    })
    expect(scenarios[0].tags).toEqual([
      'component-fixture',
      'component:layer-toggle-row',
      'state:hidden',
    ])
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
