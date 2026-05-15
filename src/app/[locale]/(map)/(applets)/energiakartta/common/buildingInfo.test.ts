import {
  composeEnergymapBuildingAddress,
  createEnergymapBuildingInfoPanels,
  formatYearFromDate,
  resolveCurrentEnergyScenarioPrefix,
} from './buildingInfo'
import type {
  EnergymapBuildingInfoMetric,
  EnergymapBuildingInfoPanel,
  EnergymapBuildingInfoPanelId,
  EnergymapBuildingInfoRow,
  EnergymapBuildingInfoScenario,
  EnergymapBuildingInfoText,
  EnergymapBuildingInfoValue,
} from './buildingInfo'
import type { EnergymapSelectedBuilding } from './types'

const translationPrefix = 'sidebar.building_info'

const createSelectedBuilding = (
  properties: EnergymapSelectedBuilding['properties']
): EnergymapSelectedBuilding => ({
  id: String(properties.building_key ?? 'selected-building'),
  buildingKey: String(properties.building_key ?? 'selected-building'),
  source: 'energymap_building_polygons',
  sourceLayer: 'energymap_building_polygons',
  layerId: 'energymap_building_polygons-fill',
  properties,
})

const districtHeatingBuilding = createSelectedBuilding({
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
})

const geothermalBuilding = createSelectedBuilding({
  building_key: '020e4152-d81a-4e5a-a2cd-84819a0fb84d',
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
})

const unsupportedHeatingBuilding = createSelectedBuilding({
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
})

const getPanel = (
  panels: EnergymapBuildingInfoPanel[],
  panelId: EnergymapBuildingInfoPanelId
) => {
  const panel = panels.find((candidate) => candidate.id === panelId)

  if (panel == null) {
    throw new Error(`Panel not found: ${panelId}`)
  }

  return panel
}

const getRows = (panel: EnergymapBuildingInfoPanel) =>
  panel.sections.flatMap((section) => section.rows ?? [])

const getRow = (
  panel: EnergymapBuildingInfoPanel,
  rowId: string
): EnergymapBuildingInfoRow => {
  const row = getRows(panel).find((candidate) => candidate.id === rowId)

  if (row == null) {
    throw new Error(`Row not found: ${rowId}`)
  }

  return row
}

const getMetrics = (panel: EnergymapBuildingInfoPanel) =>
  panel.sections.flatMap((section) => section.metrics ?? [])

const getMetric = (
  panel: EnergymapBuildingInfoPanel,
  metricId: EnergymapBuildingInfoMetric['id']
): EnergymapBuildingInfoMetric => {
  const metric = getMetrics(panel).find((candidate) => candidate.id === metricId)

  if (metric == null) {
    throw new Error(`Metric not found: ${metricId}`)
  }

  return metric
}

const getMetricValue = (
  metric: EnergymapBuildingInfoMetric,
  valueId: 'annualTotal' | 'perSquareMeter' | 'savingsPercent'
): EnergymapBuildingInfoValue => {
  const value = metric.values.find((candidate) => candidate.id === valueId)

  if (value == null) {
    throw new Error(`Metric value not found: ${valueId}`)
  }

  return value
}

const getScenarios = (panel: EnergymapBuildingInfoPanel) =>
  panel.sections.flatMap((section) => section.scenarios ?? [])

const getScenario = (
  panel: EnergymapBuildingInfoPanel,
  scenarioId: EnergymapBuildingInfoScenario['id']
): EnergymapBuildingInfoScenario => {
  const scenario = getScenarios(panel).find(
    (candidate) => candidate.id === scenarioId
  )

  if (scenario == null) {
    throw new Error(`Scenario not found: ${scenarioId}`)
  }

  return scenario
}

const expectPlainText = (
  value: EnergymapBuildingInfoText,
  expectedText: string
) => {
  expect(value).toEqual({ type: 'plain', text: expectedText })
}

const expectTranslation = (
  value: EnergymapBuildingInfoText,
  expectedKey: string,
  expectedParams?: Record<string, string | number>
) => {
  expect(value).toEqual({
    type: 'translation',
    keyName: expectedKey,
    ...(expectedParams == null ? {} : { params: expectedParams }),
  })
}

