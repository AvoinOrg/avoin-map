import type { SidebarPanelExtensionRuntimeOptions } from '#/common/types/sidebar'

type GetEnergymapBuildingInfoPanelRuntimeOptionsInput = {
  hasBuildingInfo: boolean
  isBuildingInfoCollapsed: boolean
  isMobileLayout: boolean
  isDesktopFullscreenFallback?: boolean
  desktopContentWidthPx?: number
}

export const ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_GROUP_WIDTH_PX = 1440
export const ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_PANEL_WIDTH_PX =
  ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_GROUP_WIDTH_PX
export const ENERGYMAP_BUILDING_INFO_BASIC_DESKTOP_PANEL_WIDTH_PX = 760
export const ENERGYMAP_BUILDING_INFO_DESKTOP_TAB_RAIL_RESERVE_PX = 68
export const ENERGYMAP_BUILDING_INFO_DESKTOP_MAP_CONTROLS_RESERVE_PX = 140
export const ENERGYMAP_BUILDING_INFO_DESKTOP_COMFORT_GAP_PX = 32
export const ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_MIN_WIDTH_PX =
  ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_PANEL_WIDTH_PX +
  ENERGYMAP_BUILDING_INFO_DESKTOP_TAB_RAIL_RESERVE_PX +
  ENERGYMAP_BUILDING_INFO_DESKTOP_MAP_CONTROLS_RESERVE_PX +
  ENERGYMAP_BUILDING_INFO_DESKTOP_COMFORT_GAP_PX
export const ENERGYMAP_BUILDING_INFO_BASIC_DESKTOP_MIN_WIDTH_PX =
  ENERGYMAP_BUILDING_INFO_BASIC_DESKTOP_PANEL_WIDTH_PX +
  ENERGYMAP_BUILDING_INFO_DESKTOP_TAB_RAIL_RESERVE_PX +
  ENERGYMAP_BUILDING_INFO_DESKTOP_MAP_CONTROLS_RESERVE_PX +
  ENERGYMAP_BUILDING_INFO_DESKTOP_COMFORT_GAP_PX

export const getEnergymapBuildingInfoDesktopMinWidthPx = (
  desktopContentWidthPx: number,
  hasTabRail = true
) =>
  desktopContentWidthPx +
  (hasTabRail ? ENERGYMAP_BUILDING_INFO_DESKTOP_TAB_RAIL_RESERVE_PX : 0) +
  ENERGYMAP_BUILDING_INFO_DESKTOP_MAP_CONTROLS_RESERVE_PX +
  ENERGYMAP_BUILDING_INFO_DESKTOP_COMFORT_GAP_PX

export const getEnergymapBuildingInfoPanelRuntimeOptions = (
  input: GetEnergymapBuildingInfoPanelRuntimeOptionsInput
): SidebarPanelExtensionRuntimeOptions => {
  const {
    desktopContentWidthPx,
    hasBuildingInfo,
    isBuildingInfoCollapsed,
    isDesktopFullscreenFallback = false,
    isMobileLayout,
  } = input
  const isBuildingInfoExpanded = hasBuildingInfo && !isBuildingInfoCollapsed
  const isDesktopExpanded = isBuildingInfoExpanded && !isMobileLayout
  const useDesktopFullscreenFallback =
    isDesktopExpanded && isDesktopFullscreenFallback
  const desktopMainPanelWidth =
    !isDesktopExpanded ||
    useDesktopFullscreenFallback ||
    desktopContentWidthPx == null
      ? undefined
      : `${desktopContentWidthPx}px`

  return {
    width: isBuildingInfoExpanded ? 'wide' : 'compact',
    chrome: isBuildingInfoExpanded ? 'hidden' : 'visible',
    panelLayout: 'single',
    visiblePanels: isBuildingInfoExpanded ? ['main'] : [],
    replaceBaseSidebar: isBuildingInfoExpanded,
    layoutMode: useDesktopFullscreenFallback ? 'fullscreen' : 'default',
    desktopMainPanelWidth,
    forceMobileLayout: isMobileLayout,
    activePanel: 'main',
    mobileMode: 'stacked',
    mobileStackPlacement: 'after',
    actionRailPlacement: hasBuildingInfo
      ? isMobileLayout
        ? 'bottomActionRow'
        : isBuildingInfoCollapsed
          ? 'sidebarEdgeActionColumn'
          : 'inside'
      : 'inside',
  }
}
