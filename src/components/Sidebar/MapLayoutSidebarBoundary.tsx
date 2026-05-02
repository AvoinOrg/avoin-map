'use client'

import React, { useEffect } from 'react'

import { useUIStore } from '#/common/store/uiStore'

const MapLayoutSidebarBoundary = ({
  disabled = true,
  children,
}: {
  disabled?: boolean
  children: React.ReactNode
}) => {
  const setIsMapLayoutSidebarDisabled = useUIStore(
    (state) => state.setIsMapLayoutSidebarDisabled
  )

  useEffect(() => {
    setIsMapLayoutSidebarDisabled(disabled)

    return () => {
      setIsMapLayoutSidebarDisabled(false)
    }
  }, [disabled, setIsMapLayoutSidebarDisabled])

  return <>{children}</>
}

export default MapLayoutSidebarBoundary
