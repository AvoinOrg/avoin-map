#!/usr/bin/env node

const path = require('path')
const {
  DEFAULT_CONTAINER_CDP_URL,
  DEFAULT_CONTAINER_URL,
  DEFAULT_HOST_ORIGIN,
  DEFAULT_TIMEOUT_MS,
  LIVE_BROWSER_PATHS,
  clearContainerSessionMetadata,
  connectToCdpBrowser,
  ensureDir,
  ensurePageForOrigin,
  isHttpEndpointReachable,
  isPidAlive,
  printSessionSummary,
  readContainerSessionMetadata,
  validateOriginAndUrl,
} = require('./liveSharedBrowser')
const { getLockStatus, assertLockOwner } = require('./liveControlLock')
const { waitForAppHydration } = require('./playwrightContext')

const HELP_TEXT = `\
Usage:
  node utils/scripts/visual/live-container-browser-attach.js [options]

Options:
  --cdp-url <url>                 CDP endpoint URL (default: from session file, else ${DEFAULT_CONTAINER_CDP_URL})
  --origin <origin>               Origin (default: from session file, else ${DEFAULT_HOST_ORIGIN})
  --url <url>                     URL to open if no matching page exists (default: from session file, else ${DEFAULT_CONTAINER_URL})
  --page-match <substring>        Prefer pages whose URL contains this substring
  --timeout-ms <ms>               Navigation/hydration timeout (default: ${DEFAULT_TIMEOUT_MS})
  --open-if-missing               Open a new page when no matching page exists (default)
  --no-open-if-missing            Fail instead of opening a new page
  --screenshot-out <path>         Optional screenshot path for a quick visual probe
  --assert-lock-owner <owner>     Require active lock ownership by the given owner
  --check                         Connectivity/selection check mode (skips hydration wait)
  --close-opened-page-on-exit     Close only the page this script opened before exiting
  --close-browser                 Compatibility no-op (CDP client disconnects on exit by default)
  --help                          Show this help
`

const parseArgs = (argv) => {
  const args = {
    cdpUrl: null,
    origin: null,
    url: null,
    pageMatch: null,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    openIfMissing: true,
    screenshotOut: null,
    assertLockOwner: null,
    check: false,
    closeOpenedPageOnExit: false,
    closeBrowser: false,
    help: false,
  }

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (!token || token === '--') {
      continue
    }

    if (token === '--help' || token === '-h') {
      args.help = true
      continue
    }
    if (token === '--check') {
      args.check = true
      continue
    }
    if (token === '--open-if-missing') {
      args.openIfMissing = true
      continue
    }
    if (token === '--no-open-if-missing') {
      args.openIfMissing = false
      continue
    }
    if (token === '--close-opened-page-on-exit') {
      args.closeOpenedPageOnExit = true
      continue
    }
    if (token === '--close-browser') {
      args.closeBrowser = true
      continue
    }

    const readValue = () => {
      i++
      return argv[i]
    }

    if (token.startsWith('--cdp-url=')) {
      args.cdpUrl = token.slice('--cdp-url='.length)
      continue
    }
    if (token === '--cdp-url') {
      args.cdpUrl = readValue()
      continue
    }

    if (token.startsWith('--origin=')) {
      args.origin = token.slice('--origin='.length)
      continue
    }
    if (token === '--origin') {
      args.origin = readValue()
      continue
    }

    if (token.startsWith('--url=')) {
      args.url = token.slice('--url='.length)
      continue
    }
    if (token === '--url') {
      args.url = readValue()
      continue
    }

    if (token.startsWith('--page-match=')) {
      args.pageMatch = token.slice('--page-match='.length)
      continue
    }
    if (token === '--page-match') {
      args.pageMatch = readValue()
      continue
    }

    if (token.startsWith('--timeout-ms=')) {
      args.timeoutMs = Number(token.slice('--timeout-ms='.length))
      continue
    }
    if (token === '--timeout-ms') {
      args.timeoutMs = Number(readValue())
      continue
    }

    if (token.startsWith('--screenshot-out=')) {
      args.screenshotOut = token.slice('--screenshot-out='.length)
      continue
    }
    if (token === '--screenshot-out') {
      args.screenshotOut = readValue()
      continue
    }

    if (token.startsWith('--assert-lock-owner=')) {
      args.assertLockOwner = token.slice('--assert-lock-owner='.length)
      continue
    }
    if (token === '--assert-lock-owner') {
      args.assertLockOwner = readValue()
      continue
    }

    throw new Error(`Unknown option: ${token}`)
  }

  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    throw new Error(`Invalid --timeout-ms value: ${args.timeoutMs}`)
  }

  return args
}

