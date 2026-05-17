'use client'

import React, { useEffect, useId, useMemo } from 'react'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

import {
  useNullablePanelSidebarTabsContext,
  type PanelSidebarTabMetadata,
} from './PanelSidebarTabsContext'

export type PanelSidebarTabContainerProps = {
  tabId: string
  tabName: React.ReactNode
  tabAriaLabel?: string
  tabIcon?: React.ReactNode
  tabButtonSx?: SxProps<Theme>
  tabIconSx?: SxProps<Theme>
  keepMounted?: boolean
  sx?: SxProps<Theme>
  children?: React.ReactNode
}

const normalizeDomIdPart = (value: string) =>
  value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'tab'

export const PanelSidebarTabContainer = ({
  tabId,
  tabName,
  tabAriaLabel,
  tabIcon,
  tabButtonSx,
  tabIconSx,
  keepMounted = false,
  sx,
  children,
}: PanelSidebarTabContainerProps) => {
  const context = useNullablePanelSidebarTabsContext()
  const registerTab = context?.registerTab
  const unregisterTab = context?.unregisterTab
  const generatedId = useId()
  const domIdPart = normalizeDomIdPart(`${tabId}-${generatedId}`)
  const tabButtonId = `panel-sidebar-tab-${domIdPart}`
  const tabPanelId = `panel-sidebar-tabpanel-${domIdPart}`

  const metadata = useMemo<PanelSidebarTabMetadata>(
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
        sx={[
          {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            width: '100%',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
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
      data-panel-sidebar-tab-id={tabId}
      sx={[
        {
          display: isActive ? 'flex' : 'none',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  )
}

export default PanelSidebarTabContainer
