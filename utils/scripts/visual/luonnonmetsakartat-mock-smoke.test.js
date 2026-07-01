const fs = require('fs')
const path = require('path')
const shp = require('shpjs')

const {
  DEFAULT_BASE_URL,
  DUPLICATE_ID_LAYER_FIXTURE_PATH,
  VALID_LAYER_FIXTURE_PATH,
  assertServerAvailable,
  buildSmokeUrl,
  getBrowserNavigationBaseUrl,
  parseArgs,
} = require('./luonnonmetsakartat-mock-smoke')
const {
  getLuonnonmetsakartatMockSourceLiterals,
} = require('../../visual/luonnonmetsakartatMockScenarios')

const expectedColumns = [
  'id',
  'nimi',
  'kunta',
  'maakunta',
  'kuvaus',
  'pinta_ala',
]

const toArrayBuffer = (buffer) =>
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)

const parseFixture = async (fixturePath) => {
  const parsed = await shp(toArrayBuffer(fs.readFileSync(fixturePath)))

  return Array.isArray(parsed)
    ? parsed.flatMap((collection) => collection.features)
    : parsed.features
}

describe('luonnonmetsakartat mock smoke helpers', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('parses default arguments', () => {
    expect(parseArgs([])).toEqual({
      baseUrl: DEFAULT_BASE_URL,
      browserMode: 'xvfb-webgl',
      timeoutMs: 60000,
      noStart: false,
      help: false,
    })
  })

  it('parses explicit arguments and trims the base URL', () => {
    expect(
      parseArgs([
        '--base-url',
        'http://127.0.0.1:3000///',
        '--timeout=1500',
        '--browser-mode=headless',
        '--no-start',
      ])
    ).toEqual({
      baseUrl: 'http://127.0.0.1:3000',
      browserMode: 'headless',
      timeoutMs: 1500,
      noStart: true,
      help: false,
    })
  })

  it('rejects unknown arguments and invalid timeouts', () => {
    expect(() => parseArgs(['--unknown'])).toThrow('Unknown argument')
    expect(() => parseArgs(['--timeout=0'])).toThrow('Invalid --timeout value')
  })

  it('remaps numeric loopback to localhost for browser navigation', () => {
    expect(getBrowserNavigationBaseUrl('http://127.0.0.1:3000')).toBe(
      'http://localhost:3000'
    )
    expect(getBrowserNavigationBaseUrl('http://localhost:3000/')).toBe(
      'http://localhost:3000'
    )
  })

  it('builds smoke URLs with reset, scenario, and mock auth params', () => {
    const sourceLiterals = getLuonnonmetsakartatMockSourceLiterals()
    const url = new URL(
      buildSmokeUrl({
        baseUrl: 'http://localhost:3000',
        path: '/fi/luonnonmetsakartat/admin',
        state: 'admin-layers',
        queryParams: {
          [sourceLiterals.MOCK_AUTH_QUERY_PARAM]: 'authenticated',
        },
        sourceLiterals,
      })
    )

    expect(url.pathname).toBe('/fi/luonnonmetsakartat/admin')
    expect(url.searchParams.get(sourceLiterals.MOCK_RESET_QUERY_PARAM)).toBe(
      '1'
    )
    expect(
      url.searchParams.get(
        sourceLiterals.MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM
      )
    ).toBe('admin-layers')
    expect(url.searchParams.get(sourceLiterals.MOCK_AUTH_QUERY_PARAM)).toBe(
      'authenticated'
    )
  })

  it('fails clearly when the no-start dev server is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('connection refused'))

    await expect(
      assertServerAvailable({
        baseUrl: 'http://127.0.0.1:39999',
        noStart: true,
      })
    ).rejects.toThrow(
      'Dev server is unreachable at http://127.0.0.1:39999; --no-start was set'
    )
  })
})

describe('luonnonmetsakartat upload fixtures', () => {
  it('parses the valid shapefile fixture with expected columns and unique IDs', async () => {
    expect(path.basename(VALID_LAYER_FIXTURE_PATH)).toBe('valid-layer.zip')

    const features = await parseFixture(VALID_LAYER_FIXTURE_PATH)
    const columns = Object.keys(features[0].properties)
    const ids = features.map((feature) => feature.properties.id)

    expect(features).toHaveLength(2)
    expect(features.every((feature) => feature.geometry.type === 'Polygon')).toBe(
      true
    )
    expectedColumns.forEach((column) => {
      expect(columns).toContain(column)
    })
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('parses the duplicate-ID fixture and exposes duplicate IDs', async () => {
    expect(path.basename(DUPLICATE_ID_LAYER_FIXTURE_PATH)).toBe(
      'duplicate-id-layer.zip'
    )

    const features = await parseFixture(DUPLICATE_ID_LAYER_FIXTURE_PATH)
    const columns = Object.keys(features[0].properties)
    const ids = features.map((feature) => feature.properties.id)

    expect(features).toHaveLength(2)
    expectedColumns.forEach((column) => {
      expect(columns).toContain(column)
    })
    expect(new Set(ids).size).toBeLessThan(ids.length)
    expect(ids).toEqual(['lm-duplicate-1', 'lm-duplicate-1'])
  })
})
