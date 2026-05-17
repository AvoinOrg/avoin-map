#!/usr/bin/env node

const path = require('path')

const {
  BROWSER_MODE_XVFB_WEBGL,
  getChromiumLaunchOptions,
  maybeReexecInsideXvfb,
  normalizeBrowserMode,
} = require(path.resolve(
  __dirname,
  '../../../../utils/scripts/visual/browserRuntime'
))

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000'
const DEFAULT_TIMEOUT_MS = 30000

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
}

const HELP_TEXT = `\
Usage:
  node agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js --scenario sidebar-root
  node agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js --route /fi/energiakartta --viewport both --expect-sidebar yes

Options:
  --base-url <url>            Target app URL (default: ${DEFAULT_BASE_URL})
  --scenario <name>           Built-in scenario: sidebar-root
  --route <path>              Route path to check. Can be repeated or comma-separated.
  --viewport <name>           desktop|mobile|both (default: desktop)
  --expect-sidebar <state>    yes|no|auto (default: auto)
  --expect-testid <testid>    Require a visible [data-testid="<testid>"]. Can be repeated.
  --browser-mode <mode>       Browser mode (default: ${BROWSER_MODE_XVFB_WEBGL})
  --timeout <ms>              Per-route timeout (default: ${DEFAULT_TIMEOUT_MS})
  --help                      Show this help
`

const SIDEBAR_ROOT_SCENARIO = [
  {
    id: 'main-root',
    route: '/en',
    viewports: ['desktop', 'mobile'],
    expectSidebar: 'yes',
    expectMainSidebarRoot: true,
  },
  {
    id: 'hiilikartta-root',
    route: '/fi/hiilikartta',
    viewports: ['desktop', 'mobile'],
    expectSidebar: 'yes',
  },
  {
    id: 'hiilikartta-kaavat-panel',
    route: '/fi/hiilikartta/kaavat',
    viewports: ['desktop', 'mobile'],
    expectSidebar: 'yes',
  },
  {
    id: 'luonnonmetsakartat-root',
    route: '/fi/luonnonmetsakartat',
    viewports: ['desktop', 'mobile'],
    expectSidebar: 'yes',
  },
  {
    id: 'energiakartta-root',
    route: '/fi/energiakartta',
    viewports: ['desktop', 'mobile'],
    expectSidebar: 'yes',
  },
  {
    id: 'forests-panel',
    route: '/fi/forests',
    viewports: ['desktop', 'mobile'],
    expectSidebar: 'yes',
  },
  {
    id: 'hiilikartta-report-fullscreen',
    route: '/fi/hiilikartta/raportti',
    viewports: ['desktop'],
    expectSidebar: 'no',
  },
]

const splitCsv = (value) =>
  String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

const parseArgs = (argv) => {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    browserMode: BROWSER_MODE_XVFB_WEBGL,
    expectSidebar: 'auto',
    expectTestIds: [],
    help: false,
    routes: [],
    scenarios: [],
    timeout: DEFAULT_TIMEOUT_MS,
    viewport: 'desktop',
  }

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (!token || token === '--') continue

    if (token === '--help' || token === '-h') {
      args.help = true
      continue
    }

    if (token.startsWith('--base-url=')) {
      args.baseUrl = token.slice('--base-url='.length)
      continue
    }
    if (token === '--base-url') {
      args.baseUrl = argv[++i]
      continue
    }

    if (token.startsWith('--browser-mode=')) {
      args.browserMode = token.slice('--browser-mode='.length)
      continue
    }
    if (token === '--browser-mode') {
      args.browserMode = argv[++i]
      continue
    }

    if (token.startsWith('--expect-sidebar=')) {
      args.expectSidebar = token.slice('--expect-sidebar='.length)
      continue
    }
    if (token === '--expect-sidebar') {
      args.expectSidebar = argv[++i]
      continue
    }

    if (token.startsWith('--expect-testid=')) {
      args.expectTestIds.push(...splitCsv(token.slice('--expect-testid='.length)))
      continue
    }
    if (token === '--expect-testid') {
      args.expectTestIds.push(...splitCsv(argv[++i]))
      continue
    }

    if (token.startsWith('--route=')) {
      args.routes.push(...splitCsv(token.slice('--route='.length)))
      continue
    }
    if (token === '--route') {
      args.routes.push(...splitCsv(argv[++i]))
      continue
    }

    if (token.startsWith('--scenario=')) {
      args.scenarios.push(...splitCsv(token.slice('--scenario='.length)))
      continue
    }
    if (token === '--scenario') {
      args.scenarios.push(...splitCsv(argv[++i]))
      continue
    }

    if (token.startsWith('--timeout=')) {
      args.timeout = Number(token.slice('--timeout='.length))
      continue
    }
    if (token === '--timeout') {
      args.timeout = Number(argv[++i])
      continue
    }

    if (token.startsWith('--viewport=')) {
      args.viewport = token.slice('--viewport='.length)
      continue
    }
    if (token === '--viewport') {
      args.viewport = argv[++i]
      continue
    }

    throw new Error(`Unknown option: ${token}`)
  }

  args.browserMode = normalizeBrowserMode(args.browserMode)
  args.expectSidebar = String(args.expectSidebar || 'auto').toLowerCase()
  args.viewport = String(args.viewport || 'desktop').toLowerCase()

  if (!['yes', 'no', 'auto'].includes(args.expectSidebar)) {
    throw new Error('--expect-sidebar must be one of: yes, no, auto')
  }
  if (!['desktop', 'mobile', 'both'].includes(args.viewport)) {
    throw new Error('--viewport must be one of: desktop, mobile, both')
  }
  if (!Number.isFinite(args.timeout) || args.timeout <= 0) {
    throw new Error('--timeout must be a positive number')
  }

  return args
}

