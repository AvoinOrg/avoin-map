'use client'

import React from 'react'

import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import type { PandaStyleProp } from '#/common/style/panda'
import type {
  SidebarActionRailPlacement,
  SidebarPanelExtensionId,
  SidebarPanelExtensionRuntimeOptions,
  SidebarPanelExtensionTabMetadata,
  SidebarPanelId,
} from '#/common/types/sidebar'
import { Box } from '#/components/common/PandaBox'

import { SidebarPanelExtensionTabIconButton } from './SidebarPanelExtensionTabIconButton'
import {
  SidebarPanelExtensionActionRailSlot,
  SidebarPanelExtensionPanelSlot,
} from './sidebarSlots'

export type SidebarPanelExtensionProps = {
  extensionId: SidebarPanelExtensionId
  options?: SidebarPanelExtensionRuntimeOptions
  sidebarOffset?: number
  visible?: boolean
  desktopTabRail?: React.ReactNode
  mobileTabRail?: React.ReactNode
  suppressMobileStackedPanels?: boolean
  sx?: PandaStyleProp
}

export type SidebarPanelExtensionTabRailProps = {
  tabs: SidebarPanelExtensionTabMetadata[]
  activeTabId?: string
  placement: 'desktop' | 'mobile'
  orientation?: 'column' | 'row'
  onTabChange: (tabId: string) => void
}

const FULL_WIDTH_MAIN_PANEL_WIDTH = '30.5556vw'
const FULL_WIDTH_SECONDARY_PANEL_WIDTH = '38.8889vw'
const FULL_WIDTH_TERTIARY_PANEL_WIDTH = '30.5556vw'
const WIDE_SINGLE_MAIN_PANEL_WIDTH = 'min(1440px, calc(100vw - 4rem))'
const FULLSCREEN_MAIN_PANEL_WIDTH = '100vw'
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
const DEFAULT_MAP_BUTTONS_Z_INDEX = 1300
const DEFAULT_FULLSCREEN_DRAWER_Z_INDEX = 1400
const NON_FULLSCREEN_PANEL_EXTENSION_Z_INDEX_GAP = 20
const FULLSCREEN_DRAWER_Z_INDEX = Math.max(
  DEFAULT_FULLSCREEN_DRAWER_Z_INDEX,
  DEFAULT_MAP_BUTTONS_Z_INDEX + 100
)

const PANEL_ORDER: SidebarPanelId[] = ['main', 'secondary', 'tertiary']

const toSxArray = (sx?: PandaStyleProp) => (Array.isArray(sx) ? sx : [sx])

const isFullscreenLayout = (
  options?: SidebarPanelExtensionRuntimeOptions
) => options?.layoutMode === 'fullscreen'

