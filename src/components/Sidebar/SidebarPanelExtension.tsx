import React from 'react'

import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { Box, toSxArray } from '#/common/style/theme/system'
import type { AppSxProps, AppTheme } from '#/common/style/theme/system'
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
  visible?: boolean
  desktopTabRail?: React.ReactNode
  mobileTabRail?: React.ReactNode
  suppressMobileStackedPanels?: boolean
  sx?: AppSxProps
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
const FULLSCREEN_SINGLE_PANEL_WIDTH = '100vw'
const FULLSCREEN_DOUBLE_PANEL_WIDTH = '50vw'
const FULLSCREEN_TRIPLE_PANEL_WIDTH = 'calc(100vw / 3)'
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
const MOBILE_PANEL_EXTENSION_CONTROLS_FULLSCREEN_OFFSET = 14
const VIEWPORT_OVERFLOW_EPSILON_PX = 0.5
const VIEWPORT_OVERFLOW_TAB_CONTROLS_RIGHT_PX =
  MAP_CONTROL_EDGE_GUTTER_PX +
  SIDEBAR_TOGGLE_BUTTON_SIZE_PX +
  ACTION_RAIL_GAP_PX
const VIEWPORT_OVERFLOW_PAGE_CONTROLS_RIGHT_PX =
  VIEWPORT_OVERFLOW_TAB_CONTROLS_RIGHT_PX +
  SIDEBAR_TOGGLE_BUTTON_SIZE_PX +
  ACTION_RAIL_GAP_PX

const PANEL_ORDER: SidebarPanelId[] = ['main', 'secondary', 'tertiary']

const getFullscreenPanelWidth = (visiblePanelCount: number) => {
  if (visiblePanelCount === 2) {
    return FULLSCREEN_DOUBLE_PANEL_WIDTH
  }

  if (visiblePanelCount === 3) {
    return FULLSCREEN_TRIPLE_PANEL_WIDTH
  }

  return FULLSCREEN_SINGLE_PANEL_WIDTH
}

const isFullscreenLayout = (
  options?: SidebarPanelExtensionRuntimeOptions
) => options?.layoutMode === 'fullscreen'

const getMapButtonsZIndex = (theme: AppTheme) =>
  theme.zIndex.mapButtons ?? DEFAULT_MAP_BUTTONS_Z_INDEX

const getFullscreenDrawerZIndex = (theme: AppTheme) =>
  Math.max(
    theme.zIndex.drawer ?? DEFAULT_FULLSCREEN_DRAWER_Z_INDEX,
    getMapButtonsZIndex(theme) + 100
  )

