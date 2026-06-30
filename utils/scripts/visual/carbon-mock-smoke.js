#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const {
  BROWSER_MODE_XVFB_WEBGL,
  SUPPORTED_BROWSER_MODES,
  assertWebGLAvailable,
  getChromiumLaunchOptions,
  maybeReexecInsideXvfb,
  resolveBrowserMode,
} = require('./browserRuntime')
const {
  buildPlaywrightContextOptions,
  waitForAppHydration,
} = require('./playwrightContext')
const {
  buildCarbonMockQuery,
  getCarbonMockIds,
} = require('../../visual/carbonMockScenarios')

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000'
const DEFAULT_TIMEOUT_MS = 60000
const DEFAULT_VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1 }
const PREFLIGHT_DONE_ENV_KEY = 'AVOIN_MAP_CARBON_SMOKE_PREFLIGHT_DONE'
const GPKG_FIXTURE_PATH = path.resolve(
  process.cwd(),
  'test-data/carbon/test.gpkg'
)

const HELP_TEXT = `\
Usage:
  node utils/scripts/visual/carbon-mock-smoke.js [--base-url=${DEFAULT_BASE_URL}] [--no-start]

Options:
  --base-url <url>       Already-running TanStack Start dev server URL (default: ${DEFAULT_BASE_URL})
  --browser-mode <mode>  Browser mode: ${SUPPORTED_BROWSER_MODES.join('|')} (default: ${BROWSER_MODE_XVFB_WEBGL})
  --timeout <ms>         Timeout per major step (default: ${DEFAULT_TIMEOUT_MS})
  --no-start             Fail if the dev server is unreachable; never start one
  --help                 Show this help

Behavior:
  This smoke utility only reuses an already-running dev server. It creates a
  fresh Chromium context with no storage state, uploads test-data/carbon/test.gpkg
  through the real file input, and exercises canonical /fi/carbon routes plus
  legacy redirect checks.
`

const parseArgs = (argv) => {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    browserMode: BROWSER_MODE_XVFB_WEBGL,
    timeoutMs: DEFAULT_TIMEOUT_MS,
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

    if (token.startsWith('--base-url=')) {
      args.baseUrl = token.slice('--base-url='.length)
      continue
    }
    if (token === '--base-url') {
      args.baseUrl = argv[i + 1]
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

    if (token.startsWith('--timeout=')) {
      args.timeoutMs = Number(token.slice('--timeout='.length))
      continue
    }
    if (token === '--timeout') {
      args.timeoutMs = Number(argv[i + 1])
      i++
      continue
    }

    throw new Error(`Unknown argument: ${token}`)
  }

  args.baseUrl = trimTrailingSlash(args.baseUrl || DEFAULT_BASE_URL)

  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    throw new Error(`Invalid --timeout value: ${args.timeoutMs}`)
  }

  return args
}

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

const getBrowserNavigationBaseUrl = (baseUrl) => {
  try {
    const url = new URL(baseUrl)
    if (url.hostname === '127.0.0.1') {
      url.hostname = 'localhost'
      return trimTrailingSlash(url.toString())
    }
  } catch {
    // Keep non-standard values unchanged; URL construction will report errors.
  }

  return trimTrailingSlash(baseUrl)
}

const buildAbsoluteUrl = ({ baseUrl, path: routePath }) =>
  `${trimTrailingSlash(baseUrl)}${routePath}`

const buildSmokeUrl = ({
  baseUrl,
  path: routePath,
  state,
  queryParams = {},
}) =>
  buildAbsoluteUrl({
    baseUrl,
    path: `${routePath}${buildCarbonMockQuery({
      state,
      queryParams,
    })}`,
  })

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

const assertServerAvailable = async ({ baseUrl, noStart }) => {
  if (await isServerAvailable(baseUrl)) {
    return
  }

  if (noStart) {
    throw new Error(
      `Dev server is unreachable at ${baseUrl}; --no-start was set, so carbon-mock-smoke will not start it.`
    )
  }

  throw new Error(
    `Dev server is unreachable at ${baseUrl}. carbon-mock-smoke only uses an already-running dev server and will not start one.`
  )
}

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

const isFatalConsoleError = (message) =>
  [
    'Failed to load GeoPackage',
    'Failed to extract GeoPackage features',
    'Hiilikartta mock scenario bootstrap failed',
    'Failed to apply imported plan',
    'Missing access token for Hiilikartta plan save',
  ].some((pattern) => message.includes(pattern))

