/**
 * @file For global state handling that cannot be done in layoutClient.tsx
 */

import React, { useEffect } from 'react'
import { useUIStore } from '#/common/store/uiStore'

const UIStateHandler = ({ children }: { children?: React.ReactNode }) => {
  const sidebarWidth = useUIStore((state) => state.sidebarWidth)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const setMapDims = useUIStore((state) => state.setMapDims)
  const windowSize = useUIStore((state) => state.windowSize)
  const setWindowSize = useUIStore((state) => state.setWindowSize)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Window resize can fire rapidly while layout is still settling. Debounce
    // the burst and commit the measurement in rAF so map centering calculations
    // read a stable viewport size.
    const DEBOUNCE_MS = 100
    let timeoutId: number | undefined
    let rafId: number | undefined

    const apply = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    const handleResize = () => {
      if (timeoutId) window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        if (rafId) window.cancelAnimationFrame(rafId)
        rafId = window.requestAnimationFrame(apply)
      }, DEBOUNCE_MS)
    }

    // initial size
    apply()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (timeoutId) window.clearTimeout(timeoutId)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [setWindowSize])

  useEffect(() => {
    if (windowSize == null) return
    if (windowSize.width === 0 || windowSize.height === 0) return
    if (sidebarWidth == null) return

    const isFullscreenSidebar = sidebarWidth >= windowSize.width - 1
    const visibleSidebarWidth =
      isSidebarOpen && !isFullscreenSidebar ? sidebarWidth : 0
    const minSidebarWidth = isFullscreenSidebar ? 0 : sidebarWidth
    const visibleMapWidth = Math.max(0, windowSize.width - visibleSidebarWidth)
    const minMapWidth = Math.max(0, windowSize.width - minSidebarWidth)

    setMapDims({
      visible: {
        width: visibleMapWidth,
        height: windowSize.height,
        centerX: visibleMapWidth / 2 + visibleSidebarWidth,
        centerY: windowSize.height / 2,
      },
      min: {
        width: minMapWidth,
        height: windowSize.height,
        centerX: minMapWidth / 2 + minSidebarWidth,
        centerY: windowSize.height / 2,
      },
    })
  }, [windowSize, sidebarWidth, isSidebarOpen, setMapDims])

  return <>{children}</>
}

export default UIStateHandler
