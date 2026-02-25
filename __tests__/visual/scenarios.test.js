const {
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
})
