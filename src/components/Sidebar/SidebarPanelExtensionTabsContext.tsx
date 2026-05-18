'use client'

import { useCallback, useMemo } from 'react'

import { useUIStore } from '#/common/store/uiStore'
import type { SidebarPanelExtensionTabMetadata } from '#/common/types/sidebar'

import { useNullableSidebarPanelExtensionContext } from './sidebarPanelExtensionContext'

export type { SidebarPanelExtensionTabMetadata } from '#/common/types/sidebar'

export type SidebarPanelExtensionTabsContextValue = {
  tabs: SidebarPanelExtensionTabMetadata[]
  activeTabId?: string
  resolvedActiveTabId?: string
  setActiveTabId: (tabId: string) => void
  registerTab: (tab: SidebarPanelExtensionTabMetadata) => void
  unregisterTab: (tabId: string) => void
}

const EMPTY_TABS: SidebarPanelExtensionTabMetadata[] = []

export const useNullableSidebarPanelExtensionTabsContext =
  (): SidebarPanelExtensionTabsContextValue | null => {
    const extensionContext = useNullableSidebarPanelExtensionContext()
    const extensionId = extensionContext?.extensionId
    const tabs = useUIStore((state) =>
      extensionId == null
        ? EMPTY_TABS
        : (state.sidebarPanelExtensions[extensionId]?.tabs ?? EMPTY_TABS)
    )
    const activeTabId = useUIStore((state) =>
      extensionId == null
        ? undefined
        : state.sidebarPanelExtensions[extensionId]?.activeTabId
    )
    const registerSidebarPanelExtensionTab = useUIStore(
      (state) => state.registerSidebarPanelExtensionTab
    )
    const unregisterSidebarPanelExtensionTab = useUIStore(
      (state) => state.unregisterSidebarPanelExtensionTab
    )
    const setSidebarPanelExtensionActiveTab = useUIStore(
      (state) => state.setSidebarPanelExtensionActiveTab
    )
    const resolvedActiveTabId =
      tabs.find((tab) => tab.tabId === activeTabId)?.tabId ?? tabs[0]?.tabId
    const registerTab = useCallback(
      (tab: SidebarPanelExtensionTabMetadata) => {
        if (extensionId == null) {
          return
        }

        registerSidebarPanelExtensionTab(extensionId, tab)
      },
      [extensionId, registerSidebarPanelExtensionTab]
    )
    const unregisterTab = useCallback(
      (tabId: string) => {
        if (extensionId == null) {
          return
        }

        unregisterSidebarPanelExtensionTab(extensionId, tabId)
      },
      [extensionId, unregisterSidebarPanelExtensionTab]
    )
    const setActiveTabId = useCallback(
      (tabId: string) => {
        if (extensionId == null) {
          return
        }

        setSidebarPanelExtensionActiveTab(extensionId, tabId)
      },
      [extensionId, setSidebarPanelExtensionActiveTab]
    )

    return useMemo(() => {
      if (extensionId == null) {
        return null
      }

      return {
        tabs,
        activeTabId,
        resolvedActiveTabId,
        setActiveTabId,
        registerTab,
        unregisterTab,
      }
    }, [
      activeTabId,
      extensionId,
      registerTab,
      resolvedActiveTabId,
      setActiveTabId,
      tabs,
      unregisterTab,
    ])
  }

export const useSidebarPanelExtensionTabsContext = () => {
  const context = useNullableSidebarPanelExtensionTabsContext()

  if (context == null) {
    throw new Error(
      'SidebarPanelExtension tab helpers must be rendered inside <SidebarPanelExtensionProvider>'
    )
  }

  return context
}
