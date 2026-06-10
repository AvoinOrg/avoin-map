'use client'

import React, { useEffect, useId, useMemo } from 'react'

import type { PandaStyleProp } from '#/common/style/panda'
import { Box } from '#/components/common/PandaBox'
import {
  useNullableSidebarPanelExtensionTabsContext,
  type SidebarPanelExtensionTabMetadata,
} from './SidebarPanelExtensionTabsContext'

export type SidebarPanelExtensionTabContainerProps = {
  tabId: string
  tabName: React.ReactNode
  tabAriaLabel?: string
  tabIcon?: React.ReactNode
  tabButtonSx?: PandaStyleProp
  tabIconSx?: PandaStyleProp
  keepMounted?: boolean
  styleProps?: PandaStyleProp
  children?: React.ReactNode
}

const normalizeDomIdPart = (value: string) =>
  value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'tab'

export const SidebarPanelExtensionTabContainer = ({
  tabId,
  tabName,
  tabAriaLabel,
  tabIcon,
  tabButtonSx,
  tabIconSx,
  keepMounted = false,
  styleProps,
  children,
}: SidebarPanelExtensionTabContainerProps) => {
  const context = useNullableSidebarPanelExtensionTabsContext()
  const registerTab = context?.registerTab
  const unregisterTab = context?.unregisterTab
  const generatedId = useId()
  const domIdPart = normalizeDomIdPart(`${tabId}-${generatedId}`)
  const tabButtonId = `sidebar-panel-extension-tab-${domIdPart}`
  const tabPanelId = `sidebar-panel-extension-tabpanel-${domIdPart}`

  const metadata = useMemo<SidebarPanelExtensionTabMetadata>(
    () => ({
      tabId,
      tabName,
      tabAriaLabel,
      tabIcon,
      tabButtonSx,
      tabIconSx,
      tabButtonId,
      tabPanelId,
    }),
    [
      tabAriaLabel,
      tabButtonId,
      tabButtonSx,
      tabIcon,
      tabIconSx,
      tabId,
      tabName,
      tabPanelId,
    ]
  )

  useEffect(() => {
    registerTab?.(metadata)
  }, [metadata, registerTab])

  useEffect(() => {
    return () => {
      unregisterTab?.(tabId)
    }
  }, [tabId, unregisterTab])

  if (context == null) {
    return (
      <Box
        styleProps={[
          {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            width: '100%',
          },
          ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
        ]}
      >
        {children}
      </Box>
    )
  }

  const isRegistered = context.tabs.some((tab) => tab.tabId === tabId)
  const isActive = context.resolvedActiveTabId === tabId

  if (!isRegistered) {
    return null
  }

  if (!isActive && !keepMounted) {
    return null
  }

  return (
    <Box
      id={tabPanelId}
      role="tabpanel"
      aria-labelledby={tabButtonId}
      hidden={!isActive}
      data-sidebar-panel-extension-tab-id={tabId}
      styleProps={[
        {
          display: isActive ? 'flex' : 'none',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: '100%',
        },
        ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
      ]}
    >
      {children}
    </Box>
  )
}

export default SidebarPanelExtensionTabContainer
