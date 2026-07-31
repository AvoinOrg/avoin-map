import React from 'react'
import '@testing-library/jest-dom'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import { AppThemeProvider } from '#/common/style/theme'
import { SlotsProvider } from '#/components/context/slotsContext'
import { SidebarRoot } from '#/components/Sidebar/SidebarRoot'
import { SidebarPanelExtensionProvider } from '#/components/Sidebar/SidebarPanelExtensionProvider'
import { IntoSidebarPanelExtensionPanelSlot } from '#/components/Sidebar/sidebarSlots'
import {
  BuildingInfoActionRail,
  BuildingInfoTabPages,
  BuildingInfoText,
  getBuildingInfoPanelIds,
  getBuildingInfoTabPanelIds,
} from './BuildingInfoPanel'
import {
  ENERGYMAP_BUILDING_INFO_BASIC_DESKTOP_MIN_WIDTH_PX,
  ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_PANEL_WIDTH_PX,
  ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_MIN_WIDTH_PX,
  getEnergymapBuildingInfoDesktopMinWidthPx,
  getEnergymapBuildingInfoPanelRuntimeOptions,
} from '../common/buildingInfoPanelRuntime'
import type {
  EnergymapBuildingInfoConsumptionControls,
  EnergymapBuildingInfoMetric,
  EnergymapBuildingInfoPanel,
  EnergymapBuildingInfoText,
  EnergymapBuildingInfoValue,
} from '../common/buildingInfo'
import type { BuildingInfoTabId } from './BuildingInfoPanel'

jest.mock('#/common/store', () => ({
  useUIStore: jest.requireActual('#/common/store/uiStore').useUIStore,
}))

let mockIsMobile = false

jest.mock('#/common/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

jest.mock('@tolgee/react', () => {
  const ReactRuntime = jest.requireActual<typeof import('react')>('react')

  return {
    T: ({
      keyName,
      params,
    }: {
      keyName: string
      params?: Record<string, string | number>
    }) =>
      ReactRuntime.createElement(
        'span',
        null,
        params?.code == null ? keyName : `${keyName}:${params.code}`
      ),
    useTranslate: () => ({
      t: (keyName: string) => keyName,
    }),
  }
})

jest.mock('overlayscrollbars-react', () => {
  const ReactRuntime = jest.requireActual<typeof import('react')>('react')

  return {
    OverlayScrollbarsComponent: ({
      children,
      className,
      options,
      style,
      ...props
    }: {
      children: React.ReactNode
      className?: string
      options?: {
        overflow?: {
          x?: string
          y?: string
        }
        scrollbars?: {
          autoHide?: string
          visibility?: string
          theme?: string
        }
      }
      style?: React.CSSProperties
    }) =>
      ReactRuntime.createElement(
        'div',
        {
          ...props,
          className,
          style,
          'data-auto-hide': options?.scrollbars?.autoHide,
          'data-scrollbar-visibility': options?.scrollbars?.visibility,
          'data-scrollbar-theme': options?.scrollbars?.theme,
          'data-overflow-x': options?.overflow?.x,
          'data-overflow-y': options?.overflow?.y,
        },
        children
      ),
  }
})

const translation = (
  keyName: string,
  params?: Record<string, string | number>
): EnergymapBuildingInfoText => ({
  type: 'translation',
  keyName,
  ...(params == null ? {} : { params }),
})

const plain = (text: string): EnergymapBuildingInfoText => ({
  type: 'plain',
  text,
})

const metricValue = ({
  id,
  labelKey,
  text,
  status = 'estimate',
  sourceProperties,
  unitKey = 'unit.kwh',
}: {
  id: 'annualTotal' | 'perSquareMeter'
  labelKey: string
  text: EnergymapBuildingInfoText
  status?: EnergymapBuildingInfoValue['status']
  sourceProperties?: string[]
  unitKey?: string
}) => ({
  id,
  label: translation(labelKey),
  text,
  status,
  ...(sourceProperties == null ? {} : { sourceProperties }),
  unitKey,
})

const createEnergyMetric = ({
  id,
  labelKey,
  annualText,
  squareText,
  annualSources,
  squareSources,
  status = 'estimate',
}: {
  id: EnergymapBuildingInfoMetric['id']
  labelKey: string
  annualText: EnergymapBuildingInfoText
  squareText: EnergymapBuildingInfoText
  annualSources?: string[]
  squareSources?: string[]
  status?: EnergymapBuildingInfoValue['status']
}): EnergymapBuildingInfoMetric => ({
  id,
  label: translation(labelKey),
  values: [
    metricValue({
      id: 'annualTotal',
      labelKey: 'panels.energy.metric.annual_total',
      text: annualText,
      status,
      sourceProperties: annualSources,
    }),
    metricValue({
      id: 'perSquareMeter',
      labelKey: 'panels.energy.metric.per_square_meter',
      text: squareText,
      status,
      sourceProperties: squareSources,
      unitKey: 'unit.kwh_square',
    }),
  ],
})

const totalEnergyMetric = createEnergyMetric({
  id: 'total',
  labelKey: 'panels.energy.series.total',
  annualText: plain('100'),
  squareText: plain('10'),
  annualSources: ['distr_default_total', 'floor_area'],
  squareSources: ['distr_default_total'],
})

const heatingEnergyMetric = createEnergyMetric({
  id: 'heating',
  labelKey: 'panels.energy.series.heating',
  annualText: plain('70'),
  squareText: plain('7'),
  annualSources: ['distr_default_heat', 'floor_area'],
  squareSources: ['distr_default_heat'],
})

const electricityEnergyMetric = createEnergyMetric({
  id: 'electricity',
  labelKey: 'panels.energy.series.electricity',
  annualText: plain('30'),
  squareText: plain('3'),
  annualSources: ['distr_default_elec', 'floor_area'],
  squareSources: ['distr_default_elec'],
})

const waterHeatingEnergyMetric = createEnergyMetric({
  id: 'waterHeating',
  labelKey: 'panels.energy.series.water_heating',
  annualText: translation('value.water_heating_unavailable'),
  squareText: translation('value.water_heating_unavailable'),
})

const emptyEnergyMetric = createEnergyMetric({
  id: 'total',
  labelKey: 'panels.energy.series.total',
  annualText: translation(
    'sidebar.building_info.panels.energy.unsupported.no_selected_energy_submetrics'
  ),
  squareText: translation(
    'sidebar.building_info.panels.energy.unsupported.no_selected_energy_submetrics'
  ),
  status: 'placeholder',
})

const consumptionControls: EnergymapBuildingInfoConsumptionControls = {
  defaultPrimaryMetricId: 'energy',
  primaryMetrics: [
    {
      id: 'energy',
      label: translation('sidebar.building_info.panels.energy.primary.energy'),
      ariaLabelKey: 'sidebar.building_info.panels.energy.primary.energy',
      supported: true,
    },
    {
      id: 'water',
      label: translation('sidebar.building_info.panels.energy.primary.water'),
      ariaLabelKey: 'sidebar.building_info.panels.energy.primary.water',
      supported: false,
      value: {
        text: translation(
          'sidebar.building_info.panels.energy.unsupported.water'
        ),
        status: 'placeholder',
      },
      unavailableNote: {
        id: 'waterUnavailable',
        text: translation(
          'sidebar.building_info.panels.energy.unsupported.water'
        ),
        status: 'placeholder',
      },
    },
    {
      id: 'cost',
      label: translation('sidebar.building_info.panels.energy.primary.cost'),
      ariaLabelKey: 'sidebar.building_info.panels.energy.primary.cost',
      supported: true,
      value: {
        text: plain('19,613'),
        status: 'estimate',
        unitKey: 'sidebar.building_info.units.eur_per_year',
      },
    },
    {
      id: 'co2',
      label: translation('sidebar.building_info.panels.energy.primary.co2'),
      ariaLabelKey: 'sidebar.building_info.panels.energy.primary.co2',
      supported: true,
      value: {
        text: plain('18,436'),
        status: 'estimate',
        unitKey: 'sidebar.building_info.units.kg_co2_per_year',
      },
    },
  ],
  defaultEnergySubmetricIds: ['electricity', 'heating'],
  energySubmetrics: [
    {
      id: 'electricity',
      label: translation('panels.energy.series.electricity'),
      ariaLabelKey: 'panels.energy.series.electricity',
      supported: true,
      defaultSelected: true,
      metric: electricityEnergyMetric,
    },
    {
      id: 'heating',
      label: translation('panels.energy.series.heating'),
      ariaLabelKey: 'panels.energy.series.heating',
      supported: true,
      defaultSelected: true,
      metric: heatingEnergyMetric,
    },
    {
      id: 'waterHeating',
      label: translation('panels.energy.series.water_heating'),
      ariaLabelKey: 'panels.energy.series.water_heating',
      supported: false,
      defaultSelected: false,
      metric: waterHeatingEnergyMetric,
      unavailableNote: {
        id: 'waterHeatingUnavailable',
        text: translation(
          'sidebar.building_info.panels.energy.unsupported.water_heating'
        ),
        status: 'placeholder',
      },
    },
  ],
  combinedEnergyMetric: totalEnergyMetric,
  emptyEnergyMetric,
}

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider disableCssBaseline>{ui}</AppThemeProvider>)
}