describe('Energiakartta building info model', () => {
  it('returns null when there is no selected building', () => {
    expect(
      createEnergymapBuildingInfoPanels({
        selectedBuilding: null,
        locale: 'en-US',
      })
    ).toBeNull()
  })

  it('returns the three panel ids in stable order', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: districtHeatingBuilding,
      locale: 'en-US',
    })

    expect(panels?.map((panel) => panel.id)).toEqual([
      'energyConsumption',
      'renovationRecommendations',
      'buildingDetails',
    ])
  })

  it('formats date strings and composes address values from live tile fields', () => {
    expect(formatYearFromDate('1967-01-01')).toBe('1967')
    expect(formatYearFromDate('2023-08-29T00:00:00Z')).toBe('2023')
    expect(formatYearFromDate('not a date')).toBeNull()
    expect(
      composeEnergymapBuildingAddress(districtHeatingBuilding.properties)
    ).toBe('Mikkolantie 34a, 00640 HELSINKI')
  })

  it('maps real building details without overclaiming unavailable Figma fields', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: districtHeatingBuilding,
      locale: 'en-US',
    })
    const buildingPanel = getPanel(panels ?? [], 'buildingDetails')

    const address = getRow(buildingPanel, 'address')
    expect(address.status).toBe('real')
    expectPlainText(address.text, 'Mikkolantie 34a, 00640 HELSINKI')
    expect(address.sourceProperties).toEqual([
      'address_fin',
      'postal_code',
      'postal_office_fin',
    ])

    const buildingIdentifier = getRow(buildingPanel, 'buildingIdentifier')
    expect(buildingIdentifier.status).toBe('real')
    expectPlainText(buildingIdentifier.text, '101614422K')

    const constructionYear = getRow(buildingPanel, 'constructionYear')
    expect(constructionYear.status).toBe('real')
    expectPlainText(constructionYear.text, '1967')

    const buildingType = getRow(buildingPanel, 'buildingType')
    expect(buildingType.status).toBe('real')
    expectTranslation(
      buildingType.text,
      `${translationPrefix}.codes.main_purpose.05`
    )

    const energyClass = getRow(buildingPanel, 'energyClass')
    expect(energyClass.status).toBe('real')
    expectPlainText(energyClass.text, 'D')

    const propertyIdentifier = getRow(buildingPanel, 'propertyIdentifier')
    expect(propertyIdentifier.status).toBe('placeholder')
    expectTranslation(
      propertyIdentifier.text,
      `${translationPrefix}.placeholders.not_published`
    )

    const heatedNetArea = getRow(buildingPanel, 'heatedNetArea')
    expect(heatedNetArea.status).toBe('placeholder')
    expectTranslation(
      heatedNetArea.text,
      `${translationPrefix}.placeholders.not_published`
    )
  })

  it('composes heating from translation-backed code labels', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: districtHeatingBuilding,
      locale: 'en-US',
    })
    const heating = getRow(getPanel(panels ?? [], 'buildingDetails'), 'heating')

    expect(heating.status).toBe('real')
    expect(heating.text).toEqual({
      type: 'sequence',
      separator: ', ',
      parts: [
        {
          type: 'translation',
          keyName: `${translationPrefix}.codes.heating_energy_source.01`,
        },
        {
          type: 'translation',
          keyName: `${translationPrefix}.codes.heating_method.01`,
        },
      ],
    })
  })

  it('marks default consumption values as estimates and derives annual totals only from valid area', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: districtHeatingBuilding,
      locale: 'en-US',
    })
    const energyPanel = getPanel(panels ?? [], 'energyConsumption')
    const totalMetric = getMetric(energyPanel, 'total')
    const annualTotal = getMetricValue(totalMetric, 'annualTotal')
    const perSquareMeter = getMetricValue(totalMetric, 'perSquareMeter')

    expect(perSquareMeter.status).toBe('estimate')
    expectPlainText(perSquareMeter.text, '367.8')
    expect(perSquareMeter.unitKey).toBe(
      `${translationPrefix}.units.kwh_per_square_meter_year`
    )
    expect(perSquareMeter.sourceProperties).toEqual(['distr_default_total'])

    expect(annualTotal.status).toBe('estimate')
    expectPlainText(annualTotal.text, '166,976')
    expect(annualTotal.unitKey).toBe(`${translationPrefix}.units.kwh_per_year`)
    expect(annualTotal.sourceProperties).toEqual([
      'distr_default_total',
      'floor_area',
    ])
  })

  it('produces renovation scenario estimates from published baseline and measure columns', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: districtHeatingBuilding,
      locale: 'en-US',
    })
    const renovationPanel = getPanel(panels ?? [], 'renovationRecommendations')
    const certificateRecommendations = getRow(
      renovationPanel,
      'energyCertificateRecommendations'
    )
    const scenario = getScenario(renovationPanel, 'aahp')
    const annualTotal = scenario.values.find(
      (value) => value.id === 'annualTotal'
    )
    const savingsPercent = scenario.values.find(
      (value) => value.id === 'savingsPercent'
    )

    expect(certificateRecommendations.status).toBe('placeholder')
    expectTranslation(
      certificateRecommendations.text,
      `${translationPrefix}.placeholders.not_published`
    )
    expect(annualTotal?.status).toBe('estimate')
    expectPlainText(annualTotal?.text as EnergymapBuildingInfoText, '131,525')
    expect(savingsPercent?.status).toBe('estimate')
    expectTranslation(
      savingsPercent?.text as EnergymapBuildingInfoText,
      `${translationPrefix}.panels.renovation.savings_less`,
      { percent: '-21%' }
    )
  })

  it('keeps absent scenario combinations as not-published placeholders', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: geothermalBuilding,
      locale: 'en-US',
    })
    const renovationPanel = getPanel(panels ?? [], 'renovationRecommendations')
    const scenario = getScenario(renovationPanel, 'aahp')
    const annualTotal = scenario.values.find(
      (value) => value.id === 'annualTotal'
    )

    expect(annualTotal?.status).toBe('placeholder')
    expectTranslation(
      annualTotal?.text as EnergymapBuildingInfoText,
      `${translationPrefix}.placeholders.not_published`
    )
    expect(annualTotal?.sourceProperties).toEqual(['gshp_aahp_total'])
  })

  it('does not pick an arbitrary consumption scenario for unsupported heating data', () => {
    expect(
      resolveCurrentEnergyScenarioPrefix({
        heatingEnergySource: '99',
        heatingMethod: '07',
      })
    ).toBeNull()

    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: unsupportedHeatingBuilding,
      locale: 'en-US',
    })
    const energyPanel = getPanel(panels ?? [], 'energyConsumption')
    const totalMetric = getMetric(energyPanel, 'total')
    const annualTotal = getMetricValue(totalMetric, 'annualTotal')

    expect(annualTotal.status).toBe('missing')
    expectTranslation(
      annualTotal.text,
      `${translationPrefix}.placeholders.unsupported_energy_estimate`
    )
    expect(annualTotal.sourceProperties).toEqual([
      'heating_method',
      'heating_energy_source',
    ])
  })

  it('turns missing selected-feature values into explicit missing placeholders', () => {
    const selectedBuilding = createSelectedBuilding({
      building_key: 'missing-values',
      address_fin: 'Kinkeripolku 8b',
      postal_code: '00680',
      postal_office_fin: 'HELSINKI',
      main_purpose: '98',
      floor_area: 0,
    })
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding,
      locale: 'en-US',
    })
    const buildingPanel = getPanel(panels ?? [], 'buildingDetails')
    const constructionYear = getRow(buildingPanel, 'constructionYear')
    const energyClass = getRow(buildingPanel, 'energyClass')
    const floorArea = getRow(buildingPanel, 'floorArea')
    const buildingType = getRow(buildingPanel, 'buildingType')

    expect(constructionYear.status).toBe('missing')
    expectTranslation(
      constructionYear.text,
      `${translationPrefix}.placeholders.missing_value`
    )

    expect(energyClass.status).toBe('missing')
    expectTranslation(
      energyClass.text,
      `${translationPrefix}.placeholders.missing_value`
    )

    expect(floorArea.status).toBe('missing')
    expectTranslation(
      floorArea.text,
      `${translationPrefix}.placeholders.missing_value`
    )

    expect(buildingType.status).toBe('real')
    expectTranslation(
      buildingType.text,
      `${translationPrefix}.placeholders.unknown_code`,
      { code: '98' }
    )
  })
})