const getDesktopPanelExtensionZIndex = ({
  theme,
  layoutMode,
  fullscreenOffset = 0,
  defaultOffset = 0,
}: {
  theme: AppTheme
  layoutMode?: SidebarPanelExtensionRuntimeOptions['layoutMode']
  fullscreenOffset?: number
  defaultOffset?: number
}) =>
  layoutMode === 'fullscreen'
    ? getFullscreenDrawerZIndex(theme) + fullscreenOffset
    : getMapButtonsZIndex(theme) -
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
  if (isFullscreenLayout(options)) {
    return getFullscreenPanelWidth(getVisiblePanels(options).length)
  }

  if (options?.desktopMainPanelWidth != null) {
    return options.desktopMainPanelWidth
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
  visiblePanelCount,
}: {
  panelId: SidebarPanelId
  options?: SidebarPanelExtensionRuntimeOptions
  visiblePanelCount: number
}) => {
  if (isFullscreenLayout(options)) {
    return getFullscreenPanelWidth(visiblePanelCount)
  }

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

const getDesktopPanelLayout = (
  options?: SidebarPanelExtensionRuntimeOptions
) => {
  const visiblePanels = getVisiblePanels(options)
  const panelWidths = visiblePanels.map((panelId) => ({
    panelId,
    width: getSidebarPanelExtensionPanelWidth({
      panelId,
      options,
      visiblePanelCount: visiblePanels.length,
    }),
  }))
  const panelGroupWidth = isFullscreenLayout(options)
    ? visiblePanels.length > 0
      ? '100vw'
      : '0px'
    : panelWidths.length > 1
      ? `calc(${panelWidths.map(({ width }) => width).join(' + ')})`
      : (panelWidths[0]?.width ?? '0px')

  return { panelGroupWidth, panelWidths, visiblePanels }
}

export const getSidebarPanelExtensionPageControlsRight = ({
  options,
  sidebarOffset = 0,
}: {
  options?: SidebarPanelExtensionRuntimeOptions
  sidebarOffset?: number
}) => {
  const { panelGroupWidth, visiblePanels } = getDesktopPanelLayout(options)

  if (isFullscreenLayout(options) && visiblePanels.length > 0) {
    return `${MAP_CONTROL_EDGE_GUTTER_PX}px`
  }

  const panelGroupRight = `min(100vw, calc(${Math.max(
    0,
    sidebarOffset
  )}px + ${panelGroupWidth}))`

  return `calc(100vw - ${panelGroupRight} + ${MAP_CONTROL_EDGE_GUTTER_PX}px)`
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
): AppSxProps | undefined =>
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
  width,
}: {
  extensionId: SidebarPanelExtensionId
  isFirstVisiblePanel: boolean
  panelId: SidebarPanelId
  options?: SidebarPanelExtensionRuntimeOptions
  width: string
}) => {
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
        minWidth: 0,
        height: '100%',
        minHeight: 0,
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
          data-testid={`sidebar-panel-extension-desktop-panel-${panelId}-scroll-host`}
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
): AppSxProps => (theme: AppTheme) => {
  const fullscreen = isFullscreenLayout(options)

  return {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    minHeight: 0,
    flex: '0 0 auto',
    pointerEvents: 'auto',
    zIndex: getDesktopPanelExtensionZIndex({
      theme,
      layoutMode: options?.layoutMode,
      fullscreenOffset: 2,
      defaultOffset: 2,
    }),
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
}): AppSxProps => {
  if (placement === 'fixedBottomActionRow') {
    return (theme: AppTheme) => ({
      position: 'fixed',
      right: `${FIXED_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
      bottom: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      zIndex: getDesktopPanelExtensionZIndex({
        theme,
        layoutMode,
        fullscreenOffset: 12,
        defaultOffset: 3,
      }),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    })
  }

  if (placement === 'fixedRightActionColumn') {
    return (theme: AppTheme) => ({
      position: 'fixed',
      top: `${FIXED_RIGHT_ACTION_COLUMN_TOP_PX}px`,
      right: `${FIXED_RIGHT_ACTION_COLUMN_RIGHT_PX}px`,
      zIndex: getDesktopPanelExtensionZIndex({
        theme,
        layoutMode,
        fullscreenOffset: 12,
        defaultOffset: 3,
      }),
      display: 'flex',
      flexDirection: 'column',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    })
  }

  if (placement === 'sidebarEdgeActionColumn') {
    return (theme: AppTheme) => ({
      position: 'fixed',
      top: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      left: `${Math.max(0, sidebarOffset) + MAP_CONTROL_EDGE_GUTTER_PX}px`,
      zIndex: getDesktopPanelExtensionZIndex({
        theme,
        layoutMode,
        fullscreenOffset: 12,
        defaultOffset: 3,
      }),
      display: 'flex',
      flexDirection: 'column',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    })
  }

  if (layoutMode === 'fullscreen') {
    return (theme: AppTheme) => ({
      position: 'fixed',
      right: `${FIXED_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
      bottom: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      zIndex: getDesktopPanelExtensionZIndex({
        theme,
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
    })
  }

  return (theme: AppTheme) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    pt: 2,
    pl: 1,
    zIndex: getDesktopPanelExtensionZIndex({
      theme,
      layoutMode,
      fullscreenOffset: 3,
      defaultOffset: 3,
    }),
    pointerEvents: 'auto',
  })
}

const getDesktopTabControlsSx = (
  layoutMode?: SidebarPanelExtensionRuntimeOptions['layoutMode'],
  viewportOverflowFallback = false
): AppSxProps => {
  if (layoutMode === 'fullscreen') {
    return (theme: AppTheme) => ({
      position: 'fixed',
      right: `${FIXED_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
      bottom: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      zIndex: getDesktopPanelExtensionZIndex({
        theme,
        layoutMode,
        fullscreenOffset: 12,
        defaultOffset: 3,
      }),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    })
  }

  if (viewportOverflowFallback) {
    return (theme: AppTheme) => ({
      position: 'fixed',
      top: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      right: `${VIEWPORT_OVERFLOW_TAB_CONTROLS_RIGHT_PX}px`,
      maxHeight: `calc(100dvh - ${MAP_CONTROL_EDGE_GUTTER_PX * 2}px)`,
      overflowY: 'auto',
      zIndex: getDesktopPanelExtensionZIndex({
        theme,
        layoutMode,
        fullscreenOffset: 3,
        defaultOffset: 3,
      }),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      pointerEvents: 'auto',
    })
  }

  return (theme: AppTheme) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    pt: 2,
    pl: 1,
    zIndex: getDesktopPanelExtensionZIndex({
      theme,
      layoutMode,
      fullscreenOffset: 3,
      defaultOffset: 3,
    }),
    pointerEvents: 'auto',
  })
}

const getMobileActionRailSx = (
  placement: SidebarActionRailPlacement,
  visible: boolean
): AppSxProps => {
  if (placement === 'fixedRightActionColumn') {
    return (theme: AppTheme) => ({
      position: 'fixed',
      top: `${FIXED_RIGHT_ACTION_COLUMN_TOP_PX}px`,
      right: `${FIXED_RIGHT_ACTION_COLUMN_RIGHT_PX}px`,
      zIndex:
        getFullscreenDrawerZIndex(theme) +
        MOBILE_PANEL_EXTENSION_CONTROLS_FULLSCREEN_OFFSET,
      display: 'flex',
      flexDirection: 'column',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
      ...getVisibilitySx(visible),
    })
  }

  return (theme: AppTheme) => ({
    position: 'fixed',
    right: `${MOBILE_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
    bottom: `${MOBILE_BOTTOM_ACTION_ROW_BOTTOM_PX}px`,
    zIndex:
      getFullscreenDrawerZIndex(theme) +
      MOBILE_PANEL_EXTENSION_CONTROLS_FULLSCREEN_OFFSET,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: `${ACTION_RAIL_GAP_PX}px`,
    pointerEvents: 'auto',
    ...getVisibilitySx(visible),
  })
}

const getMobileTabControlsSx =
  (visible: boolean): AppSxProps =>
  (theme: AppTheme) => ({
    position: 'fixed',
    right: `${MOBILE_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
    bottom: `${MOBILE_BOTTOM_ACTION_ROW_BOTTOM_PX}px`,
    zIndex:
      getFullscreenDrawerZIndex(theme) +
      MOBILE_PANEL_EXTENSION_CONTROLS_FULLSCREEN_OFFSET,
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
      sx={(theme) =>
        ({
          ...(variant === 'overlay'
            ? {
                position: 'fixed',
                inset: 0,
                zIndex: getFullscreenDrawerZIndex(theme) + 4,
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
        })
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
  visible = true,
  desktopTabRail,
  mobileTabRail,
  suppressMobileStackedPanels = false,
  sx,
}: SidebarPanelExtensionProps) => {
  const isMobile = useIsMobile()
  const useMobileLayout = isMobile || options?.forceMobileLayout === true
  const fullscreen = isFullscreenLayout(options)
  const { panelWidths } = getDesktopPanelLayout(options)
  const desktopPanelGroupRef = React.useRef<HTMLDivElement>(null)
  const [measuredDesktopViewportOverflow, setMeasuredDesktopViewportOverflow] =
    React.useState(false)
  const mobileMode = options?.mobileMode ?? 'stacked'
  const actionRailPlacement = options?.actionRailPlacement ?? 'inside'
  const pageControlsRight = getSidebarPanelExtensionPageControlsRight({
    options,
    sidebarOffset,
  })
  const renderMobileActionRailInTabRow =
    shouldRenderActionRailInMobileTabRow(actionRailPlacement)
  const shouldRenderMobileTabControls =
    mobileTabRail != null || renderMobileActionRailInTabRow
  const shouldRenderMobileOverlayPanels =
    mobileMode !== 'stacked' || !suppressMobileStackedPanels
  const shouldMeasureDesktopViewportOverflow =
    !useMobileLayout &&
    !fullscreen &&
    visible &&
    desktopTabRail != null &&
    panelWidths.length > 0
  const desktopViewportOverflow =
    shouldMeasureDesktopViewportOverflow && measuredDesktopViewportOverflow
  const resolvedPageControlsRight = desktopViewportOverflow
    ? `${VIEWPORT_OVERFLOW_PAGE_CONTROLS_RIGHT_PX}px`
    : pageControlsRight
  const desktopPanels = panelWidths.map(({ panelId, width }, index) => (
    <SidebarPanelExtensionDesktopPanel
      key={panelId}
      extensionId={extensionId}
      isFirstVisiblePanel={index === 0}
      panelId={panelId}
      options={options}
      width={width}
    />
  ))

  React.useEffect(() => {
    if (!shouldMeasureDesktopViewportOverflow) {
      setMeasuredDesktopViewportOverflow(false)
      return
    }

    const panelGroup = desktopPanelGroupRef.current

    if (panelGroup == null) {
      setMeasuredDesktopViewportOverflow(false)
      return
    }

    const measureViewportOverflow = () => {
      const nextViewportOverflow =
        panelGroup.getBoundingClientRect().right >
        window.innerWidth + VIEWPORT_OVERFLOW_EPSILON_PX

      setMeasuredDesktopViewportOverflow((currentViewportOverflow) =>
        currentViewportOverflow === nextViewportOverflow
          ? currentViewportOverflow
          : nextViewportOverflow
      )
    }

    measureViewportOverflow()
    window.addEventListener('resize', measureViewportOverflow)

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measureViewportOverflow)
    resizeObserver?.observe(panelGroup)

    return () => {
      window.removeEventListener('resize', measureViewportOverflow)
      resizeObserver?.disconnect()
    }
  }, [shouldMeasureDesktopViewportOverflow, sidebarOffset])

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
      data-sidebar-panel-extension-viewport-overflow={
        desktopViewportOverflow ? 'true' : undefined
      }
      sx={[
        (theme: AppTheme) => ({
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
            theme,
            layoutMode: options?.layoutMode,
            fullscreenOffset: 2,
          }),
          pointerEvents: fullscreen ? 'auto' : 'none',
          '--sidebar-panel-extension-page-controls-position': 'fixed',
          '--sidebar-panel-extension-page-controls-top': `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
          '--sidebar-panel-extension-page-controls-right': resolvedPageControlsRight,
          '--sidebar-panel-extension-page-controls-padding-inline': 0,
          '--sidebar-panel-extension-page-controls-padding-block': 0,
          '--sidebar-panel-extension-page-controls-background': 'transparent',
          '--sidebar-panel-extension-page-controls-border': 0,
          '--sidebar-panel-extension-page-controls-z-index': 3,
          ...getVisibilitySx(visible),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        ref={desktopPanelGroupRef}
        data-testid="sidebar-panel-extension-desktop-panel-group"
        sx={getDesktopPanelGroupSx(options)}
      >
        {desktopPanels}
      </Box>
      {desktopTabRail != null && (
        <Box
          data-testid="sidebar-panel-extension-desktop-tab-controls"
          data-sidebar-panel-extension-tab-placement={
            fullscreen
              ? 'bottomActionRow'
              : desktopViewportOverflow
                ? 'viewport-edge'
                : 'sidebar-edge'
          }
          sx={getDesktopTabControlsSx(
            options?.layoutMode,
            desktopViewportOverflow
          )}
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
