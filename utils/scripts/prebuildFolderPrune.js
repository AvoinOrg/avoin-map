// Prune applet folders and Start routes before building.
//
// This script is destructive by design and must only run inside the
// non-destructive temp workspace created by prebuildFolderPruneTmp.js.

const fs = require('fs')
const path = require('path')
const {
  TEMP_WORKSPACE_ENV,
  TEMP_WORKSPACE_MARKER,
  getAppletSourceRoot,
  getCompiledAppletConfig,
} = require('./appletBuildConfig')

const projectRoot = path.join(__dirname, '..', '..')
const appletsPath = getAppletSourceRoot(projectRoot)
const startRoutesAppletPath = path.join(
  projectRoot,
  'src',
  'routes',
  '$locale',
  '(map)',
  '_map',
  '(applets)'
)

const appletRouteAliases = {
  energiakartta: [
    path.join('src', 'routes', '$locale', '(map)', '_map', 'energymap'),
  ],
  hiilikartta: [
    path.join('src', 'routes', '$locale', '(map)', '_map', 'kaavat'),
    path.join('src', 'routes', '$locale', '(map)', '_map', 'raportti.tsx'),
    path.join('src', 'routes', 'api', 'hiilikartta'),
  ],
  luonnonmetsakartat: [
    path.join('src', 'routes', '$locale', '(map)', '_map', 'admin'),
    path.join('src', 'routes', 'api', 'luonnonmetsakartat'),
  ],
}

const productionOnlyPrunedRoutes = [
  path.join('src', 'routes', '$locale', 'dev', 'component-fixtures'),
]

const die = (msg) => {
  console.error(msg)
  process.exit(1)
}

const isRouteGroup = (name) => name.startsWith('(') && name.endsWith(')')

const normalizeName = (name) => {
  if (isRouteGroup(name)) return name.slice(1, -1)
  return name
}

const rmDir = (dirPath) => {
  fs.rmSync(dirPath, { recursive: true, force: true })
}

const rmPath = (targetPath) => {
  fs.rmSync(targetPath, { recursive: true, force: true })
}

const readDirectories = (dirPath) =>
  fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

const assertTempWorkspace = () => {
  if (process.env[TEMP_WORKSPACE_ENV] !== '1') {
    die(
      `prebuildFolderPrune: refusing to prune without ${TEMP_WORKSPACE_ENV}=1. Use prebuildFolderPruneTmp.js instead.`
    )
  }

  const markerPath = path.join(projectRoot, TEMP_WORKSPACE_MARKER)
  if (!fs.existsSync(markerPath)) {
    die(
      `prebuildFolderPrune: refusing to prune without temp workspace marker ${markerPath}.`
    )
  }

  let marker
  try {
    marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'))
  } catch (error) {
    die(
      `prebuildFolderPrune: invalid temp workspace marker ${markerPath}: ${error.message}`
    )
  }

  if (path.resolve(marker.tmpRoot || '') !== path.resolve(projectRoot)) {
    die(
      `prebuildFolderPrune: temp workspace marker does not match current root ${projectRoot}.`
    )
  }

  if (path.resolve(marker.sourceRoot || '') === path.resolve(projectRoot)) {
    die(
      'prebuildFolderPrune: temp workspace marker points sourceRoot at the current root; refusing to prune.'
    )
  }
}

const pruneAppletSourceFolders = ({ buildConfig }) => {
  if (!fs.existsSync(appletsPath)) {
    die(`prebuildFolderPrune: applets folder not found at ${appletsPath}.`)
  }

  const dirs = readDirectories(appletsPath)
  const existingAppletDirNames = new Set(
    dirs.map((dirName) => normalizeName(dirName).toLowerCase())
  )

  const missing = buildConfig.compiledNonMain.filter(
    (namespace) => !existingAppletDirNames.has(namespace)
  )

  if (missing.length > 0) {
    die(
      `prebuildFolderPrune: unknown applet folder(s): ${missing.join(
        ','
      )}. Expected to find them under ${appletsPath}.`
    )
  }

  const removed = []
  for (const dirName of dirs) {
    const normalized = normalizeName(dirName).toLowerCase()
    const remove = buildConfig.includesMain
      ? normalized !== 'main' && !buildConfig.selectedApplets.has(normalized)
      : normalized !== buildConfig.keepOnlyApplet

    if (remove) {
      rmDir(path.join(appletsPath, dirName))
      removed.push(dirName)
    }
  }

  return removed
}

