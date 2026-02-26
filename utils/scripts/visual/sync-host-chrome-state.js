#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const { chromium } = require('@playwright/test')
const {
  waitForAppHydration,
} = require('./playwrightContext')

const HELP_TEXT = `\
Usage:
  node utils/scripts/visual/sync-host-chrome-state.js [options]

Options:
  --cdp-url <url>             CDP endpoint URL (default: http://host.docker.internal:9222)
  --origin <origin>           Origin to export (default: http://localhost:3000)
  --url <url>                 URL to open if no matching page exists (default: http://localhost:3000/en)
  --out <path>                Output storage state JSON path (default: .codex/browser-state/localhost-3000.storage-state.json)
  --page-match <substring>    Prefer pages whose URL also contains this substring
  --timeout-ms <ms>           Navigation/hydration timeout (default: 60000)
  --help                      Show this help

Behavior:
  Connects to a host Chrome instance via CDP and exports Playwright storage state
  (cookies + localStorage + IndexedDB) for one origin.
`

const DEFAULTS = {
  cdpUrl: 'http://host.docker.internal:9222',
  origin: 'http://localhost:3000',
  url: 'http://localhost:3000/en',
  out: '.codex/browser-state/localhost-3000.storage-state.json',
  pageMatch: null,
  timeoutMs: 60000,
}

const ensureDir = (dirPath) => fs.mkdirSync(dirPath, { recursive: true })

