'use client'

import React from 'react'

import { useAppParams } from '#/common/navigation/navigation'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { Box } from '#/common/style/theme'
import type { SidebarPanelExtensionRuntimeOptions } from '#/common/types/sidebar'
import { Button } from '#/components/common/Button'
import {
  IntoSidebarPanelExtensionActionRailSlot,
  IntoSidebarPanelExtensionPanelSlot,
  SidebarPanelExtensionProvider,
} from '#/components/Sidebar'
import { useTranslate } from '@tolgee/react'

import {
  BuildingInfoActionRail,
  BuildingInfoTabPages,
  getBuildingInfoModeForTabId,
  getBuildingInfoTabIdForMode,
  type BuildingInfoDesktopMode,
  type BuildingInfoTabId,
} from 'applets/energy/components/BuildingInfoPanel'
import { createEnergymapBuildingInfoPanels } from 'applets/energy/common/buildingInfo'
import type { EnergymapSelectedBuilding } from 'applets/energy/common/types'
import {
  ENERGYMAP_BUILDING_INFO_DESKTOP_COMFORT_GAP_PX,
  ENERGYMAP_BUILDING_INFO_DESKTOP_MAP_CONTROLS_RESERVE_PX,
  ENERGYMAP_BUILDING_INFO_DESKTOP_TAB_RAIL_RESERVE_PX,
  ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_PANEL_WIDTH_PX,
  getEnergymapBuildingInfoPanelRuntimeOptions,
} from 'applets/energy/common/buildingInfoPanelRuntime'

type BaselinePanelState = 'standard' | 'collapsed' | 'fullscreen' | 'closed'

type UiBaselinePanelsSampleId =
  | 'district-heating'
  | 'geothermal'
  | 'unsupported-heating-source'

type BaselinePanelSample = {
  id: UiBaselinePanelsSampleId
  label: string
  note: string
  building: EnergymapSelectedBuilding
}

const createSampleBuilding = (
  properties: Record<string, unknown>
): EnergymapSelectedBuilding => ({
  id: String(properties.building_key ?? 'selected-building'),
  buildingKey: String(properties.building_key ?? 'selected-building'),
  source: 'energymap_building_polygons',
  sourceLayer: 'energymap_building_polygons',
  layerId: 'energymap_building_polygons-fill',
  properties,
})

const PANEL_SAMPLES: readonly BaselinePanelSample[] = [
  {
    id: 'district-heating',
    label: 'District heating baseline',
    note: 'Representative district-heating sample with full energy values and active scenarios.',
    building: createSampleBuilding({
      building_key: '9da63bcd-bb54-447c-b991-8eec8f8c5666',
      permanent_building_identifier: '101614422K',
      address_fin: 'Mikkolantie 34a',
      postal_code: '00640',
      postal_office_fin: 'HELSINKI',
      main_purpose: '05',
      completion_date: '1967-01-01',
      heating_method: '01',
      heating_energy_source: '01',
      floor_area: 454,
      gross_floor_area: 333,
      total_area: 454,
      volume: 1006,
      energy_certificate_class: 'D',
      distr_default_total: 367.7884615,
      distr_default_heat: 343.6634615,
      distr_default_elec: 24.125,
      distr_aahp_total: 289.7019231,
      distr_solar_total: 334.2980769,
      distr_windows_total: 332.6442308,
    }),
  },
  {
    id: 'geothermal',
    label: 'Geothermal with scenario estimates',
    note: 'Synthetic geothermal sample with non-default scenario values.',
    building: createSampleBuilding({
      building_key: '020e4152-d81a-4e5a-a2ec-84819a0fb84d',
      permanent_building_identifier: '103389971B',
      address_fin: 'Kantakylantie 20',
      postal_code: '00650',
      postal_office_fin: 'HELSINKI',
      main_purpose: '06',
      completion_date: '1979-01-01',
      heating_method: '01',
      heating_energy_source: '09',
      floor_area: 262,
      gross_floor_area: 336,
      total_area: 336,
      volume: 1006,
      gshp_default_total: 155.8557692,
      gshp_default_heat: 128.1442307,
      gshp_default_elec: 27.71153846,
      gshp_solar_total: 132.6634615,
      gshp_windows_total: 147.2788462,
    }),
  },
  {
    id: 'unsupported-heating-source',
    label: 'Unsupported heating source',
    note: 'Placeholder-heavy sample to show unsupported / missing value behavior.',
    building: createSampleBuilding({
      building_key: 'unsupported',
      permanent_building_identifier: '103383786U',
      address_fin: 'Henrik Sohlbergin tie 25',
      postal_code: '00640',
      postal_office_fin: 'HELSINKI',
      main_purpose: '07',
      completion_date: '1976-12-31',
      heating_method: '07',
      heating_energy_source: '99',
      floor_area: 384,
      gross_floor_area: 386,
      total_area: 386,
      volume: 2025,
    }),
  },
] as const

