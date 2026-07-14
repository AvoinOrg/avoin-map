#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { spawn, spawnSync } = require('child_process')

require('dotenv').config()

const {
  DEFAULT_BASELINE_DIFF_THRESHOLD,
  DEFAULT_SERVER_TIMEOUT_MS,
  DEFAULT_SETTLE_MS,
  DEFAULT_VIEWPORTS,
  VISUAL_DIRS,
} = require('../../visual/constants')
const {
  DEFAULT_SCENARIO_SET,
  SUPPORTED_SCENARIO_SETS,
  buildVisualScenarios,
} = require('../../visual/scenarios')
const { resolveImpactedScenarios } = require('../../visual/impactMap')
const {
  buildPlaywrightContextOptions,
  validateStorageStateFile,
  warnOnStorageStateOriginMismatch,
} = require('./playwrightContext')
const {
  BROWSER_MODE_AUTO,
  SUPPORTED_BROWSER_MODES,
  assertWebGLAvailable,
  getChromiumLaunchOptions,
  maybeReexecInsideXvfb,
  resolveBrowserMode,
} = require('./browserRuntime')

const DEFAULT_MIN_NON_WHITE_PIXELS = 500
const VISUAL_CONTENT_WHITE_THRESHOLD = 248
const DEFAULT_APP_BASE_URL = 'http://127.0.0.1:6900'
const DEFAULT_START_COMMAND = 'yarn start:dev'

const HELP_TEXT = `\
Usage:
  node utils/scripts/visual/run.js --mode=baseline [--base-url=${DEFAULT_APP_BASE_URL}]
  node utils/scripts/visual/run.js --mode=changed [--files=a.tsx,b.tsx] [--base-url=${DEFAULT_APP_BASE_URL}]
  node utils/scripts/visual/run.js --mode=changed --base-url=http://localhost:6900 --storage-state=.dev/browser-state/localhost-6900.storage-state.json

Options:
  --mode baseline|changed     Run baseline generation or regression check
  --browser-mode <mode>       Browser mode: ${SUPPORTED_BROWSER_MODES.join('|')} (default: ${BROWSER_MODE_AUTO})
  --scenario-set <set>        Scenario set: ${SUPPORTED_SCENARIO_SETS.join('|')} (default: ${DEFAULT_SCENARIO_SET})
  --files <csv>               Comma-separated changed files for targeted mode
  --base-url <url>            Base URL for the running TanStack Start app
  --storage-state <path>      Playwright storage state JSON (cookies/localStorage/IndexedDB)
  --start-command <cmd>       Command used if the dev server is not already running (default: ${DEFAULT_START_COMMAND})
  --no-start                  Fail instead of attempting to start the dev server
  --help                      Show this help

Behavior:
  The runner probes --base-url first and reuses an existing dev server when reachable.
  Browser navigation remaps http://127.0.0.1:<port> to http://localhost:<port>
  so captures share localhost-origin browser state with host/container workflows.
  It only spawns a temporary server with --start-command as a fallback (unless --no-start is set).
  Captures fail when the screenshot is blank or near-blank after visual masks are applied.
  Browser mode "auto" switches WebGL scenarios to Xvfb-backed Chromium and keeps
  non-WebGL scenarios in true headless mode.
`

const ensureDir = (dirPath) => fs.mkdirSync(dirPath, { recursive: true })

const requireOrThrow = ({ id, installHint }) => {
  try {
    return require(id)
  } catch (error) {
    if (error && error.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `Missing dependency "${id}". Run \`yarn install\` and then ${
          installHint || '`yarn visual:install`'
        }.`
      )
    }
    throw error
  }
}

