'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import type {
  SidebarPanelExtensionId,
  SidebarPanelExtensionRuntimeOptions,
} from '#/common/types/sidebar'
import { SlotsProvider } from '#/components/context/slotsContext'
import {
  SidebarPanelExtension,
  SidebarPanelExtensionTabRail,
} from '#/components/Sidebar/SidebarPanelExtension'
import { SidebarPanelExtensionContextProvider } from '#/components/Sidebar/sidebarPanelExtensionContext'
import {
  SidebarPanelExtensionTabsProvider,
  useSidebarPanelExtensionTabsRegistryContext,
} from '#/components/Sidebar/SidebarPanelExtensionTabsContext'
import { IntoSidebarPanelExtensionPanelSlot } from '#/components/Sidebar/sidebarSlots'
import type {
  EnergymapBuildingInfoConsumptionControls,
  EnergymapBuildingInfoMetric,
  EnergymapBuildingInfoMetricValue,
  EnergymapBuildingInfoPanel,
  EnergymapBuildingInfoPrimaryMetricId,
  EnergymapBuildingInfoText,
  EnergymapBuildingInfoValueStatus,
} from 'applets/energy/common/buildingInfo'
import {
  BuildingInfoActionRail,
  BuildingInfoTabPages,
} from 'applets/energy/components/BuildingInfoPanel'
import type { BuildingInfoTabId } from 'applets/energy/components/BuildingInfoPanel'

const noop = () => {}

const ariaLabels = {
  close: 'Close building information',
  collapse: 'Collapse building information',
  overview: 'Open energy and building information',
  renovation: 'Open renovation recommendations',
}

const FIXTURE_EXTENSION_ID: SidebarPanelExtensionId =
  'building-info-fixture-extension'

const plain = (text: string): EnergymapBuildingInfoText => ({
  type: 'plain',
  text,
})

const value = ({
  id,
  label,
  text,
  status = 'estimate',
}: {
  id: EnergymapBuildingInfoMetricValue['id']
  label: string
  text: string
  status?: EnergymapBuildingInfoValueStatus
}): EnergymapBuildingInfoMetricValue => ({
  id,
  label: plain(label),
  text: plain(text),
  status,
})

const metric = ({
  id,
  label,
  annual,
  square,
}: {
  id: EnergymapBuildingInfoMetric['id']
  label: string
  annual: string
  square: string
}): EnergymapBuildingInfoMetric => ({
  id,
  label: plain(label),
  values: [
    value({
      id: 'annualTotal',
      label: 'Annual total',
      text: annual,
    }),
    value({
      id: 'perSquareMeter',
      label: 'Per square meter',
      text: square,
    }),
  ],
})

const totalMetric = metric({
  id: 'total',
  label: 'Total energy',
  annual: '118 MWh',
  square: '142 kWh/m2',
})

const electricityMetric = metric({
  id: 'electricity',
  label: 'Electricity',
  annual: '38 MWh',
  square: '46 kWh/m2',
})

const heatingMetric = metric({
  id: 'heating',
  label: 'Heating',
  annual: '80 MWh',
  square: '96 kWh/m2',
})

const waterHeatingMetric = metric({
  id: 'waterHeating',
  label: 'Water heating',
  annual: 'Unavailable',
  square: 'Unavailable',
})

const emptyMetric = metric({
  id: 'total',
  label: 'No selected sources',
  annual: 'Select at least one source',
  square: 'Select at least one source',
})

const createControls = (
  defaultPrimaryMetricId: EnergymapBuildingInfoPrimaryMetricId = 'energy'
): EnergymapBuildingInfoConsumptionControls => ({
  defaultPrimaryMetricId,
  primaryMetrics: [
    {
      id: 'energy',
      label: plain('Energy'),
      ariaLabelKey: 'sidebar.building_info.panels.energy.primary.energy',
      supported: true,
    },
    {
      id: 'water',
      label: plain('Water'),
      ariaLabelKey: 'sidebar.building_info.panels.energy.primary.water',
      supported: false,
      unavailableNote: {
        id: 'water-unavailable',
        text: plain('Water consumption is not available for this building.'),
        status: 'placeholder',
      },
    },
    {
      id: 'cost',
      label: plain('Cost'),
      ariaLabelKey: 'sidebar.building_info.panels.energy.primary.cost',
      supported: false,
      unavailableNote: {
        id: 'cost-unavailable',
        text: plain('Energy cost is not available for this building.'),
        status: 'placeholder',
      },
    },
    {
      id: 'co2',
      label: plain('CO2'),
      ariaLabelKey: 'sidebar.building_info.panels.energy.primary.co2',
      supported: false,
      unavailableNote: {
        id: 'co2-unavailable',
        text: plain('CO2 estimate is not available for this building.'),
        status: 'placeholder',
      },
    },
  ],
  defaultEnergySubmetricIds: ['electricity', 'heating'],
  energySubmetrics: [
    {
      id: 'electricity',
      label: plain('Electricity'),
      ariaLabelKey: 'panels.energy.series.electricity',
      supported: true,
      defaultSelected: true,
      metric: electricityMetric,
    },
    {
      id: 'heating',
      label: plain('Heating'),
      ariaLabelKey: 'panels.energy.series.heating',
      supported: true,
      defaultSelected: true,
      metric: heatingMetric,
    },
    {
      id: 'waterHeating',
      label: plain('Water heating'),
      ariaLabelKey: 'panels.energy.series.water_heating',
      supported: false,
      defaultSelected: false,
      metric: waterHeatingMetric,
      unavailableNote: {
        id: 'water-heating-unavailable',
        text: plain('Water heating is estimated through the total value.'),
        status: 'placeholder',
      },
    },
  ],
  yearOptions: [
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
  ],
  yearUnavailableValue: {
    text: plain('No reference year'),
    status: 'placeholder',
  },
  combinedEnergyMetric: totalMetric,
  emptyEnergyMetric: emptyMetric,
})

