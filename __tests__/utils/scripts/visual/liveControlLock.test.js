const fs = require('fs')
const os = require('os')
const path = require('path')

const {
  DEFAULT_LOCK_TTL_MS,
  getLockStatus,
  releaseControlLock,
  takeControlLock,
} = require('../../../../utils/scripts/visual/liveControlLock')

const makeTmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'live-lock-test-'))

describe('liveControlLock', () => {
  let tmpDir
  let lockPath

  beforeEach(() => {
    tmpDir = makeTmpDir()
    lockPath = path.join(tmpDir, 'control-lock.json')
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  test('take creates an active lock with default ttl', () => {
    const nowMs = Date.parse('2026-02-26T15:00:00.000Z')
    const result = takeControlLock({
      owner: 'codex',
      mode: 'host-cdp',
      cdpUrl: 'http://host.docker.internal:9222',
      origin: 'http://localhost:6900',
      pageUrl: 'http://localhost:6900/en',
      lockPath,
      nowMs,
    })

    expect(result.locked).toBe(true)
    expect(result.owner).toBe('codex')
    expect(result.mode).toBe('host-cdp')
    expect(result.lock.expiresAt).toBe(new Date(nowMs + DEFAULT_LOCK_TTL_MS).toISOString())

    const status = getLockStatus({ lockPath, nowMs: nowMs + 1 })
    expect(status.locked).toBe(true)
    expect(status.expired).toBe(false)
    expect(status.owner).toBe('codex')
  })

  test('take rejects a different owner while active', () => {
    const nowMs = Date.parse('2026-02-26T15:00:00.000Z')
    takeControlLock({ owner: 'human', mode: 'host-cdp', lockPath, nowMs })

    expect(() =>
      takeControlLock({ owner: 'codex', mode: 'host-cdp', lockPath, nowMs: nowMs + 1000 })
    ).toThrow(/already held by "human"/)
  })

  test('expired lock can be replaced without force', () => {
    const nowMs = Date.parse('2026-02-26T15:00:00.000Z')
    takeControlLock({
      owner: 'human',
      mode: 'host-cdp',
      lockPath,
      nowMs,
      ttlMs: 1000,
    })

    const result = takeControlLock({
      owner: 'codex',
      mode: 'container-headed',
      lockPath,
      nowMs: nowMs + 1001,
    })

    expect(result.locked).toBe(true)
    expect(result.owner).toBe('codex')
    expect(result.mode).toBe('container-headed')
  })

  test('release enforces owner unless forced', () => {
    const nowMs = Date.parse('2026-02-26T15:00:00.000Z')
    takeControlLock({ owner: 'human', mode: 'host-cdp', lockPath, nowMs })

    expect(() => releaseControlLock({ owner: 'codex', lockPath, nowMs: nowMs + 500 })).toThrow(
      /owned by "human"/
    )

    const released = releaseControlLock({ owner: 'human', lockPath, nowMs: nowMs + 500 })
    expect(released.released).toBe(true)
    expect(released.locked).toBe(false)
    expect(released.owner).toBe(null)
  })
})