const resetUIStore = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
    sidebarPanelExtensions: {},
    _sidebarPanelExtensionRegistrationOrder: 0,
    isSidebarOpen: true,
    isSidebarDisabled: false,
    isSidebarLoading: false,
    sidebarHeaderConfig: { title: 'Test sidebar' },
    sidebarWidth: undefined,
  })
}

const panels: EnergymapBuildingInfoPanel[] = [
  {
    id: 'energyConsumption',
    title: translation('panel.energy.title'),
    description: translation('panel.energy.description'),
    sections: [
      {
        id: 'estimatedConsumption',
        title: translation('section.energy.estimated.title'),
        metrics: [
          totalEnergyMetric,
          heatingEnergyMetric,
          electricityEnergyMetric,
          waterHeatingEnergyMetric,
        ],
        consumptionControls,
        notes: [
          {
            id: 'estimatedConsumption',
            text: translation('note.energy.estimated'),
            status: 'estimate',
          },
        ],
      },
      {
        id: 'energyRows',
        rows: [
          {
            id: 'sequenceRow',
            label: translation('row.sequence.label'),
            text: {
              type: 'sequence',
              separator: ' / ',
              parts: [
                translation('value.part_a'),
                {
                  type: 'sequence',
                  separator: ' + ',
                  parts: [plain('plain value'), translation('value.part_b')],
                },
              ],
            },
            status: 'estimate',
            sourceProperties: ['distr_default_total', 'floor_area'],
            unitKey: 'unit.kwh',
          },
        ],
        notes: [
          {
            id: 'placeholderNote',
            text: translation('note.placeholder'),
            status: 'placeholder',
          },
        ],
      },
      {
        id: 'calculationContext',
        title: translation('section.energy.calculation_context.title'),
        rows: [
          {
            id: 'costMode',
            label: translation('panels.energy.rows.cost_mode'),
            text: translation('placeholders.not_published'),
            status: 'placeholder',
          },
        ],
      },
    ],
  },
  {
    id: 'renovationRecommendations',
    title: translation('panel.renovation.title'),
    description: translation('panel.renovation.description'),
    sections: [
      {
        id: 'scenarioComparison',
        title: translation('section.scenario.title'),
        description: translation('section.scenario.description'),
        scenarios: [
          {
            id: 'aahp',
            label: translation('scenario.aahp.label'),
            values: [
              {
                id: 'annualTotal',
                label: translation('metric.annual.label'),
                text: plain('12000'),
                status: 'estimate',
                sourceProperties: ['aahp_total'],
                unitKey: 'unit.kwh',
              },
              {
                id: 'perSquareMeter',
                label: translation('metric.square.label'),
                text: plain('34'),
                status: 'estimate',
                sourceProperties: ['aahp_square'],
                unitKey: 'unit.kwh_square',
              },
              {
                id: 'savingsPercent',
                label: translation('metric.savings.label'),
                text: plain('-12%'),
                status: 'estimate',
                sourceProperties: ['default_total', 'aahp_total'],
              },
            ],
          },
        ],
        notes: [
          {
            id: 'scenarioEstimate',
            text: translation(
              'sidebar.building_info.panels.renovation.note.scenario_estimate'
            ),
            status: 'estimate',
          },
        ],
      },
    ],
  },
  {
    id: 'buildingDetails',
    title: translation('panel.building.title'),
    sections: [
      {
        id: 'buildingSubheader',
        variant: 'buildingSubheader',
        rows: [
          {
            id: 'address',
            label: translation('row.address.label'),
            text: plain('Test address 1'),
            status: 'real',
            sourceProperties: [
              'address_fin',
              'postal_code',
              'postal_office_fin',
            ],
          },
        ],
      },
      {
        id: 'identity',
        rows: [
          {
            id: 'missingRow',
            label: translation('row.missing.label'),
            text: translation('value.missing'),
            status: 'missing',
            sourceProperties: ['main_purpose'],
          },
          {
            id: 'placeholderRow',
            label: translation('row.placeholder.label'),
            text: translation('value.placeholder'),
            status: 'placeholder',
            sourceProperties: ['planned_measure'],
          },
        ],
      },
      {
        id: 'energyCertificate',
        variant: 'energyCertificate',
        rows: [
          {
            id: 'energyClass',
            label: translation('row.energy_class.label'),
            text: plain('B'),
            status: 'real',
            sourceProperties: ['energy_certificate_class'],
          },
        ],
      },
      {
        id: 'previousEnergyClass',
        variant: 'previousEnergyClass',
        rows: [
          {
            id: 'previousEnergyClass',
            label: translation('row.previous_energy_class.label'),
            text: translation('value.placeholder'),
            status: 'placeholder',
            sourceProperties: ['previous_energy_certificate_class'],
          },
          {
            id: 'energyClassMeasures',
            label: translation('row.energy_class_measures.label'),
            text: translation('value.placeholder'),
            status: 'placeholder',
            sourceProperties: ['energy_class_measure'],
          },
        ],
      },
      {
        id: 'plannedMeasures',
        variant: 'measureList',
        rows: [
          {
            id: 'plannedMeasures',
            label: translation('row.planned_measures.label'),
            text: translation('value.placeholder'),
            status: 'placeholder',
            sourceProperties: ['planned_measure'],
          },
        ],
      },
    ],
  },
]