const createPageIssueCollector = (page) => {
  const pageErrors = []
  const consoleErrors = []

  page.on('pageerror', (error) => {
    pageErrors.push(error.message || String(error))
  })

  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return
    }

    const text = message.text()
    consoleErrors.push(text)
  })

  return {
    assertNoFatalIssues: () => {
      if (pageErrors.length > 0) {
        throw new Error(`Browser page error: ${pageErrors.join('\n')}`)
      }

      const fatalConsoleErrors = consoleErrors.filter(isFatalConsoleError)
      if (fatalConsoleErrors.length > 0) {
        throw new Error(
          `Fatal browser console error: ${fatalConsoleErrors.join('\n')}`
        )
      }
    },
    getConsoleErrors: () => [...consoleErrors],
  }
}

const assertPathname = async ({ page, expectedPathname }) => {
  const currentUrl = new URL(page.url())
  if (currentUrl.pathname !== expectedPathname) {
    throw new Error(
      `Expected pathname ${expectedPathname}, got ${currentUrl.pathname} (${page.url()})`
    )
  }
}

const assertSearchParam = async ({ page, key, value }) => {
  const currentUrl = new URL(page.url())
  const actual = currentUrl.searchParams.get(key)
  if (actual !== value) {
    throw new Error(
      `Expected URL search param ${key}=${value}, got ${actual} (${page.url()})`
    )
  }
}

const gotoAndAssertOk = async ({ page, url, timeoutMs }) => {
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: timeoutMs,
  })
  const status = response ? response.status() : null
  if (status && status >= 400) {
    throw new Error(`Route returned HTTP ${status} for ${url}`)
  }

  await waitForAppHydration({
    page,
    timeoutMs,
    minBodyHeight: 100,
    settleMs: 250,
  })

  await page.waitForFunction(
    () => {
      const bodyText = document.body?.innerText?.trim() ?? ''
      return (
        bodyText.length > 0 ||
        !!document.querySelector(
          '#map, main, .layout-container, .map-actions-wrapper, [data-slot]'
        )
      )
    },
    null,
    { timeout: timeoutMs }
  )

  return response
}

const assertMockBootstrapAvailable = async ({ page, timeoutMs }) => {
  await page.waitForFunction(
    () =>
      typeof window.__avoinCarbonMocks?.reset === 'function' &&
      typeof window.__avoinCarbonMocks?.seed === 'function',
    null,
    { timeout: timeoutMs }
  )
}

const waitForApiResponse = async ({
  page,
  method,
  pathPart,
  timeoutMs,
  status = 200,
}) =>
  page.waitForResponse(
    (response) => {
      const request = response.request()
      const requestUrl = new URL(response.url())
      return (
        request.method().toUpperCase() === method.toUpperCase() &&
        requestUrl.pathname.includes(pathPart) &&
        response.status() === status
      )
    },
    { timeout: timeoutMs }
  )

const waitForVisible = async ({ locator, timeoutMs }) => {
  await locator.waitFor({ state: 'visible', timeout: timeoutMs })
  return locator
}

const selectDropdownOption = async ({
  page,
  trigger,
  option,
  timeoutMs,
}) => {
  await waitForVisible({ locator: trigger, timeoutMs })
  await trigger.click()

  const roleOption = page.getByRole('option', { name: option, exact: true })
  try {
    await roleOption.click({ timeout: 5000 })
    return
  } catch {
    await page
      .locator('[data-slot="option"]')
      .filter({ hasText: option })
      .first()
      .click({ timeout: timeoutMs })
  }
}

const isElementDisabled = async (locator) =>
  locator.evaluate(
    (element) =>
      element.matches(':disabled') ||
      element.hasAttribute('data-disabled') ||
      element.getAttribute('aria-disabled') === 'true'
  )

const waitForDisabled = async ({ locator, timeoutMs }) => {
  await locator.waitFor({ state: 'visible', timeout: timeoutMs })
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (await isElementDisabled(locator)) {
      return
    }

    await delay(250)
  }

  throw new Error('Timed out waiting for element to become disabled')
}

const clickDataSlot = async ({ page, slot, timeoutMs }) => {
  const locator = page.locator(`[data-slot="${slot}"]`).first()
  await waitForVisible({ locator, timeoutMs })
  await locator.click()
  return locator
}

const waitForCopiedPlanLink = async ({ page, timeoutMs }) => {
  const link = page
    .locator('a[href*="/fi/carbon/plans/"]:not([href*="mock-local-plan"])')
    .last()

  await waitForVisible({ locator: link, timeoutMs })
  return link
}

