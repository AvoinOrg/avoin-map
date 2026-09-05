import type {
  EnergymapBuildingInfoPanel,
  EnergymapBuildingInfoPanelId,
  EnergymapBuildingInfoSection,
} from './buildingInfo'

export type BuildingInfoDesktopMode = 'twoPanel' | 'threePanel'
export type BuildingInfoTabId = 'basic' | 'renovation'

export type EnergymapBuildingInfoDesktopPanelRegion = {
  id: string
  panel: EnergymapBuildingInfoPanel
  sections: EnergymapBuildingInfoSection[]
  targetWidthPx: number
}

export type EnergymapBuildingInfoDesktopPanelRow = {
  kind: 'panels'
  id: 'basic' | 'renovationTop'
  regions: EnergymapBuildingInfoDesktopPanelRegion[]
  contentWidthPx: number
}

export type EnergymapBuildingInfoDesktopComparisonRow = {
  kind: 'comparison'
  id: 'renovationComparison'
  panel: EnergymapBuildingInfoPanel
  section: EnergymapBuildingInfoSection
  contentWidthPx: number
}

export type EnergymapBuildingInfoDesktopRow =
  | EnergymapBuildingInfoDesktopPanelRow
  | EnergymapBuildingInfoDesktopComparisonRow

export type EnergymapBuildingInfoTabTopology = {
  id: BuildingInfoTabId
  mode: BuildingInfoDesktopMode
  panels: EnergymapBuildingInfoPanel[]
  desktopRows: EnergymapBuildingInfoDesktopRow[]
  desktopContentWidthPx: number
}

export type EnergymapBuildingInfoPanelTopology = {
  availableTabs: EnergymapBuildingInfoTabTopology[]
  signature: string
  hasTabRail: boolean
}

const PANEL_IDS_BY_TAB_ID: Record<
  BuildingInfoTabId,
  readonly EnergymapBuildingInfoPanelId[]
> = {
  basic: ['energyConsumption', 'buildingDetails'],
  renovation: [
    'energyConsumption',
    'renovationRecommendations',
    'buildingDetails',
  ],
}

const TAB_ID_BY_MODE: Record<BuildingInfoDesktopMode, BuildingInfoTabId> = {
  twoPanel: 'basic',
  threePanel: 'renovation',
}

const MODE_BY_TAB_ID: Record<BuildingInfoTabId, BuildingInfoDesktopMode> = {
  basic: 'twoPanel',
  renovation: 'threePanel',
}

const BASIC_PANEL_TARGET_WIDTH_PX = 380
const RENOVATION_PANEL_TARGET_WIDTH_PX: Record<
  EnergymapBuildingInfoPanelId,
  number
> = {
  energyConsumption: 440,
  renovationRecommendations: 560,
  buildingDetails: 440,
}
const RENOVATION_COMPARISON_WIDTH_PX = 1440

const getOrderedPanels = ({
  panelIds,
  panelsById,
}: {
  panelIds: readonly EnergymapBuildingInfoPanelId[]
  panelsById: Map<EnergymapBuildingInfoPanelId, EnergymapBuildingInfoPanel>
}) =>
  panelIds
    .map((panelId) => panelsById.get(panelId))
    .filter((panel): panel is EnergymapBuildingInfoPanel => panel != null)

const sumRegionWidths = (regions: EnergymapBuildingInfoDesktopPanelRegion[]) =>
  regions.reduce((sum, region) => sum + region.targetWidthPx, 0)

const getTopologySignature = (
  panels: EnergymapBuildingInfoPanel[],
  availableTabs: EnergymapBuildingInfoTabTopology[]
) =>
  [
    panels
      .map(
        (panel) =>
          `${panel.id}:${panel.sections
            .map((section) => section.id)
            .join(',')}`
      )
      .join(';'),
    availableTabs.map((tab) => tab.id).join(','),
  ].join('|')

