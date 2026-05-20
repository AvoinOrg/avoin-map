// Prune applet folders before building, based on NEXT_PUBLIC_COMPILED_APPLETS.
//
// This script is meant to be run in a throwaway workspace (see the tmp build
// scripts), because it deletes directories under src/app/[locale]/(map)/(applets).

const fs = require('fs')
const path = require('path')

const projectRoot = path.join(__dirname, '..', '..')
const appletsPath = path.join(
  projectRoot,
  'src',
  'app',
  '[locale]',
  '(map)',
  '(applets)'
)

const isRouteGroup = (name) => name.startsWith('(') && name.endsWith(')')

const normalizeName = (name) => {
  if (isRouteGroup(name)) return name.slice(1, -1)
  return name
}

const parseCompiledApplets = (raw) =>
  (raw || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const compiledApplets = parseCompiledApplets(
  process.env.NEXT_PUBLIC_COMPILED_APPLETS
)

if (compiledApplets.length === 0) {
  console.error(
    'prebuildFolderPrune: NEXT_PUBLIC_COMPILED_APPLETS is empty. Refusing to prune.'
  )
  process.exit(1)
}

const includesMain = compiledApplets.includes('main')
const compiledNonMain = compiledApplets.filter((ns) => ns !== 'main')

// In non-main builds we only support a single standalone applet.
if (!includesMain && compiledNonMain.length !== 1) {
  console.error(
    `prebuildFolderPrune: unsupported NEXT_PUBLIC_COMPILED_APPLETS=${JSON.stringify(
      compiledApplets.join(',')
    )}. Without "main", exactly one applet must be listed.`
  )
  process.exit(1)
}

const rmDir = (dirPath) => {
  fs.rmSync(dirPath, { recursive: true, force: true })
}

if (!fs.existsSync(appletsPath)) {
  console.warn(
    `prebuildFolderPrune: applets folder not found at ${appletsPath}; nothing to prune.`
  )
  process.exit(0)
}

const entries = fs.readdirSync(appletsPath, { withFileTypes: true })
const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

const keepOnlyApplet = !includesMain ? compiledNonMain[0] : null
const keepApplets = new Set(compiledNonMain)

const shouldRemoveInMainMode = (dirName) => {
  const normalized = normalizeName(dirName).toLowerCase()
  if (normalized === 'main') return false // keep the (main) route group
  return !keepApplets.has(normalized)
}

const shouldRemoveInStandaloneMode = (dirName) => {
  const normalized = normalizeName(dirName).toLowerCase()
  return normalized !== keepOnlyApplet
}

const existingAppletDirNames = new Set(
  dirs.map((dirName) => normalizeName(dirName).toLowerCase())
)

// Help catch typos: if we were asked to keep an applet that doesn't exist, fail fast.
const missing = compiledNonMain.filter((ns) => !existingAppletDirNames.has(ns))
if (missing.length > 0) {
  console.error(
    `prebuildFolderPrune: unknown applet folder(s): ${missing.join(
      ','
    )}. Expected to find them under ${appletsPath}.`
  )
  process.exit(1)
}

const removed = []
for (const dirName of dirs) {
  const fullPath = path.join(appletsPath, dirName)

  const remove = includesMain
    ? shouldRemoveInMainMode(dirName)
    : shouldRemoveInStandaloneMode(dirName)

  if (remove) {
    rmDir(fullPath)
    removed.push(dirName)
  }
}

// Helpful output for CI logs.
const mode = includesMain ? 'main' : `standalone:${keepOnlyApplet}`
console.log(
  `prebuildFolderPrune: mode=${mode}; removed=${removed.length ? removed.join(',') : '(none)'}`
)
