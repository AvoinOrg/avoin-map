'use client'

import React from 'react'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import type {
  SidebarActionRailPlacement,
  SidebarPanelExtensionId,
  SidebarPanelExtensionRuntimeOptions,
  SidebarPanelExtensionTabMetadata,
  SidebarPanelId,
} from '#/common/types/sidebar'

import { SidebarPanelExtensionTabIconButton } from './SidebarPanelExtensionTabIconButton'
import {
  SidebarPanelExtensionActionRailSlot,
  SidebarPanelExtensionPanelSlot,
} from './sidebarSlots'

export type SidebarPanelExtensionProps = {
  extensionId: SidebarPanelExtensionId
  options?: SidebarPanelExtensionRuntimeOptions
  sidebarOffset?: number
  desktopTabRail?: React.ReactNode
  mobileTabRail?: React.ReactNode
  suppressMobileStackedPanels?: boolean
  sx?: SxProps<Theme>
}

export type SidebarPanelExtensionTabRailProps = {
  tabs: SidebarPanelExtensionTabMetadata[]
  activeTabId?: string
  placement: 'desktop' | 'mobile'
  onTabChange: (tabId: string) => void
}

const FULL_WIDTH_MAIN_PANEL_WIDTH = '30.5556vw'
const FULL_WIDTH_SECONDARY_PANEL_WIDTH = '38.8889vw'
const FULL_WIDTH_TERTIARY_PANEL_WIDTH = '30.5556vw'
const WIDE_SINGLE_MAIN_PANEL_WIDTH = 'min(1440px, calc(100vw - 4rem))'
const DEFAULT_PANEL_WIDTH = '23.75rem'
const SIDEBAR_TOGGLE_BUTTON_SIZE_PX = 45
const ACTION_RAIL_GAP_PX = 10
const MOBILE_BOTTOM_ACTION_ROW_BOTTOM_PX = MAP_CONTROL_EDGE_GUTTER_PX
const MOBILE_BOTTOM_ACTION_ROW_RIGHT_PX =
  MAP_CONTROL_EDGE_GUTTER_PX +
  SIDEBAR_TOGGLE_BUTTON_SIZE_PX +
  ACTION_RAIL_GAP_PX
const FIXED_BOTTOM_ACTION_ROW_RIGHT_PX =
  MAP_CONTROL_EDGE_GUTTER_PX +
  SIDEBAR_TOGGLE_BUTTON_SIZE_PX +
  ACTION_RAIL_GAP_PX
const FIXED_RIGHT_ACTION_COLUMN_TOP_PX =
  MAP_CONTROL_EDGE_GUTTER_PX +
  SIDEBAR_TOGGLE_BUTTON_SIZE_PX +
  ACTION_RAIL_GAP_PX
const FIXED_RIGHT_ACTION_COLUMN_RIGHT_PX =
  MAP_CONTROL_EDGE_GUTTER_PX +
  SIDEBAR_TOGGLE_BUTTON_SIZE_PX +
  ACTION_RAIL_GAP_PX

const PANEL_ORDER: SidebarPanelId[] = ['main', 'secondary', 'tertiary']

const toSxArray = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : [sx])

const hasFullWidthPanelLayout = (
  options?: SidebarPanelExtensionRuntimeOptions
) => {
  const visiblePanels = options?.visiblePanels ?? []

  return (
    options?.width === 'wide' &&
    options.panelLayout === 'triple' &&
    visiblePanels.includes('main') &&
    visiblePanels.includes('secondary') &&
    visiblePanels.includes('tertiary')
  )
}

const hasWideSingleMainPanelLayout = (
  options?: SidebarPanelExtensionRuntimeOptions
) => {
  const visiblePanels = options?.visiblePanels ?? ['main']

  return (
    options?.width === 'wide' &&
    options.chrome === 'hidden' &&
    options.panelLayout === 'single' &&
    visiblePanels.length === 1 &&
    visiblePanels.includes('main')
  )
}

export const getSidebarPanelExtensionMainPanelWidth = (
  options?: SidebarPanelExtensionRuntimeOptions
) =>
  hasFullWidthPanelLayout(options)
    ? FULL_WIDTH_MAIN_PANEL_WIDTH
    : hasWideSingleMainPanelLayout(options)
      ? WIDE_SINGLE_MAIN_PANEL_WIDTH
      : DEFAULT_PANEL_WIDTH

