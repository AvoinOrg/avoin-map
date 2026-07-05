const fs = require('fs')
const os = require('os')
const path = require('path')

const {
  materializeStandaloneAppletRoutes,
  pruneAppletApiStartRoutes,
  pruneAppletSourceFolders,
  pruneCanonicalStartAppletRoutes,
  pruneStandaloneMainStartRoutes,
} = require('./prebuildFolderPrune')

const makeTempProject = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'avoin-prune-test-'))

const routeFile = (routeId) => [
  "import { createFileRoute } from '@tanstack/react-router'",
  '',
  'export const Route = createFileRoute(',
  `  '${routeId}'`,
  ')({})',
  '',
].join('\n')

const luonnonmetsakartatLegacyImportRouteFile = () => [
  "import { createFileRoute } from '@tanstack/react-router'",
  '',
  'export const Route = createFileRoute(',
  "  '/$locale/_map/(applets)/luonnonmetsakartat/admin/tuo'",
  ')({',
  '  beforeLoad: () => {',
  "    redirectTo({ segments: ['luonnonmetsakartat', 'admin', 'import'] })",
  '  },',
  '})',
  '',
].join('\n')

const luonnonmetsakartatLegacyLayerRouteFile = () => [
  "import { createFileRoute } from '@tanstack/react-router'",
  '',
  'export const Route = createFileRoute(',
  "  '/$locale/_map/(applets)/luonnonmetsakartat/admin/taso'",
  ')({',
  '  beforeLoad: () => {',
  '    redirectTo({',
  '      segments: [',
  "        'luonnonmetsakartat',",
  "        'admin',",
  "        'layer',",
  '      ],',
  "      prefixSegments: ['luonnonmetsakartat', 'admin', 'taso'],",
  '    })',
  '  },',
  '})',
  '',
].join('\n')

const writeFile = ({ root, relativePath, content = '' }) => {
  const filePath = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
  return filePath
}

const writeDir = ({ root, relativePath }) => {
  fs.mkdirSync(path.join(root, relativePath), { recursive: true })
}

const exists = ({ root, relativePath }) =>
  fs.existsSync(path.join(root, relativePath))

const read = ({ root, relativePath }) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8')

const appletRoute = (...segments) =>
  path.join(
    'src',
    'routes',
    '$locale',
    '_map',
    '(applets)',
    ...segments
  )

const mapRoute = (...segments) =>
  path.join('src', 'routes', '$locale', '_map', ...segments)

const apiRoute = (...segments) => path.join('src', 'routes', 'api', ...segments)

const standaloneRoute = (...segments) => mapRoute('(standalone)', ...segments)

const makeBuildConfig = ({ includesMain, selected }) => ({
  compiledNonMain: selected,
  includesMain,
  keepOnlyApplet: includesMain ? null : selected[0],
  mode: includesMain ? 'main' : `standalone:${selected[0]}`,
  selectedApplets: new Set(selected),
})

