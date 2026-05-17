import React from 'react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, within } from '@testing-library/react'

import theme from '#/common/style/theme/theme'
import {
  BuildingInfoActionRail,
  BuildingInfoDesktopChrome,
  BuildingInfoDesktopSidebar,
  BuildingInfoMobileActionRow,
  BuildingInfoMobilePanelStack,
  BuildingInfoMobileSidebar,
  BuildingInfoPanelSlotContent,
  BuildingInfoText,
  getBuildingInfoPanelIds,
  getBuildingInfoDesktopPanelIds,
} from './BuildingInfoSidebar'
import type {
  EnergymapBuildingInfoPanel,
  EnergymapBuildingInfoText,
} from '../common/buildingInfo'

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
        scrollbars?: {
          autoHide?: string
          visibility?: string
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
}

const modeAriaLabels = {
  overview: 'Open energy and building information',
  renovation: 'Open renovation recommendations',
}

describe('BuildingInfoSidebar', () => {
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

  it('shows only the energy and building panels in two-panel mode', () => {
    renderWithTheme(
      <BuildingInfoDesktopSidebar
        mode="twoPanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

    expect(getBuildingInfoDesktopPanelIds('twoPanel')).toEqual([
      'energyConsumption',
      'buildingDetails',
    ])
    expect(getBuildingInfoPanelIds('twoPanel')).toEqual([
      'energyConsumption',
      'buildingDetails',
    ])
    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual(['energyConsumption', 'buildingDetails'])
    expect(
      screen.queryByTestId('building-info-panel-renovationRecommendations')
    ).not.toBeInTheDocument()
  })

  it('shows all panels in three-panel mode and preserves value metadata', () => {
    renderWithTheme(
      <BuildingInfoDesktopSidebar
        mode="threePanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual([
      'energyConsumption',
      'renovationRecommendations',
      'buildingDetails',
    ])
    const value = screen.getByText('value.part_a').closest('[data-status]')

    expect(value).toHaveTextContent('value.part_a / plain value + value.part_b')
    expect(value).toHaveAttribute('data-status', 'estimate')
    expect(value).toHaveAttribute(
      'data-source-properties',
      'distr_default_total,floor_area'
    )
  })

  it('uses overlay scroll areas for each desktop panel', () => {
    renderWithTheme(
      <BuildingInfoDesktopSidebar
        mode="threePanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

    const scrollAreas = screen.getAllByTestId(/^building-info-scroll-/)

    expect(scrollAreas).toHaveLength(3)
    scrollAreas.forEach((scrollArea) => {
      expect(scrollArea).toHaveClass('osScroll')
      expect(scrollArea).toHaveAttribute('data-auto-hide', 'leave')
      expect(scrollArea).toHaveAttribute('data-scrollbar-visibility', 'auto')
    })
  })

  it('renders a single desktop panel body for scoped panel slots', () => {
    renderWithTheme(
      <BuildingInfoPanelSlotContent
        mode="twoPanel"
        panel={panels[2]}
        presentation="desktop"
      />
    )

    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual(['buildingDetails'])
    expect(screen.getByTestId('building-info-scroll-buildingDetails')).toHaveClass(
      'osScroll'
    )
    expect(screen.getByTestId('building-info-panel-buildingDetails')).toHaveStyle(
      {
        flex: '1 1 auto',
      }
    )
  })

  it('renders a single mobile panel section for scoped panel slots', () => {
    renderWithTheme(
      <BuildingInfoPanelSlotContent
        mode="threePanel"
        panel={panels[1]}
        presentation="mobile"
        mobileIndex={1}
        mobilePanelCount={3}
      />
    )

    expect(screen.getByTestId('building-info-panel-renovationRecommendations'))
      .toHaveAttribute('data-panel-id', 'renovationRecommendations')
    expect(
      screen.queryByTestId('building-info-mobile-scroll')
    ).not.toBeInTheDocument()
  })

  it('renders the Figma panel graphics from sidebar assets', () => {
    renderWithTheme(
      <BuildingInfoDesktopSidebar
        mode="threePanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

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
    renderWithTheme(
      <BuildingInfoDesktopSidebar
        mode="twoPanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

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
    expect(
      within(placeholderValue as HTMLElement).getByTestId(
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

  it('renders the building address as a stacked sub-header instead of a table row', () => {
    renderWithTheme(
      <BuildingInfoDesktopSidebar
        mode="twoPanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

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

  it('keeps labels and section titles regular while values stay bold', () => {
    renderWithTheme(
      <BuildingInfoDesktopSidebar
        mode="threePanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

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

  it('calls collapse and close without coupling the two actions', () => {
    const onCollapse = jest.fn()
    const onClose = jest.fn()

    renderWithTheme(
      <BuildingInfoDesktopSidebar
        mode="twoPanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={onClose}
        onCollapse={onCollapse}
      />
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse building information' })
    )
    expect(onCollapse).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('button', { name: 'Close building information' })
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps migrated desktop chrome above generic panel bodies', () => {
    renderWithTheme(
      <BuildingInfoDesktopChrome
        mode="threePanel"
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

    expect(screen.getByTestId('building-info-desktop-chrome')).toHaveStyle({
      pointerEvents: 'auto',
      zIndex: String(theme.zIndex.drawer + 13),
    })
  })

  it('keeps both tab buttons available in collapsed state', () => {
    const onModeChange = jest.fn()

    renderWithTheme(
      <BuildingInfoActionRail
        activeMode="twoPanel"
        isCollapsed={true}
        ariaLabels={modeAriaLabels}
        onModeChange={onModeChange}
      />
    )

    expect(
      screen.getByRole('button', {
        name: 'Open energy and building information',
      })
    ).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open renovation recommendations',
      })
    )

    expect(onModeChange).toHaveBeenCalledWith('threePanel')
  })

  it('stacks only the energy and building panels in mobile two-panel mode', () => {
    renderWithTheme(
      <BuildingInfoMobileSidebar
        mode="twoPanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

    expect(screen.getByTestId('building-info-mobile-sidebar')).toHaveAttribute(
      'data-building-info-mode',
      'twoPanel'
    )
    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual(['energyConsumption', 'buildingDetails'])
    expect(
      screen.queryByTestId('building-info-panel-renovationRecommendations')
    ).not.toBeInTheDocument()
  })

  it('uses one auto-hiding overlay scroll area for mobile stacked panels', () => {
    renderWithTheme(
      <BuildingInfoMobileSidebar
        mode="threePanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

    const scrollAreas = screen.getAllByTestId(/building-info.*scroll/)

    expect(scrollAreas).toHaveLength(1)
    expect(screen.getByTestId('building-info-mobile-scroll')).toHaveClass(
      'osScroll'
    )
    expect(screen.getByTestId('building-info-mobile-scroll')).toHaveAttribute(
      'data-auto-hide',
      'scroll'
    )
  })

  it('renders mobile scoped selected-building content through one overlay stack', () => {
    renderWithTheme(
      <BuildingInfoMobilePanelStack mode="threePanel" panels={panels} />
    )

    expect(screen.getByTestId('building-info-mobile-scroll')).toHaveClass(
      'osScroll'
    )
    expect(screen.getAllByTestId(/building-info-panel-/)).toHaveLength(3)
  })

  it('stacks all panels in mobile three-panel mode and preserves metadata', () => {
    renderWithTheme(
      <BuildingInfoMobileSidebar
        mode="threePanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={jest.fn()}
        onCollapse={jest.fn()}
      />
    )

    expect(
      screen
        .getAllByTestId(/building-info-panel-/)
        .map((panel) => panel.dataset.panelId)
    ).toEqual([
      'energyConsumption',
      'renovationRecommendations',
      'buildingDetails',
    ])
    const value = screen.getByText('value.part_a').closest('[data-status]')

    expect(value).toHaveTextContent('value.part_a / plain value + value.part_b')
    expect(value).toHaveAttribute('data-status', 'estimate')
    expect(value).toHaveAttribute(
      'data-source-properties',
      'distr_default_total,floor_area'
    )
  })

  it('keeps mobile collapse and close controls independent', () => {
    const onCollapse = jest.fn()
    const onClose = jest.fn()

    renderWithTheme(
      <BuildingInfoMobileSidebar
        mode="twoPanel"
        panels={panels}
        ariaLabels={ariaLabels}
        onClose={onClose}
        onCollapse={onCollapse}
      />
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse building information' })
    )
    expect(onCollapse).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('button', { name: 'Close building information' })
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps mobile mode buttons reachable and marks active state', () => {
    const onModeChange = jest.fn()

    const { rerender } = renderWithTheme(
      <BuildingInfoMobileActionRow
        activeMode="threePanel"
        isCollapsed={false}
        ariaLabels={modeAriaLabels}
        onModeChange={onModeChange}
      />
    )

    expect(
      screen.getByRole('button', {
        name: 'Open energy and building information',
      })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', {
        name: 'Open renovation recommendations',
      })
    ).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open energy and building information',
      })
    )
    expect(onModeChange).toHaveBeenCalledWith('twoPanel')

    rerender(
      <ThemeProvider theme={theme}>
        <BuildingInfoMobileActionRow
          activeMode="threePanel"
          isCollapsed={true}
          ariaLabels={modeAriaLabels}
          onModeChange={onModeChange}
        />
      </ThemeProvider>
    )

    expect(
      screen.getByRole('button', {
        name: 'Open renovation recommendations',
      })
    ).toHaveAttribute('aria-pressed', 'false')
  })
})
