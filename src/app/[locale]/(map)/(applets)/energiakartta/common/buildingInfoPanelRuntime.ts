import type { SidebarPanelExtensionRuntimeOptions } from '#/common/types/sidebar'

type GetEnergymapBuildingInfoPanelRuntimeOptionsInput = {
  hasBuildingInfo: boolean
  isBuildingInfoCollapsed: boolean
  isMobileLayout: boolean
  activeMode: 'twoPanel' | 'threePanel'
}

export const ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_GROUP_WIDTH_PX = 1440
export const ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_MIN_WIDTH_PX = 1360
export const ENERGYMAP_BUILDING_INFO_BASIC_DESKTOP_PANEL_WIDTH_PX = 760
export const ENERGYMAP_BUILDING_INFO_BASIC_DESKTOP_MIN_WIDTH_PX = 820

const BUILDING_INFO_RENOVATION_DESKTOP_GROUP_WIDTH = `${ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_GROUP_WIDTH_PX}px`
const BUILDING_INFO_BASIC_DESKTOP_PANEL_WIDTH = `${ENERGYMAP_BUILDING_INFO_BASIC_DESKTOP_PANEL_WIDTH_PX}px`

export const getEnergymapBuildingInfoDesktopMinWidthPx = (
  activeMode: GetEnergymapBuildingInfoPanelRuntimeOptionsInput['activeMode']
) =>
  activeMode === 'threePanel'
    ? ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_MIN_WIDTH_PX
    : ENERGYMAP_BUILDING_INFO_BASIC_DESKTOP_MIN_WIDTH_PX

export const getEnergymapBuildingInfoPanelRuntimeOptions = (
  input: GetEnergymapBuildingInfoPanelRuntimeOptionsInput
): SidebarPanelExtensionRuntimeOptions => {
  const {
    activeMode,
    hasBuildingInfo,
    isBuildingInfoCollapsed,
    isMobileLayout,
  } = input
  const isBuildingInfoExpanded = hasBuildingInfo && !isBuildingInfoCollapsed
  const isDesktopRenovationExpanded =
    isBuildingInfoExpanded && !isMobileLayout && activeMode === 'threePanel'
  const isDesktopBasicExpanded =
    isBuildingInfoExpanded && !isMobileLayout && activeMode === 'twoPanel'

  return {
    width: isBuildingInfoExpanded ? 'wide' : 'compact',
    chrome: isBuildingInfoExpanded ? 'hidden' : 'visible',
    panelLayout: 'single',
    visiblePanels: isBuildingInfoExpanded ? ['main'] : [],
    replaceBaseSidebar: isBuildingInfoExpanded,
    layoutMode: isDesktopRenovationExpanded ? 'fullscreen' : 'default',
    desktopMainPanelWidth: isDesktopRenovationExpanded
      ? '100%'
      : isDesktopBasicExpanded
        ? BUILDING_INFO_BASIC_DESKTOP_PANEL_WIDTH
        : undefined,
    desktopPanelGroupMaxWidth: isDesktopRenovationExpanded
      ? BUILDING_INFO_RENOVATION_DESKTOP_GROUP_WIDTH
      : undefined,
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
