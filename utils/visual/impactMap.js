const { matchesAnyGlob, normalizePath } = require('./glob')

const buildImpactRules = () => [
  {
    label: 'global-config',
    globs: [
      'package.json',
      'yarn.lock',
      'Dockerfile',
      'vite.config.mts',
      'nitro.config.ts',
      'appletConf.json',
      '.env',
      '.env.*',
      'src/server.tsx',
      'src/common/routing/requestRouting.ts',
    ],
    target: '*',
  },
  {
    label: 'component-fixture-harness',
    globs: [
      'src/routes/$locale/dev/component-fixtures/**',
      'src/common/component-fixtures/**',
      'utils/visual/componentFixtureScenarios.js',
    ],
    target: '*',
  },
  {
    label: 'shared-ui-and-state',
    globs: ['src/components/**', 'src/common/**'],
    target: '*',
  },
  {
    label: 'app-shell',
    globs: [
      'src/routes/__root.tsx',
      'src/routes/$locale/route.tsx',
      'src/routes/$locale/(map)/_map/route.tsx',
      'src/runtime/ShellProvider.tsx',
      'src/runtime/MapShell.tsx',
      'src/app/[locale]/(map)/layoutClient.tsx',
    ],
    target: '*',
  },
  {
    label: 'main-pages',
    globs: [
      'src/applets/main/**',
      'src/applets/forests/**',
    ],
    target: 'main',
  },
  {
    label: 'hiilikartta-pages',
    globs: [
      'src/applets/hiilikartta/**',
      'src/common/routing/routes/hiilikartta.ts',
    ],
    target: 'hiilikartta',
  },
  {
    label: 'energiakartta-pages',
    globs: [
      'src/applets/energiakartta/**',
      'src/common/routing/routes/energiakartta.ts',
    ],
    target: 'energiakartta',
  },
  {
    label: 'luonnonmetsakartat-pages',
    globs: [
      'src/applets/luonnonmetsakartat/**',
      'src/common/routing/routes/luonnonmetsakartat.ts',
    ],
    target: 'luonnonmetsakartat',
  },
]

const getScenarioSourceMatches = ({ file, scenarios }) =>
  scenarios.filter((scenario) =>
    matchesAnyGlob({ filePath: file, globs: scenario.sourceGlobs || [] })
  )

const resolveImpactedScenarios = ({ files, scenarios, rules = buildImpactRules() }) => {
  const normalizedFiles = (files || []).map(normalizePath).filter(Boolean)

  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    return {
      scenarioIds: [],
      mode: 'none',
      reasons: ['No scenarios available'],
      fileMatches: {},
    }
  }

  if (normalizedFiles.length === 0) {
    return {
      scenarioIds: scenarios.map((scenario) => scenario.id),
      mode: 'all',
      reasons: ['No changed files provided; running all scenarios'],
      fileMatches: {},
    }
  }

  const fileMatches = {}
  let allTriggered = false
  const targetedApplets = new Set()
  const targetedScenarioIds = new Set()

  for (const file of normalizedFiles) {
    const scenarioSourceMatches = getScenarioSourceMatches({ file, scenarios })

    if (scenarioSourceMatches.length > 0) {
      fileMatches[file] = scenarioSourceMatches.map((scenario) => ({
        label: 'scenario-source-globs',
        target: scenario.id,
      }))
      scenarioSourceMatches.forEach((scenario) =>
        targetedScenarioIds.add(scenario.id)
      )
      continue
    }

    const matches = rules.filter((rule) => matchesAnyGlob({ filePath: file, globs: rule.globs }))
    fileMatches[file] = matches.map((match) => ({ label: match.label, target: match.target }))

    if (matches.length === 0) {
      allTriggered = true
      continue
    }

    for (const match of matches) {
      if (match.target === '*') {
        allTriggered = true
        continue
      }
      targetedApplets.add(match.target)
    }
  }

  if (allTriggered) {
    return {
      scenarioIds: scenarios.map((scenario) => scenario.id),
      mode: 'all',
      reasons: [
        'At least one changed file mapped to all scenarios or was unmapped; running full scenario set',
      ],
      fileMatches,
    }
  }

  const scenarioIds = scenarios
    .filter(
      (scenario) =>
        targetedScenarioIds.has(scenario.id) || targetedApplets.has(scenario.applet)
    )
    .map((scenario) => scenario.id)

  if (scenarioIds.length === 0) {
    return {
      scenarioIds: scenarios.map((scenario) => scenario.id),
      mode: 'all',
      reasons: ['No scenario mapping match after filtering; running all scenarios'],
      fileMatches,
    }
  }

  return {
    scenarioIds,
    mode: 'targeted',
    reasons: ['Resolved impacted scenarios from manifest rules'],
    fileMatches,
  }
}

module.exports = {
  buildImpactRules,
  resolveImpactedScenarios,
}
