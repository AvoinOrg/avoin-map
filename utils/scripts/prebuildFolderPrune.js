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
const {
  getPublicAppletRouteSlug,
} = require('./publicRoutes')

const defaultProjectRoot = path.join(__dirname, '..', '..')

const getPrunePaths = (projectRoot) => {
  const startRoutesMapPath = path.join(
    projectRoot,
    'src',
    'routes',
    '$locale',
    '_map'
  )

  return {
    appletsPath: getAppletSourceRoot(projectRoot),
    startRoutesMapPath,
    startRoutesAppletPath: path.join(startRoutesMapPath, '(applets)'),
    standaloneRouteGroupPath: path.join(startRoutesMapPath, '(standalone)'),
  }
}

const appletVisibleRootAliasRoutes = {
  energiakartta: [],
  hiilikartta: [
    path.join('src', 'routes', '$locale', '_map', 'report.tsx'),
    path.join('src', 'routes', '$locale', '_map', 'raportti.tsx'),
  ],
  luonnonmetsakartat: [],
}

const appletApiRoutes = {
  energiakartta: [],
  hiilikartta: [path.join('src', 'routes', 'api', 'hiilikartta')],
  luonnonmetsakartat: [
    path.join('src', 'routes', 'api', 'luonnonmetsakartat'),
  ],
}

const mainBuildAppletSourceFolders = new Set(['main', 'forests'])

const standaloneVisibleRootRoutePaths = [
  path.join('src', 'routes', '$locale', '_map', 'index.tsx'),
]

const productionOnlyPrunedRoutes = [
  path.join('src', 'routes', '$locale', 'dev', 'component-fixtures'),
]

const appletLegacyStartRouteFolders = {
  energiakartta: ['energiakartta'],
  hiilikartta: ['hiilikartta'],
  luonnonmetsakartat: [],
}

const fail = (msg) => {
  throw new Error(msg)
}

const die = (msg) => {
  console.error(msg)
  process.exit(1)
}

const isRouteGroup = (name) => name.startsWith('(') && name.endsWith(')')

const normalizeName = (name) => {
  if (isRouteGroup(name)) return name.slice(1, -1)
  return name
}

const getStartRouteFolderNamesForNamespace = (namespace) => [
  getPublicAppletRouteSlug(namespace),
  ...(appletLegacyStartRouteFolders[namespace] || []),
]

