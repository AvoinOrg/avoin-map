const { resolveImpactedScenarios } = require('../../utils/visual/impactMap')

const scenarios = [
  { id: 'main-root', applet: 'main' },
  { id: 'energy-root', applet: 'energy' },
  { id: 'carbon-root', applet: 'carbon' },
  { id: 'luonnonmetsakartat-root', applet: 'luonnonmetsakartat' },
]

const fixtureScenarios = [
  {
    id: 'component-fixture-layer-toggle-row-hidden',
    applet: 'component-fixtures',
    sourceGlobs: ['src/components/common/LayerToggleRow.tsx'],
  },
  {
    id: 'component-fixture-layer-toggle-row-visible',
    applet: 'component-fixtures',
    sourceGlobs: ['src/components/common/LayerToggleRow.tsx'],
  },
  {
    id: 'component-fixture-other-component-default',
    applet: 'component-fixtures',
    sourceGlobs: ['src/components/common/OtherComponent.tsx'],
  },
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
      files: ['src/applets/carbon/pages/CarbonHomePage.tsx'],
      scenarios,
    })

    expect(result.mode).toBe('targeted')
    expect(result.scenarioIds).toEqual(['carbon-root'])
  })

  test('maps energy source changes to the energy scenario only', () => {
    const result = resolveImpactedScenarios({
      files: ['src/applets/energy/pages/EnergyHomePage.tsx'],
      scenarios,
    })

    expect(result.mode).toBe('targeted')
    expect(result.scenarioIds).toEqual(['energy-root'])
  })

  test('maps TanStack applet route changes to applet scenario only', () => {
    const result = resolveImpactedScenarios({
      files: [
        'src/routes/$locale/_map/(applets)/carbon/plans/route.tsx',
      ],
      scenarios,
    })

    expect(result.mode).toBe('targeted')
    expect(result.scenarioIds).toEqual(['carbon-root'])
  })

  test('maps energy TanStack applet route changes to the energy scenario only', () => {
    const result = resolveImpactedScenarios({
      files: ['src/routes/$locale/_map/(applets)/energy/route.tsx'],
      scenarios,
    })

    expect(result.mode).toBe('targeted')
    expect(result.scenarioIds).toEqual(['energy-root'])
  })

  test('falls back to all scenarios for unmapped files', () => {
    const result = resolveImpactedScenarios({
      files: ['docs/some-unmapped-file.md'],
      scenarios,
    })

    expect(result.mode).toBe('all')
    expect(result.scenarioIds).toEqual(scenarios.map((scenario) => scenario.id))
  })

  test('maps component source changes to matching fixture scenarios', () => {
    const result = resolveImpactedScenarios({
      files: ['src/components/common/LayerToggleRow.tsx'],
      scenarios: fixtureScenarios,
    })

    expect(result.mode).toBe('targeted')
    expect(result.scenarioIds).toEqual([
      'component-fixture-layer-toggle-row-hidden',
      'component-fixture-layer-toggle-row-visible',
    ])
    expect(result.fileMatches['src/components/common/LayerToggleRow.tsx']).toEqual([
      {
        label: 'scenario-source-globs',
        target: 'component-fixture-layer-toggle-row-hidden',
      },
      {
        label: 'scenario-source-globs',
        target: 'component-fixture-layer-toggle-row-visible',
      },
    ])
  })

  test('maps fixture harness changes to all fixture scenarios', () => {
    const result = resolveImpactedScenarios({
      files: ['src/common/component-fixtures/ComponentFixtureFrame.tsx'],
      scenarios: fixtureScenarios,
    })

    expect(result.mode).toBe('all')
    expect(result.scenarioIds).toEqual(
      fixtureScenarios.map((scenario) => scenario.id)
    )
  })
})
