/**
 * @file For global state handling that cannot be done in layoutClient.tsx
 */

'use client'

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

    // `visible` tracks the current unobscured map viewport (depends on whether
    // the sidebar is open). Camera actions use its center to target what the
    // user actually sees.
    const currentActualSidebarWidth = isSidebarOpen ? sidebarWidth || 0 : 0
    const visibleMapWidth = windowSize.width - currentActualSidebarWidth

    const visibleMapCenterX = visibleMapWidth / 2 + currentActualSidebarWidth
    const visibleMapCenterY = windowSize.height / 2

    // `min` reserves sidebar space even when closed. UI overlays use this
    // "worst-case" map width/center to avoid jumping when the sidebar opens.
    const minMapWidth = windowSize.width - (sidebarWidth || 0)
    const minMapCenterX = minMapWidth / 2 + (sidebarWidth || 0)
    const minMapCenterY = windowSize.height / 2

    setMapDims({
      visible: {
        width: visibleMapWidth,
        height: windowSize.height,
        centerX: visibleMapCenterX,
        centerY: visibleMapCenterY,
      },
      min: {
        width: minMapWidth,
        height: windowSize.height,
        centerX: minMapCenterX,
        centerY: minMapCenterY,
      },
    })
  }, [windowSize, sidebarWidth, isSidebarOpen, setMapDims])

  return <>{children}</>
}

export default UIStateHandler