const getSidebarPanelExtensionPanelWidth = ({
  panelId,
  options,
}: {
  panelId: SidebarPanelId
  options?: SidebarPanelExtensionRuntimeOptions
}) => {
  if (panelId === 'main') {
    return getSidebarPanelExtensionMainPanelWidth(options)
  }

  if (!hasFullWidthPanelLayout(options)) {
    return DEFAULT_PANEL_WIDTH
  }

  return panelId === 'secondary'
    ? FULL_WIDTH_SECONDARY_PANEL_WIDTH
    : FULL_WIDTH_TERTIARY_PANEL_WIDTH
}

const getCapacityPanels = (
  options?: SidebarPanelExtensionRuntimeOptions
): SidebarPanelId[] => {
  if (options?.panelLayout === 'triple') {
    return PANEL_ORDER
  }

  if (options?.panelLayout === 'double') {
    return ['main', 'secondary']
  }

  return ['main']
}

const getVisiblePanels = (
  options?: SidebarPanelExtensionRuntimeOptions
): SidebarPanelId[] => {
  const visiblePanels = options?.visiblePanels ?? ['main']
  const capacityPanels = getCapacityPanels(options)

  return capacityPanels.filter((panelId) => visiblePanels.includes(panelId))
}

const getActiveMobilePanel = ({
  options,
  visiblePanels,
}: {
  options?: SidebarPanelExtensionRuntimeOptions
  visiblePanels: SidebarPanelId[]
}) =>
  options?.activePanel != null && visiblePanels.includes(options.activePanel)
    ? options.activePanel
    : visiblePanels[0]

const getPanelContentSx = (
  options?: SidebarPanelExtensionRuntimeOptions
): SxProps<Theme> | undefined =>
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

const SidebarPanelExtensionDesktopPanel = ({
  extensionId,
  panelId,
  options,
}: {
  extensionId: SidebarPanelExtensionId
  panelId: SidebarPanelId
  options?: SidebarPanelExtensionRuntimeOptions
}) => {
  const width = getSidebarPanelExtensionPanelWidth({ panelId, options })
  const panelContentSx = getPanelContentSx(options)

  return (
    <Box
      data-testid={`sidebar-panel-extension-desktop-panel-${panelId}`}
      data-sidebar-panel-extension-panel-id={panelId}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 auto',
        width,
        maxWidth: `min(${width}, 100vw)`,
        height: '100%',
        minHeight: 0,
        zIndex: theme.zIndex.drawer + 2,
        pointerEvents: 'auto',
      })}
    >
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 6px rgba(17, 17, 17, 0.06)',
          borderLeft: '1px solid rgba(17, 17, 17, 0.08)',
        }}
      >
        <Box
          sx={[
            {
              position: 'absolute',
              inset: 0,
              overflow: 'auto',
            },
            ...toSxArray(panelContentSx),
          ]}
        >
          <SidebarPanelExtensionPanelSlot
            extensionId={extensionId}
            panelId={panelId}
          />
        </Box>
      </Box>
    </Box>
  )
}

