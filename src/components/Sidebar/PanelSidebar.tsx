'use client'

import React, { useMemo } from 'react'
import type { SxProps, Theme } from '@mui/material'

import type {
  SidebarBoundaryId,
  SidebarPanelConfig as SidebarPanelOptions,
  SidebarPanelId,
} from '#/common/types/sidebar'

import SimpleSidebar from './SimpleSidebar'
import type {
  SimpleSidebarMobilePanel,
  SimpleSidebarPanelsConfig,
} from './SimpleSidebar'
import {
  SidebarActionRailSlot,
  SidebarPanelSlot,
} from './sidebarSlots'

export type PanelSidebarProps = {
  sx?: SxProps<Theme>
  panels?: SimpleSidebarPanelsConfig
  boundaryId?: SidebarBoundaryId
  options?: SidebarPanelOptions
  children: React.ReactNode
}

const panelSlotContent = ({
  boundaryId,
  panelId,
}: {
  boundaryId: SidebarBoundaryId
  panelId: SidebarPanelId
}) => <SidebarPanelSlot boundaryId={boundaryId} panelId={panelId} />

const toSingleMobilePanel = (
  activePanel: SidebarPanelId | undefined,
  panelId: SidebarPanelId
): Extract<SimpleSidebarMobilePanel, 'main' | 'a'> =>
  activePanel === panelId ? 'a' : 'main'

const toDoubleMobilePanel = (
  activePanel: SidebarPanelId | undefined
): Extract<SimpleSidebarMobilePanel, 'a' | 'b'> =>
  activePanel === 'tertiary' ? 'b' : 'a'

const getScopedPanelsConfig = ({
  boundaryId,
  options,
}: {
  boundaryId?: SidebarBoundaryId
  options?: SidebarPanelOptions
}): SimpleSidebarPanelsConfig | undefined => {
  if (boundaryId == null) {
    return undefined
  }

  const visiblePanels = options?.visiblePanels ?? []
  const extraPanels = visiblePanels.filter(
    (panelId): panelId is Exclude<SidebarPanelId, 'main'> =>
      panelId === 'secondary' || panelId === 'tertiary'
  )

  if (extraPanels.length === 0) {
    return undefined
  }

  const scopedActionRail = <SidebarActionRailSlot boundaryId={boundaryId} />

  if (extraPanels.includes('secondary') && extraPanels.includes('tertiary')) {
    return {
      mode: 'double',
      mobileMode: options?.mobileMode,
      mobileActivePanel: toDoubleMobilePanel(options?.activePanel),
      desktopActionRail: scopedActionRail,
      mobileActionRail: scopedActionRail,
      panelA: {
        content: panelSlotContent({ boundaryId, panelId: 'secondary' }),
      },
      panelB: {
        content: panelSlotContent({ boundaryId, panelId: 'tertiary' }),
      },
    }
  }

  const panelId = extraPanels[0]

  return {
    mode: 'single',
    isOpen: true,
    mobileMode: options?.mobileMode,
    mobileActivePanel: toSingleMobilePanel(options?.activePanel, panelId),
    desktopActionRail: scopedActionRail,
    mobileActionRail: scopedActionRail,
    panel: {
      content: panelSlotContent({ boundaryId, panelId }),
    },
  }
}

export const PanelSidebar = ({
  sx,
  panels,
  boundaryId,
  options,
  children,
}: PanelSidebarProps) => {
  const scopedPanels = useMemo(
    () => getScopedPanelsConfig({ boundaryId, options }),
    [boundaryId, options]
  )

  return (
    <SimpleSidebar sx={sx} panels={panels ?? scopedPanels}>
      {boundaryId != null && (
        <SidebarPanelSlot boundaryId={boundaryId} panelId="main" />
      )}
      {children}
    </SimpleSidebar>
  )
}

export default PanelSidebar
