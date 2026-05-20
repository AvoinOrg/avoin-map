const { spawnSync } = require('child_process')

const BROWSER_MODE_AUTO = 'auto'
const BROWSER_MODE_HEADLESS = 'headless'
const BROWSER_MODE_XVFB_WEBGL = 'xvfb-webgl'

const SUPPORTED_BROWSER_MODES = [
  BROWSER_MODE_AUTO,
  BROWSER_MODE_HEADLESS,
  BROWSER_MODE_XVFB_WEBGL,
]

const XVFB_BOOTSTRAP_ENV_KEY = 'AVOIN_MAP_VISUAL_XVFB_ACTIVE'
const DEFAULT_XVFB_SERVER_ARGS = '-screen 0 1440x900x24 -ac -nolisten tcp +extension RANDR'

const BASE_CHROMIUM_ARGS = ['--no-sandbox', '--disable-dev-shm-usage']

const WEBGL_CHROMIUM_ARGS = [
  ...BASE_CHROMIUM_ARGS,
  '--enable-webgl',
  '--ignore-gpu-blocklist',
  '--enable-unsafe-swiftshader',
  '--use-gl=angle',
  '--use-angle=swiftshader',
]

const normalizeBrowserMode = (browserMode = BROWSER_MODE_AUTO) => {
  const normalized = String(browserMode || BROWSER_MODE_AUTO)
    .trim()
    .toLowerCase()

  if (!SUPPORTED_BROWSER_MODES.includes(normalized)) {
    throw new Error(
      `Unsupported browser mode: ${browserMode}. Expected one of ${SUPPORTED_BROWSER_MODES.join(', ')}.`
    )
  }

  return normalized
}

const scenarioRequiresWebGL = (scenario) => !!scenario?.requiresWebGL

const resolveBrowserMode = ({
  browserMode = BROWSER_MODE_AUTO,
  scenarios = [],
} = {}) => {
  const normalized = normalizeBrowserMode(browserMode)
  if (normalized !== BROWSER_MODE_AUTO) {
    return normalized
  }

  return scenarios.some(scenarioRequiresWebGL)
    ? BROWSER_MODE_XVFB_WEBGL
    : BROWSER_MODE_HEADLESS
}

const browserModeNeedsVirtualDisplay = (browserMode) =>
  normalizeBrowserMode(browserMode) === BROWSER_MODE_XVFB_WEBGL

const ensureXvfbRunAvailable = () => {
  const result = spawnSync('xvfb-run', ['--help'], {
    stdio: 'ignore',
  })

  if (result.error || result.status !== 0) {
    throw new Error(
      'Browser mode "xvfb-webgl" requires `xvfb-run`, but it is not available in this container. Install `xvfb` and `xauth`, then rebuild the image.'
    )
  }
}

const maybeReexecInsideXvfb = ({
  browserMode,
  scriptPath = process.argv[1],
  scriptArgs = process.argv.slice(2),
  env = process.env,
  cwd = process.cwd(),
} = {}) => {
  const effectiveMode = normalizeBrowserMode(browserMode)
  if (!browserModeNeedsVirtualDisplay(effectiveMode)) {
    return { reexecuted: false, exitCode: null }
  }

  if (env[XVFB_BOOTSTRAP_ENV_KEY] === '1') {
    return { reexecuted: false, exitCode: null }
  }

  ensureXvfbRunAvailable()

  const result = spawnSync(
    'xvfb-run',
    [
      '-a',
      `--server-args=${DEFAULT_XVFB_SERVER_ARGS}`,
      process.execPath,
      scriptPath,
      ...scriptArgs,
    ],
    {
      cwd,
      env: {
        ...env,
        [XVFB_BOOTSTRAP_ENV_KEY]: '1',
      },
      stdio: 'inherit',
    }
  )

  if (result.error) {
    throw result.error
  }

  return {
    reexecuted: true,
    exitCode: typeof result.status === 'number' ? result.status : 1,
  }
}

const getChromiumLaunchOptions = ({ browserMode }) => {
  const effectiveMode = normalizeBrowserMode(browserMode)

  if (effectiveMode === BROWSER_MODE_HEADLESS) {
    return {
      headless: true,
      args: [...BASE_CHROMIUM_ARGS],
    }
  }

  if (effectiveMode === BROWSER_MODE_XVFB_WEBGL) {
    return {
      headless: false,
      args: [...WEBGL_CHROMIUM_ARGS],
    }
  }

  throw new Error(
    `Cannot build Chromium launch options for unresolved browser mode "${browserMode}".`
  )
}

const getLiveBrowserCommand = ({
  browserBin,
  browserArgs = [],
  browserMode = BROWSER_MODE_XVFB_WEBGL,
} = {}) => {
  if (!browserBin) {
    throw new Error('browserBin is required')
  }

  const effectiveMode = normalizeBrowserMode(browserMode)
  const launchArgs = [...browserArgs]

  if (!browserModeNeedsVirtualDisplay(effectiveMode)) {
    return {
      command: browserBin,
      args: launchArgs,
      wrappedInXvfb: false,
    }
  }

  return {
    command: 'xvfb-run',
    args: ['-a', `--server-args=${DEFAULT_XVFB_SERVER_ARGS}`, browserBin, ...launchArgs],
    wrappedInXvfb: true,
  }
}

const probeWebGL = async ({ browser }) => {
  const page = await browser.newPage()
  try {
    return await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      const context =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

      if (!context) {
        return {
          ok: false,
          details: 'canvas.getContext("webgl") returned null',
        }
      }

      const debugInfo = context.getExtension('WEBGL_debug_renderer_info')
      return {
        ok: true,
        vendor: debugInfo
          ? context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
          : context.getParameter(context.VENDOR),
        renderer: debugInfo
          ? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          : context.getParameter(context.RENDERER),
        version: context.getParameter(context.VERSION),
      }
    })
  } finally {
    await page.close()
  }
}

const assertWebGLAvailable = async ({ browser, browserMode }) => {
  const probe = await probeWebGL({ browser })
  if (probe.ok) {
    return probe
  }

  throw new Error(
    `WebGL preflight failed in browser mode "${browserMode}": ${
      probe.details || 'unknown WebGL initialization error'
    }. MapLibre routes will fall back to the app error boundary until the browser runtime can create a WebGL context.`
  )
}

module.exports = {
  BASE_CHROMIUM_ARGS,
  BROWSER_MODE_AUTO,
  BROWSER_MODE_HEADLESS,
  BROWSER_MODE_XVFB_WEBGL,
  DEFAULT_XVFB_SERVER_ARGS,
  SUPPORTED_BROWSER_MODES,
  WEBGL_CHROMIUM_ARGS,
  assertWebGLAvailable,
  browserModeNeedsVirtualDisplay,
  getChromiumLaunchOptions,
  getLiveBrowserCommand,
  maybeReexecInsideXvfb,
  normalizeBrowserMode,
  probeWebGL,
  resolveBrowserMode,
  scenarioRequiresWebGL,
}