const getSampleBuildingForId = (sampleId: UiBaselinePanelsSampleId) =>
  PANEL_SAMPLES.find((sample) => sample.id === sampleId) ??
  PANEL_SAMPLES[0]

const SAMPLE_BUTTONS_ID_PREFIX = 'ui-baseline-panels-sample'

const PANEL_EXTENSION_ID = 'ui-baseline-building-info-panel'
// SimpleSidebar's default desktop panel width is 23.75rem, which is 380px.
const UI_BASELINE_DEFAULT_SIDEBAR_WIDTH_PX = 380
const BASELINE_STANDARD_RENOVATION_DESKTOP_RESERVED_WIDTH_PX =
  UI_BASELINE_DEFAULT_SIDEBAR_WIDTH_PX +
  ENERGYMAP_BUILDING_INFO_DESKTOP_TAB_RAIL_RESERVE_PX +
  ENERGYMAP_BUILDING_INFO_DESKTOP_MAP_CONTROLS_RESERVE_PX +
  ENERGYMAP_BUILDING_INFO_DESKTOP_COMFORT_GAP_PX
const BASELINE_STANDARD_RENOVATION_DESKTOP_PANEL_WIDTH =
  `clamp(20rem, calc(100vw - ${BASELINE_STANDARD_RENOVATION_DESKTOP_RESERVED_WIDTH_PX}px), ${ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_PANEL_WIDTH_PX}px)`

const PANEL_CONTROL_BOX_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
} as const

const PANEL_CONTROL_ROW_SX = {
  display: 'flex',
  flexDirection: { mobile: 'column', desktop: 'row' },
  alignItems: { mobile: 'stretch', desktop: 'center' },
  flexWrap: 'wrap',
  gap: '0.625rem',
} as const

