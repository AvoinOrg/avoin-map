/**
 * @file For global state handling that cannot be done in layoutClient.tsx
 */

'use client'

import React, { useEffect } from 'react'
import { useUIStore } from '#/common/store/UIStore'

const UIStateHandler = ({ children }: { children?: React.ReactNode }) => {
  const sidebarWidth = useUIStore((state) => state.sidebarWidth)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const setVisibleMapSize = useUIStore((state) => state.setVisibleMapSize)
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
    const calculatedVisibleMapWidth =
      windowSize.width - currentActualSidebarWidth

    setVisibleMapSize({
      width: calculatedVisibleMapWidth,
    })
  }, [windowSize, sidebarWidth, isSidebarOpen, setVisibleMapSize])

  return <>{children}</>
}

export default UIStateHandler
