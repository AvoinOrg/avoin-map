import React, { createContext, useContext } from 'react'

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
  return (
    <SidebarBoundaryContext.Provider value={value}>
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
