const {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  buildAbsoluteUrl,
  buildSmokeUrl,
  getBrowserNavigationBaseUrl,
  parseArgs,
} = require('../../utils/scripts/visual/carbon-mock-smoke')
const fs = require('fs')
const path = require('path')

const SMOKE_SCRIPT_PATH = path.resolve(
  __dirname,
  '../../utils/scripts/visual/carbon-mock-smoke.js'
)

describe('carbon mock smoke helpers', () => {
  test('parses defaults for the no-start browser smoke', () => {
    expect(parseArgs([])).toEqual({
      baseUrl: DEFAULT_BASE_URL,
      browserMode: 'xvfb-webgl',
      timeoutMs: DEFAULT_TIMEOUT_MS,
      noStart: false,
      help: false,
    })
  })

  test('parses explicit smoke arguments', () => {
    expect(
      parseArgs([
        '--base-url',
        'http://localhost:3000/',
        '--browser-mode=headless',
        '--timeout=120000',
        '--no-start',
      ])
    ).toEqual({
      baseUrl: 'http://localhost:3000',
      browserMode: 'headless',
      timeoutMs: 120000,
      noStart: true,
      help: false,
    })
  })

  test('builds canonical mock carbon route URLs', () => {
    expect(
      buildSmokeUrl({
        baseUrl: 'http://localhost:3000',
        path: '/fi/carbon/plans/mock-local-plan',
        state: 'save-ready',
        queryParams: { mockAuth: 'authenticated' },
      })
    ).toBe(
      'http://localhost:3000/fi/carbon/plans/mock-local-plan?mockReset=1&mockCarbonState=save-ready&mockAuth=authenticated'
    )
  })

  test('remaps numeric loopback to localhost for browser navigation', () => {
    expect(getBrowserNavigationBaseUrl('http://127.0.0.1:3000')).toBe(
      'http://localhost:3000'
    )
    expect(getBrowserNavigationBaseUrl('http://localhost:3000/')).toBe(
      'http://localhost:3000'
    )
  })

  test('builds absolute URLs without altering canonical paths', () => {
    expect(
      buildAbsoluteUrl({
        baseUrl: 'http://localhost:3000/',
        path: '/fi/carbon/report?planIds=mock-plan-local',
      })
    ).toBe('http://localhost:3000/fi/carbon/report?planIds=mock-plan-local')
  })

  test('does not contain dev-server startup or reset behavior', () => {
    const source = fs.readFileSync(SMOKE_SCRIPT_PATH, 'utf8')

    expect(source).not.toContain('yarn dev')
    expect(source).not.toContain('start:dev')
    expect(source).not.toContain('process.kill')
    expect(source).not.toContain('spawn(')
    expect(source).not.toContain('HIILIKARTTA_API_URL')
    expect(source).not.toContain('TOLGEE_API_KEY')
  })

  test('performs server preflight before Xvfb browser re-exec', () => {
    const source = fs.readFileSync(SMOKE_SCRIPT_PATH, 'utf8')
    const runSmokeSource = source.slice(
      source.indexOf('const runSmoke = async'),
      source.indexOf('const main = async')
    )

    expect(runSmokeSource.indexOf("name: 'server preflight'")).toBeGreaterThan(
      -1
    )
    expect(
      runSmokeSource.indexOf('maybeReexecInsideXvfb')
    ).toBeGreaterThan(runSmokeSource.indexOf("name: 'server preflight'"))
  })
})