const uniqueByKey = (checks) => {
  const seen = new Set()
  return checks.filter((check) => {
    const key = `${check.id}:${check.route}:${check.viewport}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const getRequestedViewports = (viewport) =>
  viewport === 'both' ? ['desktop', 'mobile'] : [viewport]

const buildChecks = (args) => {
  const checks = []

  for (const scenario of args.scenarios) {
    if (scenario !== 'sidebar-root') {
      throw new Error(`Unknown scenario: ${scenario}`)
    }

    for (const item of SIDEBAR_ROOT_SCENARIO) {
      for (const viewport of item.viewports) {
        checks.push({
          ...item,
          viewport,
          expectTestIds: [],
        })
      }
    }
  }

  for (const route of args.routes) {
    for (const viewport of getRequestedViewports(args.viewport)) {
      checks.push({
        id: `custom:${route}:${viewport}`,
        route,
        viewport,
        expectSidebar: args.expectSidebar,
        expectTestIds: [...args.expectTestIds],
      })
    }
  }

  if (checks.length === 0) {
    for (const item of SIDEBAR_ROOT_SCENARIO) {
      for (const viewport of item.viewports) {
        checks.push({
          ...item,
          viewport,
          expectTestIds: [],
        })
      }
    }
  }

  return uniqueByKey(checks)
}

const toUrl = ({ baseUrl, route }) => {
  const normalizedBase = String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '')
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`
  return `${normalizedBase}${normalizedRoute}`
}

const isLocatorVisible = async (locator, timeout = 1200) => {
  try {
    return await locator.first().isVisible({ timeout })
  } catch (_error) {
    return false
  }
}

const countVisible = async (locator) => {
  const count = await locator.count()
  let visible = 0
  for (let i = 0; i < count; i++) {
    if (await isLocatorVisible(locator.nth(i), 500)) {
      visible += 1
    }
  }
  return { count, visible }
}

const getBox = async (locator) => {
  try {
    return await locator.first().boundingBox({ timeout: 1000 })
  } catch (_error) {
    return null
  }
}

const boxesOverlap = (a, b) => {
  if (!a || !b) return false
  return (
    Math.max(a.x, b.x) < Math.min(a.x + a.width, b.x + b.width) &&
    Math.max(a.y, b.y) < Math.min(a.y + a.height, b.y + b.height)
  )
}

const collectRuntimeTextFlags = async (page) =>
  page.evaluate(() => {
    const text = document.body?.innerText || ''
    return {
      hasApplicationError: /Application error|Unhandled Runtime Error/i.test(text),
      hasNotFound: /This page could not be found|404/i.test(text),
    }
  })

const runCheck = async ({ browser, args, check }) => {
  const page = await browser.newPage({ viewport: VIEWPORTS[check.viewport] })
  const consoleErrors = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  const url = toUrl({ baseUrl: args.baseUrl, route: check.route })
  const errors = []
  const warnings = []

  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: args.timeout,
    })

    if (!response) {
      errors.push('page.goto did not return a response')
    } else if (response.status() >= 400) {
      errors.push(`route returned HTTP ${response.status()}`)
    }

    await page.waitForSelector('body', { timeout: args.timeout })
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})

    const flags = await collectRuntimeTextFlags(page)
    if (flags.hasApplicationError) {
      errors.push('route rendered an application/runtime error')
    }
    if (flags.hasNotFound) {
      errors.push('route rendered a not-found page')
    }

    const sidebarToggle = page.locator('.sidebar-toggle-button')
    const sidebarContainer = page.locator(
      '.sidebar-container, [data-main-sidebar-root="true"]'
    )
    const mainSidebarRoot = page.locator('[data-main-sidebar-root="true"]')
    const mapControlButtons = page.locator(
      '[aria-label="Cookie settings"], [aria-label="Toggle attribution information"]'
    )

    const sidebarToggleVisible = await isLocatorVisible(sidebarToggle)
    const sidebarContainerVisible = await isLocatorVisible(sidebarContainer)
    const mainSidebarRootVisible = await isLocatorVisible(mainSidebarRoot)
    const mapControlStats = await countVisible(mapControlButtons)

    if (check.expectSidebar === 'yes' && !sidebarToggleVisible) {
      errors.push('expected a visible sidebar toggle, but none was visible')
    }
    if (check.expectSidebar === 'no' && sidebarToggleVisible) {
      errors.push('expected no visible sidebar toggle, but one was visible')
    }
    if (check.expectMainSidebarRoot && !mainSidebarRootVisible) {
      errors.push('expected [data-main-sidebar-root="true"] to be visible')
    }

    for (const testId of check.expectTestIds || []) {
      const locator = page.locator(`[data-testid="${testId}"]`)
      if (!(await isLocatorVisible(locator))) {
        errors.push(`expected visible data-testid "${testId}"`)
      }
    }

    const toggleBox = await getBox(sidebarToggle)
    for (let i = 0; i < (await mapControlButtons.count()); i++) {
      const control = mapControlButtons.nth(i)
      if (!(await isLocatorVisible(control, 300))) continue

      const controlBox = await getBox(control)
      if (boxesOverlap(toggleBox, controlBox)) {
        warnings.push('sidebar toggle overlaps a bottom map control button')
        break
      }
    }

    if (consoleErrors.length > 0) {
      warnings.push(
        ...consoleErrors.slice(0, 5).map((text) => `console.error: ${text}`)
      )
      if (consoleErrors.length > 5) {
        warnings.push(`console.error: ${consoleErrors.length - 5} more omitted`)
      }
    }

    return {
      id: check.id,
      route: check.route,
      url,
      viewport: check.viewport,
      ok: errors.length === 0,
      sidebarToggle: {
        visible: sidebarToggleVisible,
        box: toggleBox,
      },
      sidebarContainer: {
        visible: sidebarContainerVisible,
      },
      mainSidebarRoot: {
        visible: mainSidebarRootVisible,
      },
      mapControls: mapControlStats,
      errors,
      warnings,
    }
  } finally {
    await page.close()
  }
}

const run = async () => {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(HELP_TEXT)
    return
  }

  const xvfbBootstrap = maybeReexecInsideXvfb({
    browserMode: args.browserMode,
  })
  if (xvfbBootstrap.reexecuted) {
    process.exit(xvfbBootstrap.exitCode)
  }

  const checks = buildChecks(args)
  const { chromium } = require('@playwright/test')
  const browser = await chromium.launch(
    getChromiumLaunchOptions({ browserMode: args.browserMode })
  )

  try {
    const results = []
    for (const check of checks) {
      results.push(await runCheck({ browser, args, check }))
    }

    const payload = {
      ok: results.every((result) => result.ok),
      baseUrl: args.baseUrl,
      browserMode: args.browserMode,
      checkedAt: new Date().toISOString(),
      results,
    }

    console.log(JSON.stringify(payload, null, 2))

    if (!payload.ok) {
      process.exit(1)
    }
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(message)
  process.exit(1)
})