const pruneCanonicalStartAppletRoutes = ({ buildConfig }) => {
  if (!fs.existsSync(startRoutesAppletPath)) {
    return []
  }

  const dirs = readDirectories(startRoutesAppletPath)
  const existingRouteDirNames = new Set(
    dirs.map((dirName) => normalizeName(dirName).toLowerCase())
  )

  const missingRoutes = buildConfig.compiledNonMain.filter(
    (namespace) => !existingRouteDirNames.has(namespace)
  )

  if (missingRoutes.length > 0) {
    die(
      `prebuildFolderPrune: missing Start applet route folder(s): ${missingRoutes.join(
        ','
      )}. Expected to find them under ${startRoutesAppletPath}.`
    )
  }

  const removed = []
  for (const dirName of dirs) {
    const normalized = normalizeName(dirName).toLowerCase()
    if (buildConfig.selectedApplets.has(normalized)) continue

    rmDir(path.join(startRoutesAppletPath, dirName))
    removed.push(path.join('src/routes/.../(applets)', dirName))
  }

  return removed
}

const pruneAppletAliasStartRoutes = ({ buildConfig }) => {
  const removed = []

  for (const [namespace, relativePaths] of Object.entries(appletRouteAliases)) {
    if (buildConfig.selectedApplets.has(namespace)) continue

    for (const relativePath of relativePaths) {
      const fullPath = path.join(projectRoot, relativePath)
      if (!fs.existsSync(fullPath)) continue

      rmPath(fullPath)
      removed.push(relativePath)
    }
  }

  return removed
}

const pruneProductionOnlyStartRoutes = () => {
  const removed = []

  for (const relativePath of productionOnlyPrunedRoutes) {
    const fullPath = path.join(projectRoot, relativePath)
    if (!fs.existsSync(fullPath)) continue

    rmPath(fullPath)
    removed.push(relativePath)
  }

  return removed
}

const pushEnergiakarttaBridge = (lines) => {
  lines.push(
    "import EnergiakarttaLayoutClient from 'applets/energiakartta/pages/layoutClient'",
    "import EnergiakarttaPage from 'applets/energiakartta/pages/page'",
    '',
    'export const EnergiakarttaLayout = () => (',
    '  <EnergiakarttaLayoutClient>',
    '    <Outlet />',
    '  </EnergiakarttaLayoutClient>',
    ')',
    '',
    'export const EnergiakarttaApplet = ({ locale }: { locale: string }) => (',
    '  <EnergiakarttaLayoutClient>',
    '    <EnergiakarttaPage locale={locale} />',
    '  </EnergiakarttaLayoutClient>',
    ')',
    '',
    'export const EnergiakarttaIndexRoute = ({',
    '  locale,',
    '}: {',
    '  locale: string',
    '}) => <EnergiakarttaPage locale={locale} />',
    ''
  )
}

const pushHiilikarttaBridge = (lines) => {
  lines.push(
    "import HiilikarttaLayoutClient from 'applets/hiilikartta/pages/layoutClient'",
    "import HiilikarttaPage from 'applets/hiilikartta/pages/page'",
    "import HiilikarttaPlansLayout from 'applets/hiilikartta/pages/kaavat/layout'",
    "import HiilikarttaPlansPage from 'applets/hiilikartta/pages/kaavat/page'",
    "import HiilikarttaPlanLayout from 'applets/hiilikartta/pages/kaavat/plan/layout'",
    "import HiilikarttaPlanPage from 'applets/hiilikartta/pages/kaavat/plan/page'",
    "import HiilikarttaPlanAreasPage from 'applets/hiilikartta/pages/kaavat/plan/alueet/page'",
    "import HiilikarttaReportPage from 'applets/hiilikartta/pages/raportti/page'",
    '',
    'export const HiilikarttaLayout = () => (',
    '  <HiilikarttaLayoutClient>',
    '    <Outlet />',
    '  </HiilikarttaLayoutClient>',
    ')',
    '',
    'export const HiilikarttaApplet = () => (',
    '  <HiilikarttaLayoutClient>',
    '    <HiilikarttaPage />',
    '  </HiilikarttaLayoutClient>',
    ')',
    '',
    'export const HiilikarttaIndexRoute = () => <HiilikarttaPage />',
    '',
    'export const HiilikarttaPlansLayoutRoute = () => (',
    '  <HiilikarttaPlansLayout>',
    '    <Outlet />',
    '  </HiilikarttaPlansLayout>',
    ')',
    '',
    'export const HiilikarttaVisiblePlansLayoutRoute = () => (',
    '  <HiilikarttaLayoutClient>',
    '    <HiilikarttaPlansLayout>',
    '      <Outlet />',
    '    </HiilikarttaPlansLayout>',
    '  </HiilikarttaLayoutClient>',
    ')',
    '',
    'export const HiilikarttaPlansIndexRoute = () => <HiilikarttaPlansPage />',
    '',
    'export const HiilikarttaPlanLayoutRoute = () => (',
    '  <HiilikarttaPlanLayout>',
    '    <Outlet />',
    '  </HiilikarttaPlanLayout>',
    ')',
    '',
    'export const HiilikarttaPlanIndexRoute = () => <HiilikarttaPlanPage />',
    '',
    'export const HiilikarttaPlanAreasRoute = () => <HiilikarttaPlanAreasPage />',
    '',
    'export const HiilikarttaReportRoute = () => <HiilikarttaReportPage />',
    '',
    'export const HiilikarttaVisibleReportRoute = () => (',
    '  <HiilikarttaLayoutClient>',
    '    <HiilikarttaReportPage />',
    '  </HiilikarttaLayoutClient>',
    ')',
    ''
  )
}

