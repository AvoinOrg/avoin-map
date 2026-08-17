const fs = require('fs')
const os = require('os')
const path = require('path')

const {
  findPreferredContextAndPage,
  getPagePreferenceScore,
  readContainerSessionMetadata,
  validateContainerSessionMetadata,
  validateOriginAndUrl,
} = require('../../../../utils/scripts/visual/liveSharedBrowser')

const makeTmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'live-shared-browser-test-'))

describe('liveSharedBrowser', () => {
  test('getPagePreferenceScore prioritizes pageMatch and root path', () => {
    expect(
      getPagePreferenceScore({
        pageUrl: 'http://localhost:6900/en/carbon',
        origin: 'http://localhost:6900',
        pageMatch: 'carbon',
      })
    ).toBe(110)

    expect(
      getPagePreferenceScore({
        pageUrl: 'http://localhost:6900/',
        origin: 'http://localhost:6900',
        pageMatch: null,
      })
    ).toBe(15)

    expect(
      getPagePreferenceScore({
        pageUrl: 'http://127.0.0.1:6900/en',
        origin: 'http://localhost:6900',
        pageMatch: null,
      })
    ).toBe(-1)
  })

  test('findPreferredContextAndPage returns highest scoring matching page', () => {
    const pageA = { url: () => 'http://localhost:6900/en' }
    const pageB = { url: () => 'http://localhost:6900/en/carbon' }
    const pageC = { url: () => 'https://example.com' }
    const context1 = { pages: () => [pageA, pageC] }
    const context2 = { pages: () => [pageB] }
    const browser = { contexts: () => [context1, context2] }

    const best = findPreferredContextAndPage({
      browser,
      origin: 'http://localhost:6900',
      pageMatch: 'carbon',
    })

    expect(best).toBeTruthy()
    expect(best.page).toBe(pageB)
    expect(best.context).toBe(context2)
    expect(best.pageUrl).toBe('http://localhost:6900/en/carbon')
  })

  test('validateOriginAndUrl rejects mismatched origin', () => {
    expect(() =>
      validateOriginAndUrl({
        origin: 'http://localhost:6900',
        url: 'http://127.0.0.1:6900/en',
      })
    ).toThrow(/must match origin/)
  })

  test('validateContainerSessionMetadata normalizes and validates payload', () => {
    const value = validateContainerSessionMetadata({
      value: {
        version: 1,
        pid: 1234,
        cdpUrl: 'http://127.0.0.1:9223',
        origin: 'http://localhost:6900',
        url: 'http://localhost:6900/en',
        startedAt: '2026-02-26T15:00:00.000Z',
      },
    })

    expect(value.pid).toBe(1234)
    expect(value.cdpUrl).toBe('http://127.0.0.1:9223')
    expect(value.origin).toBe('http://localhost:6900')
  })

  test('readContainerSessionMetadata reads and validates json file', () => {
    const tmpDir = makeTmpDir()
    const filePath = path.join(tmpDir, 'container-session.json')
    fs.writeFileSync(
      filePath,
      `${JSON.stringify({
        version: 1,
        pid: 2345,
        cdpUrl: 'http://127.0.0.1:9223',
        origin: 'http://localhost:6900',
        url: 'http://localhost:6900/en',
        startedAt: '2026-02-26T15:10:00.000Z',
      })}\n`,
      'utf8'
    )

    try {
      const value = readContainerSessionMetadata({ filePath })
      expect(value.pid).toBe(2345)
      expect(value.url).toBe('http://localhost:6900/en')
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
