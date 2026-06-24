import { FileType } from './types'

const DB_NAME = 'hiilikartta-import-files'
const STORE_NAME = 'creation-import-files'
const DB_VERSION = 1

type CreationImportFileRecord = {
  buffer: ArrayBuffer
  fileName: string
  fileType?: FileType
  size: number
}

const dbPromiseCache = new Map<string, Promise<IDBDatabase>>()

const openCreationImportDb = () => {
  const cacheKey = `${DB_NAME}-${STORE_NAME}-${DB_VERSION}`

  if (dbPromiseCache.has(cacheKey)) {
    return dbPromiseCache.get(cacheKey) as Promise<IDBDatabase>
  }

  const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onerror = () =>
      reject(request.error ?? new Error('Failed to open IndexedDB'))
    request.onsuccess = () => resolve(request.result)
  })

  dbPromiseCache.set(cacheKey, dbPromise)
  return dbPromise
}

const getCreationImportFileStore = async (mode: IDBTransactionMode) => {
  const db = await openCreationImportDb()
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME)
}

export const getCreationImportFileStorageKey = (placeholderId: string) =>
  `creation-import-file:${placeholderId}`

export const putCreationImportFile = async ({
  storageKey,
  file,
  fileType,
}: {
  storageKey: string
  file: File
  fileType?: FileType
}) => {
  const buffer = await file.arrayBuffer()
  const store = await getCreationImportFileStore('readwrite')
  const record: CreationImportFileRecord = {
    buffer,
    fileName: file.name,
    fileType,
    size: file.size,
  }

  await new Promise<void>((resolve, reject) => {
    const request = store.put(record, storageKey)

    request.onerror = () =>
      reject(request.error ?? new Error('IDB set failed'))
    request.onsuccess = () => resolve()
  })

  return record
}

export const getCreationImportFile = async (storageKey: string) => {
  const store = await getCreationImportFileStore('readonly')

  return new Promise<CreationImportFileRecord | null>((resolve, reject) => {
    const request = store.get(storageKey)

    request.onerror = () =>
      reject(request.error ?? new Error('IDB get failed'))
    request.onsuccess = () => resolve(request.result ?? null)
  })
}

export const deleteCreationImportFile = async (storageKey: string) => {
  const store = await getCreationImportFileStore('readwrite')

  await new Promise<void>((resolve, reject) => {
    const request = store.delete(storageKey)

    request.onerror = () =>
      reject(request.error ?? new Error('IDB delete failed'))
    request.onsuccess = () => resolve()
  })
}