const writeCommonFixture = (root) => {
  for (const namespace of [
    'main',
    'forests',
    'energiakartta',
    'hiilikartta',
    'luonnonmetsakartat',
    'ui-baseline',
  ]) {
    writeDir({ root, relativePath: path.join('src', 'applets', namespace) })
  }

  writeFile({
    root,
    relativePath: mapRoute('index.tsx'),
    content: routeFile('/$locale/_map/'),
  })
  writeFile({
    root,
    relativePath: mapRoute('route.tsx'),
    content: routeFile('/$locale/_map'),
  })
  writeFile({
    root,
    relativePath: apiRoute('hiilikartta', '$.ts'),
    content: 'export const Route = {}',
  })
  writeFile({
    root,
    relativePath: apiRoute('luonnonmetsakartat', '$.ts'),
    content: 'export const Route = {}',
  })

  writeFile({
    root,
    relativePath: appletRoute('forests', 'route.tsx'),
    content: routeFile('/$locale/_map/(applets)/forests'),
  })
  writeFile({
    root,
    relativePath: appletRoute('energy', 'route.tsx'),
    content: routeFile('/$locale/_map/(applets)/energy'),
  })
  writeFile({
    root,
    relativePath: appletRoute('energy', 'index.tsx'),
    content: routeFile('/$locale/_map/(applets)/energy/'),
  })
  writeFile({
    root,
    relativePath: appletRoute('carbon', 'route.tsx'),
    content: routeFile('/$locale/_map/(applets)/carbon'),
  })
  writeFile({
    root,
    relativePath: appletRoute('carbon', 'index.tsx'),
    content: routeFile('/$locale/_map/(applets)/carbon/'),
  })
  writeFile({
    root,
    relativePath: appletRoute('carbon', 'plans', 'route.tsx'),
    content: routeFile('/$locale/_map/(applets)/carbon/plans'),
  })
  writeFile({
    root,
    relativePath: appletRoute(
      'carbon',
      'plans',
      '$planId',
      'areas.tsx'
    ),
    content: routeFile(
      '/$locale/_map/(applets)/carbon/plans/$planId/areas'
    ),
  })
  writeFile({
    root,
    relativePath: appletRoute('carbon', 'report.tsx'),
    content: routeFile('/$locale/_map/(applets)/carbon/report'),
  })
  writeFile({
    root,
    relativePath: appletRoute('luonnonmetsakartat', 'route.tsx'),
    content: routeFile('/$locale/_map/(applets)/luonnonmetsakartat'),
  })
  writeFile({
    root,
    relativePath: appletRoute('luonnonmetsakartat', 'admin', 'route.tsx'),
    content: routeFile(
      '/$locale/_map/(applets)/luonnonmetsakartat/admin'
    ),
  })
  writeFile({
    root,
    relativePath: appletRoute(
      'luonnonmetsakartat',
      'admin',
      'layer',
      '$folayerIdSlug',
      'route.tsx'
    ),
    content: routeFile(
      '/$locale/_map/(applets)/luonnonmetsakartat/admin/layer/$folayerIdSlug'
    ),
  })
  writeFile({
    root,
    relativePath: appletRoute(
      'luonnonmetsakartat',
      'admin',
      'layer',
      '$folayerIdSlug',
      'settings.tsx'
    ),
    content: routeFile(
      '/$locale/_map/(applets)/luonnonmetsakartat/admin/layer/$folayerIdSlug/settings'
    ),
  })
  writeFile({
    root,
    relativePath: appletRoute('luonnonmetsakartat', 'admin', 'taso', 'route.tsx'),
    content: luonnonmetsakartatLegacyLayerRouteFile(),
  })
  writeFile({
    root,
    relativePath: appletRoute('luonnonmetsakartat', 'admin', 'tuo.tsx'),
    content: luonnonmetsakartatLegacyImportRouteFile(),
  })
  writeFile({
    root,
    relativePath: appletRoute('ui-baseline', 'route.tsx'),
    content: routeFile('/$locale/_map/(applets)/ui-baseline'),
  })
  writeFile({
    root,
    relativePath: appletRoute('ui-baseline', 'index.tsx'),
    content: routeFile('/$locale/_map/(applets)/ui-baseline/'),
  })
  writeFile({
    root,
    relativePath: appletRoute('ui-baseline', 'dropdowns.tsx'),
    content: routeFile('/$locale/_map/(applets)/ui-baseline/dropdowns'),
  })
}

const runPruneTopology = ({ root, buildConfig }) => {
  const materialized = materializeStandaloneAppletRoutes({
    buildConfig,
    projectRoot: root,
  })
  const removedSource = pruneAppletSourceFolders({
    buildConfig,
    projectRoot: root,
  })
  const removedCanonical = pruneCanonicalStartAppletRoutes({
    buildConfig,
    projectRoot: root,
  })
  const removedStandaloneMain = pruneStandaloneMainStartRoutes({
    buildConfig,
    projectRoot: root,
  })
  const removedApis = pruneAppletApiStartRoutes({
    buildConfig,
    projectRoot: root,
  })

  return {
    materialized,
    removedApis,
    removedCanonical,
    removedSource,
    removedStandaloneMain,
  }
}

