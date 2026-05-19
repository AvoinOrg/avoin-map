import type { SidebarPanelExtensionRuntimeOptions } from '#/common/types/sidebar'

type GetEnergymapBuildingInfoPanelRuntimeOptionsInput = {
  hasBuildingInfo: boolean
  isBuildingInfoCollapsed: boolean
  isMobile: boolean
}

export const getEnergymapBuildingInfoPanelRuntimeOptions = (
  input: GetEnergymapBuildingInfoPanelRuntimeOptionsInput
): SidebarPanelExtensionRuntimeOptions => {
  const { hasBuildingInfo, isBuildingInfoCollapsed, isMobile } = input
  const isBuildingInfoExpanded = hasBuildingInfo && !isBuildingInfoCollapsed

  return {
    width: isBuildingInfoExpanded ? 'wide' : 'compact',
    chrome: isBuildingInfoExpanded ? 'hidden' : 'visible',
    panelLayout: 'single',
    visiblePanels: isBuildingInfoExpanded ? ['main'] : [],
    activePanel: 'main',
    mobileMode: 'stacked',
    mobileStackPlacement: 'after',
    actionRailPlacement: hasBuildingInfo
      ? isMobile
        ? 'bottomActionRow'
        : 'fixedRightActionColumn'
      : 'inside',
  }
}
