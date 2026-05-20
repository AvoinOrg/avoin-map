'use client'

import React, { createContext, useContext, useMemo } from 'react'

import type { SidebarPanelExtensionId } from '#/common/types/sidebar'

export type SidebarPanelExtensionContextValue = {
  extensionId: SidebarPanelExtensionId
  depth: number
}

const SidebarPanelExtensionContext =
  createContext<SidebarPanelExtensionContextValue | null>(null)

export const SidebarPanelExtensionContextProvider = ({
  value,
  children,
}: {
  value: SidebarPanelExtensionContextValue
  children: React.ReactNode
}) => {
  const memoizedValue = useMemo(
    () => value,
    [value.depth, value.extensionId]
  )

  return (
    <SidebarPanelExtensionContext.Provider value={memoizedValue}>
      {children}
    </SidebarPanelExtensionContext.Provider>
  )
}

export const useNullableSidebarPanelExtensionContext = () =>
  useContext(SidebarPanelExtensionContext)

export const useSidebarPanelExtensionContext = () => {
  const context = useNullableSidebarPanelExtensionContext()

  if (context == null) {
    throw new Error(
      'useSidebarPanelExtensionContext must be used inside <SidebarPanelExtensionProvider>'
    )
  }

  return context
}
