import React from 'react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'

import theme from '#/common/style/theme/theme'
import {
  BuildingInfoActionRail,
  BuildingInfoDesktopSidebar,
  BuildingInfoMobileActionRow,
  BuildingInfoMobileSidebar,
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
      },
    ],
  },
  {
    id: 'renovationRecommendations',
    title: translation('panel.renovation.title'),
    sections: [],
  },
  {
    id: 'buildingDetails',
    title: translation('panel.building.title'),
    sections: [
      {
        id: 'buildingRows',
        rows: [
          {
            id: 'missingRow',
            label: translation('row.missing.label'),
            text: translation('value.missing'),
            status: 'missing',
            sourceProperties: ['main_purpose'],
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
