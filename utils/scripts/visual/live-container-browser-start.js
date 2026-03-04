#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const {
  DEFAULT_CONTAINER_CDP_URL,
  DEFAULT_CONTAINER_URL,
  DEFAULT_HOST_ORIGIN,
  DEFAULT_TIMEOUT_MS,
  LIVE_BROWSER_PATHS,
  clearContainerSessionMetadata,
  ensureDir,
  isHttpEndpointReachable,
  isPidAlive,
  readContainerSessionMetadata,
  validateOriginAndUrl,
  waitForHttpEndpoint,
  writeContainerSessionMetadata,
} = require('./liveSharedBrowser')

const DEFAULT_WINDOW_SIZE = '1600,960'

const HELP_TEXT = `\
Usage:
  node utils/scripts/visual/live-container-browser-start.js [options]

Options:
  --cdp-url <url>             CDP endpoint URL to expose (default: ${DEFAULT_CONTAINER_CDP_URL})
  --origin <origin>           Origin for shared browsing (default: ${DEFAULT_HOST_ORIGIN})
  --url <url>                 Initial URL (default: ${DEFAULT_CONTAINER_URL})
  --timeout-ms <ms>           Startup timeout (default: ${DEFAULT_TIMEOUT_MS})
  --user-data-dir <path>      Chromium user data dir (default: ${LIVE_BROWSER_PATHS.containerUserDataDir})
  --log-path <path>           Browser log file path (default: ${LIVE_BROWSER_PATHS.containerBrowserLog})
  --browser-bin <path>        Browser executable to use (default: prefer Google Chrome stable, fallback to Playwright Chromium)
  --browser-arg <arg>         Additional raw browser arg (repeatable)
  --window-size <w,h>         Initial window size (default: ${DEFAULT_WINDOW_SIZE})
  --no-window-size            Do not force an initial window size (use browser/profile default)
  --start-maximized           Start maximized (overrides --window-size)
  --force                     Replace stale session metadata if present
  --help                      Show this help
`

const CONTAINER_BROWSER_BIN_CANDIDATES = [
  { path: '/usr/bin/google-chrome-stable', kind: 'google-chrome-stable' },
  { path: '/usr/bin/google-chrome', kind: 'google-chrome' },
]

const DEFAULT_CONTAINER_BROWSER_ARGS = [
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--ozone-platform=x11',
  '--enable-webgl',
  '--ignore-gpu-blocklist',
  '--enable-unsafe-swiftshader',
  '--use-gl=angle',
  '--use-angle=swiftshader',
]

const fileExists = (targetPath) => {
  try {
    fs.accessSync(targetPath)
    return true
  } catch {
    return false
  }
}

const getPlaywrightChromiumExecutablePath = () => {
  const { chromium } = require('@playwright/test')
  return chromium.executablePath()
}

const resolveContainerBrowserExecutable = ({ browserBinOverride } = {}) => {
  if (browserBinOverride) {
    const normalizedOverride = String(browserBinOverride).trim()
    if (!normalizedOverride) {
      throw new Error('Browser executable override is empty')
    }
    const looksLikePath =
      normalizedOverride.startsWith('/') ||
      normalizedOverride.startsWith('./') ||
      normalizedOverride.startsWith('../')
    const resolvedPath = looksLikePath ? path.resolve(process.cwd(), normalizedOverride) : normalizedOverride
    if (looksLikePath && !fileExists(resolvedPath)) {
      throw new Error(`Browser executable not found: ${resolvedPath}`)
    }

    return {
      browserBin: resolvedPath,
      browserKind: 'custom',
      fallbackUsed: false,
      warnings: [],
    }
  }

  for (const candidate of CONTAINER_BROWSER_BIN_CANDIDATES) {
    if (fileExists(candidate.path)) {
      return {
        browserBin: candidate.path,
        browserKind: candidate.kind,
        fallbackUsed: false,
        warnings: [],
      }
    }
  }

  const playwrightChromiumPath = getPlaywrightChromiumExecutablePath()
  return {
    browserBin: playwrightChromiumPath,
    browserKind: 'playwright-chromium',
    fallbackUsed: true,
    warnings: [
      'Google Chrome stable was not found in the container. Falling back to Playwright bundled Chromium; Chrome Web Store extension install may be limited in this browser build.',
    ],
  }
}