const pushLuonnonmetsakartatBridge = (lines) => {
  lines.push(
    "import LuonnonmetsakartatLayoutClient from 'applets/luonnonmetsakartat/pages/layoutClient'",
    "import LuonnonmetsakartatPage from 'applets/luonnonmetsakartat/pages/page'",
    "import LuonnonmetsakartatAdminLayoutClient from 'applets/luonnonmetsakartat/pages/admin/layoutClient'",
    "import LuonnonmetsakartatAdminPage from 'applets/luonnonmetsakartat/pages/admin/page'",
    "import LuonnonmetsakartatImportPage from 'applets/luonnonmetsakartat/pages/admin/tuo/page'",
    "import LuonnonmetsakartatFolayerLayoutClient from 'applets/luonnonmetsakartat/pages/admin/taso/folayer/layoutClient'",
    "import LuonnonmetsakartatFolayerPage from 'applets/luonnonmetsakartat/pages/admin/taso/folayer/page'",
    "import LuonnonmetsakartatFolayerSettingsPage from 'applets/luonnonmetsakartat/pages/admin/taso/folayer/asetukset/page'",
    "import LuonnonmetsakartatFolayerPicturesPage from 'applets/luonnonmetsakartat/pages/admin/taso/folayer/kuvat/page'",
    '',
    'export const LuonnonmetsakartatLayout = () => (',
    '  <LuonnonmetsakartatLayoutClient>',
    '    <Outlet />',
    '  </LuonnonmetsakartatLayoutClient>',
    ')',
    '',
    'export const LuonnonmetsakartatApplet = () => (',
    '  <LuonnonmetsakartatLayoutClient>',
    '    <LuonnonmetsakartatPage />',
    '  </LuonnonmetsakartatLayoutClient>',
    ')',
    '',
    'export const LuonnonmetsakartatIndexRoute = () => (',
    '  <LuonnonmetsakartatPage />',
    ')',
    '',
    'export const LuonnonmetsakartatAdminLayout = () => (',
    '  <LuonnonmetsakartatAdminLayoutClient>',
    '    <Outlet />',
    '  </LuonnonmetsakartatAdminLayoutClient>',
    ')',
    '',
    'export const LuonnonmetsakartatVisibleAdminLayout = () => (',
    '  <LuonnonmetsakartatLayoutClient>',
    '    <LuonnonmetsakartatAdminLayoutClient>',
    '      <Outlet />',
    '    </LuonnonmetsakartatAdminLayoutClient>',
    '  </LuonnonmetsakartatLayoutClient>',
    ')',
    '',
    'export const LuonnonmetsakartatAdminIndexRoute = () => (',
    '  <LuonnonmetsakartatAdminPage />',
    ')',
    '',
    'export const LuonnonmetsakartatImportRoute = () => (',
    '  <LuonnonmetsakartatImportPage />',
    ')',
    '',
    'export const LuonnonmetsakartatFolayerLayout = () => (',
    '  <LuonnonmetsakartatFolayerLayoutClient>',
    '    <Outlet />',
    '  </LuonnonmetsakartatFolayerLayoutClient>',
    ')',
    '',
    'export const LuonnonmetsakartatFolayerIndexRoute = () => (',
    '  <LuonnonmetsakartatFolayerPage />',
    ')',
    '',
    'export const LuonnonmetsakartatFolayerSettingsRoute = () => (',
    '  <LuonnonmetsakartatFolayerSettingsPage />',
    ')',
    '',
    'export const LuonnonmetsakartatFolayerPicturesRoute = () => (',
    '  <LuonnonmetsakartatFolayerPicturesPage />',
    ')',
    ''
  )
}