const getDesktopControlsSx = (
  placement: SidebarActionRailPlacement
): SxProps<Theme> => {
  if (placement === 'fixedBottomActionRow') {
    return (theme: Theme) => ({
      position: 'fixed',
      right: `${FIXED_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
      bottom: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      zIndex: theme.zIndex.drawer + 12,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    })
  }

  if (placement === 'fixedRightActionColumn') {
    return (theme: Theme) => ({
      position: 'fixed',
      top: `${FIXED_RIGHT_ACTION_COLUMN_TOP_PX}px`,
      right: `${FIXED_RIGHT_ACTION_COLUMN_RIGHT_PX}px`,
      zIndex: theme.zIndex.drawer + 12,
      display: 'flex',
      flexDirection: 'column',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    })
  }

  return (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    pt: 2,
    pl: 1,
    zIndex: theme.zIndex.drawer + 3,
    pointerEvents: 'auto',
  })
}

const getDesktopTabControlsSx = (): SxProps<Theme> => (theme: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
  pt: 2,
  pl: 1,
  zIndex: theme.zIndex.drawer + 3,
  pointerEvents: 'auto',
})

const getMobileActionRailSx = (
  placement: SidebarActionRailPlacement
): SxProps<Theme> => {
  if (placement === 'fixedRightActionColumn') {
    return (theme: Theme) => ({
      position: 'fixed',
      top: `${FIXED_RIGHT_ACTION_COLUMN_TOP_PX}px`,
      right: `${FIXED_RIGHT_ACTION_COLUMN_RIGHT_PX}px`,
      zIndex: theme.zIndex.drawer + 12,
      display: 'flex',
      flexDirection: 'column',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    })
  }

  return (theme: Theme) => ({
    position: 'fixed',
    right: `${MOBILE_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
    bottom: `${MOBILE_BOTTOM_ACTION_ROW_BOTTOM_PX}px`,
    zIndex: theme.zIndex.drawer + 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: `${ACTION_RAIL_GAP_PX}px`,
    pointerEvents: 'auto',
  })
}

const getMobileTabControlsSx = (): SxProps<Theme> => (theme: Theme) => ({
  position: 'fixed',
  right: `${MOBILE_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
  bottom: `${MOBILE_BOTTOM_ACTION_ROW_BOTTOM_PX}px`,
  zIndex: theme.zIndex.drawer + 12,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: `${ACTION_RAIL_GAP_PX}px`,
  pointerEvents: 'auto',
})

const shouldRenderActionRailInMobileTabRow = (
  placement: SidebarActionRailPlacement
) => placement === 'bottomActionRow'

export const SidebarPanelExtensionTabRail = ({
  tabs,
  activeTabId,
  placement,
  onTabChange,
}: SidebarPanelExtensionTabRailProps) => {
  if (tabs.length < 2) {
    return null
  }

  return (
    <Box
      role="tablist"
      aria-label="Sidebar panel extension tabs"
      data-testid={`sidebar-panel-extension-${placement}-tab-rail`}
      sx={{
        display: 'flex',
        flexDirection: placement === 'desktop' ? 'column' : 'row',
        alignItems: 'center',
        gap: 1,
        pointerEvents: 'auto',
      }}
    >
      {tabs.map((tab) => (
        <SidebarPanelExtensionTabIconButton
          key={tab.tabId}
          tabId={tab.tabId}
          tabName={tab.tabName}
          ariaLabel={tab.tabAriaLabel}
          icon={tab.tabIcon}
          selected={tab.tabId === activeTabId}
          buttonId={tab.tabButtonId}
          controlsId={tab.tabPanelId}
          onSelect={onTabChange}
          sx={tab.tabButtonSx}
          iconSx={tab.tabIconSx}
        />
      ))}
    </Box>
  )
}

const SidebarPanelExtensionMobilePanels = ({
  extensionId,
  options,
  variant,
}: {
  extensionId: SidebarPanelExtensionId
  options?: SidebarPanelExtensionRuntimeOptions
  variant: 'overlay' | 'stacked'
}) => {
  const visiblePanels = getVisiblePanels(options)
  const activeMobilePanel = getActiveMobilePanel({ options, visiblePanels })
  const mobileMode = options?.mobileMode ?? 'stacked'
  const mobilePanels =
    mobileMode === 'buttons' && activeMobilePanel != null
      ? [activeMobilePanel]
      : visiblePanels

  if (mobilePanels.length === 0) {
    return null
  }

  return (
    <Box
      data-testid="sidebar-panel-extension-mobile-panels"
      data-sidebar-panel-extension-mobile-render={variant}
      data-sidebar-panel-extension-mobile-stack-placement={
        variant === 'stacked'
          ? (options?.mobileStackPlacement ?? 'after')
          : undefined
      }
      sx={(theme) =>
        variant === 'overlay'
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: theme.zIndex.drawer + 4,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              minHeight: 0,
              backgroundColor: '#ffffff',
              pointerEvents: 'auto',
            }
          : {
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              width: '100%',
              minHeight: 0,
              backgroundColor: '#ffffff',
              pointerEvents: 'auto',
            }
      }
    >
      {mobilePanels.map((panelId) => (
        <Box
          key={panelId}
          data-testid={`sidebar-panel-extension-mobile-panel-${panelId}`}
          data-sidebar-panel-extension-panel-id={panelId}
          sx={[
            {
              display: 'flex',
              flexDirection: 'column',
              flex: mobileMode === 'stacked' ? '0 0 auto' : 1,
              minHeight: mobileMode === 'stacked' ? 'auto' : 0,
              width: '100%',
              overflow: 'auto',
            },
            ...toSxArray(getPanelContentSx(options)),
          ]}
        >
          <SidebarPanelExtensionPanelSlot
            extensionId={extensionId}
            panelId={panelId}
          />
        </Box>
      ))}
    </Box>
  )
}

export const SidebarPanelExtensionMobileStackedPanels = ({
  extensionId,
  options,
}: {
  extensionId: SidebarPanelExtensionId
  options?: SidebarPanelExtensionRuntimeOptions
}) => (
  <SidebarPanelExtensionMobilePanels
    extensionId={extensionId}
    options={options}
    variant="stacked"
  />
)

export const SidebarPanelExtension = ({
  extensionId,
  options,
  sidebarOffset = 0,
  desktopTabRail,
  mobileTabRail,
  suppressMobileStackedPanels = false,
  sx,
}: SidebarPanelExtensionProps) => {
  const isMobile = useIsMobile()
  const visiblePanels = getVisiblePanels(options)
  const mobileMode = options?.mobileMode ?? 'stacked'
  const actionRailPlacement = options?.actionRailPlacement ?? 'inside'
  const renderMobileActionRailInTabRow =
    shouldRenderActionRailInMobileTabRow(actionRailPlacement)
  const shouldRenderMobileTabControls =
    mobileTabRail != null || renderMobileActionRailInTabRow
  const shouldRenderMobileOverlayPanels =
    mobileMode !== 'stacked' || !suppressMobileStackedPanels
  const desktopPanels = visiblePanels.map((panelId) => (
    <SidebarPanelExtensionDesktopPanel
      key={panelId}
      extensionId={extensionId}
      panelId={panelId}
      options={options}
    />
  ))

  if (isMobile) {
    return (
      <>
        {shouldRenderMobileOverlayPanels && (
          <SidebarPanelExtensionMobilePanels
            extensionId={extensionId}
            options={options}
            variant="overlay"
          />
        )}
        {shouldRenderMobileTabControls && (
          <Box
            data-testid="sidebar-panel-extension-mobile-controls"
            data-sidebar-panel-extension-tab-placement="bottomActionRow"
            data-sidebar-panel-extension-control-placement={
              renderMobileActionRailInTabRow ? actionRailPlacement : undefined
            }
            sx={getMobileTabControlsSx()}
          >
            {mobileTabRail}
            {renderMobileActionRailInTabRow && (
              <SidebarPanelExtensionActionRailSlot extensionId={extensionId} />
            )}
          </Box>
        )}
        {!renderMobileActionRailInTabRow && (
          <Box
            data-testid="sidebar-panel-extension-mobile-action-rail"
            data-sidebar-panel-extension-control-placement={
              actionRailPlacement
            }
            sx={getMobileActionRailSx(actionRailPlacement)}
          >
            <SidebarPanelExtensionActionRailSlot extensionId={extensionId} />
          </Box>
        )}
      </>
    )
  }

  return (
    <Box
      data-testid="sidebar-panel-extension-root"
      sx={[
        (theme: Theme) => ({
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: `${Math.max(0, sidebarOffset)}px`,
          display: 'flex',
          flexDirection: 'row',
          height: '100dvh',
          maxWidth: '100vw',
          minHeight: 0,
          zIndex: theme.zIndex.drawer + 2,
          pointerEvents: 'none',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {desktopPanels}
      {desktopTabRail != null && (
        <Box
          data-testid="sidebar-panel-extension-desktop-tab-controls"
          data-sidebar-panel-extension-tab-placement="sidebar-edge"
          sx={getDesktopTabControlsSx()}
        >
          {desktopTabRail}
        </Box>
      )}
      <Box
        data-testid="sidebar-panel-extension-desktop-controls"
        data-sidebar-panel-extension-control-placement={actionRailPlacement}
        sx={getDesktopControlsSx(actionRailPlacement)}
      >
        <SidebarPanelExtensionActionRailSlot extensionId={extensionId} />
      </Box>
    </Box>
  )
}

export default SidebarPanelExtension
