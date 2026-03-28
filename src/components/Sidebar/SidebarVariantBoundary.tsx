'use client'

import React, { useEffect } from 'react'

import { SidebarVariant, useUIStore } from '#/common/store/uiStore'

const SidebarVariantBoundary = ({
  variant,
  children,
}: {
  variant: SidebarVariant
  children: React.ReactNode
}) => {
  const setSidebarVariant = useUIStore((state) => state.setSidebarVariant)

  useEffect(() => {
    setSidebarVariant(variant)

    return () => {
      setSidebarVariant('default')
    }
  }, [setSidebarVariant, variant])

  return <>{children}</>
}

export default SidebarVariantBoundary