const runInvalidImportSmoke = async ({ page, baseUrl, timeoutMs, ids }) => {
  if (!fs.existsSync(GPKG_FIXTURE_PATH)) {
    throw new Error(`GeoPackage fixture not found: ${GPKG_FIXTURE_PATH}`)
  }

  let autoFileChooserHandled = false
  page.once('filechooser', async (fileChooser) => {
    autoFileChooserHandled = true
    await fileChooser.setFiles(GPKG_FIXTURE_PATH)
  })

  await gotoAndAssertOk({
    page,
    url: buildSmokeUrl({
      baseUrl,
      path: `/fi/carbon/plans/${ids.MOCK_LOCAL_PLAN_ID}`,
      state: 'import-placeholder',
      queryParams: { mockAuth: 'authenticated' },
    }),
    timeoutMs,
  })
  await assertMockBootstrapAvailable({ page, timeoutMs })
  await assertPathname({
    page,
    expectedPathname: `/fi/carbon/plans/${ids.MOCK_LOCAL_PLAN_ID}`,
  })

  await page.waitForTimeout(500)

  if (!autoFileChooserHandled) {
    await page
      .locator('input[type="file"][accept=".zip,.gpkg"]')
      .setInputFiles(GPKG_FIXTURE_PATH)
  }

  const tableTrigger = page
    .locator('[data-slot="plan-import-table-select"] [data-slot="trigger"]')
    .first()
  if ((await tableTrigger.count()) > 0) {
    await selectDropdownOption({
      page,
      trigger: tableTrigger,
      option: 'pappila',
      timeoutMs,
    })
  }

  const zoningTrigger = page
    .locator('[data-slot="plan-import-zoning-column"] [data-slot="trigger"]')
    .first()
  await selectDropdownOption({
    page,
    trigger: zoningTrigger,
    option: 'Subtype',
    timeoutMs,
  })

  const acceptButton = page.getByRole('button', {
    name: 'Accept imported plan',
  })
  await waitForVisible({ locator: acceptButton, timeoutMs })
  await acceptButton.click()

  await clickDataSlot({ page, slot: 'plan-areas-step-action', timeoutMs })
  await page.waitForURL(
    (url) =>
      url.pathname === `/fi/carbon/plans/${ids.MOCK_LOCAL_PLAN_ID}/areas`,
    { timeout: timeoutMs }
  )

  const calculateAction = page
    .locator('[data-slot="zone-calculate-action"]')
    .first()
  await waitForDisabled({ locator: calculateAction, timeoutMs })
  if (!(await isElementDisabled(calculateAction))) {
    throw new Error('Expected imported invalid-zone calculate action to be disabled')
  }
}

const runSaveCalculateReportSmoke = async ({
  page,
  baseUrl,
  timeoutMs,
  ids,
}) => {
  await gotoAndAssertOk({
    page,
    url: buildSmokeUrl({
      baseUrl,
      path: `/fi/carbon/plans/${ids.MOCK_LOCAL_PLAN_ID}`,
      state: 'save-ready',
      queryParams: { mockAuth: 'authenticated' },
    }),
    timeoutMs,
  })
  await assertMockBootstrapAvailable({ page, timeoutMs })
  await assertPathname({
    page,
    expectedPathname: `/fi/carbon/plans/${ids.MOCK_LOCAL_PLAN_ID}`,
  })

  await clickDataSlot({ page, slot: 'plan-copy-action', timeoutMs })
  const copiedPlanLink = await waitForCopiedPlanLink({ page, timeoutMs })
  await copiedPlanLink.click()
  await page.waitForURL(
    (url) =>
      url.pathname.startsWith('/fi/carbon/plans/') &&
      url.pathname !== `/fi/carbon/plans/${ids.MOCK_LOCAL_PLAN_ID}`,
    { timeout: timeoutMs }
  )

  const copiedPlanId = new URL(page.url()).pathname.split('/').pop()
  if (!copiedPlanId) {
    throw new Error(`Unable to parse copied plan id from ${page.url()}`)
  }

  const saveResponsePromise = waitForApiResponse({
    page,
    method: 'PUT',
    pathPart: '/api/hiilikartta/plan',
    timeoutMs,
  })
  await clickDataSlot({ page, slot: 'plan-cloud-action', timeoutMs })
  const saveResponse = await saveResponsePromise
  const savePayload = await saveResponse.json().catch(() => ({}))
  const dynamicServerId = savePayload.id
  if (!dynamicServerId || typeof dynamicServerId !== 'string') {
    throw new Error('Mock save response did not include a dynamic server id')
  }

  const calculationPostPromise = waitForApiResponse({
    page,
    method: 'POST',
    pathPart: '/api/hiilikartta/calculation',
    timeoutMs,
  })
  await clickDataSlot({ page, slot: 'plan-report-action', timeoutMs })
  await calculationPostPromise

  await waitForApiResponse({
    page,
    method: 'GET',
    pathPart: '/api/hiilikartta/calculation',
    timeoutMs,
  })
  await waitForVisible({
    locator: page.locator('[data-slot="plan-report-preview"]').first(),
    timeoutMs,
  })

  await clickDataSlot({ page, slot: 'plan-report-action', timeoutMs })
  await page.waitForURL((url) => url.pathname === '/fi/carbon/report', {
    timeout: timeoutMs,
  })

  await assertSearchParam({ page, key: 'planIds', value: dynamicServerId })
  await assertSearchParam({ page, key: 'prevPageId', value: copiedPlanId })
  await waitForVisible({
    locator: page.getByRole('button', {
      name: 'Download report data as GeoJSON',
    }),
    timeoutMs,
  })

  return { copiedPlanId, dynamicServerId }
}