const readSessionMetadataSafely = () => {
  try {
    return readContainerSessionMetadata()
  } catch (error) {
    if (LIVE_BROWSER_PATHS.containerSessionFile) {
      console.warn(
        `[live-container-attach] Invalid session metadata; removing stale file: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
      try {
        clearContainerSessionMetadata()
      } catch {
        // ignore cleanup errors
      }
    }
    return null
  }
}

const run = async () => {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(HELP_TEXT)
    return
  }

  const session = readSessionMetadataSafely()
  const cdpUrl = args.cdpUrl || session?.cdpUrl || DEFAULT_CONTAINER_CDP_URL
  const origin = args.origin || session?.origin || DEFAULT_HOST_ORIGIN
  const url = args.url || session?.url || DEFAULT_CONTAINER_URL

  validateOriginAndUrl({ origin, url })

  if (session) {
    const endpointUrl = `${session.cdpUrl.replace(/\/+$/, '')}/json/version`
    const endpointAlive = await isHttpEndpointReachable({ url: endpointUrl, timeoutMs: 1000 })
    const pidAlive = isPidAlive(session.pid)
    if (!endpointAlive && !pidAlive) {
      console.warn(
        `[live-container-attach] Removing stale session metadata for pid ${session.pid}; endpoint ${session.cdpUrl} is unavailable.`
      )
      clearContainerSessionMetadata()
    }
  }

  const lockStatus = args.assertLockOwner
    ? assertLockOwner({ expectedOwner: args.assertLockOwner, allowUnlocked: false })
    : getLockStatus()

  let browser
  let selectedPage
  try {
    browser = await connectToCdpBrowser({ cdpUrl })

    selectedPage = await ensurePageForOrigin({
      browser,
      origin,
      url,
      pageMatch: args.pageMatch,
      openIfMissing: args.openIfMissing,
      timeoutMs: args.timeoutMs,
      bringToFront: true,
    })

    if (!args.check) {
      try {
        await waitForAppHydration({
          page: selectedPage.page,
          timeoutMs: args.timeoutMs,
          settleMs: 750,
          minBodyHeight: 50,
        })
      } catch {
        // Live attach should not fail purely because hydration heuristics were slow.
      }
    }

    if (args.screenshotOut) {
      const screenshotPath = path.resolve(process.cwd(), args.screenshotOut)
      ensureDir(path.dirname(screenshotPath))
      await selectedPage.page.screenshot({
        path: screenshotPath,
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
      })
    }

    printSessionSummary({
      mode: 'container-headed',
      cdpUrl,
      origin,
      selectedPage,
      openedNewPage: selectedPage.openedNewPage,
      lockStatus,
    })
  } finally {
    try {
      if (args.closeOpenedPageOnExit && selectedPage?.openedNewPage && selectedPage?.page) {
        if (!selectedPage.page.isClosed()) {
          await selectedPage.page.close()
        }
      }
    } catch {
      // ignore cleanup issues
    }

    if (browser) {
      try {
        await browser.close()
      } catch {
        // ignore disconnect/close errors
      }
    }
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(message)
  process.exit(1)
})
