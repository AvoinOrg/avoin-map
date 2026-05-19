import type { SidebarPanelExtensionRuntimeOptions } from '#/common/types/sidebar'

type GetEnergymapBuildingInfoPanelRuntimeOptionsInput = {
  hasBuildingInfo: boolean
  isBuildingInfoCollapsed: boolean
  isMobile: boolean
  activeMode: 'twoPanel' | 'threePanel'
}

const BUILDING_INFO_BASIC_DESKTOP_PANEL_WIDTH = '760px'

export const getEnergymapBuildingInfoPanelRuntimeOptions = (
  input: GetEnergymapBuildingInfoPanelRuntimeOptionsInput
): SidebarPanelExtensionRuntimeOptions => {
  const { activeMode, hasBuildingInfo, isBuildingInfoCollapsed, isMobile } =
    input
  const isBuildingInfoExpanded = hasBuildingInfo && !isBuildingInfoCollapsed
  const isDesktopRenovationExpanded =
    isBuildingInfoExpanded && !isMobile && activeMode === 'threePanel'
  const isDesktopBasicExpanded =
    isBuildingInfoExpanded && !isMobile && activeMode === 'twoPanel'

  return {
    width: isBuildingInfoExpanded ? 'wide' : 'compact',
    chrome: isBuildingInfoExpanded ? 'hidden' : 'visible',
    panelLayout: 'single',
    visiblePanels: isBuildingInfoExpanded ? ['main'] : [],
    replaceBaseSidebar: isBuildingInfoExpanded,
    layoutMode: isDesktopRenovationExpanded ? 'fullscreen' : 'default',
    desktopMainPanelWidth: isDesktopBasicExpanded
      ? BUILDING_INFO_BASIC_DESKTOP_PANEL_WIDTH
      : undefined,
    activePanel: 'main',
    mobileMode: 'stacked',
    mobileStackPlacement: 'after',
    actionRailPlacement: hasBuildingInfo
      ? isMobile
        ? 'bottomActionRow'
        : isBuildingInfoCollapsed
          ? 'sidebarEdgeActionColumn'
          : 'inside'
      : 'inside',
  }
}
