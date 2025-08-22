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
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setWindowSize])

  useEffect(() => {
    const currentActualSidebarWidth = isSidebarOpen ? sidebarWidth || 0 : 0
    const visibleMapWidth = windowSize.width - currentActualSidebarWidth

    const visibleMapCenterX = visibleMapWidth / 2 + currentActualSidebarWidth
    const visibleMapCenterY = windowSize.height / 2

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
