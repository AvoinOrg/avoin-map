type ShpjsRuntimeGlobal = typeof globalThis & {
  Buffer?: unknown
  global?: typeof globalThis
}

export const ensureShpjsBrowserGlobals = async () => {
  const runtimeGlobal = globalThis as ShpjsRuntimeGlobal

  if (runtimeGlobal.global == null) {
    runtimeGlobal.global = runtimeGlobal
  }

  if (runtimeGlobal.Buffer == null) {
    const { Buffer } = await import('buffer')
    runtimeGlobal.Buffer = Buffer
  }
}
