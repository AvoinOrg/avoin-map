const fs = require('fs')
const path = require('path')
const { LIVE_BROWSER_PATHS, ensureDir, writeJsonFile, fileExists, readJsonFile } = require('./liveSharedBrowser')

const DEFAULT_LOCK_TTL_MS = 10 * 60 * 1000
const ALLOWED_MODES = new Set(['host-cdp', 'container-headed'])

const resolveLockPath = ({ lockPath } = {}) =>
  path.resolve(process.cwd(), lockPath || LIVE_BROWSER_PATHS.controlLockFile)

const normalizeNowMs = (nowMs) => (Number.isFinite(nowMs) ? Number(nowMs) : Date.now())

const validateLockPayload = ({ value, source = 'lock payload' }) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${source} must be an object`)
  }

  if (typeof value.owner !== 'string' || !value.owner.trim()) {
    throw new Error(`${source} has invalid owner`)
  }

  if (typeof value.mode !== 'string' || !value.mode.trim()) {
    throw new Error(`${source} has invalid mode`)
  }

  if (!ALLOWED_MODES.has(value.mode)) {
    throw new Error(`${source} mode must be one of: ${Array.from(ALLOWED_MODES).join(', ')}`)
  }

  if (typeof value.takenAt !== 'string' || !value.takenAt.trim()) {
    throw new Error(`${source} has invalid takenAt`)
  }

  if (typeof value.expiresAt !== 'string' || !value.expiresAt.trim()) {
    throw new Error(`${source} has invalid expiresAt`)
  }

  return {
    version: Number(value.version) || 1,
    owner: value.owner,
    mode: value.mode,
    cdpUrl: typeof value.cdpUrl === 'string' ? value.cdpUrl : null,
    origin: typeof value.origin === 'string' ? value.origin : null,
    pageUrl: typeof value.pageUrl === 'string' ? value.pageUrl : null,
    takenAt: value.takenAt,
    expiresAt: value.expiresAt,
    note: typeof value.note === 'string' ? value.note : undefined,
  }
}

const isLockExpired = ({ lock, nowMs } = {}) => {
  if (!lock || !lock.expiresAt) return true
  const expiresMs = new Date(lock.expiresAt).getTime()
  if (!Number.isFinite(expiresMs)) return true
  return expiresMs <= normalizeNowMs(nowMs)
}

const readLock = ({ lockPath } = {}) => {
  const resolvedLockPath = resolveLockPath({ lockPath })
  if (!fileExists(resolvedLockPath)) {
    return null
  }

  try {
    const parsed = readJsonFile({ filePath: resolvedLockPath })
    return validateLockPayload({ value: parsed, source: resolvedLockPath })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to read lock file ${resolvedLockPath}: ${message}`)
  }
}