const parseWindowSize = ({ value, optionName }) => {
  const raw = String(value || '').trim()
  const match = raw.match(/^(\d+)\s*,\s*(\d+)$/)
  if (!match) {
    throw new Error(`Invalid ${optionName} value: ${value}. Expected "<width>,<height>"`)
  }

  const width = Number(match[1])
  const height = Number(match[2])
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error(`Invalid ${optionName} value: ${value}. Width/height must be positive integers`)
  }

  return `${width},${height}`
}

const parseArgs = (argv) => {
  const args = {
    cdpUrl: DEFAULT_CONTAINER_CDP_URL,
    origin: DEFAULT_HOST_ORIGIN,
    url: DEFAULT_CONTAINER_URL,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    userDataDir: LIVE_BROWSER_PATHS.containerUserDataDir,
    logPath: LIVE_BROWSER_PATHS.containerBrowserLog,
    browserBin: null,
    browserArgs: [],
    windowSize: DEFAULT_WINDOW_SIZE,
    noWindowSize: false,
    startMaximized: false,
    force: false,
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
    if (token === '--force') {
      args.force = true
      continue
    }
    if (token === '--no-window-size') {
      args.noWindowSize = true
      continue
    }
    if (token === '--start-maximized') {
      args.startMaximized = true
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

    if (token.startsWith('--timeout-ms=')) {
      args.timeoutMs = Number(token.slice('--timeout-ms='.length))
      continue
    }
    if (token === '--timeout-ms') {
      args.timeoutMs = Number(readValue())
      continue
    }

    if (token.startsWith('--user-data-dir=')) {
      args.userDataDir = token.slice('--user-data-dir='.length)
      continue
    }
    if (token === '--user-data-dir') {
      args.userDataDir = readValue()
      continue
    }

    if (token.startsWith('--log-path=')) {
      args.logPath = token.slice('--log-path='.length)
      continue
    }
    if (token === '--log-path') {
      args.logPath = readValue()
      continue
    }

    if (token.startsWith('--browser-bin=')) {
      args.browserBin = token.slice('--browser-bin='.length)
      continue
    }
    if (token === '--browser-bin') {
      args.browserBin = readValue()
      continue
    }

    if (token.startsWith('--browser-arg=')) {
      const browserArg = token.slice('--browser-arg='.length)
      if (!browserArg) {
        throw new Error('Invalid --browser-arg value: empty string')
      }
      args.browserArgs.push(browserArg)
      continue
    }
    if (token === '--browser-arg') {
      const browserArg = readValue()
      if (!browserArg) {
        throw new Error('Invalid --browser-arg value: empty string')
      }
      args.browserArgs.push(browserArg)
      continue
    }

    if (token.startsWith('--window-size=')) {
      args.windowSize = parseWindowSize({
        value: token.slice('--window-size='.length),
        optionName: '--window-size',
      })
      continue
    }
    if (token === '--window-size') {
      args.windowSize = parseWindowSize({
        value: readValue(),
        optionName: '--window-size',
      })
      continue
    }

    throw new Error(`Unknown option: ${token}`)
  }

  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    throw new Error(`Invalid --timeout-ms value: ${args.timeoutMs}`)
  }
  if (!args.noWindowSize) {
    args.windowSize = parseWindowSize({
      value: args.windowSize,
      optionName: '--window-size',
    })
  }

  validateOriginAndUrl({ origin: args.origin, url: args.url })

  const cdpUrl = new URL(args.cdpUrl)
  if (!['127.0.0.1', 'localhost'].includes(cdpUrl.hostname)) {
    throw new Error(`Container browser start only supports localhost CDP endpoints, got ${args.cdpUrl}`)
  }
  if (!cdpUrl.port) {
    throw new Error(`CDP URL must include a port: ${args.cdpUrl}`)
  }

  return args
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const stopPid = async ({ pid }) => {
  if (!isPidAlive(pid)) {
    return { stopped: false, signal: null }
  }

  try {
    process.kill(pid, 'SIGTERM')
  } catch {
    return { stopped: !isPidAlive(pid), signal: 'SIGTERM' }
  }

  const started = Date.now()
  while (Date.now() - started < 3000) {
    if (!isPidAlive(pid)) {
      return { stopped: true, signal: 'SIGTERM' }
    }
    await delay(200)
  }

  try {
    process.kill(pid, 'SIGKILL')
  } catch {
    // ignore
  }

  await delay(200)
  return { stopped: !isPidAlive(pid), signal: 'SIGKILL' }
}

const run = async () => {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(HELP_TEXT)
    return
  }

  ensureDir(LIVE_BROWSER_PATHS.root)
  ensureDir(path.resolve(process.cwd(), args.userDataDir))
  ensureDir(path.dirname(path.resolve(process.cwd(), args.logPath)))

  let existingSession = null
  try {
    existingSession = readContainerSessionMetadata()
  } catch (error) {
    console.warn(String(error instanceof Error ? error.message : error))
    if (!args.force) {
      throw new Error('Container session metadata is invalid. Re-run with --force to replace it.')
    }
    clearContainerSessionMetadata()
  }

  if (existingSession) {
    const cdpVersionUrl = `${existingSession.cdpUrl.replace(/\/+$/, '')}/json/version`
    const endpointAlive = await isHttpEndpointReachable({ url: cdpVersionUrl, timeoutMs: 1000 })
    const pidAlive = isPidAlive(existingSession.pid)
    if (pidAlive || endpointAlive) {
      throw new Error(
        `A container shared browser session already exists (pid ${existingSession.pid}, ${existingSession.cdpUrl}). Stop it first with \`yarn browser:live:container:stop\`.`
      )
    }
    clearContainerSessionMetadata()
  }

  const cdpUrl = new URL(args.cdpUrl)
  const cdpPort = cdpUrl.port
  const browserExec = resolveContainerBrowserExecutable({ browserBinOverride: args.browserBin })
  const logPath = path.resolve(process.cwd(), args.logPath)
  const userDataDir = path.resolve(process.cwd(), args.userDataDir)
  const logFd = fs.openSync(logPath, 'a')
  const startStamp = new Date().toISOString()
  fs.writeSync(
    logFd,
    `\n[${startStamp}] Starting shared container browser (${browserExec.browserKind}): ${browserExec.browserBin}\n`
  )
  for (const warning of browserExec.warnings) {
    fs.writeSync(logFd, `[${startStamp}] Warning: ${warning}\n`)
    console.warn(`[live-container-start] ${warning}`)
  }

  const child = spawn(
    browserExec.browserBin,
    [
      ...DEFAULT_CONTAINER_BROWSER_ARGS,
      `--remote-debugging-port=${cdpPort}`,
      '--remote-debugging-address=127.0.0.1',
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--new-window',
      ...(args.startMaximized
        ? ['--start-maximized']
        : args.noWindowSize
          ? []
          : [`--window-size=${args.windowSize}`]),
      ...args.browserArgs,
      args.url,
    ],
    {
      cwd: process.cwd(),
      detached: true,
      env: process.env,
      stdio: ['ignore', logFd, logFd],
    }
  )
  child.unref()
  fs.closeSync(logFd)

  const cdpVersionUrl = `${args.cdpUrl.replace(/\/+$/, '')}/json/version`
  const ready = await waitForHttpEndpoint({ url: cdpVersionUrl, timeoutMs: args.timeoutMs, intervalMs: 500 })
  if (!ready) {
    await stopPid({ pid: child.pid })
    throw new Error(
      `Timed out waiting for container shared browser CDP endpoint at ${cdpVersionUrl}. See ${logPath} for details.`
    )
  }

  const metadata = writeContainerSessionMetadata({
    value: {
      version: 1,
      pid: child.pid,
      cdpUrl: args.cdpUrl,
      origin: args.origin,
      url: args.url,
      startedAt: startStamp,
      logPath,
      userDataDir,
      browserBin: browserExec.browserBin,
      browserKind: browserExec.browserKind,
    },
  })

  console.log(
    JSON.stringify(
      {
        action: 'started',
        mode: 'container-headed',
        pid: metadata.pid,
        cdpUrl: metadata.cdpUrl,
        origin: metadata.origin,
        url: metadata.url,
        logPath: metadata.logPath,
        userDataDir: metadata.userDataDir,
        browserBin: metadata.browserBin || browserExec.browserBin,
        browserKind: metadata.browserKind || browserExec.browserKind,
        windowSize: args.noWindowSize ? null : args.windowSize,
        startMaximized: args.startMaximized,
        fallbackBrowserUsed: browserExec.fallbackUsed,
        startedAt: metadata.startedAt,
      },
      null,
      2
    )
  )
}

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(message)
  process.exit(1)
})