const PanelsContent = () => {
  const { t } = useTranslate('energiakartta')
  const params = useAppParams<{ locale?: string | string[] }>()
  const locale = typeof params.locale === 'string' ? params.locale : 'fi'
  const isMobileLayout = useIsMobile()

  const [panelState, setPanelState] =
    React.useState<BaselinePanelState>('standard')
  const [buildingInfoMode, setBuildingInfoMode] =
    React.useState<BuildingInfoDesktopMode>('twoPanel')
  const [sampleId, setSampleId] =
    React.useState<UiBaselinePanelsSampleId>(PANEL_SAMPLES[0].id)

  const sample = React.useMemo(
    () => getSampleBuildingForId(sampleId),
    [sampleId]
  )
  const buildingInfoPanels = React.useMemo(
    () =>
      createEnergymapBuildingInfoPanels({
        selectedBuilding: sample.building,
        locale,
      }),
    [sample.building, locale]
  )
  const hasBuildingInfo = buildingInfoPanels != null
  const isBuildingInfoCollapsed = panelState === 'collapsed'
  const isPanelOpen = hasBuildingInfo && panelState !== 'closed'
  const isPanelExpanded = isPanelOpen && !isBuildingInfoCollapsed
  const isDesktopFullscreenLayout =
    panelState === 'fullscreen' && !isMobileLayout

  const buildingInfoAriaLabels = React.useMemo(
    () => ({
      close: t('sidebar.building_info.aria.close'),
      collapse: t('sidebar.building_info.aria.collapse'),
      overview: t('sidebar.building_info.aria.open_overview'),
      renovation: t('sidebar.building_info.aria.open_renovation'),
    }),
    [t]
  )

  const buildingInfoRuntimeOptions =
    React.useMemo<SidebarPanelExtensionRuntimeOptions>(() => {
      const runtimeOptions = getEnergymapBuildingInfoPanelRuntimeOptions({
        hasBuildingInfo,
        isBuildingInfoCollapsed,
        isMobileLayout,
        isDesktopFullscreenFallback: isDesktopFullscreenLayout,
        activeMode: buildingInfoMode,
      })

      if (!hasBuildingInfo) {
        return runtimeOptions
      }

      // Keep base ui-baseline sidebar visible for default baseline checks.
      if (panelState === 'fullscreen') {
        return {
          ...runtimeOptions,
          replaceBaseSidebar: true,
          layoutMode: 'fullscreen',
        }
      }

      if (!isMobileLayout && buildingInfoMode === 'threePanel') {
        return {
          ...runtimeOptions,
          // Keep the base sidebar visible while reserving room for the real
          // desktop tab rail and map controls in the route-local baseline.
          replaceBaseSidebar: false,
          desktopMainPanelWidth:
            BASELINE_STANDARD_RENOVATION_DESKTOP_PANEL_WIDTH,
        }
      }

      return {
        ...runtimeOptions,
        replaceBaseSidebar: false,
      }
    }, [
      buildingInfoMode,
      hasBuildingInfo,
      isBuildingInfoCollapsed,
      isDesktopFullscreenLayout,
      isMobileLayout,
      panelState,
    ])

  const handleSampleChange = React.useCallback(
    (nextSampleId: UiBaselinePanelsSampleId) => {
      setSampleId(nextSampleId)
      setBuildingInfoMode('twoPanel')
      setPanelState('standard')
    },
    []
  )

  const handleOpenBasic = React.useCallback(() => {
    setBuildingInfoMode('twoPanel')
    setPanelState('standard')
  }, [])

  const handleOpenRenovation = React.useCallback(() => {
    setBuildingInfoMode('threePanel')
    setPanelState('standard')
  }, [])

  const handleOpenCollapsed = React.useCallback(() => {
    setPanelState('collapsed')
  }, [])

  const handleOpenFullscreen = React.useCallback(() => {
    setBuildingInfoMode('threePanel')
    setPanelState('fullscreen')
  }, [])

  const handleClosePanel = React.useCallback(() => {
    setPanelState('closed')
  }, [])

  const handlePanelReopen = React.useCallback(() => {
    setPanelState('standard')
  }, [])

  const handleActiveTabChange = React.useCallback(
    (tabId: BuildingInfoTabId) => {
      setBuildingInfoMode((currentMode) => {
        const nextMode = getBuildingInfoModeForTabId(tabId)
        return currentMode === nextMode ? currentMode : nextMode
      })
    },
    []
  )

  const handleActionRailModeChange = React.useCallback(
    (nextMode: BuildingInfoDesktopMode) => {
      setBuildingInfoMode(nextMode)
      setPanelState('standard')
    },
    []
  )

  const handleCollapse = React.useCallback((tabId: BuildingInfoTabId) => {
    setBuildingInfoMode(getBuildingInfoModeForTabId(tabId))
    setPanelState('collapsed')
  }, [])

  const buildingInfoActionRail =
    hasBuildingInfo && isBuildingInfoCollapsed ? (
      <BuildingInfoActionRail
        activeMode={buildingInfoMode}
        isCollapsed={isBuildingInfoCollapsed}
        orientation={isMobileLayout ? 'row' : 'column'}
        ariaLabels={{
          overview: buildingInfoAriaLabels.overview,
          renovation: buildingInfoAriaLabels.renovation,
        }}
        onModeChange={handleActionRailModeChange}
      />
    ) : null

  return (
    <Box
      data-testid="ui-baseline-panels-content"
      sx={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <Box sx={PANEL_CONTROL_BOX_SX}>
        <Box sx={PANEL_CONTROL_ROW_SX}>
          <Button
            data-testid="ui-baseline-panels-open-basic"
            size="small"
            variant={buildingInfoMode === 'twoPanel' ? 'contained' : 'outlined'}
            onClick={handleOpenBasic}
          >
            Open basic view
          </Button>
          <Button
            data-testid="ui-baseline-panels-open-renovation"
            size="small"
            variant={
              buildingInfoMode === 'threePanel' ? 'contained' : 'outlined'
            }
            onClick={handleOpenRenovation}
          >
            Open renovation view
          </Button>
          <Button size="small" variant="outlined" onClick={handleOpenCollapsed}>
            Open collapsed controls
          </Button>
          <Button
            data-testid="ui-baseline-panels-open-fullscreen"
            size="small"
            variant={isDesktopFullscreenLayout ? 'contained' : 'outlined'}
            onClick={handleOpenFullscreen}
          >
            Open full-screen
          </Button>
          <Button size="small" variant="outlined" onClick={handleClosePanel}>
            Close panel
          </Button>
          <Button size="small" variant="outlined" onClick={handlePanelReopen}>
            Reopen panel
          </Button>
        </Box>

        <Box sx={PANEL_CONTROL_ROW_SX}>
          {PANEL_SAMPLES.map((panelSample) => (
            <Button
              key={panelSample.id}
              data-testid={`${SAMPLE_BUTTONS_ID_PREFIX}-${panelSample.id}`}
              size="small"
              variant={
                panelSample.id === sampleId ? 'contained' : 'outlined'
              }
              onClick={() => handleSampleChange(panelSample.id)}
            >
              {panelSample.label}
            </Button>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          px: '0.5rem',
          py: '0.25rem',
          border: '1px solid #e4e4e4',
          borderRadius: '0.625rem',
          backgroundColor: '#f9f9f9',
          color: '#111111',
          fontSize: '0.875rem',
          lineHeight: 1.35,
        }}
      >
        Active sample: <strong>{sample.label}</strong> - {sample.note}
      </Box>

      <SidebarPanelExtensionProvider
        id={PANEL_EXTENSION_ID}
        enabled={isPanelOpen}
        runtimeOptions={buildingInfoRuntimeOptions}
      >
        {isPanelExpanded && buildingInfoPanels != null && (
          <IntoSidebarPanelExtensionPanelSlot panelId="main">
            <BuildingInfoTabPages
              key={sample.id}
              panels={buildingInfoPanels}
              ariaLabels={buildingInfoAriaLabels}
              activeTabId={getBuildingInfoTabIdForMode(buildingInfoMode)}
              forceMobileLayout={isMobileLayout}
              isDesktopFullscreenLayout={isDesktopFullscreenLayout}
              onActiveTabChange={handleActiveTabChange}
              onClose={handleClosePanel}
              onCollapse={handleCollapse}
            />
          </IntoSidebarPanelExtensionPanelSlot>
        )}
        {buildingInfoActionRail != null && (
          <IntoSidebarPanelExtensionActionRailSlot>
            {buildingInfoActionRail}
          </IntoSidebarPanelExtensionActionRailSlot>
        )}
      </SidebarPanelExtensionProvider>
    </Box>
  )
}

export default PanelsContent
