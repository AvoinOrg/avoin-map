import React from 'react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, within } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import theme from '#/common/style/theme/theme'
import { PanelSidebar } from '#/components/Sidebar/PanelSidebar'
import {
  BuildingInfoActionRail,
  BuildingInfoTabPages,
  BuildingInfoText,
  getBuildingInfoPanelIds,
  getBuildingInfoTabPanelIds,
} from './BuildingInfoSidebar'
import { getEnergymapBuildingInfoSidebarRuntimeOptions } from '../common/buildingInfoSidebarRuntime'
import type {
  EnergymapBuildingInfoPanel,
  EnergymapBuildingInfoText,
} from '../common/buildingInfo'
import type { BuildingInfoTabId } from './BuildingInfoSidebar'

jest.mock('#/common/store', () => ({
  useUIStore: jest.requireActual('#/common/store/uiStore').useUIStore,
}))

let mockIsMobile = false

jest.mock('#/common/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

jest.mock('@tolgee/react', () => {
  const React = require('react')

  return {
    T: ({
      keyName,
      params,
    }: {
      keyName: string
      params?: Record<string, string | number>
    }) =>
      React.createElement(
        'span',
        null,
        params?.code == null ? keyName : `${keyName}:${params.code}`
      ),
  }
})

jest.mock('overlayscrollbars-react', () => {
  const React = require('react')

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
      React.createElement(
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

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

const resetUIStore = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
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

const renderBuildingInfoTabs = ({
  activeTabId,
  onClose = jest.fn(),
  onCollapse = jest.fn(),
}: {
  activeTabId?: BuildingInfoTabId
  onClose?: () => void
  onCollapse?: (tabId: BuildingInfoTabId) => void
} = {}) => {
  return renderWithTheme(
    <PanelSidebar>
      <BuildingInfoTabPages
        panels={panels}
        ariaLabels={ariaLabels}
        activeTabId={activeTabId}
        onClose={onClose}
        onCollapse={onCollapse}
      />
    </PanelSidebar>
  )
}

describe('BuildingInfoSidebar', () => {
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

  it('renders the basic building information tab through PanelSidebar', async () => {
    renderBuildingInfoTabs()

    expect(
      await screen.findByTestId('building-info-tab-page-basic')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tablist', { name: /sidebar panel tabs/i })
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
    expect(screen.getAllByTestId('panel-sidebar-page-scroll')).toHaveLength(1)
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
      screen.getByTestId('building-info-renovation-comparison-wide')
    ).toBeInTheDocument()
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
    expect(screen.getAllByTestId('panel-sidebar-page-scroll')).toHaveLength(1)
    expect(screen.queryByTestId(/^building-info-scroll-/)).not.toBeInTheDocument()
    expect(screen.getByTestId('panel-sidebar-page-scroll')).toHaveAttribute(
      'data-overflow-y',
      'scroll'
    )
    expect(screen.getByTestId('panel-sidebar-page-scroll')).toHaveAttribute(
      'data-scrollbar-visibility',
      'auto'
    )
    expect(screen.getByTestId('panel-sidebar-page-scroll')).toHaveAttribute(
      'data-auto-hide',
      'leave'
    )
    expect(screen.getByTestId('panel-sidebar-page-scroll')).toHaveClass('osLeft')
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
    expect(screen.getAllByTestId('panel-sidebar-page-scroll')).toHaveLength(1)
    expect(screen.queryByTestId(/^building-info-scroll-/)).not.toBeInTheDocument()
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

  it('shows unavailable values as construction icons with reason tooltips', async () => {
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
    expect(
      within(missingValue as HTMLElement).getByTestId(
        'building-info-unavailable-value-icon'
      )
    ).toBeInTheDocument()
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
    fireEvent.mouseOver(tooltipTrigger as Element)

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
        .closest('p')
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
    expect(screen.getByText('scenario.aahp.label').closest('p')).toHaveStyle({
      fontWeight: '400',
    })
    expect(screen.getByText('panel.renovation.title').closest('p')).toHaveStyle({
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
    const desktopOptions = getEnergymapBuildingInfoSidebarRuntimeOptions({
      hasBuildingInfo: true,
      isBuildingInfoCollapsed: false,
      isMobile: false,
    })
    const mobileOptions = getEnergymapBuildingInfoSidebarRuntimeOptions({
      hasBuildingInfo: true,
      isBuildingInfoCollapsed: false,
      isMobile: true,
    })

    expect(desktopOptions).toMatchObject({
      width: 'wide',
      chrome: 'hidden',
      panelLayout: 'single',
      visiblePanels: ['main'],
      activePanel: 'main',
      actionRailPlacement: 'fixedRightActionColumn',
    })
    expect(mobileOptions).toMatchObject({
      width: 'wide',
      chrome: 'hidden',
      panelLayout: 'single',
      visiblePanels: ['main'],
      activePanel: 'main',
      actionRailPlacement: 'bottomActionRow',
    })
    expect(desktopOptions.visiblePanels).not.toContain('secondary')
    expect(desktopOptions.visiblePanels).not.toContain('tertiary')
    expect(mobileOptions.visiblePanels).not.toContain('secondary')
    expect(mobileOptions.visiblePanels).not.toContain('tertiary')
  })
})
