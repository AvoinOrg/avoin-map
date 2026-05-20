#!/usr/bin/env node

const {
  BROWSER_MODE_HEADLESS,
  assertWebGLAvailable,
  getChromiumLaunchOptions,
  maybeReexecInsideXvfb,
  normalizeBrowserMode,
  probeWebGL,
} = require('./browserRuntime')

const EXPECT_AVAILABLE = 'available'
const EXPECT_UNAVAILABLE = 'unavailable'
const SUPPORTED_EXPECTATIONS = [EXPECT_AVAILABLE, EXPECT_UNAVAILABLE]

const HELP_TEXT = `\
Usage:
  node utils/scripts/visual/webgl-smoke.js [options]

Options:
  --browser-mode <mode>       Browser mode to probe (default: ${BROWSER_MODE_HEADLESS})
  --expect-webgl <state>      Expected result: ${SUPPORTED_EXPECTATIONS.join('|')} (default: ${EXPECT_UNAVAILABLE})
  --help                      Show this help

Behavior:
  Launches Playwright Chromium in the requested mode and probes a blank page for
  raw WebGL context availability. This is a browser-runtime smoke check, not an
  app route test.
`

const parseArgs = (argv) => {
  const args = {
    browserMode: BROWSER_MODE_HEADLESS,
    expectWebGL: EXPECT_UNAVAILABLE,
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

    if (token.startsWith('--browser-mode=')) {
      args.browserMode = token.slice('--browser-mode='.length)
      continue
    }
    if (token === '--browser-mode') {
      args.browserMode = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--expect-webgl=')) {
      args.expectWebGL = token.slice('--expect-webgl='.length)
      continue
    }
    if (token === '--expect-webgl') {
      args.expectWebGL = argv[i + 1]
      i++
      continue
    }

    throw new Error(`Unknown option: ${token}`)
  }

  args.browserMode = normalizeBrowserMode(args.browserMode)
  args.expectWebGL = String(args.expectWebGL || '').trim().toLowerCase()

  if (!SUPPORTED_EXPECTATIONS.includes(args.expectWebGL)) {
    throw new Error(
      `Unsupported --expect-webgl value: ${args.expectWebGL}. Expected one of ${SUPPORTED_EXPECTATIONS.join(', ')}.`
    )
  }

  return args
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

  const { chromium } = require('@playwright/test')
  const browser = await chromium.launch(
    getChromiumLaunchOptions({ browserMode: args.browserMode })
  )

  try {
    const probe = await probeWebGL({ browser })
    const payload = {
      browserMode: args.browserMode,
      expected: args.expectWebGL,
      ...probe,
    }

    if (args.expectWebGL === EXPECT_AVAILABLE) {
      await assertWebGLAvailable({
        browser,
        browserMode: args.browserMode,
      })
      console.log(JSON.stringify(payload, null, 2))
      return
    }

    if (probe.ok) {
      throw new Error(
        `Expected WebGL to be unavailable in browser mode "${args.browserMode}", but it initialized successfully (${probe.renderer || 'unknown renderer'}).`
      )
    }

    console.log(JSON.stringify(payload, null, 2))
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(message)
  process.exit(1)
})