const runExternalComparisonSmoke = async ({
  page,
  baseUrl,
  timeoutMs,
  ids,
}) => {
  const externalResponsePromise = waitForApiResponse({
    page,
    method: 'GET',
    pathPart: '/api/hiilikartta/plan/external',
    timeoutMs,
  })

  await gotoAndAssertOk({
    page,
    url: buildSmokeUrl({
      baseUrl,
      path: '/fi/carbon/report',
      state: 'report-single-local',
      queryParams: {
        planIds: [
          ids.MOCK_LOCAL_PLAN_SERVER_ID,
          ids.MOCK_EXTERNAL_REPORT_SERVER_ID,
        ],
        prevPageId: ids.MOCK_LOCAL_PLAN_ID,
        prevPageStep: 'areas',
      },
    }),
    timeoutMs,
  })
  await externalResponsePromise
  await assertPathname({ page, expectedPathname: '/fi/carbon/report' })

  await page.waitForFunction(
    () => {
      const text = document.body?.innerText ?? ''
      return (
        text.includes('Mock local carbon plan') &&
        text.includes('Mock external carbon report')
      )
    },
    null,
    { timeout: timeoutMs }
  )

  await waitForVisible({
    locator: page.getByRole('button', {
      name: 'Download report data as GeoJSON',
    }),
    timeoutMs,
  })
}

const assertRedirect = async ({
  page,
  baseUrl,
  fromPath,
  expectedPathname,
  expectedSearchParams = {},
  timeoutMs,
}) => {
  await gotoAndAssertOk({
    page,
    url: buildAbsoluteUrl({ baseUrl, path: fromPath }),
    timeoutMs,
  })
  await page.waitForURL((url) => url.pathname === expectedPathname, {
    timeout: timeoutMs,
  })
  await assertPathname({ page, expectedPathname })

  for (const [key, value] of Object.entries(expectedSearchParams)) {
    await assertSearchParam({ page, key, value })
  }
}

const runLegacyRedirectSmoke = async ({ page, baseUrl, timeoutMs, ids }) => {
  await assertRedirect({
    page,
    baseUrl,
    fromPath: '/fi/hiilikartta',
    expectedPathname: '/fi/carbon',
    timeoutMs,
  })

  await assertRedirect({
    page,
    baseUrl,
    fromPath: `/fi/hiilikartta/kaavat/${ids.MOCK_LOCAL_PLAN_ID}?mockReset=1&mockCarbonState=plan-valid`,
    expectedPathname: `/fi/carbon/plans/${ids.MOCK_LOCAL_PLAN_ID}`,
    expectedSearchParams: {
      mockReset: '1',
      mockCarbonState: 'plan-valid',
    },
    timeoutMs,
  })

  await assertRedirect({
    page,
    baseUrl,
    fromPath: `/fi/raportti?mockReset=1&mockCarbonState=report-single-local&planIds=${ids.MOCK_LOCAL_PLAN_SERVER_ID}&prevPageId=${ids.MOCK_LOCAL_PLAN_ID}&prevPageStep=areas`,
    expectedPathname: '/fi/carbon/report',
    expectedSearchParams: {
      mockReset: '1',
      mockCarbonState: 'report-single-local',
      planIds: ids.MOCK_LOCAL_PLAN_SERVER_ID,
      prevPageId: ids.MOCK_LOCAL_PLAN_ID,
      prevPageStep: 'areas',
    },
    timeoutMs,
  })
}