const getStandaloneFallbackRoute = ({ buildConfig }) => {
  if (buildConfig.keepOnlyApplet === 'energiakartta') {
    return '  return <EnergiakarttaApplet locale={locale} />'
  }

  if (buildConfig.keepOnlyApplet === 'hiilikartta') {
    return '  return <HiilikarttaApplet />'
  }

  if (buildConfig.keepOnlyApplet === 'luonnonmetsakartat') {
    return '  return <LuonnonmetsakartatApplet />'
  }

  return '  return null'
}

const writePrunedAppletRouteComponents = ({ buildConfig }) => {
  const outputPath = path.join(
    projectRoot,
    'src',
    'runtime',
    'appletRouteComponents.tsx'
  )
  const lines = [
    '// Generated inside a pruned temp build workspace by prebuildFolderPrune.js.',
    '// The live workspace keeps the full development bridge.',
    "import { Outlet } from '@tanstack/react-router'",
  ]

  if (buildConfig.includesMain) {
    lines.push("import MainPage from 'applets/main/page'")
  }

  lines.push(
    '',
    "import { getVisibleAppletRootNamespace } from './appletRouteGuards'",
    ''
  )

  if (buildConfig.selectedApplets.has('energiakartta')) {
    pushEnergiakarttaBridge(lines)
  }

  if (buildConfig.selectedApplets.has('hiilikartta')) {
    pushHiilikarttaBridge(lines)
  }

  if (buildConfig.selectedApplets.has('luonnonmetsakartat')) {
    pushLuonnonmetsakartatBridge(lines)
  }

  lines.push(
    'export const VisibleAppletRootRoute = ({ locale }: { locale: string }) => {',
    '  const namespace = getVisibleAppletRootNamespace()',
    ''
  )

  if (buildConfig.selectedApplets.has('energiakartta')) {
    lines.push(
      "  if (namespace === 'energiakartta') {",
      '    return <EnergiakarttaApplet locale={locale} />',
      '  }',
      ''
    )
  }

  if (buildConfig.selectedApplets.has('hiilikartta')) {
    lines.push(
      "  if (namespace === 'hiilikartta') {",
      '    return <HiilikarttaApplet />',
      '  }',
      ''
    )
  }

  if (buildConfig.selectedApplets.has('luonnonmetsakartat')) {
    lines.push(
      "  if (namespace === 'luonnonmetsakartat') {",
      '    return <LuonnonmetsakartatApplet />',
      '  }',
      ''
    )
  }

  if (buildConfig.includesMain) {
    lines.push('  return <MainPage />')
  } else {
    lines.push(getStandaloneFallbackRoute({ buildConfig }))
  }

  lines.push('}', '')

  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8')

  return path.relative(projectRoot, outputPath)
}

const main = () => {
  assertTempWorkspace()

  let buildConfig
  try {
    buildConfig = getCompiledAppletConfig({
      projectRoot,
      scriptName: 'prebuildFolderPrune',
    })
  } catch (error) {
    die(error.message)
  }

  const removedSource = pruneAppletSourceFolders({ buildConfig })
  const removedCanonicalRoutes = pruneCanonicalStartAppletRoutes({
    buildConfig,
  })
  const removedAliasRoutes = pruneAppletAliasStartRoutes({ buildConfig })
  const removedProductionOnlyRoutes = pruneProductionOnlyStartRoutes()
  const generatedBridge = writePrunedAppletRouteComponents({ buildConfig })

  console.log(
    [
      `prebuildFolderPrune: mode=${buildConfig.mode}`,
      `removedAppSource=${
        removedSource.length ? removedSource.join(',') : '(none)'
      }`,
      `removedStartAppletRoutes=${
        removedCanonicalRoutes.length
          ? removedCanonicalRoutes.join(',')
          : '(none)'
      }`,
      `removedStartAliasRoutes=${
        removedAliasRoutes.length ? removedAliasRoutes.join(',') : '(none)'
      }`,
      `removedProductionOnlyRoutes=${
        removedProductionOnlyRoutes.length
          ? removedProductionOnlyRoutes.join(',')
          : '(none)'
      }`,
      `generatedBridge=${generatedBridge}`,
    ].join('; ')
  )
}

main()