const parseArgs = (argv) => {
  const args = {
    mode: null,
    browserMode: BROWSER_MODE_AUTO,
    scenarioSet: process.env.VISUAL_SCENARIO_SET || DEFAULT_SCENARIO_SET,
    files: [],
    baseUrl: null,
    storageState: null,
    startCommand: DEFAULT_START_COMMAND,
    noStart: false,
    help: false,
  }

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]

    if (token === '--help' || token === '-h') {
      args.help = true
      continue
    }

    if (token === '--no-start') {
      args.noStart = true
      continue
    }

    if (token.startsWith('--mode=')) {
      args.mode = token.slice('--mode='.length)
      continue
    }
    if (token === '--mode') {
      args.mode = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--browser-mode=')) {
      args.browserMode = token.slice('--browser-mode='.length)
      continue
    }
    if (token === '--browser-mode') {
      args.browserMode = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--scenario-set=')) {
      args.scenarioSet = token.slice('--scenario-set='.length)
      continue
    }
    if (token === '--scenario-set') {
      args.scenarioSet = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--base-url=')) {
      args.baseUrl = token.slice('--base-url='.length)
      continue
    }
    if (token === '--base-url') {
      args.baseUrl = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--storage-state=')) {
      args.storageState = token.slice('--storage-state='.length)
      continue
    }
    if (token === '--storage-state') {
      args.storageState = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--start-command=')) {
      args.startCommand = token.slice('--start-command='.length)
      continue
    }
    if (token === '--start-command') {
      args.startCommand = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--files=')) {
      args.files.push(token.slice('--files='.length))
      continue
    }
    if (token === '--files') {
      args.files.push(argv[i + 1] || '')
      i++
      continue
    }
  }

  args.files = args.files
    .flatMap((entry) => String(entry || '').split(','))
    .map((entry) => entry.trim())
    .filter(Boolean)

  return args
}

const getDefaultBaseUrl = () => DEFAULT_APP_BASE_URL

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

const getBrowserCaptureBaseUrl = (baseUrl) => {
  try {
    const url = new URL(baseUrl)
    if (url.hostname === '127.0.0.1') {
      url.hostname = 'localhost'
      return trimTrailingSlash(url.toString())
    }
  } catch {
    // Relative and non-standard URLs are left as they are.
  }

  return trimTrailingSlash(baseUrl)
}

const fileExists = (targetPath) => {
  try {
    fs.accessSync(targetPath)
    return true
  } catch {
    return false
  }
}

const safeUnlink = (targetPath) => {
  try {
    fs.unlinkSync(targetPath)
  } catch {
    // ignore
  }
}

const readLines = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

const runGit = (args) => {
  const result = spawnSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    return []
  }

  return readLines(result.stdout)
}

const collectChangedFilesFromGit = () => {
  const unstaged = runGit(['diff', '--name-only', '--relative'])
  const staged = runGit(['diff', '--cached', '--name-only', '--relative'])
  const untracked = runGit(['ls-files', '--others', '--exclude-standard'])
  return Array.from(new Set([...unstaged, ...staged, ...untracked]))
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isServerAvailable = async (baseUrl) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
    })
    return response.status > 0
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

const waitForServer = async ({ baseUrl, timeoutMs }) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerAvailable(baseUrl)) {
      return true
    }
    await delay(1000)
  }
  return false
}

