import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import {
  createEnergymapBuildingInfoPanels,
  type EnergymapBuildingInfoPanel,
} from '../common/buildingInfo'
import {
  deriveEnergymapBuildingInfoProvenanceSummary,
  type EnergymapBuildingInfoProvenanceSummaryResult,
} from '../common/buildingInfoProvenanceSummary'
import type { EnergymapSelectedBuilding } from '../common/types'
import { BuildingInfoProvenanceView } from './BuildingInfoProvenanceView'

jest.mock('@tolgee/react', () => {
  const ReactRuntime = jest.requireActual<typeof import('react')>('react')

  return {
    T: ({ keyName }: { keyName: string }) =>
      ReactRuntime.createElement('span', null, keyName),
  }
})

const completeProperties = {
  building_key: 'complete-provenance-view',
  permanent_building_identifier: '101614422K',
  address_fin: 'Mikkolantie 34a',
  postal_code: '00640',
  postal_office_fin: 'HELSINKI',
  main_purpose: '05',
  completion_date: '1967-01-01',
  heating_method: '01',
  heating_energy_source: '01',
  floor_area: 454,
  total_area: 470,
  gross_floor_area: 500,
  number_of_storeys: 2,
  energy_class: 'D',
  is_energy_class_modeled: false,
  energy_certificate_valid_until: '2031-12-31 00:00:00.0',
  energy_certificate_previous_class: 'E',
  energy_certificate_heated_net_area: 1355,
  energy_certificate_ventilation_description_sv: 'Självdrag.',
  energy_certificate_recommendations_fi: 'Tiivistä yläpohjan lämmöneristystä.',
  distr_default_total: 367.7884615,
  distr_default_heat: 343.6634615,
  distr_default_elec: 24.125,
  distr_aahp_total: 289.7019231,
  distr_solar_total: 334.2980769,
  distr_windows_total: 332.6442308,
} satisfies EnergymapSelectedBuilding['properties']

const createPanels = ({
  properties = completeProperties,
  locale = 'en',
}: {
  properties?: EnergymapSelectedBuilding['properties']
  locale?: string
} = {}): EnergymapBuildingInfoPanel[] => {
  const buildingKey = String(properties.building_key)
  const panels = createEnergymapBuildingInfoPanels({
    selectedBuilding: {
      id: buildingKey,
      buildingKey,
      source: 'energymap_building_polygons',
      sourceLayer: 'energymap_building_polygons',
      layerId: 'energymap_building_polygons-fill',
      properties,
    },
    locale,
  })

  if (panels == null) {
    throw new Error('Expected building-info panels')
  }

  return panels
}

const deriveResult = ({
  properties,
  locale = 'en',
}: {
  properties?: EnergymapSelectedBuilding['properties']
  locale?: string
} = {}) => {
  const panels = createPanels({ properties, locale })
  const result = deriveEnergymapBuildingInfoProvenanceSummary({
    panels,
    locale,
  })

  if (result == null) {
    throw new Error('Expected provenance result')
  }

  return result
}

const renderView = ({
  result,
  onClose = jest.fn(),
}: {
  result: EnergymapBuildingInfoProvenanceSummaryResult
  onClose?: () => void
}) => {
  const headingRef = React.createRef<HTMLHeadingElement>()
  const view = render(
    <AppThemeProvider disableCssBaseline>
      <BuildingInfoProvenanceView
        result={result}
        regionId="provenance-region"
        headingId="provenance-heading"
        headingRef={headingRef}
        onClose={onClose}
      />
    </AppThemeProvider>
  )

  return { ...view, headingRef }
}

