const fs = require('fs')
const path = require('path')
const dns = require('dns')

const DEFAULT_HOST_CDP_URL = 'http://host.docker.internal:9222'
const DEFAULT_CONTAINER_CDP_URL = 'http://127.0.0.1:9223'
const DEFAULT_HOST_ORIGIN = 'http://localhost:3000'
const DEFAULT_HOST_URL = 'http://localhost:3000/en'
const DEFAULT_CONTAINER_URL = 'http://localhost:3000/en'
const DEFAULT_TIMEOUT_MS = 60000

const LIVE_BROWSER_PATHS = {
  root: path.join(process.cwd(), '.dev', 'live-browser'),
  controlLockFile: path.join(process.cwd(), '.dev', 'live-browser', 'control-lock.json'),
  containerSessionFile: path.join(process.cwd(), '.dev', 'live-browser', 'container-session.json'),
  containerBrowserLog: path.join(process.cwd(), '.dev', 'live-browser', 'container-browser.log'),
  containerUserDataDir: path.join(
    process.cwd(),
    '.dev',
    'live-browser-persist',
    'container-chrome-profile'
  ),
}

const ensureDir = (dirPath) => fs.mkdirSync(dirPath, { recursive: true })

const writeJsonFile = ({ filePath, value }) => {
  ensureDir(path.dirname(filePath))
  const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`
  fs.writeFileSync(tmpPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  fs.renameSync(tmpPath, filePath)
}

const readJsonFile = ({ filePath }) => {
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

const fileExists = (filePath) => {
  try {
    fs.accessSync(filePath)
    return true
  } catch {
    return false
  }
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

const getChromium = () => {
  const { chromium } = require('@playwright/test')
  return chromium
}

const getConnectedCdpUrl = ({ browser, requestedCdpUrl = null } = {}) =>
  browser && browser.__codexCdpConnection && browser.__codexCdpConnection.effectiveCdpUrl
    ? browser.__codexCdpConnection.effectiveCdpUrl
    : requestedCdpUrl

const setConnectedCdpMetadata = ({ browser, requestedCdpUrl, effectiveCdpUrl, usedHostDockerInternalIpFallback }) => {
  if (!browser) return browser
  try {
    browser.__codexCdpConnection = {
      requestedCdpUrl,
      effectiveCdpUrl,
      usedHostDockerInternalIpFallback: !!usedHostDockerInternalIpFallback,
    }
  } catch {
    // ignore metadata attachment failures
  }
  return browser
}

const isHostDockerInternalDevToolsHttpUrl = ({ cdpUrl }) => {
  try {
    const url = new URL(cdpUrl)
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      String(url.hostname || '').toLowerCase() === 'host.docker.internal'
    )
  } catch {
    return false
  }
}

const isLikelyHostHeaderRejectedDevToolsError = ({ error }) => {
  const message = String(error instanceof Error ? error.message : error || '')
  return (
    message.includes('Unexpected status 500') &&
    message.includes('/json/version') &&
    message.includes('This does not look like a DevTools server')
  )
}

const replaceUrlHostname = ({ url, hostname }) => {
  const parsed = new URL(url)
  parsed.hostname = hostname
  return parsed.toString()
}

const resolveHostDockerInternalIp = async () => {
  const result = await dns.promises.lookup('host.docker.internal')
  if (!result || !result.address) {
    throw new Error('DNS lookup for host.docker.internal returned no address')
  }
  return result.address
}

const connectToCdpBrowser = async ({ cdpUrl, logger = null } = {}) => {
  const chromium = getChromium()

  try {
    const browser = await chromium.connectOverCDP(cdpUrl)
    return setConnectedCdpMetadata({
      browser,
      requestedCdpUrl: cdpUrl,
      effectiveCdpUrl: cdpUrl,
      usedHostDockerInternalIpFallback: false,
    })
  } catch (error) {
    const shouldRetryWithIp =
      isHostDockerInternalDevToolsHttpUrl({ cdpUrl }) &&
      isLikelyHostHeaderRejectedDevToolsError({ error })

    if (!shouldRetryWithIp) {
      throw error
    }

    let fallbackCdpUrl
    try {
      const hostIp = await resolveHostDockerInternalIp()
      fallbackCdpUrl = replaceUrlHostname({ url: cdpUrl, hostname: hostIp })
      if (typeof logger === 'function' && fallbackCdpUrl !== cdpUrl) {
        logger(
          `[live-browser] Retrying CDP connect with literal host IP (${fallbackCdpUrl}) because Chrome rejected Host header for host.docker.internal.`
        )
      }
      const browser = await chromium.connectOverCDP(fallbackCdpUrl)
      return setConnectedCdpMetadata({
        browser,
        requestedCdpUrl: cdpUrl,
        effectiveCdpUrl: fallbackCdpUrl,
        usedHostDockerInternalIpFallback: true,
      })
    } catch (retryError) {
      const originalMessage = error instanceof Error ? error.message : String(error)
      const retryMessage = retryError instanceof Error ? retryError.message : String(retryError)
      throw new Error(
        `${originalMessage}\n\nAutomatic retry with literal host IP${fallbackCdpUrl ? ` (${fallbackCdpUrl})` : ''} also failed: ${retryMessage}`
      )
    }
  }
}

const validateOriginAndUrl = ({ origin, url }) => {
  try {
    const originUrl = new URL(origin)
    const pageUrl = new URL(url)
    if (originUrl.origin !== origin) {
      throw new Error('origin must not include a path/query/hash')
    }
    if (pageUrl.origin !== originUrl.origin) {
      throw new Error(`url origin (${pageUrl.origin}) must match origin (${originUrl.origin})`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Invalid URL/origin arguments: ${message}`)
  }
}

