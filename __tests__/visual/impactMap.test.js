const { resolveImpactedScenarios } = require('../../utils/visual/impactMap')

const scenarios = [
  { id: 'main-root', applet: 'main' },
  { id: 'energiakartta-root', applet: 'energiakartta' },
  { id: 'hiilikartta-root', applet: 'hiilikartta' },
  { id: 'luonnonmetsakartat-root', applet: 'luonnonmetsakartat' },
]

describe('resolveImpactedScenarios', () => {
  test('maps shared component changes to all scenarios', () => {
    const result = resolveImpactedScenarios({
      files: ['src/components/common/DropDownSelect.tsx'],
      scenarios,
    })

    expect(result.mode).toBe('all')
    expect(result.scenarioIds).toEqual(scenarios.map((scenario) => scenario.id))
  })

  test('maps applet page changes to applet scenario only', () => {
    const result = resolveImpactedScenarios({
      files: ['src/app/[locale]/(map)/(applets)/hiilikartta/(pages)/page.tsx'],
      scenarios,
    })

    expect(result.mode).toBe('targeted')
    expect(result.scenarioIds).toEqual(['hiilikartta-root'])
  })

  test('falls back to all scenarios for unmapped files', () => {
    const result = resolveImpactedScenarios({
      files: ['docs/some-unmapped-file.md'],
      scenarios,
    })

    expect(result.mode).toBe('all')
    expect(result.scenarioIds).toEqual(scenarios.map((scenario) => scenario.id))
  })
})
