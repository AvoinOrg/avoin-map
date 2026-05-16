'use client'

import React from 'react'
import { Box, Tooltip, Typography, useMediaQuery } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { useParams } from 'next/navigation'

import { MAP_BOTTOM_LEFT_FLOATING_CONTROLS_SLOT } from '#/common/constants/map'
import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { useMapStore, useUIStore } from '#/common/store'
import {
  LayerToggleRow,
  LayerToggleRowAccordion,
} from '#/components/common/LayerToggleRow'
import SquishedSwitchWithLabel from '#/components/common/SquishedSwitchWithLabel'
import TText from '#/components/common/TText'
import { IntoSlot } from '#/components/context/slotsContext'
import {
  IntoSidebarActionRailSlot,
  IntoSidebarFooterSlot,
  IntoSidebarHeaderSlot,
  IntoSidebarPanelSlot,
  SidebarContentBox,
  useSidebarBoundaryRuntimeOptions,
} from '#/components/Sidebar'
import type { SidebarRuntimeOptions } from '#/components/Sidebar'
import EnergyCertificateClassControls from '../components/EnergyCertificateClassControls'
import EnergyClassesAccordionContent from '../components/EnergyClassesAccordionContent'
import {
  BuildingInfoActionRail,
  BuildingInfoDesktopChrome,
  BuildingInfoMobileActionRow,
  BuildingInfoMobileChrome,
  BuildingInfoPanelSlotContent,
  getBuildingInfoPanelIds,
} from '../components/BuildingInfoSidebar'
import type { BuildingInfoDesktopMode } from '../components/BuildingInfoSidebar'
import {
  createEnergymapBuildingInfoPanels,
  type EnergymapBuildingInfoPanelId,
} from '../common/buildingInfo'
import {
  areEnergymapSelectedBuildingsEqual,
  toEnergymapSelectedBuilding,
} from '../common/utils'
import {
  ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID,
  ENERGYMAP_BUILDING_POLYGONS_LAYER_IDS,
  ENERGYMAP_SHARED_BUILDING_LAYER_IDS,
  combineMapFilters,
  getEnergymapBuildingFilter,
} from '../layers/buildingPolygonsLayerConf'
import {
  ENERGYMAP_ENERGY_CERTIFICATE_FILL_OPACITY,
  ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID,
  ENERGYMAP_ENERGY_CERTIFICATE_LAYER_IDS,
  ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID,
  ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_OPACITY,
  getEnergyCertificateFillColorExpression,
} from '../layers/energyCertificateLayerConf'
import {
  ENERGYMAP_HEATING_FILL_OPACITY,
  ENERGYMAP_HEATING_FILL_LAYER_ID,
  ENERGYMAP_HEATING_LAYER_IDS,
  ENERGYMAP_HEATING_OUTLINE_LAYER_ID,
  ENERGYMAP_HEATING_OUTLINE_OPACITY,
  HEATING_ENERGY_SOURCE_COLORS,
  HeatingEnergySourceFilterKey,
  getHeatingEnergySourceFilter,
} from '../layers/heatingLayerConf'
import { listedBackgroundBuildingFiltersAccordion } from '../common/constants'
import { useAppletStore } from '../state/appletStore'

const SIDEBAR_SIDE_PADDING = {
  mobile: '1.5rem',
  desktop: '1.875rem',
}

const SIDEBAR_CONTENT_VERTICAL_PADDING = {
  mobile: '2.25rem',
  desktop: '3.0625rem',
}

const ROW_LABEL_SX = {
  color: '#111111',
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
}

const ACCORDION_TEXT_SX = {
  color: '#111111',
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
}