const getStandaloneSourceRouteFolderName = ({ buildConfig }) => {
  const namespace = buildConfig.keepOnlyApplet
  if (!namespace) {
    fail(
      'prebuildFolderPrune: standalone route materialization requires keepOnlyApplet.'
    )
  }

  return getPublicAppletRouteSlug(namespace)
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

const assertTempWorkspace = ({ projectRoot = defaultProjectRoot } = {}) => {
  if (process.env[TEMP_WORKSPACE_ENV] !== '1') {
    fail(
      `prebuildFolderPrune: refusing to prune without ${TEMP_WORKSPACE_ENV}=1. Use prebuildFolderPruneTmp.js instead.`
    )
  }

  const markerPath = path.join(projectRoot, TEMP_WORKSPACE_MARKER)
  if (!fs.existsSync(markerPath)) {
    fail(
      `prebuildFolderPrune: refusing to prune without temp workspace marker ${markerPath}.`
    )
  }

  let marker
  try {
    marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'))
  } catch (error) {
    fail(
      `prebuildFolderPrune: invalid temp workspace marker ${markerPath}: ${error.message}`
    )
  }

  if (path.resolve(marker.tmpRoot || '') !== path.resolve(projectRoot)) {
    fail(
      `prebuildFolderPrune: temp workspace marker does not match current root ${projectRoot}.`
    )
  }

  if (path.resolve(marker.sourceRoot || '') === path.resolve(projectRoot)) {
    fail(
      'prebuildFolderPrune: temp workspace marker points sourceRoot at the current root; refusing to prune.'
    )
  }
}

const pruneAppletSourceFolders = ({
  buildConfig,
  projectRoot = defaultProjectRoot,
}) => {
  const { appletsPath } = getPrunePaths(projectRoot)

  if (!fs.existsSync(appletsPath)) {
    fail(`prebuildFolderPrune: applets folder not found at ${appletsPath}.`)
  }

  const dirs = readDirectories(appletsPath)
  const existingAppletDirNames = new Set(
    dirs.map((dirName) => normalizeName(dirName).toLowerCase())
  )

  const missing = buildConfig.compiledNonMain.filter(
    (namespace) => !existingAppletDirNames.has(namespace)
  )

  if (missing.length > 0) {
    fail(
      `prebuildFolderPrune: unknown applet folder(s): ${missing.join(
        ','
      )}. Expected to find them under ${appletsPath}.`
    )
  }

  const removed = []
  for (const dirName of dirs) {
    const normalized = normalizeName(dirName).toLowerCase()
    const remove = buildConfig.includesMain
      ? !mainBuildAppletSourceFolders.has(normalized) &&
        !buildConfig.selectedApplets.has(normalized)
      : normalized !== buildConfig.keepOnlyApplet

    if (remove) {
      rmDir(path.join(appletsPath, dirName))
      removed.push(dirName)
    }
  }

  return removed
}

const collectFiles = (dirPath) => {
  if (!fs.existsSync(dirPath)) return []

  const files = []
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

const isRouteSourceFile = (filePath) =>
  filePath.endsWith('.ts') || filePath.endsWith('.tsx')

const createFileRouteLiteralRe =
  /createFileRoute\(\s*(['"`])([^'"`]+)\1\s*\)/g

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const stripPromotedRedirectSegmentPrefix = ({
  source,
  sourceRouteFolderName,
}) => {
  const escapedFolderName = escapeRegExp(sourceRouteFolderName)
  const segmentPrefixRe = new RegExp(
    `(\\b(?:segments|prefixSegments):\\s*\\[\\s*)(['"\`])${escapedFolderName}\\2\\s*,\\s*`,
    'g'
  )
  let replacements = 0
  const updated = source.replace(segmentPrefixRe, (_match, prefix) => {
    replacements += 1
    return prefix
  })

  return { source: updated, replacements }
}

const rewritePromotedRouteFileLiterals = ({
  filePath,
  sourceRouteFolderName,
  sourceRoutePrefix,
  targetRoutePrefix,
}) => {
  const source = fs.readFileSync(filePath, 'utf8')
  if (!source.includes('createFileRoute')) {
    return { filePath, replacements: 0 }
  }

  let replacements = 0
  const routeLiteralUpdated = source.replace(
    createFileRouteLiteralRe,
    (match, quote, routeId) => {
      if (
        routeId !== sourceRoutePrefix &&
        !routeId.startsWith(`${sourceRoutePrefix}/`)
      ) {
        return match
      }

      replacements += 1
      const tail = routeId.slice(sourceRoutePrefix.length)
      return `createFileRoute(${quote}${targetRoutePrefix}${tail}${quote})`
    }
  )

  if (replacements === 0) {
    fail(
      `prebuildFolderPrune: promoted route file ${filePath} contains createFileRoute(...) but no literal starting with ${sourceRoutePrefix}.`
    )
  }

  if (routeLiteralUpdated.includes(sourceRoutePrefix)) {
    fail(
      `prebuildFolderPrune: promoted route file ${filePath} still contains ${sourceRoutePrefix} after route literal rewriting.`
    )
  }

  const { source: updated } = stripPromotedRedirectSegmentPrefix({
    source: routeLiteralUpdated,
    sourceRouteFolderName,
  })

  fs.writeFileSync(filePath, updated, 'utf8')

  return { filePath, replacements }
}

const materializeStandaloneAppletRoutes = ({
  buildConfig,
  projectRoot = defaultProjectRoot,
}) => {
  if (buildConfig.includesMain) {
    return {
      promotedFiles: [],
      sourceRouteFolder: null,
      sourceRoutePrefix: null,
      targetRouteFolder: null,
      targetRoutePrefix: null,
    }
  }

  const namespace = buildConfig.keepOnlyApplet
  if (!namespace) {
    fail(
      'prebuildFolderPrune: standalone route materialization requires exactly one selected applet.'
    )
  }

  const {
    startRoutesAppletPath,
    standaloneRouteGroupPath,
  } = getPrunePaths(projectRoot)
  const sourceRouteFolderName = getStandaloneSourceRouteFolderName({
    buildConfig,
  })
  const sourceRouteFolder = path.join(
    startRoutesAppletPath,
    sourceRouteFolderName
  )
  const sourceRoutePrefix = `/$locale/_map/(applets)/${sourceRouteFolderName}`
  const targetRoutePrefix = '/$locale/_map/(standalone)'

  if (!fs.existsSync(sourceRouteFolder)) {
    fail(
      `prebuildFolderPrune: missing canonical Start route folder for standalone applet ${namespace}: ${sourceRouteFolder}.`
    )
  }

  if (fs.existsSync(standaloneRouteGroupPath)) {
    fail(
      `prebuildFolderPrune: refusing to overwrite existing standalone route group: ${standaloneRouteGroupPath}.`
    )
  }

  fs.cpSync(sourceRouteFolder, standaloneRouteGroupPath, { recursive: true })

  const promotedFiles = collectFiles(standaloneRouteGroupPath)
    .filter(isRouteSourceFile)
    .map((filePath) =>
      rewritePromotedRouteFileLiterals({
        filePath,
        sourceRouteFolderName,
        sourceRoutePrefix,
        targetRoutePrefix,
      })
    )
    .filter((result) => result.replacements > 0)
    .map((result) => path.relative(projectRoot, result.filePath))

  if (promotedFiles.length === 0) {
    fail(
      `prebuildFolderPrune: standalone materialization for ${namespace} did not rewrite any route files under ${standaloneRouteGroupPath}.`
    )
  }

  return {
    promotedFiles,
    sourceRouteFolder: path.relative(projectRoot, sourceRouteFolder),
    sourceRoutePrefix,
    targetRouteFolder: path.relative(projectRoot, standaloneRouteGroupPath),
    targetRoutePrefix,
  }
}

const pruneCanonicalStartAppletRoutes = ({
  buildConfig,
  projectRoot = defaultProjectRoot,
}) => {
  const { startRoutesAppletPath } = getPrunePaths(projectRoot)

  if (!fs.existsSync(startRoutesAppletPath)) {
    return []
  }

  const dirs = readDirectories(startRoutesAppletPath)
  const existingRouteDirNames = new Set(
    dirs.map((dirName) => normalizeName(dirName).toLowerCase())
  )

  if (buildConfig.includesMain) {
    const missingRoutes = buildConfig.compiledNonMain.filter(
      (namespace) =>
        !existingRouteDirNames.has(getPublicAppletRouteSlug(namespace))
    )

    if (missingRoutes.length > 0) {
      fail(
        `prebuildFolderPrune: missing Start applet route folder(s): ${missingRoutes.join(
          ','
        )}. Expected to find them under ${startRoutesAppletPath}.`
      )
    }
  }

  const removed = []
  const selectedRouteFolderNames = new Set(
    Array.from(buildConfig.selectedApplets).flatMap((namespace) =>
      getStartRouteFolderNamesForNamespace(namespace)
    )
  )

  for (const dirName of dirs) {
    const normalized = normalizeName(dirName).toLowerCase()
    if (buildConfig.includesMain && normalized === 'forests') continue
    if (buildConfig.includesMain && selectedRouteFolderNames.has(normalized)) {
      continue
    }

    rmDir(path.join(startRoutesAppletPath, dirName))
    removed.push(path.join('src/routes/.../(applets)', dirName))
  }

  return removed
}

const removeRelativePaths = ({ relativePaths, projectRoot }) => {
  const removed = []

  for (const relativePath of relativePaths) {
    const fullPath = path.join(projectRoot, relativePath)
    if (!fs.existsSync(fullPath)) continue

    rmPath(fullPath)
    removed.push(relativePath)
  }

  return removed
}

const pruneAppletApiStartRoutes = ({
  buildConfig,
  projectRoot = defaultProjectRoot,
}) => {
  const removed = []

  for (const [namespace, relativePaths] of Object.entries(appletApiRoutes)) {
    if (buildConfig.selectedApplets.has(namespace)) continue

    removed.push(...removeRelativePaths({ relativePaths, projectRoot }))
  }

  return removed
}

const pruneAppletAliasStartRoutes = ({
  buildConfig,
  projectRoot = defaultProjectRoot,
}) => {
  const removed = []

  for (const [namespace, relativePaths] of Object.entries(
    appletVisibleRootAliasRoutes
  )) {
    if (buildConfig.selectedApplets.has(namespace)) continue

    removed.push(...removeRelativePaths({ relativePaths, projectRoot }))
  }

  return removed
}

const pruneStandaloneRootAliasStartRoutes = ({
  buildConfig,
  projectRoot = defaultProjectRoot,
}) => {
  if (buildConfig.includesMain) return []

  const namespace = buildConfig.keepOnlyApplet
  if (!namespace) return []

  return removeRelativePaths({
    projectRoot,
    relativePaths: [
      ...standaloneVisibleRootRoutePaths,
      ...(appletVisibleRootAliasRoutes[namespace] || []),
    ],
  })
}

const pruneProductionOnlyStartRoutes = ({
  projectRoot = defaultProjectRoot,
} = {}) => {
  const removed = []

  for (const relativePath of productionOnlyPrunedRoutes) {
    const fullPath = path.join(projectRoot, relativePath)
    if (!fs.existsSync(fullPath)) continue

    rmPath(fullPath)
    removed.push(relativePath)
  }

  return removed
}

const getStandaloneVisibleRootFallback = ({ buildConfig }) => {
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

const writePrunedVisibleAppletRootRoute = ({
  buildConfig,
  projectRoot = defaultProjectRoot,
}) => {
  const outputPath = path.join(
    projectRoot,
    'src',
    'runtime',
    'visibleAppletRootRoute.tsx'
  )
  const lines = [
    '// Generated inside a pruned temp build workspace by prebuildFolderPrune.js.',
    '// The live workspace keeps the full development visible-root switch.',
  ]

  if (buildConfig.includesMain) {
    lines.push("import MainPage from 'applets/main/page'")
  }

  if (buildConfig.selectedApplets.has('energiakartta')) {
    lines.push(
      "import { EnergiakarttaApplet } from 'applets/energiakartta/routeComponents'"
    )
  }

  if (buildConfig.selectedApplets.has('hiilikartta')) {
    lines.push(
      "import { HiilikarttaApplet } from 'applets/hiilikartta/routeComponents'"
    )
  }

  if (buildConfig.selectedApplets.has('luonnonmetsakartat')) {
    lines.push(
      "import { LuonnonmetsakartatApplet } from 'applets/luonnonmetsakartat/routeComponents'"
    )
  }

  lines.push(
    '',
    "import { getVisibleAppletRootNamespace } from './appletRouteGuards'",
    '',
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
    lines.push(getStandaloneVisibleRootFallback({ buildConfig }))
  }

  lines.push('}', '')

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8')

  return path.relative(projectRoot, outputPath)
}

const main = () => {
  try {
    const projectRoot = defaultProjectRoot

    assertTempWorkspace({ projectRoot })

    const buildConfig = getCompiledAppletConfig({
      projectRoot,
      scriptName: 'prebuildFolderPrune',
    })

    const materializedStandaloneRoutes = materializeStandaloneAppletRoutes({
      buildConfig,
      projectRoot,
    })
    const removedSource = pruneAppletSourceFolders({
      buildConfig,
      projectRoot,
    })
    const removedCanonicalRoutes = pruneCanonicalStartAppletRoutes({
      buildConfig,
      projectRoot,
    })
    const removedAliasRoutes = pruneAppletAliasStartRoutes({
      buildConfig,
      projectRoot,
    })
    const removedStandaloneAliasRoutes = pruneStandaloneRootAliasStartRoutes({
      buildConfig,
      projectRoot,
    })
    const removedApiRoutes = pruneAppletApiStartRoutes({
      buildConfig,
      projectRoot,
    })
    const removedProductionOnlyRoutes = pruneProductionOnlyStartRoutes({
      projectRoot,
    })
    const generatedVisibleRootRoute = writePrunedVisibleAppletRootRoute({
      buildConfig,
      projectRoot,
    })

    console.log(
      [
        `prebuildFolderPrune: mode=${buildConfig.mode}`,
        `materializedStandaloneRoutes=${
          materializedStandaloneRoutes.promotedFiles.length
            ? materializedStandaloneRoutes.promotedFiles.join(',')
            : '(none)'
        }`,
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
        `removedStandaloneAliasRoutes=${
          removedStandaloneAliasRoutes.length
            ? removedStandaloneAliasRoutes.join(',')
            : '(none)'
        }`,
        `removedApiRoutes=${
          removedApiRoutes.length ? removedApiRoutes.join(',') : '(none)'
        }`,
        `removedProductionOnlyRoutes=${
          removedProductionOnlyRoutes.length
            ? removedProductionOnlyRoutes.join(',')
            : '(none)'
        }`,
        `generatedVisibleRootRoute=${generatedVisibleRootRoute}`,
      ].join('; ')
    )
  } catch (error) {
    die(error.message)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  appletApiRoutes,
  appletVisibleRootAliasRoutes,
  assertTempWorkspace,
  getPrunePaths,
  materializeStandaloneAppletRoutes,
  pruneAppletAliasStartRoutes,
  pruneAppletApiStartRoutes,
  pruneAppletSourceFolders,
  pruneCanonicalStartAppletRoutes,
  pruneProductionOnlyStartRoutes,
  pruneStandaloneRootAliasStartRoutes,
  rewritePromotedRouteFileLiterals,
  writePrunedVisibleAppletRootRoute,
}
