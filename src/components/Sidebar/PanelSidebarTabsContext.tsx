'use client'

import React, { createContext, useContext } from 'react'
import type { SxProps, Theme } from '@mui/material'

export type PanelSidebarTabMetadata = {
  tabId: string
  tabName: React.ReactNode
  tabAriaLabel?: string
  tabIcon?: React.ReactNode
  tabButtonSx?: SxProps<Theme>
  tabIconSx?: SxProps<Theme>
  tabButtonId: string
  tabPanelId: string
}

export type PanelSidebarTabsContextValue = {
  tabs: PanelSidebarTabMetadata[]
  activeTabId?: string
  resolvedActiveTabId?: string
  setActiveTabId: (tabId: string) => void
  registerTab: (tab: PanelSidebarTabMetadata) => void
  unregisterTab: (tabId: string) => void
}

export const PanelSidebarTabsContext =
  createContext<PanelSidebarTabsContextValue | null>(null)

export const useNullablePanelSidebarTabsContext = () =>
  useContext(PanelSidebarTabsContext)

export const usePanelSidebarTabsContext = () => {
  const context = useNullablePanelSidebarTabsContext()

  if (context == null) {
    throw new Error(
      'PanelSidebar tab helpers must be rendered inside <PanelSidebar>'
    )
  }

  return context
}