const HEATING_SWITCH_ITEMS = [
  {
    id: 'geothermal',
    keyName: 'sidebar.front_page.heating.legend.geothermal',
    color: HEATING_ENERGY_SOURCE_COLORS.geothermal,
  },
  {
    id: 'districtHeating',
    keyName: 'sidebar.front_page.heating.legend.district_heating',
    color: HEATING_ENERGY_SOURCE_COLORS.districtHeating,
  },
  {
    id: 'electricity',
    keyName: 'sidebar.front_page.heating.legend.electricity',
    color: HEATING_ENERGY_SOURCE_COLORS.electricity,
  },
  {
    id: 'solar',
    keyName: 'sidebar.front_page.heating.legend.solar',
    color: HEATING_ENERGY_SOURCE_COLORS.solar,
  },
  {
    id: 'other',
    keyName: 'sidebar.front_page.heating.legend.other',
    color: HEATING_ENERGY_SOURCE_COLORS.other,
  },
] as const satisfies readonly {
  id: HeatingEnergySourceFilterKey
  keyName: string
  color: string
}[]

type HeatingSwitchKey = (typeof HEATING_SWITCH_ITEMS)[number]['id']

type HeatingSwitchState = Record<HeatingSwitchKey, boolean>

const INITIAL_HEATING_SWITCH_STATE = HEATING_SWITCH_ITEMS.reduce(
  (state, { id }) => ({
    ...state,
    [id]: true,
  }),
  {} as HeatingSwitchState
)

const LOWER_DISABLED_LAYER_ROWS = [
  {
    keyName: 'sidebar.front_page.layers.ventilation',
    ariaKeyName: 'sidebar.front_page.aria.ventilation_upcoming',
  },
  {
    keyName: 'sidebar.front_page.layers.other_energy_sources',
    ariaKeyName: 'sidebar.front_page.aria.other_energy_sources_upcoming',
  },
] as const

type EnergymapMainThematicMode = 'energyCertificates' | 'heating'

const ENERGY_CERTIFICATE_THEMATIC_MODE: EnergymapMainThematicMode =
  'energyCertificates'
const HEATING_THEMATIC_MODE: EnergymapMainThematicMode = 'heating'
const INACTIVE_THEMATIC_OPACITY = 0
const BUILDING_INFO_DESKTOP_MIN_WIDTH_BY_MODE = {
  twoPanel: 840,
  threePanel: 1180,
} as const satisfies Record<BuildingInfoDesktopMode, number>