const createPanels = ({
  defaultPrimaryMetricId = 'energy',
}: {
  defaultPrimaryMetricId?: EnergymapBuildingInfoPrimaryMetricId
} = {}): EnergymapBuildingInfoPanel[] => [
  {
    id: 'energyConsumption',
    title: plain('Estimated energy consumption'),
    description: plain('Consumption values for the selected building.'),
    sections: [
      {
        id: 'estimatedConsumption',
        title: plain('Energy estimate'),
        consumptionControls: createControls(defaultPrimaryMetricId),
        notes: [
          {
            id: 'estimate-note',
            text: plain('Values combine registry data and estimated heating demand.'),
            status: 'estimate',
          },
        ],
      },
    ],
  },
  {
    id: 'renovationRecommendations',
    title: plain('Renovation recommendations'),
    description: plain('Potential upgrades for the current heating profile.'),
    sections: [
      {
        id: 'renovationSummary',
        title: plain('Recommended measures'),
        rows: [
          {
            id: 'primaryMeasure',
            label: plain('Primary action'),
            text: plain('Air-to-air heat pump'),
            status: 'estimate',
          },
          {
            id: 'secondaryMeasure',
            label: plain('Additional action'),
            text: plain('Solar panels'),
            status: 'estimate',
          },
        ],
      },
      {
        id: 'scenarioComparison',
        title: plain('Scenario comparison'),
        description: plain('Estimated savings compared with current demand.'),
        scenarios: [
          {
            id: 'aahp',
            label: plain('Air-to-air heat pump'),
            values: [
              value({
                id: 'savingsPercent',
                label: 'Savings',
                text: '18%',
              }),
              value({
                id: 'annualTotal',
                label: 'Annual total',
                text: '96 MWh',
              }),
              value({
                id: 'perSquareMeter',
                label: 'Per square meter',
                text: '116 kWh/m2',
              }),
            ],
          },
          {
            id: 'solar',
            label: plain('Solar panels'),
            values: [
              value({
                id: 'savingsPercent',
                label: 'Savings',
                text: '9%',
              }),
              value({
                id: 'annualTotal',
                label: 'Annual total',
                text: '107 MWh',
              }),
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'buildingDetails',
    title: plain('Building details'),
    description: plain('Registry information for the selected building.'),
    sections: [
      {
        id: 'address',
        variant: 'buildingSubheader',
        rows: [
          {
            id: 'address',
            label: plain('Address'),
            text: plain('Keskuskatu 1, Helsinki'),
            status: 'real',
          },
        ],
      },
      {
        id: 'properties',
        rows: [
          {
            id: 'buildingType',
            label: plain('Use'),
            text: plain('Apartment building'),
            status: 'real',
          },
          {
            id: 'missingYear',
            label: plain('Renovation year'),
            text: plain('Source data unavailable'),
            status: 'missing',
            sourceProperties: ['renovation_year'],
          },
        ],
      },
      {
        id: 'energyCertificate',
        variant: 'energyCertificate',
        rows: [
          {
            id: 'energyClass',
            label: plain('Energy class'),
            text: plain('C'),
            status: 'real',
          },
          {
            id: 'energyCertificateValidity',
            label: plain('Valid until'),
            text: plain('2031'),
            status: 'real',
          },
        ],
      },
    ],
  },
]

const getFixtureExtensionOptions = (
  forceMobileLayout: boolean
): SidebarPanelExtensionRuntimeOptions => ({
  visiblePanels: ['main'],
  activePanel: 'main',
  width: 'wide',
  chrome: 'hidden',
  panelLayout: 'single',
  forceMobileLayout,
})

const BuildingInfoPanelFixtureChrome = ({
  options,
}: {
  options: SidebarPanelExtensionRuntimeOptions
}) => {
  const tabsRegistry = useSidebarPanelExtensionTabsRegistryContext()
  const tabsState = tabsRegistry.registry[FIXTURE_EXTENSION_ID]
  const tabs = tabsState?.tabs ?? []
  const resolvedActiveTabId =
    tabs.find((tab) => tab.tabId === tabsState?.activeTabId)?.tabId ??
    tabs[0]?.tabId
  const hasTabRail = tabs.length >= 2
  const desktopTabRail = hasTabRail ? (
    <SidebarPanelExtensionTabRail
      tabs={tabs}
      activeTabId={resolvedActiveTabId}
      placement="desktop"
      orientation={options.layoutMode === 'fullscreen' ? 'row' : 'column'}
      onTabChange={(tabId) =>
        tabsRegistry.setActiveTabId(FIXTURE_EXTENSION_ID, tabId)
      }
    />
  ) : undefined
  const mobileTabRail = hasTabRail ? (
    <SidebarPanelExtensionTabRail
      tabs={tabs}
      activeTabId={resolvedActiveTabId}
      placement="mobile"
      onTabChange={(tabId) =>
        tabsRegistry.setActiveTabId(FIXTURE_EXTENSION_ID, tabId)
      }
    />
  ) : undefined

  return (
    <SidebarPanelExtension
      extensionId={FIXTURE_EXTENSION_ID}
      options={options}
      visible
      desktopTabRail={desktopTabRail}
      mobileTabRail={mobileTabRail}
    />
  )
}

const BuildingInfoPanelFixtureState = ({
  activeTabId = 'basic',
  defaultPrimaryMetricId,
  forceMobileLayout = false,
}: {
  activeTabId?: BuildingInfoTabId
  defaultPrimaryMetricId?: EnergymapBuildingInfoPrimaryMetricId
  forceMobileLayout?: boolean
}) => {
  const extensionOptions = React.useMemo(
    () => getFixtureExtensionOptions(forceMobileLayout),
    [forceMobileLayout]
  )

  return (
    <SlotsProvider>
      <SidebarPanelExtensionTabsProvider>
        <SidebarPanelExtensionContextProvider
          value={{ extensionId: FIXTURE_EXTENSION_ID, depth: 0 }}
        >
          <Box
            sx={{
              position: 'relative',
              width: forceMobileLayout ? 390 : 960,
              height: 760,
              maxWidth: '100%',
              overflow: 'hidden',
              backgroundColor: '#e7ece7',
            }}
          >
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <BuildingInfoTabPages
                panels={createPanels({ defaultPrimaryMetricId })}
                ariaLabels={ariaLabels}
                activeTabId={activeTabId}
                forceMobileLayout={forceMobileLayout}
                onActiveTabChange={noop}
                onClose={noop}
                onCollapse={noop}
              />
            </IntoSidebarPanelExtensionPanelSlot>
            <BuildingInfoPanelFixtureChrome options={extensionOptions} />
          </Box>
        </SidebarPanelExtensionContextProvider>
      </SidebarPanelExtensionTabsProvider>
    </SlotsProvider>
  )
}

const ActionRailFixtureState = () => (
  <Box
    sx={{
      p: 2,
      backgroundColor: '#e7ece7',
    }}
  >
    <BuildingInfoActionRail
      activeMode="twoPanel"
      isCollapsed
      orientation="row"
      ariaLabels={ariaLabels}
      onModeChange={noop}
    />
  </Box>
)

export const energymapBuildingInfoPanelFixture: ComponentFixture = {
  id: 'energymap-building-info-panel',
  label: 'Energiakartta building info panel',
  description:
    'Energiakartta building-info panel tabs, metric controls, mobile layout, and collapsed action rail.',
  sourceGlobs: [
    'src/applets/energy/components/BuildingInfoPanel.tsx',
    'src/applets/energy/components/BuildingInfoPanel.test.tsx',
    'src/common/component-fixtures/fixtures/EnergymapBuildingInfoPanelFixture.tsx',
  ],
  canvasSx: {
    p: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  states: [
    {
      id: 'desktop-basic',
      label: 'Desktop basic',
      description: 'Basic two-panel tab with metric controls.',
      waitFor: '[data-testid="building-info-tab-page-basic"]',
      render: () => <BuildingInfoPanelFixtureState activeTabId="basic" />,
    },
    {
      id: 'desktop-renovation',
      label: 'Desktop renovation',
      description: 'Renovation tab with comparison and effectiveness content.',
      waitFor: '[data-testid="building-info-tab-page-renovation"]',
      render: () => <BuildingInfoPanelFixtureState activeTabId="renovation" />,
    },
    {
      id: 'mobile-renovation',
      label: 'Mobile renovation',
      description: 'Forced stacked layout for the renovation tab.',
      waitFor: '[data-testid="building-info-tab-page-renovation"]',
      render: () => (
        <BuildingInfoPanelFixtureState
          activeTabId="renovation"
          forceMobileLayout
        />
      ),
    },
    {
      id: 'metric-unsupported',
      label: 'Unsupported metric',
      description: 'Unsupported primary metric selected by default.',
      waitFor: '[data-testid="building-info-tab-page-basic"]',
      render: () => (
        <BuildingInfoPanelFixtureState defaultPrimaryMetricId="water" />
      ),
    },
    {
      id: 'action-rail-collapsed',
      label: 'Collapsed action rail',
      description: 'Collapsed row action rail with both reopen buttons.',
      waitFor: '[data-testid="building-info-action-rail"]',
      canvasSx: {
        p: 3,
      },
      render: () => <ActionRailFixtureState />,
    },
  ],
}
