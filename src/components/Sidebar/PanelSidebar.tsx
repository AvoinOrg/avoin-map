'use client'

import React, { useMemo } from 'react'
import type { SxProps, Theme } from '@mui/material'

import {
  HIILIKARTTA_HOME_FLOATING_GUTTER_PX,
  MAP_CONTROL_EDGE_GUTTER_PX,
} from '#/common/constants/map'
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
  SidebarFooterSlot,
  SidebarHeaderChildrenSlot,
  SidebarHeaderSlot,
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

const FULL_WIDTH_MAIN_PANEL_WIDTH = '30.5556vw'
const FULL_WIDTH_SECONDARY_PANEL_WIDTH = '38.8889vw'
const FULL_WIDTH_TERTIARY_PANEL_WIDTH = '30.5556vw'
const DEFAULT_PANEL_WIDTH = '23.75rem'

const hasFullWidthPanelLayout = (options?: SidebarPanelOptions) => {
  const visiblePanels = options?.visiblePanels ?? []

  return (
    options?.width === 'wide' &&
    options.panelLayout === 'triple' &&
    visiblePanels.includes('main') &&
    visiblePanels.includes('secondary') &&
    visiblePanels.includes('tertiary')
  )
}

const getMainPanelWidth = (options?: SidebarPanelOptions) =>
  hasFullWidthPanelLayout(options)
    ? FULL_WIDTH_MAIN_PANEL_WIDTH
    : DEFAULT_PANEL_WIDTH

const getExtraPanelWidth = ({
  panelId,
  options,
}: {
  panelId: Exclude<SidebarPanelId, 'main'>
  options?: SidebarPanelOptions
}) => {
  if (!hasFullWidthPanelLayout(options)) {
    return DEFAULT_PANEL_WIDTH
  }

  return panelId === 'secondary'
    ? FULL_WIDTH_SECONDARY_PANEL_WIDTH
    : FULL_WIDTH_TERTIARY_PANEL_WIDTH
}

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

  const visiblePanels = options?.visiblePanels ?? ['main']
  const visibleExtraPanels = visiblePanels.filter(
    (panelId): panelId is Exclude<SidebarPanelId, 'main'> =>
      panelId === 'secondary' || panelId === 'tertiary'
  )
  const capacityPanels: Exclude<SidebarPanelId, 'main'>[] =
    options?.panelLayout === 'triple'
      ? ['secondary', 'tertiary']
      : options?.panelLayout === 'double'
        ? visibleExtraPanels.length > 0
          ? [visibleExtraPanels[0]]
          : ['secondary']
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
      desktopMainPanelVisible:
        options?.mainPanelVisible !== false && visiblePanels.includes('main'),
      mobileMainPanelVisible:
        options?.mainPanelVisible !== false && visiblePanels.includes('main'),
      desktopActionRail: scopedActionRail,
      mobileActionRail: scopedActionRail,
      panelA: {
        content: panelSlotContent({ boundaryId, panelId: 'secondary' }),
        desktopWidth: getExtraPanelWidth({ panelId: 'secondary', options }),
      },
      panelB: {
        content: panelSlotContent({ boundaryId, panelId: 'tertiary' }),
        desktopWidth: getExtraPanelWidth({ panelId: 'tertiary', options }),
      },
    }
  }

  const panelId = openExtraPanels[0] ?? capacityPanels[0]

  return {
    mode: 'single',
    isOpen: openExtraPanels.includes(panelId),
    mobileMode: options?.mobileMode,
    mobileStackPlacement: options?.mobileStackPlacement,
    mobileStackRender: 'direct',
    mobileActivePanel: toSingleMobilePanel(options?.activePanel, panelId),
    desktopActionRail: scopedActionRail,
    mobileActionRail: scopedActionRail,
    panel: {
      content: panelSlotContent({ boundaryId, panelId }),
      desktopWidth: getExtraPanelWidth({ panelId, options }),
    },
  }
}

const getPanelSidebarSx = (
  sx: SxProps<Theme> | undefined,
  options?: SidebarPanelOptions
): SxProps<Theme> => {
  const floatingGutter = `${HIILIKARTTA_HOME_FLOATING_GUTTER_PX}px`
  const mainPanelWidth = getMainPanelWidth(options)

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
          width: { mobile: '100vw', desktop: mainPanelWidth },
          maxWidth: { mobile: '100vw', desktop: `min(${mainPanelWidth}, 100vw)` },
        },
    ...(Array.isArray(sx) ? sx : [sx]),
  ]
}

const getPanelSidebarToggleSx = (
  options?: SidebarPanelOptions
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
  const scopedActionRail =
    boundaryId != null ? (
      <SidebarActionRailSlot boundaryId={boundaryId} />
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
    <SimpleSidebar
      sx={getPanelSidebarSx(sx, options)}
      sidebarToggleSx={getPanelSidebarToggleSx(options)}
      panels={panels ?? scopedPanels}
      headerChildren={headerChildren}
      topContent={scopedTopContent}
      bottomContent={scopedBottomContent}
      actionRail={
        panels == null && scopedPanels == null ? scopedActionRail : undefined
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
      contentSx={
        options?.chrome === 'hidden'
          ? {
              overflow: 'hidden',
              minHeight: 0,
            }
          : undefined
      }
    >
      {boundaryId != null && (
        <SidebarPanelSlot boundaryId={boundaryId} panelId="main" />
      )}
      {children}
    </SimpleSidebar>
  )
}

export default PanelSidebar