const HomeSidebarHeader = () => {
  return (
    <Box
      sx={{
        px: { mobile: '0.625rem', desktop: '0.625rem' },
        pt: { mobile: '0.625rem', desktop: '0.75rem' },
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: '6.25rem',
          border: '0.2px solid #ffffff',
          borderRadius: '0.625rem',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src="/files/img/energiakartta/sidebar/main-hero-header-crop.jpg"
          alt=""
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 17.5%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
        <Typography
          sx={{
            position: 'relative',
            zIndex: 1,
            pt: '2.625rem',
            pl: '1.25rem',
            color: '#111111',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            lineHeight: '1.125rem',
          }}
        >
          <TText keyName="sidebar.front_page.header.title" ns="energiakartta" />
        </Typography>
      </Box>
    </Box>
  )
}

const SidebarFooterAction = ({
  tooltip,
  label,
  reserveActionRow,
}: {
  tooltip: string
  label: string
  reserveActionRow?: boolean
}) => {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box
        component="span"
        role="button"
        tabIndex={0}
        aria-disabled="true"
        aria-label={label}
        sx={{
          width: '100%',
          height: '5rem',
          pl: { mobile: '1.625rem', desktop: '1.625rem' },
          pr: {
            mobile: reserveActionRow ? '12rem' : '1.625rem',
            desktop: '1.625rem',
          },
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          borderRadius: { mobile: 0, desktop: '6px 6px 10px 10px' },
          background:
            'linear-gradient(90deg, #f8fff2 0%, #d9ffbd 48%, #b0ff6b 100%)',
          color: '#111111',
          cursor: 'not-allowed',
          opacity: 0.72,
          boxShadow: '0px 1px 1px rgba(189, 189, 189, 0.25)',
          '&:focus-visible': {
            outline: '2px solid #111111',
            outlineOffset: '-0.375rem',
          },
        }}
      >
        <Box
          component="img"
          src="/files/img/energiakartta/sidebar/edit-building-details.svg"
          alt=""
          aria-hidden="true"
          sx={{
            width: '1.90625rem',
            height: '1.3125rem',
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            minWidth: 0,
            color: '#111111',
            fontSize: '0.6875rem',
            fontWeight: 700,
            lineHeight: '0.8125rem',
            letterSpacing: '0.1em',
          }}
        >
          <TText
            keyName="sidebar.front_page.footer.edit_building_details"
            ns="energiakartta"
          />
        </Typography>
      </Box>
    </Tooltip>
  )
}

const HeatingAccordionContent = ({
  heatingSwitchState,
  onHeatingSwitchChange,
}: {
  heatingSwitchState: HeatingSwitchState
  onHeatingSwitchChange: (
    id: HeatingSwitchKey
  ) => React.ChangeEventHandler<HTMLInputElement>
}) => {
  const { t } = useTranslate('energiakartta')

  return (
    <Box
      sx={{
        pt: '2.125rem',
        mx: '2rem',
        maxWidth: '15.875rem',
      }}
    >
      <Typography
        sx={{
          ...ACCORDION_TEXT_SX,
          mb: '2.5rem',
        }}
      >
        <TText keyName="sidebar.front_page.heating.body" ns="energiakartta" />
      </Typography>
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          listStyle: 'none',
        }}
      >
        {HEATING_SWITCH_ITEMS.map(({ id, keyName, color }) => (
          <Box
            key={id}
            component="li"
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              minHeight: '0.875rem',
            }}
          >
            <SquishedSwitchWithLabel
              checked={heatingSwitchState[id]}
              checkedTrackColor={color}
              ariaLabel={t(keyName)}
              onChange={onHeatingSwitchChange(id)}
              sx={{ width: '100%' }}
              labelSx={{
                ...ACCORDION_TEXT_SX,
                fontSize: '0.6875rem',
                lineHeight: '0.875rem',
              }}
            >
              <TText keyName={keyName} ns="energiakartta" />
            </SquishedSwitchWithLabel>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const Page = () => {
  const { t } = useTranslate('energiakartta')
  const params = useParams<{ locale?: string | string[] }>()
  const locale = typeof params.locale === 'string' ? params.locale : 'fi'
  const setFilter = useMapStore((state) => state.setFilter)
  const setLayoutProperty = useMapStore((state) => state.setLayoutProperty)
  const setPaintProperty = useMapStore((state) => state.setPaintProperty)
  const enableLayerGroup = useMapStore((state) => state.enableLayerGroup)
  const setSelectedFeatures = useMapStore((state) => state.setSelectedFeatures)
  const selectedFeatures = useMapStore((state) => state.selectedFeatures)
  const isMobile = useIsMobile('desktop')
  const isTwoPanelBuildingInfoTooNarrow = useMediaQuery(
    `(max-width:${BUILDING_INFO_DESKTOP_MIN_WIDTH_BY_MODE.twoPanel - 0.02}px)`
  )
  const isThreePanelBuildingInfoTooNarrow = useMediaQuery(
    `(max-width:${BUILDING_INFO_DESKTOP_MIN_WIDTH_BY_MODE.threePanel - 0.02}px)`
  )
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const setIsSidebarOpen = useUIStore((state) => state.setIsSidebarOpen)
  const isSharedBuildingLayerGroupRegistered = useMapStore((state) =>
    ENERGYMAP_SHARED_BUILDING_LAYER_IDS.every((layerId) =>
      Boolean(
        state._layerGroups[ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID]?.layers[
          layerId
        ]
      )
    )
  )
  const buildingTypeFilter = useAppletStore((state) => state.buildingTypeFilter)
  const selectedConstructionDecade = useAppletStore(
    (state) => state.selectedConstructionDecade
  )
  const showBuildingsFromSelectedDecade = useAppletStore(
    (state) => state.showBuildingsFromSelectedDecade
  )
  const showOnlySelectedDecade = useAppletStore(
    (state) => state.showOnlySelectedDecade
  )
  const activeEnergyCertificateClasses = useAppletStore(
    (state) => state.activeEnergyCertificateClasses
  )
  const selectedBuilding = useAppletStore((state) => state.selectedBuilding)
  const setSelectedBuilding = useAppletStore(
    (state) => state.setSelectedBuilding
  )
  const clearSelectedBuilding = useAppletStore(
    (state) => state.clearSelectedBuilding
  )
  const visibleLayerGroupIds = useVisibleLayerGroupIds()
  const [heatingSwitchState, setHeatingSwitchState] = React.useState(
    INITIAL_HEATING_SWITCH_STATE
  )
  const [activeThematicMode, setActiveThematicMode] =
    React.useState<EnergymapMainThematicMode | null>(null)
  const [activeBuildingInfoMode, setActiveBuildingInfoMode] =
    React.useState<BuildingInfoDesktopMode>('twoPanel')
  const [isBuildingInfoCollapsed, setIsBuildingInfoCollapsed] =
    React.useState(false)
  const previousSelectedBuildingKeyRef = React.useRef<string | null>(null)
  const energyCertificateFillColorExpression = React.useMemo(
    () =>
      getEnergyCertificateFillColorExpression(activeEnergyCertificateClasses),
    [activeEnergyCertificateClasses]
  )
  const activeHeatingFilterKeys = React.useMemo<HeatingEnergySourceFilterKey[]>(
    () =>
      HEATING_SWITCH_ITEMS.filter(({ id }) => heatingSwitchState[id]).map(
        ({ id }) => id
      ),
    [heatingSwitchState]
  )
  const heatingFilter = React.useMemo(
    () => getHeatingEnergySourceFilter(activeHeatingFilterKeys),
    [activeHeatingFilterKeys]
  )
  const buildingFilter = React.useMemo(
    () =>
      getEnergymapBuildingFilter({
        buildingTypeFilter,
        selectedConstructionDecade,
        showBuildingsFromSelectedDecade,
        showOnlySelectedDecade,
      }),
    [
      buildingTypeFilter,
      selectedConstructionDecade,
      showBuildingsFromSelectedDecade,
      showOnlySelectedDecade,
    ]
  )
  const combinedHeatingFilter = React.useMemo(
    () => combineMapFilters([buildingFilter, heatingFilter]),
    [buildingFilter, heatingFilter]
  )
  const selectedEnergymapBuilding = React.useMemo(
    () =>
      selectedFeatures
        .map(toEnergymapSelectedBuilding)
        .find((building) => building != null) ?? null,
    [selectedFeatures]
  )
  const buildingInfoPanels = React.useMemo(
    () =>
      createEnergymapBuildingInfoPanels({
        selectedBuilding,
        locale,
      }),
    [locale, selectedBuilding]
  )
  const buildingInfoPanelsById = React.useMemo(
    () =>
      new Map(
        (buildingInfoPanels ?? []).map((panel) => [panel.id, panel])
      ),
    [buildingInfoPanels]
  )
  const selectedBuildingKey = selectedBuilding?.buildingKey ?? null
  const hasBuildingInfo = buildingInfoPanels != null
  const activeBuildingInfoModeNeedsMobileLayout =
    activeBuildingInfoMode === 'twoPanel'
      ? isTwoPanelBuildingInfoTooNarrow
      : isThreePanelBuildingInfoTooNarrow
  const shouldUseBuildingInfoMobileLayout =
    hasBuildingInfo &&
    (isMobile || activeBuildingInfoModeNeedsMobileLayout)
  const hasDesktopBuildingInfo =
    hasBuildingInfo && !shouldUseBuildingInfoMobileLayout
  const hasMobileBuildingInfo =
    hasBuildingInfo && shouldUseBuildingInfoMobileLayout
  const isDesktopBuildingInfoExpanded =
    hasDesktopBuildingInfo && !isBuildingInfoCollapsed
  const isMobileBuildingInfoExpanded =
    hasMobileBuildingInfo && !isBuildingInfoCollapsed
  const isBuildingInfoExpanded =
    isDesktopBuildingInfoExpanded || isMobileBuildingInfoExpanded
  const shouldShowHomeSidebarChrome = !isBuildingInfoExpanded
  const isSharedBuildingLayerGroupVisible = visibleLayerGroupIds.includes(
    ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID
  )
  const isHeatingLayerVisible =
    isSharedBuildingLayerGroupVisible &&
    activeThematicMode === HEATING_THEMATIC_MODE
  const isEnergyCertificateLayerVisible =
    isSharedBuildingLayerGroupVisible &&
    activeThematicMode === ENERGY_CERTIFICATE_THEMATIC_MODE
  const shouldShowMobileEnergyCertificateControls =
    isMobile && !isSidebarOpen && isEnergyCertificateLayerVisible
  const upcomingTooltip = t('sidebar.front_page.upcoming_tooltip')
  const toggleEnergyClassesAria = t(
    'sidebar.front_page.aria.toggle_energy_classes'
  )
  const toggleHeatingAria = t('sidebar.front_page.aria.toggle_heating')
  const footerLabel = t('sidebar.front_page.footer.edit_building_details')
  const buildingInfoAriaLabels = React.useMemo(
    () => ({
      close: t('sidebar.building_info.aria.close'),
      collapse: t('sidebar.building_info.aria.collapse'),
      overview: t('sidebar.building_info.aria.open_overview'),
      renovation: t('sidebar.building_info.aria.open_renovation'),
    }),
    [t]
  )
  const toggleThematicMode = React.useCallback(
    async (mode: EnergymapMainThematicMode) => {
      const isModeCurrentlyVisible =
        isSharedBuildingLayerGroupVisible && activeThematicMode === mode
      const nextMode = isModeCurrentlyVisible ? null : mode

      if (nextMode && !isSharedBuildingLayerGroupVisible) {
        await enableLayerGroup(
          ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID,
          listedBackgroundBuildingFiltersAccordion.addOptions
        )
      }

      setActiveThematicMode(nextMode)
    },
    [
      activeThematicMode,
      enableLayerGroup,
      isSharedBuildingLayerGroupVisible,
    ]
  )
  const handleHeatingSwitchChange =
    (id: HeatingSwitchKey): React.ChangeEventHandler<HTMLInputElement> =>
    (event) => {
      setHeatingSwitchState((currentState) => ({
        ...currentState,
        [id]: event.target.checked,
      }))
    }
  const handleBuildingInfoModeChange = React.useCallback(
    (mode: BuildingInfoDesktopMode) => {
      setActiveBuildingInfoMode(mode)
      setIsBuildingInfoCollapsed(false)
      setIsSidebarOpen(true)
    },
    [setIsSidebarOpen]
  )
  const handleCollapseBuildingInfo = React.useCallback(() => {
    setIsBuildingInfoCollapsed(true)
    setIsSidebarOpen(true)
  }, [setIsSidebarOpen])
  const handleCloseBuildingInfo = React.useCallback(() => {
    setIsSidebarOpen(true)
    setSelectedFeatures([])
  }, [setIsSidebarOpen, setSelectedFeatures])

  React.useEffect(() => {
    if (selectedBuildingKey == null) {
      previousSelectedBuildingKeyRef.current = null
      setActiveBuildingInfoMode('twoPanel')
      setIsBuildingInfoCollapsed(false)
      return
    }

    if (previousSelectedBuildingKeyRef.current !== selectedBuildingKey) {
      previousSelectedBuildingKeyRef.current = selectedBuildingKey
      setActiveBuildingInfoMode('twoPanel')
      setIsBuildingInfoCollapsed(false)
      setIsSidebarOpen(true)
    }
  }, [selectedBuildingKey, setIsSidebarOpen])

  React.useEffect(() => {
    if (
      areEnergymapSelectedBuildingsEqual(
        selectedBuilding,
        selectedEnergymapBuilding
      )
    ) {
      return
    }

    if (selectedEnergymapBuilding == null) {
      clearSelectedBuilding()
      return
    }

    setSelectedBuilding(selectedEnergymapBuilding)
  }, [
    clearSelectedBuilding,
    selectedBuilding,
    selectedEnergymapBuilding,
    setSelectedBuilding,
  ])

  React.useEffect(() => {
    if (!isSharedBuildingLayerGroupRegistered) {
      return
    }

    void Promise.all(
      ENERGYMAP_BUILDING_POLYGONS_LAYER_IDS.map((layerId) =>
        setFilter(layerId, buildingFilter)
      )
    )
  }, [buildingFilter, isSharedBuildingLayerGroupRegistered, setFilter])

  React.useEffect(() => {
    if (!isSharedBuildingLayerGroupRegistered) {
      return
    }

    void Promise.all(
      ENERGYMAP_ENERGY_CERTIFICATE_LAYER_IDS.map((layerId) =>
        setFilter(layerId, buildingFilter)
      )
    )
  }, [
    buildingFilter,
    isSharedBuildingLayerGroupRegistered,
    setFilter,
  ])

  React.useEffect(() => {
    if (!isSharedBuildingLayerGroupRegistered) {
      return
    }

    void Promise.all([
      setPaintProperty(
        ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID,
        'fill-color',
        energyCertificateFillColorExpression
      ),
      setPaintProperty(
        ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID,
        'line-color',
        energyCertificateFillColorExpression
      ),
    ])
  }, [
    energyCertificateFillColorExpression,
    isSharedBuildingLayerGroupRegistered,
    setPaintProperty,
  ])

  React.useEffect(() => {
    if (!isSharedBuildingLayerGroupRegistered) {
      return
    }

    void Promise.all(
      ENERGYMAP_HEATING_LAYER_IDS.map((layerId) =>
        setFilter(layerId, combinedHeatingFilter)
      )
    )
  }, [combinedHeatingFilter, isSharedBuildingLayerGroupRegistered, setFilter])

  React.useEffect(() => {
    if (!isSharedBuildingLayerGroupRegistered) {
      return
    }

    const energyCertificatesVisible =
      isSharedBuildingLayerGroupVisible &&
      activeThematicMode === ENERGY_CERTIFICATE_THEMATIC_MODE
    const heatingVisible =
      isSharedBuildingLayerGroupVisible &&
      activeThematicMode === HEATING_THEMATIC_MODE

    void Promise.all([
      ...ENERGYMAP_ENERGY_CERTIFICATE_LAYER_IDS.map((layerId) =>
        setLayoutProperty(
          layerId,
          'visibility',
          energyCertificatesVisible ? 'visible' : 'none'
        )
      ),
      setPaintProperty(
        ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID,
        'fill-opacity',
        energyCertificatesVisible
          ? ENERGYMAP_ENERGY_CERTIFICATE_FILL_OPACITY
          : INACTIVE_THEMATIC_OPACITY
      ),
      setPaintProperty(
        ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID,
        'line-opacity',
        energyCertificatesVisible
          ? ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_OPACITY
          : INACTIVE_THEMATIC_OPACITY
      ),
      ...ENERGYMAP_HEATING_LAYER_IDS.map((layerId) =>
        setLayoutProperty(
          layerId,
          'visibility',
          heatingVisible ? 'visible' : 'none'
        )
      ),
      setPaintProperty(
        ENERGYMAP_HEATING_FILL_LAYER_ID,
        'fill-opacity',
        heatingVisible
          ? ENERGYMAP_HEATING_FILL_OPACITY
          : INACTIVE_THEMATIC_OPACITY
      ),
      setPaintProperty(
        ENERGYMAP_HEATING_OUTLINE_LAYER_ID,
        'line-opacity',
        heatingVisible
          ? ENERGYMAP_HEATING_OUTLINE_OPACITY
          : INACTIVE_THEMATIC_OPACITY
      ),
    ])
  }, [
    activeThematicMode,
    isSharedBuildingLayerGroupRegistered,
    isSharedBuildingLayerGroupVisible,
    setLayoutProperty,
    setPaintProperty,
  ])

  const visibleBuildingInfoPanelIds = React.useMemo(
    () =>
      isBuildingInfoExpanded
        ? getBuildingInfoPanelIds(activeBuildingInfoMode)
        : [],
    [activeBuildingInfoMode, isBuildingInfoExpanded]
  )
  const buildingInfoPanelPresentation = shouldUseBuildingInfoMobileLayout
    ? 'mobile'
    : 'desktop'
  const buildingInfoActionRail = hasDesktopBuildingInfo ? (
    <>
      {isDesktopBuildingInfoExpanded && (
        <BuildingInfoDesktopChrome
          mode={activeBuildingInfoMode}
          ariaLabels={buildingInfoAriaLabels}
          onClose={handleCloseBuildingInfo}
          onCollapse={handleCollapseBuildingInfo}
        />
      )}
      <BuildingInfoActionRail
        activeMode={activeBuildingInfoMode}
        isCollapsed={isBuildingInfoCollapsed}
        ariaLabels={buildingInfoAriaLabels}
        onModeChange={handleBuildingInfoModeChange}
      />
    </>
  ) : hasMobileBuildingInfo ? (
    <>
      {isMobileBuildingInfoExpanded && (
        <BuildingInfoMobileChrome
          ariaLabels={buildingInfoAriaLabels}
          onClose={handleCloseBuildingInfo}
          onCollapse={handleCollapseBuildingInfo}
        />
      )}
      <BuildingInfoMobileActionRow
        activeMode={activeBuildingInfoMode}
        isCollapsed={isBuildingInfoCollapsed}
        ariaLabels={buildingInfoAriaLabels}
        onModeChange={handleBuildingInfoModeChange}
      />
    </>
  ) : null
  const sidebarRuntimeOptions = React.useMemo<SidebarRuntimeOptions>(
    () => {
      const expandedVisiblePanels =
        activeBuildingInfoMode === 'threePanel'
          ? (['main', 'secondary', 'tertiary'] as const)
          : (['main', 'tertiary'] as const)

      return {
        width: isBuildingInfoExpanded ? 'wide' : 'compact',
        chrome: isBuildingInfoExpanded ? 'hidden' : 'visible',
        panelLayout: isBuildingInfoExpanded
          ? activeBuildingInfoMode === 'threePanel'
            ? 'triple'
            : 'double'
          : 'single',
        visiblePanels: isBuildingInfoExpanded
          ? [...expandedVisiblePanels]
          : ['main'],
        activePanel: isBuildingInfoExpanded
          ? activeBuildingInfoMode === 'threePanel'
            ? 'secondary'
            : 'tertiary'
          : 'main',
        mainPanelVisible: true,
        mobileMode: 'stacked',
        mobileStackPlacement: 'after',
        actionRailPlacement: hasMobileBuildingInfo
          ? 'bottomActionRow'
          : 'outside',
      }
    },
    [activeBuildingInfoMode, hasMobileBuildingInfo, isBuildingInfoExpanded]
  )

  useSidebarBoundaryRuntimeOptions(sidebarRuntimeOptions)

  const renderBuildingInfoPanelSlotContent = (
    panelId: EnergymapBuildingInfoPanelId
  ) => {
    if (!isBuildingInfoExpanded) {
      return null
    }

    const panel = buildingInfoPanelsById.get(panelId)

    if (panel == null) {
      return null
    }

    return (
      <BuildingInfoPanelSlotContent
        panel={panel}
        mode={activeBuildingInfoMode}
        presentation={buildingInfoPanelPresentation}
        mobileIndex={visibleBuildingInfoPanelIds.indexOf(panelId)}
        mobilePanelCount={visibleBuildingInfoPanelIds.length}
      />
    )
  }

  return (
    <>
      {shouldShowHomeSidebarChrome && (
        <IntoSidebarHeaderSlot>
          <HomeSidebarHeader />
        </IntoSidebarHeaderSlot>
      )}
      {shouldShowHomeSidebarChrome && (
        <IntoSidebarFooterSlot>
          <SidebarFooterAction
            tooltip={upcomingTooltip}
            label={footerLabel}
            reserveActionRow={hasMobileBuildingInfo}
          />
        </IntoSidebarFooterSlot>
      )}
      {buildingInfoActionRail != null && (
        <IntoSidebarActionRailSlot>
          {buildingInfoActionRail}
        </IntoSidebarActionRailSlot>
      )}
      {shouldShowMobileEnergyCertificateControls && (
        <IntoSlot name={MAP_BOTTOM_LEFT_FLOATING_CONTROLS_SLOT}>
          <EnergyCertificateClassControls
            variant="mobile"
            orientation="vertical"
          />
        </IntoSlot>
      )}
      <IntoSidebarPanelSlot panelId="main">
        {isBuildingInfoExpanded ? (
          renderBuildingInfoPanelSlotContent('energyConsumption')
        ) : (
          <SidebarContentBox
            sxOuter={{
              height: '100%',
            }}
            scrollbarSide="left"
            sxInner={{
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100%',
              height: '100%',
            }}
          >
            <Box
              sx={{
                px: SIDEBAR_SIDE_PADDING,
                pt: SIDEBAR_CONTENT_VERTICAL_PADDING,
                pb: SIDEBAR_CONTENT_VERTICAL_PADDING,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                sx={{
                  maxWidth: '18.1875rem',
                  color: '#111111',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  lineHeight: '1.25rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                <TText keyName="sidebar.front_page.heading" ns="energiakartta" />
              </Typography>

              <Typography
                sx={{
                  mt: { mobile: '3rem', desktop: '3.75rem' },
                  maxWidth: '18.1875rem',
                  color: '#111111',
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  lineHeight: '1.125rem',
                  letterSpacing: '0.05em',
                }}
              >
                <TText
                  keyName="sidebar.front_page.description"
                  ns="energiakartta"
                />
              </Typography>

              <Box
                sx={{
                  mt: { mobile: '4rem', desktop: '6.875rem' },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2.25rem',
                  maxWidth: '19.625rem',
                }}
              >
                <LayerToggleRowAccordion
                  label={
                    <TText
                      keyName="sidebar.front_page.layers.energy_classes"
                      ns="energiakartta"
                    />
                  }
                  status={isEnergyCertificateLayerVisible ? 'visible' : 'hidden'}
                  expanded={isEnergyCertificateLayerVisible}
                  ariaLabel={toggleEnergyClassesAria}
                  onToggle={() => {
                    void toggleThematicMode(ENERGY_CERTIFICATE_THEMATIC_MODE)
                  }}
                  labelSx={ROW_LABEL_SX}
                >
                  <EnergyClassesAccordionContent />
                </LayerToggleRowAccordion>
                <LayerToggleRowAccordion
                  label={
                    <TText
                      keyName="sidebar.front_page.layers.heating"
                      ns="energiakartta"
                    />
                  }
                  status={isHeatingLayerVisible ? 'visible' : 'hidden'}
                  expanded={isHeatingLayerVisible}
                  ariaLabel={toggleHeatingAria}
                  onToggle={() => {
                    void toggleThematicMode(HEATING_THEMATIC_MODE)
                  }}
                  labelSx={ROW_LABEL_SX}
                >
                  <HeatingAccordionContent
                    heatingSwitchState={heatingSwitchState}
                    onHeatingSwitchChange={handleHeatingSwitchChange}
                  />
                </LayerToggleRowAccordion>
                {LOWER_DISABLED_LAYER_ROWS.map(({ keyName, ariaKeyName }) => (
                  <Tooltip
                    key={keyName}
                    title={upcomingTooltip}
                    arrow
                    placement="top"
                  >
                    <Box
                      component="span"
                      sx={{ display: 'block', width: '100%' }}
                    >
                      <LayerToggleRow
                        label={<TText keyName={keyName} ns="energiakartta" />}
                        status="hidden"
                        disabled
                        ariaLabel={t(ariaKeyName)}
                        onToggle={() => {}}
                        labelSx={ROW_LABEL_SX}
                      />
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Box>
          </SidebarContentBox>
        )}
      </IntoSidebarPanelSlot>
      <IntoSidebarPanelSlot panelId="secondary">
        {renderBuildingInfoPanelSlotContent('renovationRecommendations')}
      </IntoSidebarPanelSlot>
      <IntoSidebarPanelSlot panelId="tertiary">
        {renderBuildingInfoPanelSlotContent('buildingDetails')}
      </IntoSidebarPanelSlot>
    </>
  )
}

export default Page