describe('prebuildFolderPrune standalone route materialization', () => {
  let root

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
    root = undefined
  })

  it('materializes Hiilikartta root-shaped routes and prunes duplicate topology', () => {
    root = makeTempProject()
    writeCommonFixture(root)

    const result = runPruneTopology({
      root,
      buildConfig: makeBuildConfig({
        includesMain: false,
        selected: ['hiilikartta'],
      }),
    })

    expect(result.materialized.promotedFiles).toEqual(
      expect.arrayContaining([
        standaloneRoute('route.tsx'),
        standaloneRoute('plans', 'route.tsx'),
        standaloneRoute('plans', '$planId', 'areas.tsx'),
        standaloneRoute('report.tsx'),
      ])
    )
    expect(read({ root, relativePath: standaloneRoute('route.tsx') })).toContain(
      "createFileRoute('/$locale/_map/(standalone)')"
    )
    expect(
      read({ root, relativePath: standaloneRoute('plans', 'route.tsx') })
    ).toContain("createFileRoute('/$locale/_map/(standalone)/plans')")
    expect(
      read({
        root,
        relativePath: standaloneRoute(
          'plans',
          '$planId',
          'areas.tsx'
        ),
      })
    ).toContain(
      "createFileRoute('/$locale/_map/(standalone)/plans/$planId/areas')"
    )
    expect(exists({ root, relativePath: appletRoute('carbon') })).toBe(false)
    expect(exists({ root, relativePath: mapRoute('index.tsx') })).toBe(false)
    expect(result.removedStandaloneMain).toEqual([
      mapRoute('index.tsx'),
    ])
    expect(exists({ root, relativePath: mapRoute('plans') })).toBe(false)
    expect(exists({ root, relativePath: apiRoute('hiilikartta') })).toBe(true)
    expect(exists({ root, relativePath: apiRoute('luonnonmetsakartat') })).toBe(
      false
    )
    expect(
      exists({
        root,
        relativePath: path.join('src', 'applets', 'hiilikartta'),
      })
    ).toBe(true)
    expect(
      exists({
        root,
        relativePath: path.join('src', 'applets', 'energiakartta'),
      })
    ).toBe(false)
  })

  it('materializes Luonnonmetsakartat admin routes and keeps only selected API routes', () => {
    root = makeTempProject()
    writeCommonFixture(root)

    runPruneTopology({
      root,
      buildConfig: makeBuildConfig({
        includesMain: false,
        selected: ['luonnonmetsakartat'],
      }),
    })

    expect(
      read({
        root,
        relativePath: standaloneRoute(
          'admin',
          'layer',
          '$folayerIdSlug',
          'route.tsx'
        ),
      })
    ).toContain(
      "createFileRoute('/$locale/_map/(standalone)/admin/layer/$folayerIdSlug')"
    )
    expect(
      read({
        root,
        relativePath: standaloneRoute(
          'admin',
          'layer',
          '$folayerIdSlug',
          'settings.tsx'
        ),
      })
    ).toContain(
      "createFileRoute('/$locale/_map/(standalone)/admin/layer/$folayerIdSlug/settings')"
    )
    expect(
      read({
        root,
        relativePath: standaloneRoute('admin', 'taso', 'route.tsx'),
      })
    ).toContain(
      "createFileRoute('/$locale/_map/(standalone)/admin/taso')"
    )
    expect(
      read({
        root,
        relativePath: standaloneRoute('admin', 'taso', 'route.tsx'),
      })
    ).toContain("'admin',\n        'layer'")
    expect(
      read({
        root,
        relativePath: standaloneRoute('admin', 'taso', 'route.tsx'),
      })
    ).toContain("prefixSegments: ['admin', 'taso']")
    expect(
      read({
        root,
        relativePath: standaloneRoute('admin', 'tuo.tsx'),
      })
    ).toContain("segments: ['admin', 'import']")
    expect(exists({ root, relativePath: mapRoute('admin') })).toBe(false)
    expect(
      exists({ root, relativePath: appletRoute('luonnonmetsakartat') })
    ).toBe(false)
    expect(exists({ root, relativePath: apiRoute('luonnonmetsakartat') })).toBe(
      true
    )
    expect(exists({ root, relativePath: apiRoute('hiilikartta') })).toBe(false)
  })

  it('materializes Energiakartta from energy and does not promote the legacy folder', () => {
    root = makeTempProject()
    writeCommonFixture(root)

    runPruneTopology({
      root,
      buildConfig: makeBuildConfig({
        includesMain: false,
        selected: ['energiakartta'],
      }),
    })

    expect(read({ root, relativePath: standaloneRoute('route.tsx') })).toContain(
      "createFileRoute('/$locale/_map/(standalone)')"
    )
    expect(read({ root, relativePath: standaloneRoute('index.tsx') })).toContain(
      "createFileRoute('/$locale/_map/(standalone)/')"
    )
    expect(exists({ root, relativePath: appletRoute('energy') })).toBe(false)
    expect(exists({ root, relativePath: appletRoute('energiakartta') })).toBe(
      false
    )
    expect(exists({ root, relativePath: mapRoute('index.tsx') })).toBe(false)
    expect(exists({ root, relativePath: apiRoute('hiilikartta') })).toBe(false)
    expect(exists({ root, relativePath: apiRoute('luonnonmetsakartat') })).toBe(
      false
    )
  })

  it('keeps canonical selected routes and avoids standalone routes in full-app builds', () => {
    root = makeTempProject()
    writeCommonFixture(root)

    const result = runPruneTopology({
      root,
      buildConfig: makeBuildConfig({
        includesMain: true,
        selected: ['hiilikartta'],
      }),
    })

    expect(exists({ root, relativePath: standaloneRoute() })).toBe(false)
    expect(exists({ root, relativePath: appletRoute('carbon') })).toBe(true)
    expect(exists({ root, relativePath: appletRoute('hiilikartta') })).toBe(
      false
    )
    expect(exists({ root, relativePath: appletRoute('energy') })).toBe(false)
    expect(exists({ root, relativePath: appletRoute('forests') })).toBe(true)
    expect(
      exists({ root, relativePath: path.join('src', 'applets', 'forests') })
    ).toBe(true)
    expect(exists({ root, relativePath: mapRoute('plans') })).toBe(false)
    expect(exists({ root, relativePath: mapRoute('kaavat') })).toBe(false)
    expect(exists({ root, relativePath: mapRoute('index.tsx') })).toBe(true)
    expect(result.removedStandaloneMain).toEqual([])
    expect(exists({ root, relativePath: mapRoute('admin') })).toBe(false)
    expect(exists({ root, relativePath: apiRoute('hiilikartta') })).toBe(true)
    expect(exists({ root, relativePath: apiRoute('luonnonmetsakartat') })).toBe(
      false
    )
  })

  it('removes ui-baseline source and routes when it is not selected in a main build', () => {
    root = makeTempProject()
    writeCommonFixture(root)

    runPruneTopology({
      root,
      buildConfig: makeBuildConfig({
        includesMain: true,
        selected: ['energiakartta'],
      }),
    })

    expect(
      exists({
        root,
        relativePath: path.join('src', 'applets', 'ui-baseline'),
      })
    ).toBe(false)
    expect(exists({ root, relativePath: appletRoute('ui-baseline') })).toBe(
      false
    )
  })

  it('keeps ui-baseline source and routes when it is selected in a main build', () => {
    root = makeTempProject()
    writeCommonFixture(root)

    runPruneTopology({
      root,
      buildConfig: makeBuildConfig({
        includesMain: true,
        selected: ['ui-baseline'],
      }),
    })

    expect(
      exists({
        root,
        relativePath: path.join('src', 'applets', 'ui-baseline'),
      })
    ).toBe(true)
    expect(exists({ root, relativePath: appletRoute('ui-baseline') })).toBe(
      true
    )
    expect(exists({ root, relativePath: appletRoute('energy') })).toBe(false)
  })
})