const startServerIfNeeded = async ({ baseUrl, noStart, startCommand }) => {
  ensureDir(VISUAL_DIRS.report)

  if (await isServerAvailable(baseUrl)) {
    return { started: false }
  }

  if (noStart) {
    throw new Error(`Dev server is not reachable at ${baseUrl} and --no-start was set`)
  }

  const logPath = path.join(VISUAL_DIRS.report, 'visual-runner.log')
  const logStream = fs.createWriteStream(logPath, { flags: 'a' })
  logStream.write(`\n[${new Date().toISOString()}] Starting server: ${startCommand}\n`)

  const child = spawn('/bin/bash', ['-lc', startCommand], {
    cwd: process.cwd(),
    detached: true,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout.pipe(logStream)
  child.stderr.pipe(logStream)
  child.unref()

  const ready = await waitForServer({
    baseUrl,
    timeoutMs: DEFAULT_SERVER_TIMEOUT_MS,
  })

  if (!ready) {
    try {
      process.kill(-child.pid, 'SIGTERM')
    } catch {
      // ignore
    }
    throw new Error(
      `Timed out waiting for dev server at ${baseUrl}. See ${logPath} for logs.`
    )
  }

  return {
    started: true,
    pid: child.pid,
    logPath,
    stop: () => {
      try {
        process.kill(-child.pid, 'SIGTERM')
      } catch {
        // ignore
      }
    },
  }
}

const loadDiffLibs = () => {
  let pixelmatch = requireOrThrow({ id: 'pixelmatch', installHint: '`yarn install`' })
  if (pixelmatch && typeof pixelmatch !== 'function' && pixelmatch.default) {
    pixelmatch = pixelmatch.default
  }
  const { PNG } = requireOrThrow({ id: 'pngjs', installHint: '`yarn install`' })
  return { pixelmatch, PNG }
}

const readPng = ({ PNG, filePath }) => PNG.sync.read(fs.readFileSync(filePath))

const analyzeScreenshotContent = ({ filePath }) => {
  const { PNG } = loadDiffLibs()
  const png = readPng({ PNG, filePath })
  let nonWhitePixels = 0
  let nonTransparentPixels = 0
  const colorSample = new Set()

  for (let index = 0; index < png.data.length; index += 4) {
    const red = png.data[index]
    const green = png.data[index + 1]
    const blue = png.data[index + 2]
    const alpha = png.data[index + 3]

    if (alpha > 0) {
      nonTransparentPixels += 1
      if (
        red <= VISUAL_CONTENT_WHITE_THRESHOLD ||
        green <= VISUAL_CONTENT_WHITE_THRESHOLD ||
        blue <= VISUAL_CONTENT_WHITE_THRESHOLD
      ) {
        nonWhitePixels += 1
      }
    }

    if (colorSample.size < 12) {
      colorSample.add(`${red},${green},${blue},${alpha}`)
    }
  }

  const totalPixels = png.width * png.height
  return {
    width: png.width,
    height: png.height,
    totalPixels,
    nonTransparentPixels,
    nonWhitePixels,
    nonWhiteRatio: totalPixels > 0 ? nonWhitePixels / totalPixels : 0,
    colorSample: Array.from(colorSample),
  }
}

const assertScreenshotHasContent = ({ currentPath, scenario, viewport }) => {
  const screenshotContent = analyzeScreenshotContent({ filePath: currentPath })
  const minNonWhitePixels =
    typeof scenario.minNonWhitePixels === 'number'
      ? scenario.minNonWhitePixels
      : DEFAULT_MIN_NON_WHITE_PIXELS

  if (screenshotContent.nonWhitePixels < minNonWhitePixels) {
    throw new Error(
      `Screenshot content check failed for ${scenario.id}/${viewport.id}: ` +
        `${screenshotContent.nonWhitePixels} non-white pixels; expected at least ${minNonWhitePixels}. ` +
        'This usually means the app shell did not render or a mask hid all visible content.'
    )
  }

  return screenshotContent
}

const createBlankPng = ({ PNG, width, height }) => {
  const png = new PNG({ width, height })
  png.data.fill(0)
  return png
}

const padPngToSize = ({ PNG, source, width, height }) => {
  if (source.width === width && source.height === height) {
    return source
  }
  const out = createBlankPng({ PNG, width, height })
  PNG.bitblt(source, out, 0, 0, source.width, source.height, 0, 0)
  return out
}

const compareImages = ({ baselinePath, currentPath, diffPath }) => {
  const { pixelmatch, PNG } = loadDiffLibs()
  const baseline = readPng({ PNG, filePath: baselinePath })
  const current = readPng({ PNG, filePath: currentPath })

  const width = Math.max(baseline.width, current.width)
  const height = Math.max(baseline.height, current.height)

  const paddedBaseline = padPngToSize({ PNG, source: baseline, width, height })
  const paddedCurrent = padPngToSize({ PNG, source: current, width, height })
  const diff = new PNG({ width, height })

  const mismatchPixels = pixelmatch(
    paddedBaseline.data,
    paddedCurrent.data,
    diff.data,
    width,
    height,
    {
      threshold: 0.1,
      alpha: 0.5,
      includeAA: true,
    }
  )

  ensureDir(path.dirname(diffPath))
  fs.writeFileSync(diffPath, PNG.sync.write(diff))

  return {
    mismatchPixels,
    width,
    height,
    baselineSize: { width: baseline.width, height: baseline.height },
    currentSize: { width: current.width, height: current.height },
  }
}

const sanitizeMaskSelectors = (selectors) =>
  Array.from(new Set((selectors || []).map((s) => String(s || '').trim()).filter(Boolean)))

const applyStabilityStyles = async ({ page, maskSelectors }) => {
  const selectors = sanitizeMaskSelectors(maskSelectors)
  const maskRule = selectors.length
    ? `${selectors.join(', ')} { opacity: 0 !important; }`
    : ''

  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
        caret-color: transparent !important;
      }
      ${maskRule}
    `,
  })
}

const waitForMapActionsToSettle = async ({ page }) => {
  try {
    await page.waitForFunction(
      () => {
        const mapActions = document.querySelector('.map-actions-wrapper')
        if (!mapActions) {
          return true
        }

        return !Array.from(
          mapActions.querySelectorAll('button[disabled]')
        ).some((button) => (button.textContent || '').trim().length === 0)
      },
      null,
      { timeout: 10000 }
    )
  } catch {
    // Continue to screenshot; the pixel content check still catches unusable captures.
  }
}

const gotoScenario = async ({ page, scenario, attempts = 3 }) => {
  let lastError = null

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await page.goto(scenario.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      })
    } catch (error) {
      lastError = error
      if (attempt === attempts) {
        break
      }
      await delay(1000 * attempt)
    }
  }

  throw lastError
}

const captureScreenshot = async ({
  browser,
  scenario,
  viewport,
  currentPath,
  storageStatePath,
}) => {
  const context = await browser.newContext(
    buildPlaywrightContextOptions({
      viewport,
      storageStatePath,
    })
  )

  const page = await context.newPage()

  try {
    const response = await gotoScenario({ page, scenario })
    const status = response ? response.status() : null
    if (status && status >= 400) {
      throw new Error(`Route returned HTTP ${status} for ${scenario.url}`)
    }

    try {
      await page.waitForSelector(scenario.waitFor || 'body', { timeout: 15000 })
    } catch {
      // keep going; some routes may still render late/conditionally
    }

    await page.waitForFunction(
      () => {
        const textLength = document.body?.innerText?.trim().length || 0
        return (
          textLength > 0 ||
          !!document.querySelector(
            '#map, .layout-container, .map-actions-wrapper, main, [data-testid]'
          )
        )
      },
      null,
      { timeout: 15000 }
    )

    try {
      await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready
        }
      })
    } catch {
      // ignore
    }

    await waitForMapActionsToSettle({ page })
    await page.waitForTimeout(DEFAULT_SETTLE_MS)
    await applyStabilityStyles({ page, maskSelectors: scenario.maskSelectors })
    await page.waitForTimeout(200)

    ensureDir(path.dirname(currentPath))
    await page.screenshot({
      path: currentPath,
      fullPage: false,
      animations: 'disabled',
      caret: 'hide',
    })

    return assertScreenshotHasContent({ currentPath, scenario, viewport })
  } finally {
    await context.close()
  }
}

const getImagePath = ({ bucket, scenarioId, viewportId }) =>
  path.join(bucket, scenarioId, `${viewportId}.png`)

const writeJson = ({ filePath, value }) => {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const printSummary = ({ report }) => {
  const lines = []
  lines.push(`Mode: ${report.mode}`)
  lines.push(`Base URL: ${report.baseUrl}`)
  if (report.browserCaptureBaseUrl && report.browserCaptureBaseUrl !== report.baseUrl) {
    lines.push(`Browser capture URL: ${report.browserCaptureBaseUrl}`)
  }
  lines.push(`Browser mode: ${report.browserMode.effective} (requested: ${report.browserMode.requested})`)
  lines.push(`Scenario set: ${report.scenarioSet}`)
  if (report.storageStatePath) {
    lines.push(`Storage state: ${report.storageStatePath}`)
  }
  lines.push(`Scenarios: ${report.selectedScenarioIds.length}/${report.totalScenarioCount}`)
  if (report.changedFiles.length > 0) {
    lines.push(`Changed files: ${report.changedFiles.length}`)
  }
  lines.push('Results:')

  for (const result of report.results) {
    const status = result.status.toUpperCase()
    const prefix = result.mismatchPixels > 0 ? ` (${result.mismatchPixels} px)` : ''
    lines.push(`- [${status}] ${result.scenarioId}/${result.viewportId}${prefix}`)
    if (result.error) {
      lines.push(`  error: ${result.error}`)
    }
    if (result.status === 'missing-baseline') {
      lines.push(`  baseline: ${result.baselinePath}`)
    }
    if (result.status === 'changed') {
      lines.push(`  diff: ${result.diffPath}`)
    }
  }

  console.log(lines.join('\n'))
}

const run = async () => {
  const args = parseArgs(process.argv.slice(2))

  if (args.help || !args.mode) {
    console.log(HELP_TEXT)
    process.exit(args.help ? 0 : 1)
  }

  const mode = String(args.mode).toLowerCase()
  if (!['baseline', 'changed'].includes(mode)) {
    throw new Error(`Unsupported mode: ${args.mode}`)
  }

  const baseUrl = args.baseUrl || getDefaultBaseUrl()
  const browserCaptureBaseUrl = getBrowserCaptureBaseUrl(baseUrl)
  const storageStatePath = args.storageState
    ? validateStorageStateFile({ storageStatePath: args.storageState })
    : null

  if (storageStatePath) {
    warnOnStorageStateOriginMismatch({
      baseUrl: browserCaptureBaseUrl,
      storageStatePath,
      logger: (message) => console.warn(message),
    })
  }

  const allScenarios = buildVisualScenarios({
    baseUrl: browserCaptureBaseUrl,
    scenarioSet: args.scenarioSet,
  })

  const changedFiles = args.files.length > 0 ? args.files : collectChangedFilesFromGit()
  const impact =
    mode === 'changed'
      ? resolveImpactedScenarios({ files: changedFiles, scenarios: allScenarios })
      : {
          scenarioIds: allScenarios.map((scenario) => scenario.id),
          mode: 'all',
          reasons: ['Baseline mode always runs all scenarios'],
          fileMatches: {},
        }

  const selectedScenarios = allScenarios.filter((scenario) =>
    impact.scenarioIds.includes(scenario.id)
  )

  if (selectedScenarios.length === 0) {
    throw new Error('No visual scenarios selected')
  }

  const effectiveBrowserMode = resolveBrowserMode({
    browserMode: args.browserMode,
    scenarios: selectedScenarios,
  })
  const xvfbBootstrap = maybeReexecInsideXvfb({
    browserMode: effectiveBrowserMode,
  })
  if (xvfbBootstrap.reexecuted) {
    process.exit(xvfbBootstrap.exitCode)
  }

  ensureDir(VISUAL_DIRS.root)
  ensureDir(VISUAL_DIRS.baseline)
  ensureDir(VISUAL_DIRS.current)
  ensureDir(VISUAL_DIRS.diff)
  ensureDir(VISUAL_DIRS.report)

  const server = await startServerIfNeeded({
    baseUrl,
    noStart: args.noStart,
    startCommand: args.startCommand,
  })
  if (browserCaptureBaseUrl !== baseUrl && !(await isServerAvailable(browserCaptureBaseUrl))) {
    throw new Error(
      `Browser capture URL is not reachable at ${browserCaptureBaseUrl}; ` +
        `server probe URL was ${baseUrl}.`
    )
  }

  const { chromium } = requireOrThrow({
    id: '@playwright/test',
    installHint: '`yarn install` and `yarn visual:install`',
  })
  const browser = await chromium.launch(
    getChromiumLaunchOptions({ browserMode: effectiveBrowserMode })
  )

  const results = []
  let failed = false

  try {
    if (selectedScenarios.some((scenario) => scenario.requiresWebGL)) {
      await assertWebGLAvailable({
        browser,
        browserMode: effectiveBrowserMode,
      })
    }

    for (const scenario of selectedScenarios) {
      for (const viewport of DEFAULT_VIEWPORTS) {
        const currentPath = getImagePath({
          bucket: VISUAL_DIRS.current,
          scenarioId: scenario.id,
          viewportId: viewport.id,
        })
        const baselinePath = getImagePath({
          bucket: VISUAL_DIRS.baseline,
          scenarioId: scenario.id,
          viewportId: viewport.id,
        })
        const diffPath = getImagePath({
          bucket: VISUAL_DIRS.diff,
          scenarioId: scenario.id,
          viewportId: viewport.id,
        })

        safeUnlink(diffPath)

        try {
          const screenshotContent = await captureScreenshot({
            browser,
            scenario,
            viewport,
            currentPath,
            storageStatePath,
          })

          if (mode === 'baseline') {
            ensureDir(path.dirname(baselinePath))
            fs.copyFileSync(currentPath, baselinePath)
            results.push({
              scenarioId: scenario.id,
              viewportId: viewport.id,
              status: 'baseline-updated',
              baselinePath,
              currentPath,
              diffPath,
              mismatchPixels: 0,
              screenshotContent,
            })
            continue
          }

          if (!fileExists(baselinePath)) {
            failed = true
            results.push({
              scenarioId: scenario.id,
              viewportId: viewport.id,
              status: 'missing-baseline',
              baselinePath,
              currentPath,
              diffPath,
              mismatchPixels: 0,
              screenshotContent,
            })
            continue
          }

          const comparison = compareImages({ baselinePath, currentPath, diffPath })
          const hasDiff = comparison.mismatchPixels > DEFAULT_BASELINE_DIFF_THRESHOLD
          if (hasDiff) {
            failed = true
          } else {
            safeUnlink(diffPath)
          }

          results.push({
            scenarioId: scenario.id,
            viewportId: viewport.id,
            status: hasDiff ? 'changed' : 'ok',
            baselinePath,
            currentPath,
            diffPath,
            mismatchPixels: comparison.mismatchPixels,
            screenshotContent,
            dimensions: {
              baseline: comparison.baselineSize,
              current: comparison.currentSize,
              compared: { width: comparison.width, height: comparison.height },
            },
          })
        } catch (error) {
          failed = true
          results.push({
            scenarioId: scenario.id,
            viewportId: viewport.id,
            status: 'error',
            baselinePath,
            currentPath,
            diffPath,
            mismatchPixels: 0,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }
    }
  } finally {
    await browser.close()
    if (server.started && typeof server.stop === 'function') {
      server.stop()
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    mode,
    browserMode: {
      requested: args.browserMode,
      effective: effectiveBrowserMode,
    },
    baseUrl,
    browserCaptureBaseUrl,
    scenarioSet: args.scenarioSet,
    storageStatePath,
    changedFiles,
    selectedScenarioIds: selectedScenarios.map((scenario) => scenario.id),
    totalScenarioCount: allScenarios.length,
    impact,
    results,
    server: {
      startedByRunner: !!server.started,
      logPath: server.logPath || null,
    },
  }

  writeJson({
    filePath: path.join(VISUAL_DIRS.report, 'latest.json'),
    value: report,
  })

  printSummary({ report })

  if (failed) {
    process.exit(1)
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(message)
  process.exit(1)
})
