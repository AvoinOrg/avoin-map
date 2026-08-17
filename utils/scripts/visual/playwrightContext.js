const fs = require('fs')
const path = require('path')

const fileExists = (targetPath) => {
  try {
    fs.accessSync(targetPath)
    return true
  } catch {
    return false
  }
}

const resolveStorageStatePath = (storageStatePath) => {
  if (!storageStatePath) {
    return null
  }
  return path.resolve(process.cwd(), storageStatePath)
}

const validateStorageStateFile = ({ storageStatePath }) => {
  const resolvedPath = resolveStorageStatePath(storageStatePath)
  if (!resolvedPath) {
    return null
  }

  if (!fileExists(resolvedPath)) {
    throw new Error(
      `Storage state file not found: ${resolvedPath}. Run \`yarn browser-state:sync:localhost\` first, or omit --storage-state.`
    )
  }

  return resolvedPath
}

const readStorageStateFile = ({ storageStatePath }) => {
  const resolvedPath = validateStorageStateFile({ storageStatePath })
  if (!resolvedPath) {
    return null
  }

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf8')
    const parsed = JSON.parse(raw)
    return { path: resolvedPath, state: parsed }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to read storage state file ${resolvedPath}: ${message}`)
  }
}

const getOriginFromBaseUrl = (baseUrl) => {
  try {
    return new URL(baseUrl).origin
  } catch {
    return null
  }
}

const warnOnStorageStateOriginMismatch = ({ baseUrl, storageStatePath, logger = console.warn }) => {
  if (!storageStatePath) {
    return
  }

  const payload = readStorageStateFile({ storageStatePath })
  if (!payload || !payload.state) {
    return
  }

  const expectedOrigin = getOriginFromBaseUrl(baseUrl)
  if (!expectedOrigin) {
    return
  }

  const origins = Array.isArray(payload.state.origins) ? payload.state.origins : []
  const originValues = origins
    .map((entry) => (entry && typeof entry.origin === 'string' ? entry.origin : null))
    .filter(Boolean)

  if (originValues.length === 0) {
    logger(
      `[visual] Storage state file has no origin entries. Expected origin ${expectedOrigin}.`
    )
    return
  }

  if (!originValues.includes(expectedOrigin)) {
    logger(
      `[visual] Storage state origin mismatch: expected ${expectedOrigin}, file contains ${originValues.join(
        ', '
      )}. State for http://localhost:6900 will not apply to http://127.0.0.1:6900 (and vice versa).`
    )
  }
}

const buildPlaywrightContextOptions = ({ viewport, storageStatePath } = {}) => {
  const options = {
    ignoreHTTPSErrors: true,
  }

  if (viewport) {
    options.viewport = { width: viewport.width, height: viewport.height }
    options.deviceScaleFactor = viewport.deviceScaleFactor || 1
    options.isMobile = !!viewport.isMobile
    options.hasTouch = !!viewport.hasTouch
  }

  if (storageStatePath) {
    options.storageState = storageStatePath
  }

  return options
}

const waitForAppHydration = async ({
  page,
  timeoutMs = 60000,
  minBodyHeight = 100,
  settleMs = 1500,
}) => {
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: timeoutMs })
  await page.waitForFunction(
    (height) => {
      const body = document.body
      if (!body) return false
      return body.getBoundingClientRect().height >= height
    },
    minBodyHeight,
    { timeout: timeoutMs }
  )
  if (settleMs > 0) {
    await page.waitForTimeout(settleMs)
  }
}

module.exports = {
  buildPlaywrightContextOptions,
  readStorageStateFile,
  resolveStorageStatePath,
  validateStorageStateFile,
  warnOnStorageStateOriginMismatch,
  waitForAppHydration,
}
