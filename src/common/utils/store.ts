import { IndexedDbStorageConfig, IndexedDbStorageOptions } from '../types/store'

export const waitFor = <TState, TValue>(
  store: {
    getState: () => TState
    subscribe: (l: (s: TState, p: TState) => void) => () => void
  },
  pick: (s: TState) => TValue,
  isReady: (v: TValue) => boolean = (v) => Boolean(v),
  timeoutMs?: number
): Promise<TValue> => {
  const now = pick(store.getState())
  if (isReady(now)) return Promise.resolve(now)

  return new Promise<TValue>((resolve, reject) => {
    const unsub = store.subscribe((state, prev) => {
      const prevV = pick(prev)
      const v = pick(state)
      if (!isReady(prevV) && isReady(v)) {
        unsub()
        resolve(v)
      }
    })

    if (timeoutMs) {
      const t = setTimeout(() => {
        unsub()
        reject(new Error('waitFor timed out'))
      }, timeoutMs)
      // If it resolves earlier, clear timeout:
      const origResolve = resolve
      resolve = (val) => {
        clearTimeout(t)
        origResolve(val)
      }
    }
  })
}

const dbPromiseCache = new Map<string, Promise<IDBDatabase>>()

const isBrowser = typeof window !== 'undefined'

const getSessionStorageValue = (key: string): string | null => {
  if (!isBrowser) {
    return null
  }
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

const setSessionStorageValue = (key: string, value: string) => {
  if (!isBrowser) {
    return
  }
  try {
    window.sessionStorage.setItem(key, value)
  } catch {}
}

const removeSessionStorageValue = (key: string) => {
  if (!isBrowser) {
    return
  }
  try {
    window.sessionStorage.removeItem(key)
  } catch {}
}

const openIndexedDb = (config: IndexedDbStorageConfig) => {
  const cacheKey = `${config.dbName}-${config.storeName}-${config.version}`
  if (dbPromiseCache.has(cacheKey)) {
    return dbPromiseCache.get(cacheKey) as Promise<IDBDatabase>
  }

  const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (!isBrowser || !window.indexedDB) {
      reject(new Error('IndexedDB not available'))
      return
    }

    const request = window.indexedDB.open(config.dbName, config.version)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(config.storeName)) {
        db.createObjectStore(config.storeName)
      }
    }

    request.onerror = () =>
      reject(request.error ?? new Error('Failed to open IndexedDB'))
    request.onsuccess = () => resolve(request.result)
  })

  dbPromiseCache.set(cacheKey, dbPromise)
  return dbPromise
}

const idbGet = async (key: string, config: IndexedDbStorageConfig) => {
  const db = await openIndexedDb(config)
  return new Promise<string | null>((resolve, reject) => {
    const tx = db.transaction(config.storeName, 'readonly')
    const store = tx.objectStore(config.storeName)
    const request = store.get(key)

    request.onerror = () => reject(request.error ?? new Error('IDB get failed'))
    request.onsuccess = () => resolve(request.result ?? null)
  })
}

const idbSet = async (
  key: string,
  value: string,
  config: IndexedDbStorageConfig
) => {
  const db = await openIndexedDb(config)
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(config.storeName, 'readwrite')
    const store = tx.objectStore(config.storeName)
    const request = store.put(value, key)

    request.onerror = () => reject(request.error ?? new Error('IDB set failed'))
    request.onsuccess = () => resolve()
  })
}

const idbRemove = async (key: string, config: IndexedDbStorageConfig) => {
  const db = await openIndexedDb(config)
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(config.storeName, 'readwrite')
    const store = tx.objectStore(config.storeName)
    const request = store.delete(key)

    request.onerror = () =>
      reject(request.error ?? new Error('IDB delete failed'))
    request.onsuccess = () => resolve()
  })
}

const migrateFromSessionStorage = async (
  key: string,
  config: IndexedDbStorageConfig
) => {
  const sessionValue = getSessionStorageValue(key)
  if (sessionValue == null) {
    return null
  }

  try {
    await idbSet(key, sessionValue, config)
    removeSessionStorageValue(key)
  } catch (error) {
    console.error('store utils: migration to IndexedDB failed', error)
  }

  return sessionValue
}

export const createIndexedDbStorage =
  (options: IndexedDbStorageOptions) => () => {
    const config: IndexedDbStorageConfig = {
      dbName: options.dbName,
      storeName: options.storeName ?? options.dbName,
      version: options.version ?? 1,
    }

    if (!isBrowser) {
      return {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
      }
    }

    return {
      getItem: async (key: string) => {
        try {
          const value = await idbGet(key, config)
          if (value != null) {
            return value
          }
        } catch (error) {
          console.error('store utils: IndexedDB get failed', error)
        }

        return migrateFromSessionStorage(key, config)
      },
      setItem: async (key: string, value: string) => {
        try {
          await idbSet(key, value, config)
          removeSessionStorageValue(key)
        } catch (error) {
          console.error('store utils: IndexedDB set failed', error)
          setSessionStorageValue(key, value)
        }
      },
      removeItem: async (key: string) => {
        try {
          await idbRemove(key, config)
        } catch (error) {
          console.error('store utils: IndexedDB delete failed', error)
        }
        removeSessionStorageValue(key)
      },
    }
  }
