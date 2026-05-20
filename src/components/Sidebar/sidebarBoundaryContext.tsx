'use client'

import React, { createContext, useContext, useMemo } from 'react'

import type { SidebarBoundaryId } from '#/common/types/sidebar'

export type SidebarBoundaryContextValue = {
  boundaryId: SidebarBoundaryId
  depth: number
}

const SidebarBoundaryContext =
  createContext<SidebarBoundaryContextValue | null>(null)

export const SidebarBoundaryProvider = ({
  value,
  children,
}: {
  value: SidebarBoundaryContextValue
  children: React.ReactNode
}) => {
  const memoizedValue = useMemo(
    () => value,
    [value.boundaryId, value.depth]
  )

  return (
    <SidebarBoundaryContext.Provider value={memoizedValue}>
      {children}
    </SidebarBoundaryContext.Provider>
  )
}

export const useNullableSidebarBoundaryContext = () =>
  useContext(SidebarBoundaryContext)

export const useSidebarBoundaryContext = () => {
  const context = useNullableSidebarBoundaryContext()

  if (context == null) {
    throw new Error(
      'useSidebarBoundaryContext must be used inside <SidebarBoundary>'
    )
  }

  return context
}
