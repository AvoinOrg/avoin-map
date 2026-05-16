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
  SidebarHeaderChildrenSlot,
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
  const visibleExtraPanels = visiblePanels.filter(
    (panelId): panelId is Exclude<SidebarPanelId, 'main'> =>
      panelId === 'secondary' || panelId === 'tertiary'
  )
  const capacityPanels: Exclude<SidebarPanelId, 'main'>[] =
    options?.panelLayout === 'triple'
      ? ['secondary', 'tertiary']
      : options?.panelLayout === 'double'
        ? ['secondary']
        : options?.panelLayout === 'single'
          ? []
          : visibleExtraPanels

  if (capacityPanels.length === 0) {
    return undefined
  }

  const scopedActionRail = <SidebarActionRailSlot boundaryId={boundaryId} />
  const openExtraPanels = capacityPanels.filter((panelId) =>
    visibleExtraPanels.includes(panelId)
  )

  if (
    capacityPanels.includes('secondary') &&
    capacityPanels.includes('tertiary') &&
    openExtraPanels.includes('secondary') &&
    openExtraPanels.includes('tertiary')
  ) {
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

  const panelId = openExtraPanels[0] ?? capacityPanels[0]

  return {
    mode: 'single',
    isOpen: openExtraPanels.includes(panelId),
    mobileMode: options?.mobileMode,
    mobileStackPlacement: options?.mobileStackPlacement,
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
  const headerChildren =
    boundaryId != null ? (
      <SidebarHeaderChildrenSlot boundaryId={boundaryId} />
    ) : undefined

  return (
    <SimpleSidebar
      sx={sx}
      panels={panels ?? scopedPanels}
      headerChildren={headerChildren}
    >
      {boundaryId != null && (
        <SidebarPanelSlot boundaryId={boundaryId} panelId="main" />
      )}
      {children}
    </SimpleSidebar>
  )
}

export default PanelSidebar
