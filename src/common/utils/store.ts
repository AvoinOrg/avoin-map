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