const runStep = async ({ name, results, task }) => {
  process.stdout.write(`[carbon-smoke] ${name}... `)
  const startedAt = Date.now()
  await task()
  const durationMs = Date.now() - startedAt
  results.push({ name, durationMs })
  process.stdout.write(`ok (${durationMs}ms)\n`)
}

const runSmoke = async (args) => {
  const browserBaseUrl = getBrowserNavigationBaseUrl(args.baseUrl)
  const results = []
  const preflightAlreadyDone = process.env[PREFLIGHT_DONE_ENV_KEY] === '1'

  if (preflightAlreadyDone) {
    results.push({ name: 'server preflight', durationMs: 0 })
  } else {
    await runStep({
      name: 'server preflight',
      results,
      task: () =>
        assertServerAvailable({
          baseUrl: args.baseUrl,
          noStart: args.noStart,
        }),
    })
  }

  const effectiveBrowserMode = resolveBrowserMode({
    browserMode: args.browserMode,
    scenarios: [{ requiresWebGL: true }],
  })
  const reexecResult = maybeReexecInsideXvfb({
    browserMode: effectiveBrowserMode,
    env: {
      ...process.env,
      [PREFLIGHT_DONE_ENV_KEY]: '1',
    },
  })
  if (reexecResult.reexecuted) {
    process.exit(reexecResult.exitCode ?? 1)
  }

  const ids = getCarbonMockIds()

  const { chromium } = requireOrThrow({
    id: 'playwright',
    installHint: '`yarn visual:install`',
  })
  let browser
  let context
  let page
  let issueCollector

  try {
    browser = await chromium.launch(
      getChromiumLaunchOptions({ browserMode: effectiveBrowserMode })
    )
    await assertWebGLAvailable({
      browser,
      browserMode: effectiveBrowserMode,
    })
    context = await browser.newContext(
      buildPlaywrightContextOptions({ viewport: DEFAULT_VIEWPORT })
    )
    page = await context.newPage()
    issueCollector = createPageIssueCollector(page)

    await runStep({
      name: 'fresh context/browser launch',
      results,
      task: async () => {
        await delay(0)
      },
    })

    await runStep({
      name: 'invalid GeoPackage import',
      results,
      task: () =>
        runInvalidImportSmoke({
          page,
          baseUrl: browserBaseUrl,
          timeoutMs: args.timeoutMs,
          ids,
        }),
    })

    await runStep({
      name: 'valid copy/save/calculation/full report',
      results,
      task: () =>
        runSaveCalculateReportSmoke({
          page,
          baseUrl: browserBaseUrl,
          timeoutMs: args.timeoutMs,
          ids,
        }),
    })

    await runStep({
      name: 'external report comparison',
      results,
      task: () =>
        runExternalComparisonSmoke({
          page,
          baseUrl: browserBaseUrl,
          timeoutMs: args.timeoutMs,
          ids,
        }),
    })

    await runStep({
      name: 'legacy redirects',
      results,
      task: () =>
        runLegacyRedirectSmoke({
          page,
          baseUrl: browserBaseUrl,
          timeoutMs: args.timeoutMs,
          ids,
        }),
    })

    issueCollector.assertNoFatalIssues()

    console.log('[carbon-smoke] result:', {
      ok: true,
      baseUrl: args.baseUrl,
      browserBaseUrl,
      browserMode: effectiveBrowserMode,
      steps: results.map((result) => result.name),
    })

    const consoleErrors = issueCollector.getConsoleErrors()
    if (consoleErrors.length > 0) {
      console.warn(
        `[carbon-smoke] observed ${consoleErrors.length} non-fatal browser console error(s)`
      )
    }
  } finally {
    if (context) {
      await context.close()
    }
    if (browser) {
      await browser.close()
    }
  }
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(HELP_TEXT)
    return
  }

  await runSmoke(args)
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[carbon-smoke] ${error.message}`)
    process.exitCode = 1
  })
}

module.exports = {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  GPKG_FIXTURE_PATH,
  assertServerAvailable,
  buildAbsoluteUrl,
  buildSmokeUrl,
  getBrowserNavigationBaseUrl,
  isServerAvailable,
  parseArgs,
}