const ensurePageForOrigin = async ({
  browser,
  origin,
  url,
  pageMatch = null,
  openIfMissing = true,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  bringToFront = false,
}) => {
  const preferred = findPreferredContextAndPage({ browser, origin, pageMatch })
  if (preferred) {
    if (bringToFront && typeof preferred.page.bringToFront === 'function') {
      try {
        await preferred.page.bringToFront()
      } catch {
        // ignore platform/browser quirks
      }
    }
    return {
      browser,
      context: preferred.context,
      page: preferred.page,
      pageUrl: preferred.pageUrl,
      openedNewPage: false,
      matchedExistingPage: true,
    }
  }

  const context = browser.contexts()[0]
  if (!context) {
    throw new Error(
      'No browser context found via CDP. Open at least one normal Chrome/Chromium window and try again.'
    )
  }

  if (!openIfMissing) {
    throw new Error(
      `No page found for origin ${origin}. Open ${url || origin} in the shared browser (or allow opening a new page).`
    )
  }

  const page = await context.newPage()
  if (bringToFront && typeof page.bringToFront === 'function') {
    try {
      await page.bringToFront()
    } catch {
      // ignore platform/browser quirks
    }
  }
  const targetUrl = url || origin
  await page.goto(targetUrl, {
    waitUntil: 'domcontentloaded',
    timeout: timeoutMs,
  })

  return {
    browser,
    context,
    page,
    pageUrl: page.url(),
    openedNewPage: true,
    matchedExistingPage: false,
  }
}

const formatHostCdpConnectionError = ({ cdpUrl, error, actionLabel = 'rerun the command' }) => {
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

Then open the app in that Chrome window and ${actionLabel}.

If Chrome is already running with CDP and you see a 500 error for /json/version, Chrome may be rejecting the Host header for "host.docker.internal". In that case use the literal host IP for --cdp-url (for example the address returned by \`getent hosts host.docker.internal\`) or rerun with the updated live scripts, which auto-retry with the literal IP.

Original error: ${message}`
}

const printSessionSummary = ({ mode, cdpUrl, origin = null, selectedPage, openedNewPage, lockStatus = null }) => {
  const page = selectedPage?.page || null
  const context = selectedPage?.context || null
  const browser = selectedPage?.browser || null

  const summary = {
    mode,
    cdpUrl,
    origin,
    pageUrl: selectedPage?.pageUrl || (page && typeof page.url === 'function' ? page.url() : null),
    openedNewPage: typeof openedNewPage === 'boolean' ? openedNewPage : !!selectedPage?.openedNewPage,
    matchedExistingPage: !!selectedPage?.matchedExistingPage,
    contextPageCount: context && typeof context.pages === 'function' ? context.pages().length : null,
    browserContextCount: browser && typeof browser.contexts === 'function' ? browser.contexts().length : null,
    lock: lockStatus
      ? {
          locked: !!lockStatus.locked,
          owner: lockStatus.owner || null,
          expired: !!lockStatus.expired,
          mode: lockStatus.mode || null,
          lockPath: lockStatus.lockPath || null,
        }
      : null,
  }

  console.log(JSON.stringify(summary, null, 2))
  return summary
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isHttpEndpointReachable = async ({ url, timeoutMs = 2000 }) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
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

const waitForHttpEndpoint = async ({ url, timeoutMs = DEFAULT_TIMEOUT_MS, intervalMs = 500 }) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (await isHttpEndpointReachable({ url, timeoutMs: Math.min(2000, intervalMs) })) {
      return true
    }
    await delay(intervalMs)
  }
  return false
}