const ariaLabels = {
  close: 'Close building information',
  collapse: 'Collapse building information',
  overview: 'Open energy and building information',
  renovation: 'Open renovation recommendations',
}

const getPanelsWithConsumptionControls = (
  controls: EnergymapBuildingInfoConsumptionControls
): EnergymapBuildingInfoPanel[] =>
  panels.map((panel) =>
    panel.id === 'energyConsumption'
      ? {
          ...panel,
          sections: panel.sections.map((section) =>
            section.id === 'estimatedConsumption'
              ? { ...section, consumptionControls: controls }
              : section
          ),
        }
      : panel
  )

type RenderBuildingInfoTabsOptions = {
  activeTabId?: BuildingInfoTabId
  forceMobileLayout?: boolean
  isDesktopFullscreenLayout?: boolean
  onActiveTabChange?: (tabId: BuildingInfoTabId) => void
  onClose?: () => void
  onCollapse?: (tabId: BuildingInfoTabId) => void
  panels?: EnergymapBuildingInfoPanel[]
}

const createBuildingInfoTabsElement = ({
  activeTabId,
  forceMobileLayout = false,
  isDesktopFullscreenLayout = false,
  onActiveTabChange = jest.fn(),
  onClose = jest.fn(),
  onCollapse = jest.fn(),
  panels: buildingInfoPanels = panels,
}: RenderBuildingInfoTabsOptions = {}) => (
  <SlotsProvider>
    <SidebarRoot>
      <SidebarPanelExtensionProvider
        id="building-info-test-extension"
        initialRuntimeOptions={{ visiblePanels: ['main'], activePanel: 'main' }}
      >
        <IntoSidebarPanelExtensionPanelSlot panelId="main">
          <BuildingInfoTabPages
            panels={buildingInfoPanels}
            ariaLabels={ariaLabels}
            activeTabId={activeTabId}
            forceMobileLayout={forceMobileLayout}
            isDesktopFullscreenLayout={isDesktopFullscreenLayout}
            onActiveTabChange={onActiveTabChange}
            onClose={onClose}
            onCollapse={onCollapse}
          />
        </IntoSidebarPanelExtensionPanelSlot>
      </SidebarPanelExtensionProvider>
    </SidebarRoot>
  </SlotsProvider>
)

const renderBuildingInfoTabs = (
  options: RenderBuildingInfoTabsOptions = {}
) => {
  const result = renderWithTheme(createBuildingInfoTabsElement(options))

  return {
    ...result,
    rerenderBuildingInfoTabs: (
      nextOptions: RenderBuildingInfoTabsOptions = {}
    ) => {
      result.rerender(
        <AppThemeProvider disableCssBaseline>
          {createBuildingInfoTabsElement({ ...options, ...nextOptions })}
        </AppThemeProvider>
      )
    },
  }
}

