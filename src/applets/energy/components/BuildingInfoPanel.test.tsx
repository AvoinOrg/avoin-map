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

jest.mock('#/common/navigation/navigation', () => ({
  useAppParams: () => ({ locale: 'en' }),
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

const VENTILATION_SOURCE_TEXT =
  '<strong data-injected="true">Painovoimainen</strong><script>alert("unsafe")</script>'
const CERTIFICATE_RECOMMENDATION_SOURCE_TEXT =
  'Tiivistä yläpohjan lämmöneristystä ja tarkista ilmanvaihdon säädöt.\n\n<script data-injected="true">alert("unsafe")</script> **Tämä on lähdetekstiä, ei Markdownia.** Erittäinpitkäkatkeamatonmerkkijonotestaaturvallisenrivityksen.'

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
      supported: true,
      value: {
        text: plain('481.8'),
        status: 'estimate',
        unitKey: 'sidebar.building_info.units.cubic_meters_per_year',
      },
      residentCountControl: {
        defaultValue: 11,
        minValue: 1,
        maxValue: 10000,
        label: translation(
          'sidebar.building_info.panels.energy.water.resident_count'
        ),
        toggleLabel: translation(
          'sidebar.building_info.panels.energy.water.change_resident_count'
        ),
        description: translation(
          'sidebar.building_info.panels.energy.water.description'
        ),
        unavailableText: translation(
          'sidebar.building_info.panels.energy.water.invalid_resident_count'
        ),
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
        id: 'publishedRecommendations',
        rows: [
          {
            id: 'renovationRecommendations',
            label: translation('row.renovation_recommendations.label'),
            text: translation('value.placeholder'),
            status: 'placeholder',
          },
          {
            id: 'energyRecommendations',
            label: translation('row.energy_recommendations.label'),
            text: translation('value.placeholder'),
            status: 'placeholder',
          },
          {
            id: 'energyCertificateRecommendations',
            label: translation(
              'row.energy_certificate_recommendations.label'
            ),
            text: plain(CERTIFICATE_RECOMMENDATION_SOURCE_TEXT),
            status: 'real',
            sourceProperties: ['energy_certificate_recommendations_fi'],
            sourceLanguage: 'fi',
            presentation: 'expandableSourceText',
          },
        ],
      },
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
            sourceProperties: ['energy_class'],
            modeledIndicator: {
              label: translation(
                'sidebar.building_info.panels.building.energy_class_modeled.label'
              ),
              tooltip: translation(
                'sidebar.building_info.panels.building.energy_class_modeled.tooltip'
              ),
              ariaLabelKey:
                'sidebar.building_info.panels.building.energy_class_modeled.help_aria_label',
              sourceProperties: ['is_energy_class_modeled'],
            },
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
      {
        id: 'technicalDetails',
        rows: [
          {
            id: 'ventilation',
            label: translation('row.ventilation.label'),
            text: plain(VENTILATION_SOURCE_TEXT),
            status: 'real',
            sourceProperties: ['energy_certificate_ventilation_description_fi'],
            sourceLanguage: 'fi',
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
  panelKey?: string
  activeTabId?: BuildingInfoTabId
  forceMobileLayout?: boolean
  isDesktopFullscreenLayout?: boolean
  onActiveTabChange?: (tabId: BuildingInfoTabId) => void
  onClose?: () => void
  onCollapse?: (tabId: BuildingInfoTabId) => void
  panels?: EnergymapBuildingInfoPanel[]
}

const createBuildingInfoTabsElement = ({
  panelKey,
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
            key={panelKey}
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

  it('renders certificate recommendations as a safe accessible disclosure', async () => {
    renderBuildingInfoTabs({ activeTabId: 'renovation' })

    await screen.findByTestId('building-info-tab-page-renovation')
    const trigger = screen.getByRole('button', {
      name: 'row.energy_certificate_recommendations.label',
    })
    const panel = screen.getByTestId(
      'building-info-expandable-source-text-panel-energyCertificateRecommendations'
    )
    const content = screen.getByTestId(
      'building-info-expandable-source-text-content-energyCertificateRecommendations'
    )

    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger).toHaveAttribute('type', 'button')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-controls', panel.id)
    expect(panel).not.toBeVisible()

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toBeVisible()
    expect(content).toHaveAttribute('lang', 'fi')
    expect(content).toHaveAttribute('data-status', 'real')
    expect(content).toHaveAttribute(
      'data-source-properties',
      'energy_certificate_recommendations_fi'
    )
    expect(content).toHaveStyle({
      whiteSpace: 'pre-line',
      overflowWrap: 'anywhere',
      wordBreak: 'break-word',
    })
    expect(content.textContent).toBe(CERTIFICATE_RECOMMENDATION_SOURCE_TEXT)
    expect(
      content.querySelector('script, strong, [data-injected]')
    ).not.toBeInTheDocument()

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(panel).not.toBeVisible()
  })

  it('renders a missing certificate recommendation as unavailable without a disclosure', async () => {
    const panelsWithMissingRecommendation = panels.map((panel) =>
      panel.id === 'renovationRecommendations'
        ? {
            ...panel,
            sections: panel.sections.map((section) =>
              section.id === 'publishedRecommendations'
                ? {
                    ...section,
                    rows: section.rows?.map((row) =>
                      row.id === 'energyCertificateRecommendations'
                        ? {
                            ...row,
                            text: translation('value.missing'),
                            status: 'missing' as const,
                            sourceProperties: [
                              'energy_certificate_recommendations_fi',
                              'energy_certificate_recommendations_sv',
                            ],
                            sourceLanguage: undefined,
                          }
                        : row
                    ),
                  }
                : section
            ),
          }
        : panel
    )

    renderBuildingInfoTabs({
      activeTabId: 'renovation',
      panels: panelsWithMissingRecommendation,
    })

    await screen.findByTestId('building-info-tab-page-renovation')
    const row = document.querySelector(
      '[data-row-id="energyCertificateRecommendations"]'
    ) as HTMLElement

    expect(row).toBeInTheDocument()
    expect(
      within(row).getByTestId('building-info-unavailable-value-reason')
    ).toHaveTextContent('value.missing')
    expect(
      screen.queryByRole('button', {
        name: 'row.energy_certificate_recommendations.label',
      })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('building-info-expandable-source-text-row')
    ).not.toBeInTheDocument()
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

  it('models Water with a local resident override and resets it when disabled', async () => {
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
    expect(waterPanel).toHaveAttribute('data-primary-metric-supported', 'true')
    expect(waterPanel).toHaveTextContent('481,8')
    expect(waterPanel).toHaveTextContent(
      'sidebar.building_info.units.cubic_meters_per_year'
    )
    expect(
      within(energyPanel).getByTestId('building-info-water-resident-default')
    ).toHaveTextContent(
      'sidebar.building_info.panels.energy.water.resident_count11'
    )
    const overrideSwitch = within(energyPanel).getByRole('switch', {
      name: 'sidebar.building_info.panels.energy.water.change_resident_count',
    })
    expect(overrideSwitch).not.toBeChecked()
    fireEvent.click(overrideSwitch)
    const residentInput = within(energyPanel).getByLabelText(
      'sidebar.building_info.panels.energy.water.resident_count'
    )
    fireEvent.change(residentInput, { target: { value: '12' } })
    await waitFor(() => {
      expect(waterPanel).toHaveTextContent('525,6')
    })
    fireEvent.change(residentInput, { target: { value: '' } })
    await waitFor(() => {
      expect(waterPanel).toHaveAttribute('data-primary-metric-supported', 'true')
      expect(
        within(waterPanel).getByTestId('building-info-unavailable-value-icon')
      ).toBeInTheDocument()
      expect(waterPanel).not.toHaveTextContent(
        'sidebar.building_info.units.cubic_meters_per_year'
      )
      expect(waterPanel).not.toHaveTextContent('525,6')
    })
    fireEvent.blur(residentInput)
    await waitFor(() => {
      expect(residentInput).toHaveValue('11')
      expect(waterPanel).toHaveTextContent('481,8')
    })

    fireEvent.change(residentInput, { target: { value: '12,5' } })
    await waitFor(() => {
      expect(
        within(waterPanel).getByTestId('building-info-unavailable-value-icon')
      ).toBeInTheDocument()
    })
    fireEvent.blur(residentInput)
    await waitFor(() => {
      expect(residentInput).toHaveValue('11')
      expect(waterPanel).toHaveTextContent('481,8')
    })

    fireEvent.change(residentInput, { target: { value: '10001' } })
    await waitFor(() => {
      expect(residentInput).toHaveValue('10001')
      expect(
        within(waterPanel).getByTestId('building-info-unavailable-value-icon')
      ).toBeInTheDocument()
    })
    fireEvent.blur(residentInput)
    await waitFor(() => {
      expect(residentInput).toHaveValue('10000')
      expect(waterPanel).toHaveTextContent('438 000')
    })
    fireEvent.change(residentInput, { target: { value: '0' } })
    await waitFor(() => {
      expect(residentInput).toHaveValue('0')
      expect(
        within(waterPanel).getByTestId('building-info-unavailable-value-icon')
      ).toBeInTheDocument()
    })
    fireEvent.blur(residentInput)
    await waitFor(() => {
      expect(residentInput).toHaveValue('1')
      expect(waterPanel).toHaveTextContent('43,8')
    })

    fireEvent.change(residentInput, { target: { value: '-1' } })
    await waitFor(() => {
      expect(residentInput).toHaveValue('-1')
      expect(
        within(waterPanel).getByTestId('building-info-unavailable-value-icon')
      ).toBeInTheDocument()
    })
    fireEvent.blur(residentInput)
    await waitFor(() => {
      expect(residentInput).toHaveValue('1')
      expect(waterPanel).toHaveTextContent('43,8')
    })

    fireEvent.change(residentInput, { target: { value: 'abc' } })
    await waitFor(() => {
      expect(residentInput).toHaveValue('abc')
      expect(
        within(waterPanel).getByTestId('building-info-unavailable-value-icon')
      ).toBeInTheDocument()
    })
    fireEvent.blur(residentInput)
    await waitFor(() => {
      expect(residentInput).toHaveValue('11')
      expect(waterPanel).toHaveTextContent('481,8')
    })

    fireEvent.click(overrideSwitch)
    expect(overrideSwitch).not.toBeChecked()
    expect(
      within(energyPanel).getByTestId('building-info-water-resident-default')
    ).toHaveTextContent('11')
    fireEvent.click(overrideSwitch)
    expect(
      within(energyPanel).getByLabelText(
        'sidebar.building_info.panels.energy.water.resident_count'
      )
    ).toHaveValue('11')
    fireEvent.click(overrideSwitch)
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

  it('discards a Water resident override when the keyed building panel changes', async () => {
    const view = renderBuildingInfoTabs({ panelKey: 'building-a' })

    await screen.findByTestId('building-info-tab-page-basic')
    const getEnergyPanel = () =>
      screen.getByTestId('building-info-panel-energyConsumption')
    const getWaterButton = () =>
      within(getEnergyPanel()).getByRole('button', {
        name: 'sidebar.building_info.panels.energy.primary.water',
      })

    fireEvent.click(getWaterButton())
    const getOverrideSwitch = () =>
      within(getEnergyPanel()).getByRole('switch', {
        name: 'sidebar.building_info.panels.energy.water.change_resident_count',
      })
    fireEvent.click(getOverrideSwitch())
    fireEvent.change(
      within(getEnergyPanel()).getByLabelText(
        'sidebar.building_info.panels.energy.water.resident_count'
      ),
      { target: { value: '12' } }
    )
    await waitFor(() => {
      expect(
        within(getEnergyPanel()).getByTestId('building-info-primary-metric-value')
      ).toHaveTextContent('525,6')
    })

    view.rerenderBuildingInfoTabs({ panelKey: 'building-b' })

    await screen.findByTestId('building-info-tab-page-basic')
    fireEvent.click(getWaterButton())
    expect(getOverrideSwitch()).not.toBeChecked()
    expect(
      within(getEnergyPanel()).queryByLabelText(
        'sidebar.building_info.panels.energy.water.resident_count'
      )
    ).not.toBeInTheDocument()
    expect(
      within(getEnergyPanel()).getByTestId('building-info-water-resident-default')
    ).toHaveTextContent('11')
    expect(
      within(getEnergyPanel()).getByTestId('building-info-primary-metric-value')
    ).toHaveTextContent('481,8')
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

  it('renders ventilation source text literally with source metadata', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')
    const ventilationValue = screen
      .getByText(VENTILATION_SOURCE_TEXT)
      .closest('[data-status="real"]')

    expect(ventilationValue).toBeInTheDocument()
    expect(ventilationValue).toHaveAttribute('lang', 'fi')
    expect(ventilationValue).toHaveAttribute('data-status', 'real')
    expect(ventilationValue).toHaveAttribute(
      'data-source-properties',
      'energy_certificate_ventilation_description_fi'
    )
    expect(ventilationValue).toHaveTextContent(VENTILATION_SOURCE_TEXT)
    expect(
      ventilationValue?.querySelector('strong, script, [data-injected]')
    ).not.toBeInTheDocument()
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

  it('renders modeled energy-class help beneath the class with accessible pointer and keyboard behavior', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')
    const energyClassRow = document.querySelector(
      '[data-section-row-id="energyClass"]'
    ) as HTMLElement
    const stack = within(energyClassRow).getByTestId(
      'building-info-energy-class-value-stack'
    )
    const indicator = within(stack).getByTestId(
      'building-info-modeled-energy-class-indicator'
    )
    const classValue = within(stack).getByText('B')
    const modeledLabel = within(stack).getByText(
      'sidebar.building_info.panels.building.energy_class_modeled.label'
    )
    const trigger = within(stack).getByRole('button', {
      name: 'sidebar.building_info.panels.building.energy_class_modeled.help_aria_label',
    })

    expect(energyClassRow).toBeInTheDocument()
    expect(document.querySelectorAll('[data-section-row-id="energyClass"]')).toHaveLength(1)
    expect(stack).toHaveStyle({
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    })
    expect(indicator).toHaveAttribute(
      'data-source-properties',
      'is_energy_class_modeled'
    )
    expect(indicator).toHaveStyle({
      display: 'inline-flex',
      whiteSpace: 'nowrap',
      fontWeight: '400',
    })
    expect(
      classValue.compareDocumentPosition(modeledLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger).toHaveAttribute('type', 'button')
    expect(trigger.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(trigger).not.toHaveAttribute('aria-describedby')

    fireEvent.mouseEnter(trigger)
    const tooltip = await screen.findByRole('tooltip')
    const tooltipText =
      'sidebar.building_info.panels.building.energy_class_modeled.tooltip'

    expect(tooltip).toHaveTextContent(tooltipText)
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)
    expect(trigger).toHaveAccessibleDescription(tooltipText)
    fireEvent.mouseLeave(trigger)
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    fireEvent.focus(trigger)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'sidebar.building_info.panels.building.energy_class_modeled.tooltip'
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  it('toggles modeled energy-class help on click for touch use', async () => {
    renderBuildingInfoTabs()

    await screen.findByTestId('building-info-tab-page-basic')
    const triggerName =
      'sidebar.building_info.panels.building.energy_class_modeled.help_aria_label'
    const trigger = screen.getByRole('button', { name: triggerName })

    fireEvent.click(trigger)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'sidebar.building_info.panels.building.energy_class_modeled.tooltip'
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: triggerName,
      })
    )
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
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
