import { useLayoutEffect, useRef, useState } from 'react'

type ResizeObserverCallback = (entry: ResizeObserverEntry) => void

export const useResizeObserver = (
  ref: React.RefObject<HTMLElement>,
  callback: ResizeObserverCallback
) => {
  // Keep a stable observer; update the callback via ref
  const cbRef = useRef(callback)
  useLayoutEffect(() => {
    cbRef.current = callback
  }, [callback])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) cbRef.current(entry)
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
}

export const useElementSize = (ref: React.RefObject<HTMLElement>) => {
  const [size, setSize] = useState<{
    width: number | undefined
    height: number | undefined
  }>({ width: undefined, height: undefined })

  const handleResize = (entry: ResizeObserverEntry) => {
    // Snap to whole pixels to avoid 0.5px oscillations causing re-renders
    const w = Math.round(entry.contentRect.width)
    const h = Math.round(entry.contentRect.height)

    setSize((prev) => {
      if (prev.width === w && prev.height === h) return prev
      return { width: w, height: h }
    })
  }

  useResizeObserver(ref, handleResize)

  return size
}