export const deriveEnergymapBuildingInfoPanelTopology = (
  panels: EnergymapBuildingInfoPanel[] | null | undefined
): EnergymapBuildingInfoPanelTopology => {
  // Normalized panels are the availability authority. The section-length
  // check is only a defensive structural guard for callers outside that model
  // boundary.
  const availablePanels = (panels ?? []).filter(
    (panel) => panel.sections.length > 0
  )
  const panelsById = new Map(
    availablePanels.map((panel) => [panel.id, panel] as const)
  )
  const energyPanel = panelsById.get('energyConsumption')
  const renovationPanel = panelsById.get('renovationRecommendations')
  const buildingPanel = panelsById.get('buildingDetails')
  const availableTabs: EnergymapBuildingInfoTabTopology[] = []

  if (energyPanel != null || buildingPanel != null) {
    const basicPanels = getOrderedPanels({
      panelIds: PANEL_IDS_BY_TAB_ID.basic,
      panelsById,
    })
    const basicRegions = basicPanels.map((panel) => ({
      id: `basic-${panel.id}`,
      panel,
      sections: panel.sections,
      targetWidthPx: BASIC_PANEL_TARGET_WIDTH_PX,
    }))
    const basicRow: EnergymapBuildingInfoDesktopPanelRow = {
      kind: 'panels',
      id: 'basic',
      regions: basicRegions,
      contentWidthPx: sumRegionWidths(basicRegions),
    }

    availableTabs.push({
      id: 'basic',
      mode: 'twoPanel',
      panels: basicPanels,
      desktopRows: [basicRow],
      desktopContentWidthPx: basicRow.contentWidthPx,
    })
  }

  if (renovationPanel != null) {
    const renovationPanels = getOrderedPanels({
      panelIds: PANEL_IDS_BY_TAB_ID.renovation,
      panelsById,
    })
    const presentedEnergyPanel = renovationPanels.find(
      (panel) => panel.id === 'energyConsumption'
    )
    const presentedRenovationPanel = renovationPanels.find(
      (panel) => panel.id === 'renovationRecommendations'
    )
    const presentedBuildingPanel = renovationPanels.find(
      (panel) => panel.id === 'buildingDetails'
    )
    const energyTopSections = presentedEnergyPanel?.sections ?? []
    const renovationTopSections =
      presentedRenovationPanel?.sections.filter(
        (section) => section.id !== 'scenarioComparison'
      ) ?? []
    const buildingSections = presentedBuildingPanel?.sections ?? []
    const topRegions: EnergymapBuildingInfoDesktopPanelRegion[] = [
      ...(presentedEnergyPanel == null || energyTopSections.length === 0
        ? []
        : [
            {
              id: 'renovation-energyConsumption',
              panel: presentedEnergyPanel,
              sections: energyTopSections,
              targetWidthPx: RENOVATION_PANEL_TARGET_WIDTH_PX.energyConsumption,
            },
          ]),
      ...(presentedRenovationPanel == null || renovationTopSections.length === 0
        ? []
        : [
            {
              id: 'renovation-renovationRecommendations',
              panel: presentedRenovationPanel,
              sections: renovationTopSections,
              targetWidthPx:
                RENOVATION_PANEL_TARGET_WIDTH_PX.renovationRecommendations,
            },
          ]),
      ...(presentedBuildingPanel == null || buildingSections.length === 0
        ? []
        : [
            {
              id: 'renovation-buildingDetails',
              panel: presentedBuildingPanel,
              sections: buildingSections,
              targetWidthPx: RENOVATION_PANEL_TARGET_WIDTH_PX.buildingDetails,
            },
          ]),
    ]
    const comparisonSection = presentedRenovationPanel?.sections.find(
      (section) => section.id === 'scenarioComparison'
    )
    const desktopRows: EnergymapBuildingInfoDesktopRow[] = []
    const topRowContentWidthPx =
      comparisonSection == null
        ? sumRegionWidths(topRegions)
        : RENOVATION_COMPARISON_WIDTH_PX

    if (topRegions.length > 0) {
      desktopRows.push({
        kind: 'panels',
        id: 'renovationTop',
        regions: topRegions,
        contentWidthPx: topRowContentWidthPx,
      })
    }

    if (comparisonSection != null && presentedRenovationPanel != null) {
      desktopRows.push({
        kind: 'comparison',
        id: 'renovationComparison',
        panel: presentedRenovationPanel,
        section: comparisonSection,
        contentWidthPx: RENOVATION_COMPARISON_WIDTH_PX,
      })
    }

    availableTabs.push({
      id: 'renovation',
      mode: 'threePanel',
      panels: renovationPanels,
      desktopRows,
      desktopContentWidthPx: Math.max(
        ...desktopRows.map((row) => row.contentWidthPx)
      ),
    })
  }

  return {
    availableTabs,
    signature: getTopologySignature(availablePanels, availableTabs),
    hasTabRail: availableTabs.length >= 2,
  }
}

export const getBuildingInfoPanelIds = (mode: BuildingInfoDesktopMode) =>
  PANEL_IDS_BY_TAB_ID[TAB_ID_BY_MODE[mode]]

export const getBuildingInfoTabPanelIds = (tabId: BuildingInfoTabId) =>
  PANEL_IDS_BY_TAB_ID[tabId]

export const getBuildingInfoTabIdForMode = (mode: BuildingInfoDesktopMode) =>
  TAB_ID_BY_MODE[mode]

export const getBuildingInfoModeForTabId = (tabId: BuildingInfoTabId) =>
  MODE_BY_TAB_ID[tabId]

export const isBuildingInfoTabId = (
  tabId?: string
): tabId is BuildingInfoTabId => tabId === 'basic' || tabId === 'renovation'

export const resolveEnergymapBuildingInfoTab = ({
  topology,
  requestedTabId,
}: {
  topology: EnergymapBuildingInfoPanelTopology
  requestedTabId?: BuildingInfoTabId
}) =>
  topology.availableTabs.find((tab) => tab.id === requestedTabId) ??
  topology.availableTabs[0]

export const resolveEnergymapBuildingInfoMode = ({
  topology,
  requestedMode,
}: {
  topology: EnergymapBuildingInfoPanelTopology
  requestedMode?: BuildingInfoDesktopMode
}) =>
  resolveEnergymapBuildingInfoTab({
    topology,
    requestedTabId:
      requestedMode == null
        ? undefined
        : getBuildingInfoTabIdForMode(requestedMode),
  })?.mode