const getDesktopPanelExtensionZIndex = ({
  layoutMode,
  fullscreenOffset = 0,
  defaultOffset = 0,
}: {
  layoutMode?: SidebarPanelExtensionRuntimeOptions['layoutMode']
  fullscreenOffset?: number
  defaultOffset?: number
}) =>
  layoutMode === 'fullscreen'
    ? FULLSCREEN_DRAWER_Z_INDEX + fullscreenOffset
    : DEFAULT_MAP_BUTTONS_Z_INDEX -
      NON_FULLSCREEN_PANEL_EXTENSION_Z_INDEX_GAP +
      defaultOffset

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
) => {
  if (options?.desktopMainPanelWidth != null) {
    return options.desktopMainPanelWidth
  }

  if (isFullscreenLayout(options)) {
    return FULLSCREEN_MAIN_PANEL_WIDTH
  }

  if (hasFullWidthPanelLayout(options)) {
    return FULL_WIDTH_MAIN_PANEL_WIDTH
  }

  return hasWideSingleMainPanelLayout(options)
    ? WIDE_SINGLE_MAIN_PANEL_WIDTH
    : DEFAULT_PANEL_WIDTH
}

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
): PandaStyleProp | undefined =>
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
  isFirstVisiblePanel,
  panelId,
  options,
}: {
  extensionId: SidebarPanelExtensionId
  isFirstVisiblePanel: boolean
  panelId: SidebarPanelId
  options?: SidebarPanelExtensionRuntimeOptions
}) => {
  const width = getSidebarPanelExtensionPanelWidth({ panelId, options })
  const panelContentSx = getPanelContentSx(options)

  return (
    <Box
      data-testid={`sidebar-panel-extension-desktop-panel-${panelId}`}
      data-sidebar-panel-extension-panel-id={panelId}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 auto',
        width,
        maxWidth: `min(${width}, 100vw)`,
        height: '100%',
        minHeight: 0,
        zIndex: getDesktopPanelExtensionZIndex({
          layoutMode: options?.layoutMode,
          fullscreenOffset: 2,
          defaultOffset: 2,
        }),
        pointerEvents: 'auto',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: isFirstVisiblePanel
            ? 'none'
            : '0 2px 6px rgba(17, 17, 17, 0.06)',
          borderLeft: isFirstVisiblePanel
            ? 0
            : '1px solid rgba(17, 17, 17, 0.08)',
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

const getDesktopPanelGroupSx = (
  options?: SidebarPanelExtensionRuntimeOptions
): PandaStyleProp => {
  const fullscreen = isFullscreenLayout(options)

  return {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    minHeight: 0,
    flex: '0 0 auto',
    pointerEvents: 'auto',
    ...(fullscreen
      ? {
          width: '100vw',
          maxWidth: '100vw',
          mx: 0,
        }
      : {
          width: 'auto',
        }),
  }
}

const getDesktopControlsSx = ({
  placement,
  sidebarOffset,
  layoutMode,
}: {
  placement: SidebarActionRailPlacement
  sidebarOffset: number
  layoutMode?: SidebarPanelExtensionRuntimeOptions['layoutMode']
}): PandaStyleProp => {
  if (placement === 'fixedBottomActionRow') {
    return {
      position: 'fixed',
      right: `${FIXED_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
      bottom: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      zIndex: getDesktopPanelExtensionZIndex({
        layoutMode,
        fullscreenOffset: 12,
        defaultOffset: 3,
      }),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    }
  }

  if (placement === 'fixedRightActionColumn') {
    return {
      position: 'fixed',
      top: `${FIXED_RIGHT_ACTION_COLUMN_TOP_PX}px`,
      right: `${FIXED_RIGHT_ACTION_COLUMN_RIGHT_PX}px`,
      zIndex: getDesktopPanelExtensionZIndex({
        layoutMode,
        fullscreenOffset: 12,
        defaultOffset: 3,
      }),
      display: 'flex',
      flexDirection: 'column',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    }
  }

  if (placement === 'sidebarEdgeActionColumn') {
    return {
      position: 'fixed',
      top: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      left: `${Math.max(0, sidebarOffset) + MAP_CONTROL_EDGE_GUTTER_PX}px`,
      zIndex: getDesktopPanelExtensionZIndex({
        layoutMode,
        fullscreenOffset: 12,
        defaultOffset: 3,
      }),
      display: 'flex',
      flexDirection: 'column',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    }
  }

  if (layoutMode === 'fullscreen') {
    return {
      position: 'fixed',
      right: `${FIXED_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
      bottom: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      zIndex: getDesktopPanelExtensionZIndex({
        layoutMode,
        fullscreenOffset: 12,
        defaultOffset: 3,
      }),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
      '&:empty': {
        display: 'none',
      },
    }
  }

  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    pt: 2,
    pl: 1,
    zIndex: getDesktopPanelExtensionZIndex({
      layoutMode,
      fullscreenOffset: 3,
      defaultOffset: 3,
    }),
    pointerEvents: 'auto',
  }
}

const getDesktopTabControlsSx = (
  layoutMode?: SidebarPanelExtensionRuntimeOptions['layoutMode']
): PandaStyleProp => {
  if (layoutMode === 'fullscreen') {
    return {
      position: 'fixed',
      right: `${FIXED_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
      bottom: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      zIndex: getDesktopPanelExtensionZIndex({
        layoutMode,
        fullscreenOffset: 12,
        defaultOffset: 3,
      }),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    }
  }

  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    pt: 2,
    pl: 1,
    zIndex: getDesktopPanelExtensionZIndex({
      layoutMode,
      fullscreenOffset: 3,
      defaultOffset: 3,
    }),
    pointerEvents: 'auto',
  }
}

const getMobileActionRailSx = (
  placement: SidebarActionRailPlacement,
  visible: boolean
): PandaStyleProp => {
  if (placement === 'fixedRightActionColumn') {
    return {
      position: 'fixed',
      top: `${FIXED_RIGHT_ACTION_COLUMN_TOP_PX}px`,
      right: `${FIXED_RIGHT_ACTION_COLUMN_RIGHT_PX}px`,
      zIndex: DEFAULT_FULLSCREEN_DRAWER_Z_INDEX + 12,
      display: 'flex',
      flexDirection: 'column',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
      ...getVisibilitySx(visible),
    }
  }

  return {
    position: 'fixed',
    right: `${MOBILE_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
    bottom: `${MOBILE_BOTTOM_ACTION_ROW_BOTTOM_PX}px`,
    zIndex: DEFAULT_FULLSCREEN_DRAWER_Z_INDEX + 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: `${ACTION_RAIL_GAP_PX}px`,
    pointerEvents: 'auto',
    ...getVisibilitySx(visible),
  }
}

const getMobileTabControlsSx =
  (visible: boolean): PandaStyleProp =>
  ({
    position: 'fixed',
    right: `${MOBILE_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
    bottom: `${MOBILE_BOTTOM_ACTION_ROW_BOTTOM_PX}px`,
    zIndex: DEFAULT_FULLSCREEN_DRAWER_Z_INDEX + 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: `${ACTION_RAIL_GAP_PX}px`,
    pointerEvents: 'auto',
    ...getVisibilitySx(visible),
  })

const shouldRenderActionRailInMobileTabRow = (
  placement: SidebarActionRailPlacement
) => placement === 'bottomActionRow'

const getVisibilitySx = (visible: boolean) =>
  visible
    ? {
        visibility: 'visible' as const,
      }
    : {
        visibility: 'hidden' as const,
        pointerEvents: 'none' as const,
      }

export const SidebarPanelExtensionTabRail = ({
  tabs,
  activeTabId,
  placement,
  orientation,
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
        flexDirection:
          orientation ?? (placement === 'desktop' ? 'column' : 'row'),
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
  visible = true,
}: {
  extensionId: SidebarPanelExtensionId
  options?: SidebarPanelExtensionRuntimeOptions
  variant: 'overlay' | 'stacked'
  visible?: boolean
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
      sx={{
        ...(variant === 'overlay'
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: DEFAULT_FULLSCREEN_DRAWER_Z_INDEX + 4,
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
            }),
        ...getVisibilitySx(visible),
      }}
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
  visible = true,
  desktopTabRail,
  mobileTabRail,
  suppressMobileStackedPanels = false,
  sx,
}: SidebarPanelExtensionProps) => {
  const isMobile = useIsMobile()
  const useMobileLayout = isMobile || options?.forceMobileLayout === true
  const fullscreen = isFullscreenLayout(options)
  const visiblePanels = getVisiblePanels(options)
  const mobileMode = options?.mobileMode ?? 'stacked'
  const actionRailPlacement = options?.actionRailPlacement ?? 'inside'
  const renderMobileActionRailInTabRow =
    shouldRenderActionRailInMobileTabRow(actionRailPlacement)
  const shouldRenderMobileTabControls =
    mobileTabRail != null || renderMobileActionRailInTabRow
  const shouldRenderMobileOverlayPanels =
    mobileMode !== 'stacked' || !suppressMobileStackedPanels
  const desktopPanels = visiblePanels.map((panelId, index) => (
    <SidebarPanelExtensionDesktopPanel
      key={panelId}
      extensionId={extensionId}
      isFirstVisiblePanel={index === 0}
      panelId={panelId}
      options={options}
    />
  ))

  if (useMobileLayout) {
    return (
      <>
        {shouldRenderMobileOverlayPanels && (
          <SidebarPanelExtensionMobilePanels
            extensionId={extensionId}
            options={options}
            variant="overlay"
            visible={visible}
          />
        )}
        {shouldRenderMobileTabControls && (
          <Box
            data-testid="sidebar-panel-extension-mobile-controls"
            data-sidebar-panel-extension-tab-placement="bottomActionRow"
            data-sidebar-panel-extension-control-placement={
              renderMobileActionRailInTabRow ? actionRailPlacement : undefined
            }
            sx={getMobileTabControlsSx(visible)}
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
            sx={getMobileActionRailSx(actionRailPlacement, visible)}
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
        {
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: fullscreen ? 0 : `${Math.max(0, sidebarOffset)}px`,
          right: fullscreen ? 0 : 'auto',
          display: 'flex',
          flexDirection: 'row',
          width: fullscreen ? '100vw' : 'auto',
          height: '100dvh',
          maxWidth: '100vw',
          minHeight: 0,
          overflow: fullscreen ? 'hidden' : 'visible',
          backgroundColor: fullscreen ? '#ffffff' : 'transparent',
          zIndex: getDesktopPanelExtensionZIndex({
            layoutMode: options?.layoutMode,
            fullscreenOffset: 2,
          }),
          pointerEvents: fullscreen ? 'auto' : 'none',
          ...getVisibilitySx(visible),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        data-testid="sidebar-panel-extension-desktop-panel-group"
        sx={getDesktopPanelGroupSx(options)}
      >
        {desktopPanels}
      </Box>
      {desktopTabRail != null && (
        <Box
          data-testid="sidebar-panel-extension-desktop-tab-controls"
          data-sidebar-panel-extension-tab-placement={
            fullscreen ? 'bottomActionRow' : 'sidebar-edge'
          }
          sx={getDesktopTabControlsSx(options?.layoutMode)}
        >
          {desktopTabRail}
        </Box>
      )}
      <Box
        data-testid="sidebar-panel-extension-desktop-controls"
        data-sidebar-panel-extension-control-placement={actionRailPlacement}
        sx={getDesktopControlsSx({
          placement: actionRailPlacement,
          sidebarOffset,
          layoutMode: options?.layoutMode,
        })}
      >
        <SidebarPanelExtensionActionRailSlot extensionId={extensionId} />
      </Box>
    </Box>
  )
}

export default SidebarPanelExtension
