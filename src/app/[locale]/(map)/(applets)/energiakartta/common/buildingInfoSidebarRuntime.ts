import type { SidebarPanelExtensionRuntimeOptions } from '#/common/types/sidebar'

type GetEnergymapBuildingInfoSidebarRuntimeOptionsInput = {
  hasBuildingInfo: boolean
  isBuildingInfoCollapsed: boolean
  isMobile: boolean
}

export const getEnergymapBuildingInfoSidebarRuntimeOptions = (
  input: GetEnergymapBuildingInfoSidebarRuntimeOptionsInput
): SidebarPanelExtensionRuntimeOptions => {
  const { hasBuildingInfo, isBuildingInfoCollapsed, isMobile } = input
  const isBuildingInfoExpanded = hasBuildingInfo && !isBuildingInfoCollapsed

  return {
    width: isBuildingInfoExpanded ? 'wide' : 'compact',
    chrome: isBuildingInfoExpanded ? 'hidden' : 'visible',
    panelLayout: 'single',
    visiblePanels: ['main'],
    activePanel: 'main',
    mainPanelVisible: true,
    mobileMode: 'stacked',
    mobileStackPlacement: 'after',
    actionRailPlacement: hasBuildingInfo
      ? isMobile
        ? 'bottomActionRow'
        : 'fixedRightActionColumn'
      : 'inside',
  }
}