const parseArgs = (argv) => {
  const args = { ...DEFAULTS, help: false }

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]

    if (token === '--help' || token === '-h') {
      args.help = true
      continue
    }

    if (token.startsWith('--cdp-url=')) {
      args.cdpUrl = token.slice('--cdp-url='.length)
      continue
    }
    if (token === '--cdp-url') {
      args.cdpUrl = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--origin=')) {
      args.origin = token.slice('--origin='.length)
      continue
    }
    if (token === '--origin') {
      args.origin = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--url=')) {
      args.url = token.slice('--url='.length)
      continue
    }
    if (token === '--url') {
      args.url = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--out=')) {
      args.out = token.slice('--out='.length)
      continue
    }
    if (token === '--out') {
      args.out = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--page-match=')) {
      args.pageMatch = token.slice('--page-match='.length)
      continue
    }
    if (token === '--page-match') {
      args.pageMatch = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--timeout-ms=')) {
      args.timeoutMs = Number(token.slice('--timeout-ms='.length))
      continue
    }
    if (token === '--timeout-ms') {
      args.timeoutMs = Number(argv[i + 1])
      i++
      continue
    }

    throw new Error(`Unknown option: ${token}`)
  }

  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    throw new Error(`Invalid --timeout-ms value: ${args.timeoutMs}`)
  }

  try {
    // Validate early.
    const originUrl = new URL(args.origin)
    const pageUrl = new URL(args.url)
    if (originUrl.origin !== args.origin) {
      throw new Error('origin must not include a path/query/hash')
    }
    if (pageUrl.origin !== originUrl.origin) {
      throw new Error(`--url origin (${pageUrl.origin}) must match --origin (${originUrl.origin})`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Invalid URL/origin arguments: ${message}`)
  }

  return args
}

const getPagePreferenceScore = ({ pageUrl, origin, pageMatch }) => {
  if (!pageUrl || typeof pageUrl !== 'string') return -1
  if (!pageUrl.startsWith(origin)) return -1
  let score = 10
  if (pageMatch && pageUrl.includes(pageMatch)) {
    score += 100
  }
  if (pageUrl === origin || pageUrl === `${origin}/`) {
    score += 5
  }
  return score
}

const findPreferredContextAndPage = ({ browser, origin, pageMatch }) => {
  let best = null

  for (const context of browser.contexts()) {
    for (const page of context.pages()) {
      const pageUrl = page.url()
      const score = getPagePreferenceScore({ pageUrl, origin, pageMatch })
      if (score < 0) continue

      if (!best || score > best.score) {
        best = { context, page, score, pageUrl }
      }
    }
  }

  return best
}

const cookieMatchesHost = ({ cookie, host }) => {
  const cookieDomain = String(cookie?.domain || '')
    .replace(/^\./, '')
    .trim()
    .toLowerCase()
  const targetHost = String(host || '').trim().toLowerCase()

  if (!cookieDomain || !targetHost) return false
  if (cookieDomain === targetHost) return true
  return targetHost.endsWith(`.${cookieDomain}`)
}

const filterStorageStateForOrigin = ({ storageState, origin }) => {
  const originUrl = new URL(origin)
  const cookies = Array.isArray(storageState.cookies)
    ? storageState.cookies.filter((cookie) =>
        cookieMatchesHost({ cookie, host: originUrl.hostname })
      )
    : []

  const originEntry = Array.isArray(storageState.origins)
    ? storageState.origins.find((entry) => entry && entry.origin === origin)
    : null

  return {
    cookies,
    origins: originEntry ? [originEntry] : [],
  }
}

const getOriginSummary = ({ storageState, origin }) => {
  const originEntry = Array.isArray(storageState.origins)
    ? storageState.origins.find((entry) => entry && entry.origin === origin)
    : null

  return {
    cookiesCount: Array.isArray(storageState.cookies) ? storageState.cookies.length : 0,
    localStorageKeyCount: Array.isArray(originEntry?.localStorage)
      ? originEntry.localStorage.length
      : 0,
    indexedDbDbCount: Array.isArray(originEntry?.indexedDB) ? originEntry.indexedDB.length : 0,
    originFound: !!originEntry,
  }
}

const formatCdpConnectionError = ({ cdpUrl, error }) => {
  const message = error instanceof Error ? error.message : String(error)
  return `Could not connect to host Chrome CDP endpoint at ${cdpUrl}.

Launch Chrome on the Windows host with remote debugging enabled (dedicated profile recommended), for example in PowerShell:

  $chrome = \"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\"
  $profile = \"$env:LOCALAPPDATA\\AvoinMap-Codex-Chrome\"
  Start-Process -FilePath $chrome -ArgumentList @(
    '--remote-debugging-port=9222',
    '--remote-debugging-address=0.0.0.0',
    \"--user-data-dir=$profile\",
    'http://localhost:3000/fi/hiilikartta'
  )

Then open the app in that Chrome window, log in/import the plan, and rerun the sync.

Original error: ${message}`
}

const run = async () => {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(HELP_TEXT)
    return
  }

  const outPath = path.resolve(process.cwd(), args.out)
  ensureDir(path.dirname(outPath))

  let browser
  try {
    browser = await chromium.connectOverCDP(args.cdpUrl)
  } catch (error) {
    throw new Error(formatCdpConnectionError({ cdpUrl: args.cdpUrl, error }))
  }

  let selectedContext
  let selectedPage
  let openedNewPage = false

  try {
    const preferred = findPreferredContextAndPage({
      browser,
      origin: args.origin,
      pageMatch: args.pageMatch,
    })

    if (preferred) {
      selectedContext = preferred.context
      selectedPage = preferred.page
    } else {
      selectedContext = browser.contexts()[0]
      if (!selectedContext) {
        throw new Error(
          `No browser context found via CDP at ${args.cdpUrl}. Open at least one normal Chrome window in the debug profile and try again.`
        )
      }

      selectedPage = await selectedContext.newPage()
      openedNewPage = true
      await selectedPage.goto(args.url, {
        waitUntil: 'domcontentloaded',
        timeout: args.timeoutMs,
      })
    }

    try {
      await waitForAppHydration({
        page: selectedPage,
        timeoutMs: args.timeoutMs,
        settleMs: 1000,
        minBodyHeight: 50,
      })
    } catch {
      // Do not fail the sync purely on hydration timing; storage may already be present.
    }

    const rawStorageState = await selectedContext.storageState({ indexedDB: true })
    const filteredState = filterStorageStateForOrigin({
      storageState: rawStorageState,
      origin: args.origin,
    })
    const summary = getOriginSummary({ storageState: filteredState, origin: args.origin })

    if (!summary.originFound) {
      throw new Error(
        `Exported storage state did not contain origin ${args.origin}. Open ${args.origin} in the dedicated debug Chrome profile, ensure the app is loaded (and logged in/imported), then rerun the sync.`
      )
    }

    fs.writeFileSync(outPath, `${JSON.stringify(filteredState, null, 2)}\n`, 'utf8')

    console.log(
      JSON.stringify(
        {
          cdpUrl: args.cdpUrl,
          origin: args.origin,
          out: outPath,
          cookiesCount: summary.cookiesCount,
          localStorageKeyCount: summary.localStorageKeyCount,
          indexedDbDbCount: summary.indexedDbDbCount,
          openedNewPage,
          pageUrl: selectedPage?.url?.() || null,
        },
        null,
        2
      )
    )
  } finally {
    try {
      if (openedNewPage && selectedPage && !selectedPage.isClosed()) {
        await selectedPage.close()
      }
    } catch {
      // ignore; never close the host browser from this sync script
    }
    try {
      if (browser) {
        await browser.close()
      }
    } catch {
      // ignore disconnect errors
    }
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(message)
  process.exit(1)
})
