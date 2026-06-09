'use client'

import React, { createContext, useCallback, useContext, useMemo } from 'react'

import type {
  SidebarPanelExtensionId,
  SidebarPanelExtensionTabMetadata,
} from '#/common/types/sidebar'

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

type SidebarPanelExtensionTabsState = {
  tabs: SidebarPanelExtensionTabMetadata[]
  activeTabId?: string
}

type SidebarPanelExtensionTabsRegistry =
  Partial<Record<SidebarPanelExtensionId, SidebarPanelExtensionTabsState>>

type SidebarPanelExtensionTabsRegistryContextValue = {
  registry: SidebarPanelExtensionTabsRegistry
  registerTab: (
    extensionId: SidebarPanelExtensionId,
    tab: SidebarPanelExtensionTabMetadata
  ) => void
  unregisterTab: (
    extensionId: SidebarPanelExtensionId,
    tabId: string
  ) => void
  setActiveTabId: (
    extensionId: SidebarPanelExtensionId,
    tabId: string
  ) => void
}

const EMPTY_TABS: SidebarPanelExtensionTabMetadata[] = []
const EMPTY_EXTENSION_TABS_STATE: SidebarPanelExtensionTabsState = {
  tabs: EMPTY_TABS,
}

const SidebarPanelExtensionTabsRegistryContext =
  createContext<SidebarPanelExtensionTabsRegistryContextValue | null>(null)

const isPrimitiveRenderable = (
  value: React.ReactNode
): value is string | number | boolean | null | undefined =>
  value == null ||
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean'

const areRenderableValuesEqual = (
  previous: React.ReactNode,
  next: React.ReactNode
) => {
  if (isPrimitiveRenderable(previous) || isPrimitiveRenderable(next)) {
    return Object.is(previous, next)
  }

  return true
}

const areTabsEqual = (
  previous: SidebarPanelExtensionTabMetadata,
  next: SidebarPanelExtensionTabMetadata
) =>
  previous.tabId === next.tabId &&
  previous.tabAriaLabel === next.tabAriaLabel &&
  previous.tabButtonId === next.tabButtonId &&
  previous.tabPanelId === next.tabPanelId &&
  areRenderableValuesEqual(previous.tabName, next.tabName) &&
  areRenderableValuesEqual(previous.tabIcon, next.tabIcon)

export const SidebarPanelExtensionTabsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [registry, setRegistry] =
    React.useState<SidebarPanelExtensionTabsRegistry>({})

  const registerTab = useCallback(
    (
      extensionId: SidebarPanelExtensionId,
      tab: SidebarPanelExtensionTabMetadata
    ) => {
      setRegistry((previousRegistry) => {
        const currentState =
          previousRegistry[extensionId] ?? EMPTY_EXTENSION_TABS_STATE
        const existingIndex = currentState.tabs.findIndex(
          (currentTab) => currentTab.tabId === tab.tabId
        )
        let nextTabs = currentState.tabs

        if (existingIndex === -1) {
          nextTabs = [...currentState.tabs, tab]
        } else if (!areTabsEqual(currentState.tabs[existingIndex], tab)) {
          nextTabs = currentState.tabs.map((currentTab, index) =>
            index === existingIndex ? tab : currentTab
          )
        }

        const nextActiveTabId =
          currentState.activeTabId != null &&
          nextTabs.some((currentTab) => currentTab.tabId === currentState.activeTabId)
            ? currentState.activeTabId
            : nextTabs[0]?.tabId

        if (
          nextTabs === currentState.tabs &&
          nextActiveTabId === currentState.activeTabId
        ) {
          return previousRegistry
        }

        return {
          ...previousRegistry,
          [extensionId]: {
            tabs: nextTabs,
            activeTabId: nextActiveTabId,
          },
        }
      })
    },
    []
  )

  const unregisterTab = useCallback(
    (extensionId: SidebarPanelExtensionId, tabId: string) => {
      setRegistry((previousRegistry) => {
        const currentState = previousRegistry[extensionId]

        if (currentState == null) {
          return previousRegistry
        }

        const nextTabs = currentState.tabs.filter(
          (currentTab) => currentTab.tabId !== tabId
        )

        if (nextTabs.length === currentState.tabs.length) {
          return previousRegistry
        }

        if (nextTabs.length === 0) {
          const nextRegistry = { ...previousRegistry }
          delete nextRegistry[extensionId]
          return nextRegistry
        }

        const nextActiveTabId =
          currentState.activeTabId != null &&
          currentState.activeTabId !== tabId &&
          nextTabs.some((currentTab) => currentTab.tabId === currentState.activeTabId)
            ? currentState.activeTabId
            : nextTabs[0]?.tabId

        return {
          ...previousRegistry,
          [extensionId]: {
            tabs: nextTabs,
            activeTabId: nextActiveTabId,
          },
        }
      })
    },
    []
  )

  const setActiveTabId = useCallback(
    (extensionId: SidebarPanelExtensionId, tabId: string) => {
      setRegistry((previousRegistry) => {
        const currentState = previousRegistry[extensionId]

        if (
          currentState == null ||
          currentState.activeTabId === tabId ||
          (currentState.tabs.length > 0 &&
            !currentState.tabs.some((tab) => tab.tabId === tabId))
        ) {
          return previousRegistry
        }

        return {
          ...previousRegistry,
          [extensionId]: {
            ...currentState,
            activeTabId: tabId,
          },
        }
      })
    },
    []
  )

  const value = useMemo(
    () => ({
      registry,
      registerTab,
      setActiveTabId,
      unregisterTab,
    }),
    [registerTab, registry, setActiveTabId, unregisterTab]
  )

  return (
    <SidebarPanelExtensionTabsRegistryContext.Provider value={value}>
      {children}
    </SidebarPanelExtensionTabsRegistryContext.Provider>
  )
}

export const useSidebarPanelExtensionTabsRegistryContext = () => {
  const context = useContext(SidebarPanelExtensionTabsRegistryContext)

  if (context == null) {
    throw new Error(
      'SidebarPanelExtension tab registry must be rendered inside <SidebarPanelExtensionTabsProvider>'
    )
  }

  return context
}

export const useNullableSidebarPanelExtensionTabsContext =
  (): SidebarPanelExtensionTabsContextValue | null => {
    const extensionContext = useNullableSidebarPanelExtensionContext()
    const extensionId = extensionContext?.extensionId
    const registryContext = useContext(SidebarPanelExtensionTabsRegistryContext)
    const registryRegisterTab = registryContext?.registerTab
    const registryUnregisterTab = registryContext?.unregisterTab
    const registrySetActiveTabId = registryContext?.setActiveTabId
    const tabsState =
      extensionId == null
        ? EMPTY_EXTENSION_TABS_STATE
        : (registryContext?.registry[extensionId] ??
          EMPTY_EXTENSION_TABS_STATE)
    const tabs = tabsState.tabs
    const activeTabId = tabsState.activeTabId
    const resolvedActiveTabId =
      tabs.find((tab) => tab.tabId === activeTabId)?.tabId ?? tabs[0]?.tabId
    const registerTab = useCallback(
      (tab: SidebarPanelExtensionTabMetadata) => {
        if (extensionId == null || registryRegisterTab == null) {
          return
        }

        registryRegisterTab(extensionId, tab)
      },
      [extensionId, registryRegisterTab]
    )
    const unregisterTab = useCallback(
      (tabId: string) => {
        if (extensionId == null || registryUnregisterTab == null) {
          return
        }

        registryUnregisterTab(extensionId, tabId)
      },
      [extensionId, registryUnregisterTab]
    )
    const setActiveTabId = useCallback(
      (tabId: string) => {
        if (extensionId == null || registrySetActiveTabId == null) {
          return
        }

        registrySetActiveTabId(extensionId, tabId)
      },
      [extensionId, registrySetActiveTabId]
    )

    return useMemo(() => {
      if (extensionId == null || registryContext == null) {
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
      registryContext,
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