const isPidAlive = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

const validateContainerSessionMetadata = ({ value, source = 'container session metadata' }) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${source} must be an object`)
  }

  const pid = Number(value.pid)
  if (!Number.isInteger(pid) || pid <= 0) {
    throw new Error(`${source} has invalid pid`) 
  }

  if (typeof value.cdpUrl !== 'string' || !value.cdpUrl.trim()) {
    throw new Error(`${source} has invalid cdpUrl`)
  }

  if (typeof value.origin !== 'string' || !value.origin.trim()) {
    throw new Error(`${source} has invalid origin`)
  }

  if (typeof value.url !== 'string' || !value.url.trim()) {
    throw new Error(`${source} has invalid url`)
  }

  if (typeof value.startedAt !== 'string' || !value.startedAt.trim()) {
    throw new Error(`${source} has invalid startedAt`)
  }

  return {
    version: Number(value.version) || 1,
    pid,
    cdpUrl: value.cdpUrl,
    origin: value.origin,
    url: value.url,
    startedAt: value.startedAt,
    logPath: typeof value.logPath === 'string' ? value.logPath : undefined,
    userDataDir: typeof value.userDataDir === 'string' ? value.userDataDir : undefined,
    browserBin: typeof value.browserBin === 'string' ? value.browserBin : undefined,
    browserKind: typeof value.browserKind === 'string' ? value.browserKind : undefined,
  }
}

const readContainerSessionMetadata = ({ filePath = LIVE_BROWSER_PATHS.containerSessionFile } = {}) => {
  if (!fileExists(filePath)) {
    return null
  }

  try {
    const parsed = readJsonFile({ filePath })
    return validateContainerSessionMetadata({ value: parsed, source: filePath })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to read container session metadata ${filePath}: ${message}`)
  }
}

const writeContainerSessionMetadata = ({
  filePath = LIVE_BROWSER_PATHS.containerSessionFile,
  value,
}) => {
  const validated = validateContainerSessionMetadata({ value, source: 'container session metadata' })
  writeJsonFile({ filePath, value: validated })
  return validated
}

const clearContainerSessionMetadata = ({ filePath = LIVE_BROWSER_PATHS.containerSessionFile } = {}) => {
  try {
    fs.unlinkSync(filePath)
    return true
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

module.exports = {
  DEFAULT_CONTAINER_CDP_URL,
  DEFAULT_CONTAINER_URL,
  DEFAULT_HOST_CDP_URL,
  DEFAULT_HOST_ORIGIN,
  DEFAULT_HOST_URL,
  DEFAULT_TIMEOUT_MS,
  LIVE_BROWSER_PATHS,
  clearContainerSessionMetadata,
  connectToCdpBrowser,
  getConnectedCdpUrl,
  ensureDir,
  ensurePageForOrigin,
  fileExists,
  findPreferredContextAndPage,
  formatHostCdpConnectionError,
  getPagePreferenceScore,
  isHttpEndpointReachable,
  isPidAlive,
  printSessionSummary,
  readContainerSessionMetadata,
  readJsonFile,
  validateContainerSessionMetadata,
  validateOriginAndUrl,
  waitForHttpEndpoint,
  writeContainerSessionMetadata,
  writeJsonFile,
}