describe('BuildingInfoProvenanceView', () => {
  it('renders every resolved item in read-model order with returned relationships', () => {
    const result = deriveResult()
    if (result.status !== 'resolved') {
      throw new Error('Expected resolved provenance')
    }

    renderView({ result })

    expect(
      screen
        .getAllByTestId('building-info-provenance-item')
        .map((item) => item.getAttribute('data-provenance-item-id'))
    ).toEqual(result.summary.items.map(({ id }) => id))
    expect(screen.getByTestId('building-info-provenance-view')).toHaveAttribute(
      'data-summary-locale',
      'en'
    )
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent('sidebar.building_info.provenance.view.category')
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent('sidebar.building_info.provenance.view.direct_sources')
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.view.supporting_sources'
    )
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.view.direct_providers'
    )
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.view.supporting_providers'
    )
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.view.direct_calculations'
    )
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.view.selected_evidence'
    )
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent('sidebar.building_info.provenance.view.metadata')
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.metadata.source_language: sv'
    )
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.metadata.reference_version:'
    )
  })

  it('keeps modeled and origin-unavailable class provenance distinct', () => {
    const modeledResult = deriveResult({
      properties: {
        building_key: 'modeled-provenance-view',
        energy_class: 'D',
        is_energy_class_modeled: true,
      },
      locale: 'fi',
    })
    const modeledView = renderView({ result: modeledResult })

    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.fields.energy_class_modeled'
    )
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.categories.modeled_output'
    )
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.view.documented_method'
    )
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).toHaveTextContent(
      'sidebar.building_info.provenance.metadata.modeled_class_2018: 2018'
    )

    modeledView.unmount()
    const unknownResult = deriveResult({
      properties: {
        building_key: 'unknown-origin-provenance-view',
        energy_class: 'C',
        is_energy_class_modeled: 'true',
      },
    })
    renderView({ result: unknownResult })

    const unknownView = screen.getByTestId('building-info-provenance-view')
    expect(unknownView).toHaveTextContent(
      'sidebar.building_info.provenance.fields.energy_class_origin_unavailable'
    )
    expect(unknownView).toHaveTextContent(
      'sidebar.building_info.provenance.categories.origin_unavailable'
    )
    expect(unknownView).toHaveTextContent(
      'sidebar.building_info.provenance.metadata.energy_class_origin_unavailable'
    )
    expect(unknownView).not.toHaveTextContent(
      'sidebar.building_info.provenance.fields.energy_class_official'
    )
    expect(unknownView).not.toHaveTextContent(
      'sidebar.building_info.provenance.fields.energy_class_modeled'
    )
  })

  it('renders only the two resolved Water-only entries and no scenario note', () => {
    const result = deriveResult({
      properties: {
        building_key: 'water-only-provenance-view',
        floor_area: 100,
        distr_default_total: null,
      },
    })
    if (result.status !== 'resolved') {
      throw new Error('Expected resolved Water-only provenance')
    }

    renderView({ result })

    expect(
      screen
        .getAllByTestId('building-info-provenance-item')
        .map((item) => item.getAttribute('data-provenance-item-id'))
    ).toEqual([
      'energyConsumption/estimatedConsumption/primaryMetric/water/value',
      'energyConsumption/estimatedConsumption/primaryMetric/water/residentCountControl',
    ])
    expect(
      screen.getByTestId('building-info-provenance-view')
    ).not.toHaveTextContent(
      'sidebar.building_info.provenance.fields.estimated_consumption_note'
    )
  })

  it('fails closed without exposing partial items or raw diagnostics', () => {
    const result: EnergymapBuildingInfoProvenanceSummaryResult = {
      status: 'contractFailure',
      locale: 'fi',
      failures: [
        {
          failureType: 'catalogResolution',
          location: {
            panelId: 'buildingDetails',
            sectionId: 'identity',
            path: 'internal/raw/path',
          },
          itemKind: 'row',
          reason: 'unknown-identity',
          id: 'internal.secret.source',
        },
      ],
    }
    const onClose = jest.fn()

    renderView({ result, onClose })

    const view = screen.getByTestId('building-info-provenance-view')
    expect(view).toHaveAttribute('data-summary-status', 'contractFailure')
    expect(view).toHaveAttribute('data-summary-locale', 'fi')
    expect(view).toHaveTextContent(
      'sidebar.building_info.provenance.view.integration_unavailable'
    )
    expect(
      screen.queryAllByTestId('building-info-provenance-item')
    ).toHaveLength(0)
    expect(view).not.toHaveTextContent('internal/raw/path')
    expect(view).not.toHaveTextContent('internal.secret.source')
    expect(view).not.toHaveTextContent('unknown-identity')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'sidebar.building_info.provenance.view.close',
      })
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