describe('BuildingInfoPanel', () => {
  beforeEach(() => {
    mockIsMobile = false
    resetUIStore()
  })

  it('recursively renders sequence text and translation descriptors', () => {
    render(
      <BuildingInfoText
        text={{
          type: 'sequence',
          separator: ' / ',
          parts: [
            translation('first.key'),
            {
              type: 'sequence',
              separator: ' + ',
              parts: [plain('plain'), translation('unknown.code', { code: 99 })],
            },
          ],
        }}
      />
    )

    expect(document.body).toHaveTextContent(
      'first.key / plain + unknown.code:99'
    )
  })

  it('renders the basic building information tab through SidebarPanelExtension', async () => {
    renderBuildingInfoTabs()

    expect(
      await screen.findByTestId('building-info-tab-page-basic')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tablist', { name: /sidebar panel extension tabs/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', {
        name: 'Open energy and building information',
      })
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('tab', {
        name: 'Open renovation recommendations',
      })
    ).toHaveAttribute('aria-selected', 'false')
    expect(getBuildingInfoPanelIds('twoPanel')).toEqual([
      'energyConsumption',
      'buildingDetails',
    ])
    expect(getBuildingInfoTabPanelIds('basic')).toEqual([
      'energyConsumption',
      'buildingDetails',
    ])
    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual(['energyConsumption', 'buildingDetails'])
    expect(screen.getByTestId('building-info-grid')).toHaveAttribute(
      'data-building-info-grid-layout',
      'basic'
    )
    expect(
      screen.getByTestId('building-info-grid-section-basic-energy')
    ).toHaveAttribute('data-grid-area', 'energy')
    expect(
      screen.getByTestId('building-info-grid-section-basic-building-details')
    ).toHaveAttribute('data-grid-area', 'details')
    expect(
      screen.queryByTestId('building-info-panel-renovationRecommendations')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('building-info-grid-section-top-renovation')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('building-info-grid-section-bottom-wide')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('building-info-grid-section-bottom-right')
    ).not.toBeInTheDocument()
    expect(screen.getAllByTestId('sidebar-panel-extension-page-scroll')).toHaveLength(1)
    expect(screen.queryByTestId(/^building-info-scroll-/)).not.toBeInTheDocument()
  })

  it('switches to the renovation recommendation tab', async () => {
    renderBuildingInfoTabs()

    fireEvent.click(
      await screen.findByRole('tab', {
        name: 'Open renovation recommendations',
      })
    )

    expect(
      await screen.findByTestId('building-info-tab-page-renovation')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', {
        name: 'Open energy and building information',
      })
    ).toHaveAttribute('aria-selected', 'false')
    expect(
      screen.getByRole('tab', {
        name: 'Open renovation recommendations',
      })
    ).toHaveAttribute('aria-selected', 'true')
    expect(getBuildingInfoPanelIds('threePanel')).toEqual([
      'energyConsumption',
      'renovationRecommendations',
      'buildingDetails',
    ])
    expect(getBuildingInfoTabPanelIds('renovation')).toEqual([
      'energyConsumption',
      'renovationRecommendations',
      'buildingDetails',
    ])
    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual([
      'energyConsumption',
      'renovationRecommendations',
      'buildingDetails',
    ])
    expect(screen.getByTestId('building-info-grid')).toHaveAttribute(
      'data-building-info-grid-layout',
      'renovation'
    )
    expect(
      screen.getByTestId('building-info-grid-section-top-energy')
    ).toHaveAttribute('data-grid-area', 'energy')
    expect(
      screen.getByTestId('building-info-grid-section-top-renovation')
    ).toHaveAttribute('data-grid-area', 'renovation')
    expect(
      screen.getByTestId('building-info-grid-section-top-building-details')
    ).toHaveAttribute('data-grid-area', 'details')
    expect(
      screen.getByTestId('building-info-grid-section-bottom-wide')
    ).toHaveAttribute('data-grid-area', 'comparison')
    expect(
      screen.getByTestId('building-info-grid-section-bottom-right')
    ).toHaveAttribute('data-grid-area', 'effectiveness')
    expect(
      screen.getByTestId('building-info-grid-section-bottom-right')
    ).toHaveStyle({ backgroundColor: '#f0f0f0' })
    expect(
      screen.getByTestId('building-info-renovation-comparison-wide')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('section.energy.calculation_context.title')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('building-info-renovation-reference-year-note')
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('building-info-renovation-effectiveness-content')
    ).toHaveTextContent(
      'sidebar.building_info.panels.renovation.effectiveness.title'
    )
    expect(
      screen.getByTestId('building-info-renovation-effectiveness-content')
    ).toHaveTextContent(
      'sidebar.building_info.panels.renovation.effectiveness.body'
    )
    expect(
      screen.getByTestId('building-info-renovation-effectiveness-indicator')
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        'sidebar.building_info.panels.renovation.note.scenario_estimate'
      )
    ).not.toBeInTheDocument()

    const energyBody = screen.getByTestId(
      'building-info-panel-energyConsumption'
    ).firstElementChild as HTMLElement
    const buildingDetailsBody = screen.getByTestId(
      'building-info-panel-buildingDetails'
    ).firstElementChild as HTMLElement

    expect(energyBody).toHaveStyle({
      width: 'min(17.625rem, calc(100% - 3rem))',
      marginLeft: 'auto',
      marginRight: 'auto',
    })
    expect(buildingDetailsBody).toHaveStyle({
      width: 'min(17.625rem, calc(100% - 3rem))',
      marginLeft: 'auto',
      marginRight: 'auto',
    })
  })

  it('notifies page state when the active tab changes', async () => {
    const onActiveTabChange = jest.fn()

    renderBuildingInfoTabs({ onActiveTabChange })

    await screen.findByTestId('building-info-tab-page-basic')
    await waitFor(() => {
      expect(onActiveTabChange).toHaveBeenCalledWith('basic')
    })

    fireEvent.click(
      screen.getByRole('tab', {
        name: 'Open renovation recommendations',
      })
    )

    await waitFor(() => {
      expect(onActiveTabChange).toHaveBeenCalledWith('renovation')
    })
  })

  it('keeps the mobile tab page on the F028.2 stacked sections', async () => {
    mockIsMobile = true

    renderBuildingInfoTabs({ activeTabId: 'renovation' })

    expect(
      await screen.findByTestId('building-info-tab-page-renovation')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('building-info-grid')).not.toBeInTheDocument()
    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual([
      'energyConsumption',
      'renovationRecommendations',
      'buildingDetails',
    ])
    expect(screen.getAllByTestId('sidebar-panel-extension-page-scroll')).toHaveLength(1)
    expect(screen.queryByTestId(/^building-info-scroll-/)).not.toBeInTheDocument()
    expect(screen.getByTestId('sidebar-panel-extension-page-scroll')).toHaveAttribute(
      'data-overflow-y',
      'scroll'
    )
    expect(screen.getByTestId('sidebar-panel-extension-page-scroll')).toHaveAttribute(
      'data-scrollbar-visibility',
      'auto'
    )
    expect(screen.getByTestId('sidebar-panel-extension-page-scroll')).toHaveAttribute(
      'data-auto-hide',
      'leave'
    )
    expect(screen.getByTestId('sidebar-panel-extension-page-scroll')).toHaveClass('osLeft')
  })

  it('keeps the mobile basic tab stacked without the desktop grid', async () => {
    mockIsMobile = true

    renderBuildingInfoTabs()

    expect(
      await screen.findByTestId('building-info-tab-page-basic')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('building-info-grid')).not.toBeInTheDocument()
    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual(['energyConsumption', 'buildingDetails'])
    expect(screen.getAllByTestId('sidebar-panel-extension-page-scroll')).toHaveLength(1)
    expect(screen.queryByTestId(/^building-info-scroll-/)).not.toBeInTheDocument()
    expect(
      screen.getByTestId('building-info-energy-consumption-section')
    ).toBeInTheDocument()
  })

  it('can force the desktop basic tab into the mobile stacked layout', async () => {
    renderBuildingInfoTabs({ forceMobileLayout: true })

    expect(
      await screen.findByTestId('building-info-tab-page-basic')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('building-info-grid')).not.toBeInTheDocument()
    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual(['energyConsumption', 'buildingDetails'])
  })

  it('can force the desktop renovation tab into the mobile stacked layout', async () => {
    renderBuildingInfoTabs({
      activeTabId: 'renovation',
      forceMobileLayout: true,
    })

    expect(
      await screen.findByTestId('building-info-tab-page-renovation')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('building-info-grid')).not.toBeInTheDocument()
    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual([
      'energyConsumption',
      'renovationRecommendations',
      'buildingDetails',
    ])
  })

  it('renders the interactive energy controls in the basic tab', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')
    const energyPanel = screen.getByTestId(
      'building-info-panel-energyConsumption'
    )
    const energyButton = within(energyPanel).getByRole('button', {
      name: 'sidebar.building_info.panels.energy.primary.energy',
    })
    const waterButton = within(energyPanel).getByRole('button', {
      name: 'sidebar.building_info.panels.energy.primary.water',
    })

    expect(within(energyPanel).queryByRole('combobox')).not.toBeInTheDocument()
    expect(energyButton).toHaveAttribute('aria-pressed', 'true')
    expect(energyButton).toHaveTextContent(
      'sidebar.building_info.panels.energy.primary.energy'
    )
    expect(waterButton).toHaveAttribute('aria-pressed', 'false')
    expect(waterButton).not.toHaveTextContent(
      'sidebar.building_info.panels.energy.primary.water'
    )
    expect(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.electricity',
      })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.heating',
      })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.water_heating',
      })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      within(energyPanel).getByTestId('building-info-energy-consumption-values')
    ).toHaveTextContent('100')
    expect(energyPanel).not.toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.water_heating'
    )
  })

  it('updates the energy value table when submetrics are toggled', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')
    const energyPanel = screen.getByTestId(
      'building-info-panel-energyConsumption'
    )
    const values = within(energyPanel).getByTestId(
      'building-info-energy-consumption-values'
    )

    fireEvent.click(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.heating',
      })
    )
    expect(values).toHaveTextContent('30')
    expect(values).not.toHaveTextContent('100')
    expect(energyPanel).not.toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.water_heating'
    )

    fireEvent.click(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.water_heating',
      })
    )
    expect(values).toHaveTextContent('30')
    expect(energyPanel).toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.water_heating'
    )

    fireEvent.click(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.electricity',
      })
    )
    expect(values).toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.no_selected_energy_submetrics'
    )
    expect(energyPanel).toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.water_heating'
    )
  })

  it('allows deselecting every supported energy submetric', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')
    const energyPanel = screen.getByTestId(
      'building-info-panel-energyConsumption'
    )
    const values = within(energyPanel).getByTestId(
      'building-info-energy-consumption-values'
    )

    fireEvent.click(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.heating',
      })
    )
    fireEvent.click(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.electricity',
      })
    )

    expect(values).toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.no_selected_energy_submetrics'
    )
    expect(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.electricity',
      })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.heating',
      })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.water_heating',
      })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(energyPanel).not.toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.water_heating'
    )
  })

  it('normalizes energy control state when building controls change', async () => {
    const controlsWithReducedOptions: EnergymapBuildingInfoConsumptionControls =
      {
        ...consumptionControls,
        primaryMetrics: consumptionControls.primaryMetrics.filter(
          (metric) => metric.id !== 'water'
        ),
        energySubmetrics: consumptionControls.energySubmetrics.filter(
          (submetric) => submetric.id !== 'waterHeating'
        ),
        defaultEnergySubmetricIds: ['electricity', 'heating'],
      }
    const view = renderBuildingInfoTabs({
      panels: getPanelsWithConsumptionControls(consumptionControls),
    })

    await screen.findByTestId('building-info-tab-page-basic')
    const getEnergyPanel = () =>
      screen.getByTestId('building-info-panel-energyConsumption')

    fireEvent.click(
      within(getEnergyPanel()).getByRole('button', {
        name: 'panels.energy.series.water_heating',
      })
    )
    fireEvent.click(
      within(getEnergyPanel()).getByRole('button', {
        name: 'panels.energy.series.heating',
      })
    )
    fireEvent.click(
      within(getEnergyPanel()).getByRole('button', {
        name: 'panels.energy.series.electricity',
      })
    )
    expect(
      within(getEnergyPanel()).getByTestId(
        'building-info-energy-consumption-values'
      )
    ).toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.no_selected_energy_submetrics'
    )

    fireEvent.click(
      within(getEnergyPanel()).getByRole('button', {
        name: 'sidebar.building_info.panels.energy.primary.water',
      })
    )

    view.rerenderBuildingInfoTabs({
      panels: getPanelsWithConsumptionControls(controlsWithReducedOptions),
    })

    await waitFor(() => {
      expect(
        within(getEnergyPanel()).getByRole('button', {
          name: 'sidebar.building_info.panels.energy.primary.energy',
        })
      ).toHaveAttribute('aria-pressed', 'true')
      expect(
        within(getEnergyPanel()).getByRole('button', {
          name: 'panels.energy.series.electricity',
        })
      ).toHaveAttribute('aria-pressed', 'true')
      expect(
        within(getEnergyPanel()).getByRole('button', {
          name: 'panels.energy.series.heating',
        })
      ).toHaveAttribute('aria-pressed', 'true')
    })

    fireEvent.click(
      within(getEnergyPanel()).getByRole('button', {
        name: 'panels.energy.series.electricity',
      })
    )

    const values = within(getEnergyPanel()).getByTestId(
      'building-info-energy-consumption-values'
    )
    expect(values).toHaveTextContent('70')
    expect(values).not.toHaveTextContent('30')
    expect(
      within(getEnergyPanel()).getByRole('button', {
        name: 'panels.energy.series.electricity',
      })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      within(getEnergyPanel()).getByRole('button', {
        name: 'panels.energy.series.heating',
      })
    ).toHaveAttribute('aria-pressed', 'true')

    view.rerenderBuildingInfoTabs({
      panels: getPanelsWithConsumptionControls(consumptionControls),
    })

    await waitFor(() => {
      expect(
        within(getEnergyPanel()).getByRole('button', {
          name: 'sidebar.building_info.panels.energy.primary.energy',
        })
      ).toHaveAttribute('aria-pressed', 'true')
      expect(
        within(getEnergyPanel()).getByRole('button', {
          name: 'sidebar.building_info.panels.energy.primary.water',
        })
      ).toHaveAttribute('aria-pressed', 'false')
    })
  })

  it('switches between Energy, supported Cost and CO2, unavailable Water, and back', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')
    const energyPanel = screen.getByTestId(
      'building-info-panel-energyConsumption'
    )

    fireEvent.click(
      within(energyPanel).getByRole('button', {
        name: 'sidebar.building_info.panels.energy.primary.water',
      })
    )

    const waterButton = within(energyPanel).getByRole('button', {
      name: 'sidebar.building_info.panels.energy.primary.water',
    })
    expect(waterButton).toHaveAttribute('aria-pressed', 'true')
    expect(waterButton).toHaveTextContent(
      'sidebar.building_info.panels.energy.primary.water'
    )
    const waterPanel = within(energyPanel).getByTestId(
      'building-info-primary-metric-value'
    )
    expect(waterPanel).toHaveAttribute('data-primary-metric-id', 'water')
    expect(waterPanel).toHaveAttribute('data-primary-metric-supported', 'false')
    expect(waterPanel).toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.water'
    )
    expect(
      within(waterPanel).getByTestId('building-info-unavailable-value-icon')
    ).toBeInTheDocument()
    expect(
      within(energyPanel).queryByTestId('building-info-energy-submetric-row')
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(energyPanel).getByRole('button', {
        name: 'sidebar.building_info.panels.energy.primary.cost',
      })
    )
    const costPanel = within(energyPanel).getByTestId(
      'building-info-primary-metric-value'
    )
    expect(costPanel).toHaveAttribute('data-primary-metric-id', 'cost')
    expect(costPanel).toHaveAttribute('data-primary-metric-supported', 'true')
    expect(costPanel).toHaveTextContent('19,613')
    expect(costPanel).toHaveTextContent(
      'sidebar.building_info.units.eur_per_year'
    )
    expect(
      within(costPanel).queryByTestId('building-info-unavailable-value-icon')
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(energyPanel).getByRole('button', {
        name: 'sidebar.building_info.panels.energy.primary.co2',
      })
    )
    const co2Panel = within(energyPanel).getByTestId(
      'building-info-primary-metric-value'
    )
    expect(co2Panel).toHaveAttribute('data-primary-metric-id', 'co2')
    expect(co2Panel).toHaveAttribute('data-primary-metric-supported', 'true')
    expect(co2Panel).toHaveTextContent('18,436')
    expect(co2Panel).toHaveTextContent(
      'sidebar.building_info.units.kg_co2_per_year'
    )

    fireEvent.click(
      within(energyPanel).getByRole('button', {
        name: 'sidebar.building_info.panels.energy.primary.energy',
      })
    )
    expect(
      within(energyPanel).getByTestId('building-info-energy-submetric-row')
    ).toBeInTheDocument()
    expect(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.electricity',
      })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.heating',
      })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows unsupported Cost through the exact unavailable-value path without a partial number', async () => {
    const unsupportedCostControls: EnergymapBuildingInfoConsumptionControls = {
      ...consumptionControls,
      primaryMetrics: consumptionControls.primaryMetrics.map((metric) =>
        metric.id === 'cost'
          ? {
              ...metric,
              supported: false,
              value: {
                text: translation(
                  'sidebar.building_info.panels.energy.unsupported.apartment_pellet_cost'
                ),
                status: 'placeholder',
              },
              unavailableNote: {
                id: 'costUnavailable',
                text: translation(
                  'sidebar.building_info.panels.energy.unsupported.apartment_pellet_cost'
                ),
                status: 'placeholder',
              },
            }
          : metric
      ),
    }
    renderBuildingInfoTabs({
      panels: getPanelsWithConsumptionControls(unsupportedCostControls),
    })

    await screen.findByTestId('building-info-tab-page-basic')
    const energyPanel = screen.getByTestId(
      'building-info-panel-energyConsumption'
    )
    fireEvent.click(
      within(energyPanel).getByRole('button', {
        name: 'sidebar.building_info.panels.energy.primary.cost',
      })
    )

    const costPanel = within(energyPanel).getByTestId(
      'building-info-primary-metric-value'
    )
    expect(costPanel).toHaveAttribute('data-primary-metric-supported', 'false')
    expect(costPanel).toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.apartment_pellet_cost'
    )
    expect(costPanel).not.toHaveTextContent('19,613')
    expect(
      within(costPanel).getByTestId('building-info-unavailable-value-icon')
    ).toBeInTheDocument()
    expect(
      within(costPanel).getByTestId('building-info-unavailable-value-reason')
    ).toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.apartment_pellet_cost'
    )
  })

  it('sizes CO2 primary metric icons to match the other metric symbols', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')
    const energyPanel = screen.getByTestId(
      'building-info-panel-energyConsumption'
    )
    const co2Button = within(energyPanel).getByRole('button', {
      name: 'sidebar.building_info.panels.energy.primary.co2',
    })

    expect(within(co2Button).getByTestId('building-info-icon-co2')).toHaveStyle({
      fontSize: '1.25rem',
    })

    fireEvent.click(co2Button)

    const activeCo2Button = within(energyPanel).getByRole('button', {
      name: 'sidebar.building_info.panels.energy.primary.co2',
    })
    expect(within(activeCo2Button).getByTestId('building-info-icon-co2')).toHaveStyle({
      fontSize: '1.4rem',
    })
  })

  it('renders the same interactive energy section in the renovation tab', async () => {
    renderBuildingInfoTabs()

    fireEvent.click(
      await screen.findByRole('tab', {
        name: 'Open renovation recommendations',
      })
    )

    await screen.findByTestId('building-info-tab-page-renovation')
    const energyPanel = screen.getByTestId(
      'building-info-panel-energyConsumption'
    )

    expect(
      within(energyPanel).getByTestId('building-info-energy-consumption-section')
    ).toBeInTheDocument()
    expect(
      within(energyPanel).getByRole('button', {
        name: 'panels.energy.series.water_heating',
      })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(energyPanel).not.toHaveTextContent(
      'sidebar.building_info.panels.energy.unsupported.water_heating'
    )
  })

  it('can open on the requested tab after collapsed-tab selection', async () => {
    renderBuildingInfoTabs({ activeTabId: 'renovation' })

    expect(
      await screen.findByTestId('building-info-tab-page-renovation')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', {
        name: 'Open renovation recommendations',
      })
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('does not report the transient first tab while restoring the requested tab', async () => {
    const onActiveTabChange = jest.fn()

    renderBuildingInfoTabs({
      activeTabId: 'renovation',
      onActiveTabChange,
    })

    expect(
      await screen.findByTestId('building-info-tab-page-renovation')
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(onActiveTabChange).toHaveBeenCalledWith('renovation')
    })
    expect(onActiveTabChange).not.toHaveBeenCalledWith('basic')
  })

  it('calls page-level collapse and close controls independently', async () => {
    const onCollapse = jest.fn()
    const onClose = jest.fn()

    renderBuildingInfoTabs({ onCollapse, onClose })

    await screen.findByTestId('building-info-tab-page-basic')
    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse building information' })
    )
    expect(onCollapse).toHaveBeenCalledWith('basic')
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('button', { name: 'Close building information' })
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses shared page-control geometry for default desktop building info', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')

    const controls = document.querySelector(
      '.sidebar-panel-extension-page-container-controls'
    ) as HTMLElement
    const extensionRoot = screen.getByTestId('sidebar-panel-extension-root')
    const extensionRootStyle = window.getComputedStyle(extensionRoot)

    expect(controls).not.toHaveStyle({
      position: 'absolute',
      top: '35px',
      left: 'min(624px, calc(100% - 116px))',
    })
    expect(
      extensionRootStyle.getPropertyValue(
        '--sidebar-panel-extension-page-controls-position'
      )
    ).toBe('fixed')
    expect(
      extensionRootStyle.getPropertyValue(
        '--sidebar-panel-extension-page-controls-top'
      )
    ).toBe('16px')
  })

  it('places fullscreen page controls in the viewport top-right', async () => {
    renderBuildingInfoTabs({ isDesktopFullscreenLayout: true })

    await screen.findByTestId('building-info-tab-page-basic')

    const controls = document.querySelector(
      '.sidebar-panel-extension-page-container-controls'
    ) as HTMLElement
    const collapseButton = screen.getByRole('button', {
      name: 'Collapse building information',
    })

    expect(controls).toHaveStyle({
      position: 'fixed',
      top: '16px',
      right: '16px',
    })
    expect(collapseButton).toHaveStyle({
      boxShadow: '0 2px 8px rgba(17, 17, 17, 0.12)',
    })
    expect(
      within(collapseButton).getByTestId(
        'sidebar-panel-extension-collapse-icon'
      )
    ).toHaveStyle({
      fontSize: '1.85rem',
    })
  })

  it('reports the active renovation tab when collapsing that page', async () => {
    const onCollapse = jest.fn()

    renderBuildingInfoTabs({ onCollapse })

    fireEvent.click(
      await screen.findByRole('tab', {
        name: 'Open renovation recommendations',
      })
    )
    await screen.findByTestId('building-info-tab-page-renovation')
    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse building information' })
    )

    expect(onCollapse).toHaveBeenCalledWith('renovation')
  })

  it('preserves value metadata in tab-page panel bodies', async () => {
    renderBuildingInfoTabs({ activeTabId: 'renovation' })

    await screen.findByTestId('building-info-tab-page-renovation')
    const value = screen.getByText('value.part_a').closest('[data-status]')

    expect(value).toHaveTextContent('value.part_a / plain value + value.part_b')
    expect(value).toHaveAttribute('data-status', 'estimate')
    expect(value).toHaveAttribute(
      'data-source-properties',
      'distr_default_total,floor_area'
    )
  })

  it('renders the Figma panel graphics from sidebar assets', async () => {
    renderBuildingInfoTabs({ activeTabId: 'renovation' })

    await screen.findByTestId('building-info-tab-page-renovation')
    expect(
      document.querySelector(
        'img[src="/files/img/energiakartta/sidebar/building-info-two-panel.svg"]'
      )
    ).toBeInTheDocument()
    expect(
      document.querySelector(
        'img[src="/files/img/energiakartta/sidebar/building-info-three-panel-left.svg"]'
      )
    ).toBeInTheDocument()
    expect(
      document.querySelector(
        'img[src="/files/img/energiakartta/sidebar/building-info-energy-lightning.svg"]'
      )
    ).toBeInTheDocument()
    expect(
      document.querySelector(
        'img[src="/files/img/energiakartta/sidebar/building-info-renovation-icon-center.svg"]'
      )
    ).toBeInTheDocument()
    expect(
      document.querySelector(
        'img[src="/files/img/energiakartta/sidebar/building-info-renovation-building.svg"]'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('building-info-graphic-renovation-building')
    ).toHaveAttribute('data-figma-height', '300')
    expect(
      document.querySelector(
        'img[src="/files/img/energiakartta/sidebar/building-info-renovation-building-small-a.svg"]'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('building-info-graphic-renovation-building-small-a')
    ).toHaveAttribute('data-figma-height', '138.003')
    expect(
      document.querySelector(
        'img[src="/files/img/energiakartta/sidebar/building-info-warning-base.svg"]'
      )
    ).toBeInTheDocument()
  })

  it('shows unavailable values with the exact Figma asset and accessible reason tooltips', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')
    const missingValue = document.querySelector(
      '[data-row-id="missingRow"] [data-status="missing"]'
    )
    const placeholderValue = document.querySelector(
      '[data-row-id="placeholderRow"] [data-status="placeholder"]'
    )

    expect(missingValue).toBeInTheDocument()
    expect(missingValue).toHaveAttribute('data-source-properties', 'main_purpose')
    expect(placeholderValue).toBeInTheDocument()
    expect(placeholderValue).toHaveAttribute(
      'data-source-properties',
      'planned_measure'
    )
    const missingValueIcon = within(missingValue as HTMLElement).getByTestId(
      'building-info-unavailable-value-icon'
    )

    expect(missingValueIcon).toBeInTheDocument()
    expect(missingValueIcon).toHaveAttribute('data-figma-width', '12')
    expect(missingValueIcon).toHaveAttribute('data-figma-height', '12')
    expect(missingValueIcon).toHaveStyle({ width: '12px', height: '12px' })
    const missingValueImage = missingValueIcon.querySelector('img')
    expect(missingValueImage).toHaveAttribute(
      'src',
      '/files/img/energiakartta/sidebar/building-info-unavailable-value.svg'
    )
    expect(missingValueImage).toHaveAttribute('width', '13')
    expect(missingValueImage).toHaveAttribute('height', '13')
    expect(missingValueImage).toHaveAttribute('aria-hidden', 'true')
    expect(missingValueIcon.querySelector('svg')).not.toBeInTheDocument()
    expect(
      within(placeholderValue as HTMLElement).getByTestId(
        'building-info-unavailable-value-icon'
      )
    ).toBeInTheDocument()
    expect(
      within(missingValue as HTMLElement).getByTestId(
        'building-info-unavailable-value-reason'
      )
    ).toHaveStyle({ position: 'absolute', width: '1px' })

    const tooltipTrigger = missingValue?.querySelector('[tabindex="0"]')

    expect(tooltipTrigger).toBeInTheDocument()
    fireEvent.focus(tooltipTrigger as Element)

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'value.missing'
    )
  })

  it('renders the building address as a stacked sub-header instead of a table row', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')
    const addressSubheader = document.querySelector(
      '[data-building-subheader-row-id="address"]'
    ) as HTMLElement | null

    expect(addressSubheader).toBeInTheDocument()
    expect(
      document.querySelector('[data-row-id="address"]')
    ).not.toBeInTheDocument()
    expect(
      within(addressSubheader as HTMLElement)
        .getByText(/row.address.label/)
        .parentElement
    ).toHaveStyle({ fontWeight: '400' })
    expect(
      within(addressSubheader as HTMLElement)
        .getByText('Test address 1')
        .closest('[data-status]')
    ).toHaveStyle({ fontWeight: '700' })
  })

  it('keeps labels and section titles regular while values stay bold', async () => {
    renderBuildingInfoTabs({ activeTabId: 'renovation' })

    await screen.findByTestId('building-info-tab-page-renovation')
    expect(screen.getByText('scenario.aahp.label').parentElement).toHaveStyle({
      fontWeight: '400',
    })
    expect(screen.getByText('panel.renovation.title').parentElement).toHaveStyle({
      fontWeight: '400',
    })
    expect(screen.getByText('12000').closest('[data-status]')).toHaveStyle({
      fontWeight: '700',
    })
  })

  it('keeps both collapsed reopen buttons available without owning expanded tab switching', () => {
    const onModeChange = jest.fn()

    renderWithTheme(
      <BuildingInfoActionRail
        activeMode="twoPanel"
        isCollapsed={true}
        ariaLabels={ariaLabels}
        onModeChange={onModeChange}
      />
    )

    expect(
      screen.getByRole('button', {
        name: 'Open energy and building information',
      })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('building-info-action-rail')).toHaveAttribute(
      'data-orientation',
      'column'
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open renovation recommendations',
      })
    )

    expect(onModeChange).toHaveBeenCalledWith('threePanel')
  })

  it('keeps expanded building info runtime on the main panel only', () => {
    const desktopOptions = getEnergymapBuildingInfoPanelRuntimeOptions({
      hasBuildingInfo: true,
      isBuildingInfoCollapsed: false,
      isMobileLayout: false,
      activeMode: 'twoPanel',
    })
    const mobileOptions = getEnergymapBuildingInfoPanelRuntimeOptions({
      hasBuildingInfo: true,
      isBuildingInfoCollapsed: false,
      isMobileLayout: true,
      activeMode: 'threePanel',
    })
    const renovationDesktopOptions =
      getEnergymapBuildingInfoPanelRuntimeOptions({
        hasBuildingInfo: true,
        isBuildingInfoCollapsed: false,
        isMobileLayout: false,
        activeMode: 'threePanel',
      })

    expect(desktopOptions).toMatchObject({
      width: 'wide',
      chrome: 'hidden',
      panelLayout: 'single',
      visiblePanels: ['main'],
      replaceBaseSidebar: true,
      layoutMode: 'default',
      desktopMainPanelWidth: '760px',
      forceMobileLayout: false,
      activePanel: 'main',
      actionRailPlacement: 'inside',
    })
    expect(mobileOptions).toMatchObject({
      width: 'wide',
      chrome: 'hidden',
      panelLayout: 'single',
      visiblePanels: ['main'],
      replaceBaseSidebar: true,
      layoutMode: 'default',
      forceMobileLayout: true,
      activePanel: 'main',
      actionRailPlacement: 'bottomActionRow',
    })
    expect(renovationDesktopOptions).toMatchObject({
      width: 'wide',
      chrome: 'hidden',
      panelLayout: 'single',
      visiblePanels: ['main'],
      replaceBaseSidebar: true,
      layoutMode: 'default',
      desktopMainPanelWidth: `${ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_PANEL_WIDTH_PX}px`,
      forceMobileLayout: false,
      activePanel: 'main',
      actionRailPlacement: 'inside',
    })
    expect(renovationDesktopOptions).not.toHaveProperty(
      'desktopPanelGroupMaxWidth'
    )
    expect(desktopOptions.visiblePanels).not.toContain('secondary')
    expect(desktopOptions.visiblePanels).not.toContain('tertiary')
    expect(mobileOptions.visiblePanels).not.toContain('secondary')
    expect(mobileOptions.visiblePanels).not.toContain('tertiary')
  })

  it('uses explicit desktop fullscreen fallback without forcing mobile layout', () => {
    const fullscreenFallbackOptions =
      getEnergymapBuildingInfoPanelRuntimeOptions({
        hasBuildingInfo: true,
        isBuildingInfoCollapsed: false,
        isMobileLayout: false,
        isDesktopFullscreenFallback: true,
        activeMode: 'threePanel',
      })
    const mobileOptions = getEnergymapBuildingInfoPanelRuntimeOptions({
      hasBuildingInfo: true,
      isBuildingInfoCollapsed: false,
      isMobileLayout: true,
      isDesktopFullscreenFallback: true,
      activeMode: 'threePanel',
    })

    expect(fullscreenFallbackOptions).toMatchObject({
      width: 'wide',
      chrome: 'hidden',
      visiblePanels: ['main'],
      replaceBaseSidebar: true,
      layoutMode: 'fullscreen',
      forceMobileLayout: false,
      activePanel: 'main',
    })
    expect(fullscreenFallbackOptions.desktopMainPanelWidth).toBeUndefined()
    expect(fullscreenFallbackOptions.desktopPanelGroupMaxWidth).toBeUndefined()
    expect(mobileOptions).toMatchObject({
      layoutMode: 'default',
      forceMobileLayout: true,
      actionRailPlacement: 'bottomActionRow',
    })
  })

  it('keeps collapsed building info runtime action rail without visible panels', () => {
    const desktopOptions = getEnergymapBuildingInfoPanelRuntimeOptions({
      hasBuildingInfo: true,
      isBuildingInfoCollapsed: true,
      isMobileLayout: false,
      activeMode: 'threePanel',
    })
    const mobileOptions = getEnergymapBuildingInfoPanelRuntimeOptions({
      hasBuildingInfo: true,
      isBuildingInfoCollapsed: true,
      isMobileLayout: true,
      activeMode: 'threePanel',
    })
    const emptyOptions = getEnergymapBuildingInfoPanelRuntimeOptions({
      hasBuildingInfo: false,
      isBuildingInfoCollapsed: false,
      isMobileLayout: false,
      activeMode: 'twoPanel',
    })

    expect(desktopOptions).toMatchObject({
      width: 'compact',
      chrome: 'visible',
      panelLayout: 'single',
      visiblePanels: [],
      replaceBaseSidebar: false,
      activePanel: 'main',
      actionRailPlacement: 'sidebarEdgeActionColumn',
    })
    expect(mobileOptions).toMatchObject({
      width: 'compact',
      chrome: 'visible',
      panelLayout: 'single',
      visiblePanels: [],
      replaceBaseSidebar: false,
      activePanel: 'main',
      actionRailPlacement: 'bottomActionRow',
    })
    expect(emptyOptions.visiblePanels).toEqual([])
    expect(emptyOptions.replaceBaseSidebar).toBe(false)
  })

  it('exports building-info desktop minimum widths for page fit checks', () => {
    expect(getEnergymapBuildingInfoDesktopMinWidthPx('twoPanel')).toBe(
      ENERGYMAP_BUILDING_INFO_BASIC_DESKTOP_MIN_WIDTH_PX
    )
    expect(getEnergymapBuildingInfoDesktopMinWidthPx('threePanel')).toBe(
      ENERGYMAP_BUILDING_INFO_RENOVATION_DESKTOP_MIN_WIDTH_PX
    )
  })
})
