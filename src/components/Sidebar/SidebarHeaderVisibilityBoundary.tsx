'use client'

import React, { useEffect } from 'react'

import { useUIStore } from '#/common/store'

const SidebarHeaderVisibilityBoundary = ({
  hidden,
  children,
}: {
  hidden: boolean
  children: React.ReactNode
}) => {
  const setIsSidebarHeaderHidden = useUIStore(
    (state) => state.setIsSidebarHeaderHidden
  )

  useEffect(() => {
    setIsSidebarHeaderHidden(hidden)

    return () => {
      setIsSidebarHeaderHidden(false)
    }
  }, [hidden, setIsSidebarHeaderHidden])

  return <>{children}</>
}

export default SidebarHeaderVisibilityBoundary