const getLockStatus = ({ lockPath, nowMs } = {}) => {
  const resolvedLockPath = resolveLockPath({ lockPath })
  let lock = null
  try {
    lock = readLock({ lockPath: resolvedLockPath })
  } catch (error) {
    return {
      locked: false,
      expired: false,
      owner: null,
      mode: null,
      lockPath: resolvedLockPath,
      lock: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  if (!lock) {
    return {
      locked: false,
      expired: false,
      owner: null,
      mode: null,
      lockPath: resolvedLockPath,
      lock: null,
    }
  }

  const expired = isLockExpired({ lock, nowMs })
  return {
    locked: !expired,
    expired,
    owner: lock.owner,
    mode: lock.mode,
    lockPath: resolvedLockPath,
    lock,
  }
}

const assertLockOwner = ({ expectedOwner, lockPath, nowMs, allowUnlocked = true } = {}) => {
  if (!expectedOwner) {
    return getLockStatus({ lockPath, nowMs })
  }

  const status = getLockStatus({ lockPath, nowMs })
  if (status.error) {
    throw new Error(status.error)
  }

  if (!status.locked) {
    if (allowUnlocked) {
      return status
    }
    throw new Error(`No active live-control lock found at ${status.lockPath}`)
  }

  if (status.owner !== expectedOwner) {
    throw new Error(
      `Live-control lock is owned by "${status.owner}" (expected "${expectedOwner}"). Release the lock or use the matching owner.`
    )
  }

  return status
}

const takeControlLock = ({
  owner,
  mode = 'host-cdp',
  cdpUrl = null,
  origin = null,
  pageUrl = null,
  note,
  ttlMs = DEFAULT_LOCK_TTL_MS,
  force = false,
  lockPath,
  nowMs,
} = {}) => {
  const resolvedLockPath = resolveLockPath({ lockPath })
  const normalizedOwner = String(owner || '').trim()
  if (!normalizedOwner) {
    throw new Error('Lock owner is required')
  }

  const normalizedMode = String(mode || '').trim()
  if (!ALLOWED_MODES.has(normalizedMode)) {
    throw new Error(`Lock mode must be one of: ${Array.from(ALLOWED_MODES).join(', ')}`)
  }

  const ttl = Number(ttlMs)
  if (!Number.isFinite(ttl) || ttl <= 0) {
    throw new Error(`Invalid ttlMs: ${ttlMs}`)
  }

  const existingStatus = getLockStatus({ lockPath: resolvedLockPath, nowMs })
  if (existingStatus.error) {
    throw new Error(existingStatus.error)
  }

  if (
    existingStatus.locked &&
    existingStatus.owner &&
    existingStatus.owner !== normalizedOwner &&
    !force
  ) {
    throw new Error(
      `Live-control lock is already held by "${existingStatus.owner}" until ${existingStatus.lock.expiresAt}`
    )
  }

  const takenMs = normalizeNowMs(nowMs)
  const lock = {
    version: 1,
    owner: normalizedOwner,
    mode: normalizedMode,
    cdpUrl: cdpUrl || null,
    origin: origin || null,
    pageUrl: pageUrl || null,
    takenAt: new Date(takenMs).toISOString(),
    expiresAt: new Date(takenMs + ttl).toISOString(),
  }
  if (typeof note === 'string' && note.trim()) {
    lock.note = note.trim()
  }

  ensureDir(path.dirname(resolvedLockPath))
  writeJsonFile({ filePath: resolvedLockPath, value: lock })

  return {
    ...getLockStatus({ lockPath: resolvedLockPath, nowMs: takenMs }),
    forced: !!force,
    replacedOwner:
      existingStatus.locked && existingStatus.owner !== normalizedOwner ? existingStatus.owner : null,
  }
}

const releaseControlLock = ({ owner = null, force = false, lockPath, nowMs } = {}) => {
  const resolvedLockPath = resolveLockPath({ lockPath })
  const status = getLockStatus({ lockPath: resolvedLockPath, nowMs })
  if (status.error) {
    throw new Error(status.error)
  }

  if (!status.lock && !fileExists(resolvedLockPath)) {
    return {
      ...status,
      released: false,
      previous: null,
    }
  }

  if (status.locked) {
    const normalizedOwner = owner ? String(owner).trim() : ''
    if (!force && normalizedOwner && status.owner !== normalizedOwner) {
      throw new Error(
        `Live-control lock is owned by "${status.owner}", not "${normalizedOwner}". Use --force to override.`
      )
    }
    if (!force && !normalizedOwner) {
      throw new Error('Release requires --owner when an active lock exists (or use --force).')
    }
  }

  const previous = status.lock || null
  try {
    fs.unlinkSync(resolvedLockPath)
  } catch (error) {
    if (!(error && error.code === 'ENOENT')) {
      throw error
    }
  }

  return {
    ...getLockStatus({ lockPath: resolvedLockPath, nowMs }),
    released: true,
    previous,
    forced: !!force,
  }
}

module.exports = {
  ALLOWED_MODES,
  DEFAULT_LOCK_TTL_MS,
  assertLockOwner,
  getLockStatus,
  isLockExpired,
  readLock,
  releaseControlLock,
  resolveLockPath,
  takeControlLock,
  validateLockPayload,
}
