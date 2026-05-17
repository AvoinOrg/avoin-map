#!/usr/bin/env node

const fs = require('fs')
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
const F0284_OUTPUT_DIR = path.resolve(process.cwd(), '.tmp/f0284')

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
}

const HELP_TEXT = `\
Usage:
  node agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js --scenario sidebar-root
  node agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js --scenario energiakartta-selected-building-tabs
  node agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js --route /fi/energiakartta --viewport both --expect-sidebar yes

Options:
  --base-url <url>            Target app URL (default: ${DEFAULT_BASE_URL})
  --scenario <name>           Built-in scenario: sidebar-root|energiakartta-selected-building-tabs
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

const ENERGYMAP_SELECTED_BUILDING_TABS_SCENARIO = [
  {
    id: 'energiakartta-selected-building-tabs',
    route: '/fi/energiakartta',
    viewports: ['mobile'],
    expectSidebar: 'yes',
    selectedBuildingTabs: true,
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
    if (
      scenario !== 'sidebar-root' &&
      scenario !== 'energiakartta-selected-building-tabs'
    ) {
      throw new Error(`Unknown scenario: ${scenario}`)
    }

    const scenarioItems =
      scenario === 'energiakartta-selected-building-tabs'
        ? ENERGYMAP_SELECTED_BUILDING_TABS_SCENARIO
        : SIDEBAR_ROOT_SCENARIO

    for (const item of scenarioItems) {
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

const ensureWebpackRequire = async (page) =>
  page.evaluate(() => {
    if (window.__avoin_req) {
      return true
    }

    if (!Array.isArray(window.webpackChunk_N_E)) {
      return false
    }

    window.webpackChunk_N_E.push([
      [Math.random()],
      {},
      (req) => {
        window.__avoin_req = req
      },
    ])

    return Boolean(window.__avoin_req)
  })

const seedEnergymapSelectedBuilding = async (page) =>
  page.evaluate(async () => {
    const req = window.__avoin_req
    if (typeof req !== 'function') {
      return { ok: false, reason: 'Next.js webpack require was unavailable' }
    }

    const { useMapInstanceStore } = req(
      '(app-pages-browser)/./src/common/store/mapStore/mapInstanceStore.ts'
    )
    const { useMapStore } = req(
      '(app-pages-browser)/./src/common/store/mapStore/mapStore.ts'
    )
    const { useUIStore } = req(
      '(app-pages-browser)/./src/common/store/uiStore.ts'
    )
    const { useAppletStore } = req(
      '(app-pages-browser)/./src/app/[locale]/(map)/(applets)/energiakartta/state/appletStore.ts'
    )

    const map = useMapInstanceStore.getState()._map
    if (!map) {
      return { ok: false, reason: 'Map instance was not available' }
    }

    const waitForMapIdle = () =>
      new Promise((resolve) => {
        const timeoutId = window.setTimeout(resolve, 2500)
        map.once('idle', () => {
          window.clearTimeout(timeoutId)
          resolve()
        })
      })
    const wait = (ms) =>
      new Promise((resolve) => {
        window.setTimeout(resolve, ms)
      })

    map.jumpTo({ center: [24.9384, 60.1699], zoom: 15.5 })

    let features = []
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await waitForMapIdle()
      await wait(700)
      features = map.queryRenderedFeatures(undefined, {
        layers: ['energymap_building_polygons-fill'],
      })
      if (features.length > 0) {
        break
      }
    }

    if (features.length === 0) {
      return { ok: false, reason: 'No rendered building features found' }
    }

    const feature =
      features.find((candidate) => candidate.properties?.building_key) ??
      features[0]
    const properties = { ...(feature.properties ?? {}) }
    const idValue = feature.id ?? properties.building_key
    const buildingKey = properties.building_key ?? idValue

    if (idValue == null || buildingKey == null) {
      return { ok: false, reason: 'Rendered feature had no stable id' }
    }

    const selectedBuilding = {
      id: String(idValue),
      buildingKey: String(buildingKey),
      source: feature.source,
      sourceLayer: feature.sourceLayer,
      layerId: feature.layer?.id,
      properties,
    }

    useMapStore.getState().setSelectedFeatures([feature], false)
    useAppletStore.getState().setSelectedBuilding(selectedBuilding)
    useUIStore.getState().setIsSidebarOpen(true)

    return {
      ok: true,
      id: selectedBuilding.id,
      buildingKey: selectedBuilding.buildingKey,
      address: properties.address_fin ?? null,
      layerId: feature.layer?.id ?? null,
      source: feature.source ?? null,
      sourceLayer: feature.sourceLayer ?? null,
    }
  })

const rectToPlain = (rect) =>
  rect == null
    ? null
    : {
        x: Math.round(rect.x * 100) / 100,
        y: Math.round(rect.y * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
        right: Math.round((rect.x + rect.width) * 100) / 100,
        bottom: Math.round((rect.y + rect.height) * 100) / 100,
      }

const readEnergymapSelectedBuildingState = async (page, label) =>
  page.evaluate((stateLabel) => {
    const isVisible = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }

      const style = getComputedStyle(element)
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.getClientRects().length > 0
      )
    }
    const read = (selector) => {
      const element = document.querySelector(selector)
      if (!element || !isVisible(element)) {
        return null
      }

      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)

      return {
        selector,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom,
        },
        style: {
          display: style.display,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          position: style.position,
        },
        attributes: Object.fromEntries(
          Array.from(element.attributes).map((attribute) => [
            attribute.name,
            attribute.value,
          ])
        ),
      }
    }
    const visibleElements = (selector) =>
      Array.from(document.querySelectorAll(selector)).filter(isVisible)
    const activePageScrolls = visibleElements(
      '[data-testid="panel-sidebar-page-scroll"]'
    )
    const oldScrolls = visibleElements('[data-testid^="building-info-scroll-"]')
    const gridCount = visibleElements('[data-testid="building-info-grid"]').length
    const activePageScroll = activePageScrolls[0]
    const scrollableAncestors = []
    const panelBodyRects = visibleElements(
      '[data-testid^="building-info-panel-"] > div'
    ).map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        panelId:
          element.parentElement?.getAttribute('data-panel-id') ??
          element.parentElement?.getAttribute('data-testid') ??
          null,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom,
        },
      }
    })

    if (activePageScroll != null) {
      for (
        let element = activePageScroll.parentElement;
        element != null && element !== document.body;
        element = element.parentElement
      ) {
        const style = getComputedStyle(element)
        if (
          /(auto|scroll)/.test(style.overflowY) &&
          element.scrollHeight > element.clientHeight + 2
        ) {
          scrollableAncestors.push({
            className: element.className,
            testId: element.getAttribute('data-testid'),
            overflowY: style.overflowY,
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
          })
        }
      }
    }
    const selectedBuilding =
      window.__avoin_req?.(
        '(app-pages-browser)/./src/app/[locale]/(map)/(applets)/energiakartta/state/appletStore.ts'
      )?.useAppletStore.getState().selectedBuilding ?? null

    return {
      label: stateLabel,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      activeTab:
        document
          .querySelector('[role="tab"][aria-selected="true"]')
          ?.getAttribute('aria-controls') ?? null,
      pageScrollCount: activePageScrolls.length,
      oldScrollCount: oldScrolls.length,
      gridCount,
      panelOrder: visibleElements('[data-testid^="building-info-panel-"]').map(
        (element) => element.getAttribute('data-panel-id')
      ),
      pageScrollClassName: activePageScroll?.className ?? null,
      scrollableAncestors,
      panelBodyRects,
      controls: read('.panel-sidebar-page-container-controls'),
      tabRail: read('[data-testid="panel-sidebar-tab-rail"]'),
      sidebarActionRail: read('[data-testid="sidebar-action-rail"]'),
      buildingActionRail: read('[data-testid="building-info-action-rail"]'),
      toggle: read('.sidebar-toggle-button'),
      cookieButton: read('button[aria-label="Cookie settings"]'),
      attributionButton: read(
        'button[aria-label="Toggle attribution information"]'
      ),
      selectedBuildingState:
        selectedBuilding == null
          ? null
          : {
              id: selectedBuilding.id,
              buildingKey: selectedBuilding.buildingKey,
            },
    }
  }, label)

const normalizeSelectedBuildingState = (state) => {
  const normalizeNode = (node) =>
    node == null
      ? null
      : {
          ...node,
          rect: rectToPlain(node.rect),
        }

  return {
    ...state,
    controls: normalizeNode(state.controls),
    tabRail: normalizeNode(state.tabRail),
    sidebarActionRail: normalizeNode(state.sidebarActionRail),
    buildingActionRail: normalizeNode(state.buildingActionRail),
    toggle: normalizeNode(state.toggle),
    cookieButton: normalizeNode(state.cookieButton),
    attributionButton: normalizeNode(state.attributionButton),
    panelBodyRects: state.panelBodyRects.map((item) => ({
      ...item,
      rect: rectToPlain(item.rect),
    })),
  }
}

const scrollEnergymapBuildingInfoPage = async (page, scrollTop) =>
  page.evaluate((requestedScrollTop) => {
    const root = document.querySelector(
      '[data-testid="panel-sidebar-page-scroll"]'
    )
    if (!root) {
      return { ok: false, reason: 'panel sidebar page scroll root missing' }
    }

    const candidates = [root, ...Array.from(root.querySelectorAll('*'))]
    const scroller = candidates.find(
      (element) => element.scrollHeight > element.clientHeight + 10
    )

    if (!scroller) {
      return { ok: false, reason: 'scrollable page element missing' }
    }

    scroller.scrollTop = requestedScrollTop
    scroller.dispatchEvent(new Event('scroll', { bubbles: true }))

    return {
      ok: true,
      scrollTop: scroller.scrollTop,
      scrollHeight: scroller.scrollHeight,
      clientHeight: scroller.clientHeight,
    }
  }, scrollTop)

const settlePointer = async (page) => {
  await page.keyboard.press('Escape').catch(() => {})
  await page.mouse.move(20, 20).catch(() => {})
  await page.waitForTimeout(150)
}

const assertPanelState = ({ state, expectedPanels, errors }) => {
  const panelOrder = state.panelOrder.join(',')
  if (panelOrder !== expectedPanels.join(',')) {
    errors.push(
      `${state.label}: expected panel order ${expectedPanels.join(',')}, got ${panelOrder}`
    )
  }
  if (state.pageScrollCount !== 1) {
    errors.push(
      `${state.label}: expected one visible panel-sidebar-page-scroll, got ${state.pageScrollCount}`
    )
  }
  if (state.oldScrollCount !== 0) {
    errors.push(
      `${state.label}: expected zero old building-info-scroll-* hosts, got ${state.oldScrollCount}`
    )
  }
  if (state.gridCount !== 0) {
    errors.push(`${state.label}: mobile rendered building-info-grid`)
  }
  if (!String(state.pageScrollClassName ?? '').includes('osLeft')) {
    errors.push(`${state.label}: active page scroll did not use left-side class`)
  }
  if (state.scrollableAncestors.length > 0) {
    errors.push(
      `${state.label}: active page scroll had scrollable ancestors ${JSON.stringify(
        state.scrollableAncestors
      )}`
    )
  }

  const tooWideBody = state.panelBodyRects.find(
    (item) => item.rect.width > state.viewport.width - 72
  )
  if (tooWideBody != null) {
    errors.push(
      `${state.label}: panel content body was too wide for mobile (${tooWideBody.rect.width}px)`
    )
  }
}

const assertNoOverlap = ({ state, a, b, errors }) => {
  const first = state[a]
  const second = state[b]
  if (!first?.rect || !second?.rect) {
    return
  }

  if (boxesOverlap(first.rect, second.rect)) {
    errors.push(`${state.label}: ${a} overlaps ${b}`)
  }
}

const runEnergymapSelectedBuildingTabsCheck = async ({ page, errors }) => {
  fs.mkdirSync(F0284_OUTPUT_DIR, { recursive: true })

  await page.waitForSelector('canvas.maplibregl-canvas', { timeout: 90000 })
  await page.waitForTimeout(3500)

  const hasWebpackRequire = await ensureWebpackRequire(page)
  if (!hasWebpackRequire) {
    errors.push('could not access Next.js webpack require for selected-building setup')
    return null
  }

  const seed = await seedEnergymapSelectedBuilding(page)
  if (!seed.ok) {
    errors.push(`could not seed selected building: ${seed.reason}`)
    return { seed }
  }

  await page.waitForSelector('[data-testid="building-info-tab-page-basic"]', {
    timeout: 90000,
  })
  await page.waitForSelector('[data-testid="panel-sidebar-tab-rail"]', {
    timeout: 90000,
  })
  await page.waitForTimeout(500)

  const screenshot = async (name) => {
    const outputPath = path.join(F0284_OUTPUT_DIR, name)
    await settlePointer(page)
    await page.screenshot({ path: outputPath, fullPage: false })
    return outputPath
  }

  const screenshots = []
  screenshots.push(await screenshot('selected-building-mobile-basic.png'))
  const basic = normalizeSelectedBuildingState(
    await readEnergymapSelectedBuildingState(page, 'mobile-basic')
  )
  assertPanelState({
    state: basic,
    expectedPanels: ['energyConsumption', 'buildingDetails'],
    errors,
  })
  assertNoOverlap({ state: basic, a: 'controls', b: 'sidebarActionRail', errors })
  assertNoOverlap({ state: basic, a: 'sidebarActionRail', b: 'toggle', errors })

  await page.locator('[role="tab"]').nth(1).click()
  await page.waitForSelector('[data-testid="building-info-tab-page-renovation"]')
  await page.waitForTimeout(300)
  const renovation = normalizeSelectedBuildingState(
    await readEnergymapSelectedBuildingState(page, 'mobile-renovation')
  )
  assertPanelState({
    state: renovation,
    expectedPanels: [
      'energyConsumption',
      'renovationRecommendations',
      'buildingDetails',
    ],
    errors,
  })
  assertNoOverlap({
    state: renovation,
    a: 'controls',
    b: 'sidebarActionRail',
    errors,
  })
  assertNoOverlap({
    state: renovation,
    a: 'sidebarActionRail',
    b: 'toggle',
    errors,
  })

  const scrollResult = await scrollEnergymapBuildingInfoPage(page, 1800)
  if (!scrollResult.ok) {
    errors.push(`could not scroll mobile renovation page: ${scrollResult.reason}`)
  } else if (scrollResult.scrollTop <= 0) {
    errors.push('mobile renovation page did not scroll down')
  }
  await page.waitForTimeout(300)
  screenshots.push(await screenshot('selected-building-mobile-renovation-lower.png'))

  await page
    .locator('.panel-sidebar-page-container-controls button')
    .first()
    .click()
  await page.waitForSelector('[data-testid="building-info-action-rail"]', {
    timeout: 90000,
  })
  await page.waitForTimeout(300)
  screenshots.push(await screenshot('selected-building-mobile-collapsed.png'))
  const collapsed = normalizeSelectedBuildingState(
    await readEnergymapSelectedBuildingState(page, 'mobile-collapsed')
  )
  if (collapsed.pageScrollCount !== 0) {
    errors.push(
      `mobile-collapsed: expected expanded tab pages to be removed, got ${collapsed.pageScrollCount} page scrolls`
    )
  }
  if (collapsed.buildingActionRail == null) {
    errors.push('mobile-collapsed: expected collapsed building-info action rail')
  }
  if (collapsed.selectedBuildingState == null) {
    errors.push('mobile-collapsed: selected building was not preserved')
  }
  assertNoOverlap({
    state: collapsed,
    a: 'buildingActionRail',
    b: 'toggle',
    errors,
  })

  await page.locator('[data-testid="building-info-action-rail"] button').nth(1).click()
  await page.waitForSelector('[data-testid="building-info-tab-page-renovation"]')
  await page.waitForTimeout(300)
  const reopened = normalizeSelectedBuildingState(
    await readEnergymapSelectedBuildingState(page, 'mobile-reopened-renovation')
  )
  assertPanelState({
    state: reopened,
    expectedPanels: [
      'energyConsumption',
      'renovationRecommendations',
      'buildingDetails',
    ],
    errors,
  })

  await page.locator('.panel-sidebar-page-container-controls button').nth(1).click()
  await page.waitForSelector('[data-testid="building-info-tab-page-renovation"]', {
    state: 'detached',
    timeout: 90000,
  })
  await page
    .waitForFunction(() => {
      const store = window.__avoin_req?.(
        '(app-pages-browser)/./src/app/[locale]/(map)/(applets)/energiakartta/state/appletStore.ts'
      )?.useAppletStore

      return store?.getState().selectedBuilding == null
    })
    .catch(() => {})
  await page.waitForTimeout(500)
  screenshots.push(await screenshot('selected-building-mobile-closed.png'))
  const closed = normalizeSelectedBuildingState(
    await readEnergymapSelectedBuildingState(page, 'mobile-closed')
  )
  if (closed.pageScrollCount !== 0) {
    errors.push(
      `mobile-closed: expected no expanded page scrolls, got ${closed.pageScrollCount}`
    )
  }
  if (closed.buildingActionRail != null) {
    errors.push('mobile-closed: collapsed building-info action rail remained')
  }
  if (closed.selectedBuildingState != null) {
    errors.push('mobile-closed: selected building store was not cleared')
  }

  return {
    seed,
    screenshots,
    scrollResult,
    states: {
      basic,
      renovation,
      collapsed,
      reopened,
      closed,
    },
  }
}

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
  let selectedBuildingTabs = null

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

    if (check.selectedBuildingTabs) {
      selectedBuildingTabs = await runEnergymapSelectedBuildingTabsCheck({
        page,
        errors,
      })
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
      selectedBuildingTabs,
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
