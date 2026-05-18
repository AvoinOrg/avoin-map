'use client'

import React, { useMemo } from 'react'
import type { SxProps, Theme } from '@mui/material'

import {
  HIILIKARTTA_HOME_FLOATING_GUTTER_PX,
  MAP_CONTROL_EDGE_GUTTER_PX,
} from '#/common/constants/map'
import type {
  SidebarBoundaryId,
  SidebarPanelId,
  SidebarSimpleConfig as SidebarSimpleOptions,
} from '#/common/types/sidebar'

import SimpleSidebarBase from './SimpleSidebarBase'
import type {
  SimpleSidebarMobilePanel,
  SimpleSidebarPanelsConfig,
} from './SimpleSidebarBase'
import {
  SidebarActionRailSlot,
  SidebarFooterSlot,
  SidebarHeaderChildrenSlot,
  SidebarHeaderSlot,
  SidebarPanelSlot,
} from './sidebarSlots'

export type SimpleSidebarProps = {
  sx?: SxProps<Theme>
  panels?: SimpleSidebarPanelsConfig
  boundaryId?: SidebarBoundaryId
  options?: SidebarSimpleOptions
  children: React.ReactNode
}

const panelSlotContent = ({
  boundaryId,
  panelId,
}: {
  boundaryId: SidebarBoundaryId
  panelId: SidebarPanelId
}) => <SidebarPanelSlot boundaryId={boundaryId} panelId={panelId} />

const DEFAULT_PANEL_WIDTH = '23.75rem'

const toSecondaryMobilePanel = (
  activePanel: SidebarPanelId | undefined
): Extract<SimpleSidebarMobilePanel, 'main' | 'a'> =>
  activePanel === 'secondary' ? 'a' : 'main'

const getSimpleSidebarSecondaryPanelConfig = ({
  boundaryId,
  options,
  actionRail,
}: {
  boundaryId?: SidebarBoundaryId
  options?: SidebarSimpleOptions
  actionRail?: React.ReactNode
}): SimpleSidebarPanelsConfig | undefined => {
  if (boundaryId == null) {
    return undefined
  }

  if (options?.panelLayout !== 'double') {
    return undefined
  }

  const visiblePanels = options.visiblePanels ?? ['main']
  const isSecondaryVisible = visiblePanels.includes('secondary')
  const panelLocalScrollContentSx =
    options?.chrome === 'hidden'
      ? {
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          maxHeight: '100%',
          minHeight: 0,
          width: '100%',
        }
      : undefined

  return {
    mode: 'single',
    isOpen: isSecondaryVisible,
    mobileMode: options?.mobileMode,
    mobileStackPlacement: options?.mobileStackPlacement,
    mobileStackRender: 'direct',
    mobileActivePanel: toSecondaryMobilePanel(options?.activePanel),
    desktopActionRail: actionRail,
    mobileActionRail: actionRail,
    panel: {
      content: panelSlotContent({ boundaryId, panelId: 'secondary' }),
      desktopWidth: DEFAULT_PANEL_WIDTH,
      desktopContentSx: panelLocalScrollContentSx,
    },
  }
}

const getSimpleSidebarSx = (
  sx: SxProps<Theme> | undefined,
  options?: SidebarSimpleOptions
): SxProps<Theme> => {
  const floatingGutter = `${HIILIKARTTA_HOME_FLOATING_GUTTER_PX}px`
  const hiddenChromeHeightSx =
    options?.chrome === 'hidden'
      ? {
          height: '100dvh',
          maxHeight: '100dvh',
          minHeight: 0,
        }
      : undefined

  return [
    options?.width === 'compact'
      ? {
          pt: { mobile: 0, desktop: floatingGutter },
          pb: { mobile: 0, desktop: floatingGutter },
          ml: { mobile: 0, desktop: floatingGutter },
          width: { mobile: '100vw', desktop: DEFAULT_PANEL_WIDTH },
          maxWidth: {
            mobile: '100vw',
            desktop: `min(${DEFAULT_PANEL_WIDTH}, calc(100vw - ${floatingGutter}))`,
          },
        }
      : {
          width: { mobile: '100vw', desktop: DEFAULT_PANEL_WIDTH },
          maxWidth: {
            mobile: '100vw',
            desktop: `min(${DEFAULT_PANEL_WIDTH}, 100vw)`,
          },
        },
    hiddenChromeHeightSx,
    ...(Array.isArray(sx) ? sx : [sx]),
  ]
}

const getSimpleSidebarToggleSx = (
  options?: SidebarSimpleOptions
): SxProps<Theme> | undefined => {
  if (options?.width !== 'compact') {
    return undefined
  }

  const toggleGutter = `${MAP_CONTROL_EDGE_GUTTER_PX}px`

  return {
    right: { mobile: '1rem', desktop: toggleGutter },
    bottom: { mobile: '1rem', desktop: toggleGutter },
  }
}

const getSimpleSidebarContentSx = ({
  options,
}: {
  options?: SidebarSimpleOptions
}): SxProps<Theme> | undefined => {
  if (options?.chrome !== 'hidden') {
    return undefined
  }

  return {
    overflow: 'hidden',
    height: '100%',
    maxHeight: '100%',
    minHeight: 0,
    width: '100%',
    alignItems: 'stretch',
  }
}

export const SimpleSidebar = ({
  sx,
  panels,
  boundaryId,
  options,
  children,
}: SimpleSidebarProps) => {
  const scopedActionRailSlot = useMemo(
    () =>
      boundaryId != null ? (
        <SidebarActionRailSlot boundaryId={boundaryId} />
      ) : undefined,
    [boundaryId]
  )
  const scopedPanels = useMemo(
    () =>
      getSimpleSidebarSecondaryPanelConfig({
        boundaryId,
        options,
        actionRail: scopedActionRailSlot,
      }),
    [boundaryId, options, scopedActionRailSlot]
  )
  const headerChildren =
    boundaryId != null ? (
      <SidebarHeaderChildrenSlot boundaryId={boundaryId} />
    ) : undefined
  const scopedTopContent =
    options?.chrome === 'hidden'
      ? null
      : options?.width === 'compact' && boundaryId != null
        ? <SidebarHeaderSlot boundaryId={boundaryId} />
        : undefined
  const scopedBottomContent =
    options?.chrome === 'hidden'
      ? null
      : options?.width === 'compact' && boundaryId != null
        ? <SidebarFooterSlot boundaryId={boundaryId} />
        : undefined

  return (
    <SimpleSidebarBase
      sx={getSimpleSidebarSx(sx, options)}
      sidebarToggleSx={getSimpleSidebarToggleSx(options)}
      panels={panels ?? scopedPanels}
      headerChildren={headerChildren}
      topContent={scopedTopContent}
      bottomContent={scopedBottomContent}
      actionRail={
        panels == null && scopedPanels == null ? scopedActionRailSlot : undefined
      }
      actionRailPlacement={options?.actionRailPlacement}
      hideMainContainer={options?.mainPanelVisible === false}
      panelSx={
        options?.width === 'compact'
          ? {
              borderRadius: { mobile: 0, desktop: '10px' },
              backgroundColor: '#f4f4f4',
            }
          : undefined
      }
      contentSx={getSimpleSidebarContentSx({ options })}
    >
      {boundaryId != null && (
        <SidebarPanelSlot boundaryId={boundaryId} panelId="main" />
      )}
      {children}
    </SimpleSidebarBase>
  )
}

export default SimpleSidebar
