const fs = require('fs')
const os = require('os')
const path = require('path')

const {
  materializeStandaloneAppletRoutes,
  pruneAppletAliasStartRoutes,
  pruneAppletApiStartRoutes,
  pruneAppletSourceFolders,
  pruneCanonicalStartAppletRoutes,
  pruneStandaloneRootAliasStartRoutes,
  writePrunedVisibleAppletRootRoute,
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
  "  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/tuo'",
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
  "  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/taso'",
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
    '(map)',
    '_map',
    '(applets)',
    ...segments
  )

const mapRoute = (...segments) =>
  path.join('src', 'routes', '$locale', '(map)', '_map', ...segments)

const apiRoute = (...segments) => path.join('src', 'routes', 'api', ...segments)

const runtimeFile = (...segments) => path.join('src', 'runtime', ...segments)

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
  ]) {
    writeDir({ root, relativePath: path.join('src', 'applets', namespace) })
  }

  writeFile({
    root,
    relativePath: mapRoute('index.tsx'),
    content: routeFile('/$locale/(map)/_map/'),
  })
  writeFile({
    root,
    relativePath: mapRoute('route.tsx'),
    content: routeFile('/$locale/(map)/_map'),
  })
  writeFile({
    root,
    relativePath: mapRoute('plans', 'route.tsx'),
    content: routeFile('/$locale/(map)/_map/plans'),
  })
  writeFile({
    root,
    relativePath: mapRoute('kaavat', 'route.tsx'),
    content: routeFile('/$locale/(map)/_map/kaavat'),
  })
  writeFile({
    root,
    relativePath: mapRoute('report.tsx'),
    content: routeFile('/$locale/(map)/_map/report'),
  })
  writeFile({
    root,
    relativePath: mapRoute('raportti.tsx'),
    content: routeFile('/$locale/(map)/_map/raportti'),
  })
  writeFile({
    root,
    relativePath: mapRoute('admin', 'route.tsx'),
    content: routeFile('/$locale/(map)/_map/admin'),
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
    content: routeFile('/$locale/(map)/_map/(applets)/forests'),
  })
  writeFile({
    root,
    relativePath: appletRoute('energymap', 'route.tsx'),
    content: routeFile('/$locale/(map)/_map/(applets)/energymap'),
  })
  writeFile({
    root,
    relativePath: appletRoute('energymap', 'index.tsx'),
    content: routeFile('/$locale/(map)/_map/(applets)/energymap/'),
  })
  writeFile({
    root,
    relativePath: appletRoute('energiakartta', 'route.tsx'),
    content: routeFile('/$locale/(map)/_map/(applets)/energiakartta'),
  })
  writeFile({
    root,
    relativePath: appletRoute('carbonmap', 'route.tsx'),
    content: routeFile('/$locale/(map)/_map/(applets)/carbonmap'),
  })
  writeFile({
    root,
    relativePath: appletRoute('carbonmap', 'index.tsx'),
    content: routeFile('/$locale/(map)/_map/(applets)/carbonmap/'),
  })
  writeFile({
    root,
    relativePath: appletRoute('carbonmap', 'plans', 'route.tsx'),
    content: routeFile('/$locale/(map)/_map/(applets)/carbonmap/plans'),
  })
  writeFile({
    root,
    relativePath: appletRoute(
      'carbonmap',
      'plans',
      '$planId',
      'areas.tsx'
    ),
    content: routeFile(
      '/$locale/(map)/_map/(applets)/carbonmap/plans/$planId/areas'
    ),
  })
  writeFile({
    root,
    relativePath: appletRoute('carbonmap', 'report.tsx'),
    content: routeFile('/$locale/(map)/_map/(applets)/carbonmap/report'),
  })
  writeFile({
    root,
    relativePath: appletRoute('hiilikartta', 'route.tsx'),
    content: routeFile('/$locale/(map)/_map/(applets)/hiilikartta'),
  })
  writeFile({
    root,
    relativePath: appletRoute('luonnonmetsakartat', 'route.tsx'),
    content: routeFile('/$locale/(map)/_map/(applets)/luonnonmetsakartat'),
  })
  writeFile({
    root,
    relativePath: appletRoute('luonnonmetsakartat', 'admin', 'route.tsx'),
    content: routeFile(
      '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin'
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
      '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/layer/$folayerIdSlug'
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
      '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/layer/$folayerIdSlug/settings'
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
  const removedAliases = pruneAppletAliasStartRoutes({
    buildConfig,
    projectRoot: root,
  })
  const removedStandaloneAliases = pruneStandaloneRootAliasStartRoutes({
    buildConfig,
    projectRoot: root,
  })
  const removedApis = pruneAppletApiStartRoutes({
    buildConfig,
    projectRoot: root,
  })
  const generatedVisibleRootRoute = writePrunedVisibleAppletRootRoute({
    buildConfig,
    projectRoot: root,
  })

  return {
    generatedVisibleRootRoute,
    materialized,
    removedAliases,
    removedApis,
    removedCanonical,
    removedSource,
    removedStandaloneAliases,
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
      "createFileRoute('/$locale/(map)/_map/(standalone)')"
    )
    expect(
      read({ root, relativePath: standaloneRoute('plans', 'route.tsx') })
    ).toContain("createFileRoute('/$locale/(map)/_map/(standalone)/plans')")
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
      "createFileRoute('/$locale/(map)/_map/(standalone)/plans/$planId/areas')"
    )
    expect(exists({ root, relativePath: appletRoute('carbonmap') })).toBe(false)
    expect(exists({ root, relativePath: mapRoute('index.tsx') })).toBe(false)
    expect(exists({ root, relativePath: mapRoute('plans') })).toBe(false)
    expect(exists({ root, relativePath: mapRoute('report.tsx') })).toBe(false)
    expect(exists({ root, relativePath: apiRoute('hiilikartta') })).toBe(true)
    expect(exists({ root, relativePath: apiRoute('luonnonmetsakartat') })).toBe(
      false
    )
    expect(result.generatedVisibleRootRoute).toBe(
      runtimeFile('visibleAppletRootRoute.tsx')
    )
    expect(
      read({ root, relativePath: runtimeFile('visibleAppletRootRoute.tsx') })
    ).toContain("from 'applets/hiilikartta/routeComponents'")
    expect(
      read({ root, relativePath: runtimeFile('visibleAppletRootRoute.tsx') })
    ).not.toContain("from 'applets/main/page'")
    expect(
      read({ root, relativePath: runtimeFile('visibleAppletRootRoute.tsx') })
    ).not.toContain("from 'applets/energiakartta/routeComponents'")
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
      "createFileRoute('/$locale/(map)/_map/(standalone)/admin/layer/$folayerIdSlug')"
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
      "createFileRoute('/$locale/(map)/_map/(standalone)/admin/layer/$folayerIdSlug/settings')"
    )
    expect(
      read({
        root,
        relativePath: standaloneRoute('admin', 'taso', 'route.tsx'),
      })
    ).toContain(
      "createFileRoute('/$locale/(map)/_map/(standalone)/admin/taso')"
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

  it('materializes Energiakartta from energymap and does not promote the legacy folder', () => {
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
      "createFileRoute('/$locale/(map)/_map/(standalone)')"
    )
    expect(read({ root, relativePath: standaloneRoute('index.tsx') })).toContain(
      "createFileRoute('/$locale/(map)/_map/(standalone)/')"
    )
    expect(exists({ root, relativePath: appletRoute('energymap') })).toBe(false)
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
    expect(exists({ root, relativePath: appletRoute('carbonmap') })).toBe(true)
    expect(exists({ root, relativePath: appletRoute('hiilikartta') })).toBe(true)
    expect(exists({ root, relativePath: appletRoute('energymap') })).toBe(false)
    expect(exists({ root, relativePath: appletRoute('forests') })).toBe(true)
    expect(
      exists({ root, relativePath: path.join('src', 'applets', 'forests') })
    ).toBe(true)
    expect(exists({ root, relativePath: mapRoute('plans') })).toBe(true)
    expect(exists({ root, relativePath: mapRoute('admin') })).toBe(false)
    expect(exists({ root, relativePath: apiRoute('hiilikartta') })).toBe(true)
    expect(exists({ root, relativePath: apiRoute('luonnonmetsakartat') })).toBe(
      false
    )
    expect(result.generatedVisibleRootRoute).toBe(
      runtimeFile('visibleAppletRootRoute.tsx')
    )
    expect(
      read({ root, relativePath: runtimeFile('visibleAppletRootRoute.tsx') })
    ).toContain("from 'applets/main/page'")
    expect(
      read({ root, relativePath: runtimeFile('visibleAppletRootRoute.tsx') })
    ).toContain("from 'applets/hiilikartta/routeComponents'")
    expect(
      read({ root, relativePath: runtimeFile('visibleAppletRootRoute.tsx') })
    ).not.toContain("from 'applets/energiakartta/routeComponents'")
  })
})
