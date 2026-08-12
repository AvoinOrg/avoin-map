import { execFileSync } from 'node:child_process'
import {
  composeEnergymapBuildingAddress,
  createEnergymapBuildingInfoPanels,
  formatYearFromDate,
  getSelectedEnergyConsumption,
  resolveCurrentEnergyScenarioPrefix,
} from './buildingInfo'
import enTranslations from '@i18n/energiakartta/en.json'
import fiTranslations from '@i18n/energiakartta/fi.json'
import type {
  EnergymapBuildingInfoConsumptionControls,
  EnergymapBuildingInfoEnergySubmetricId,
  EnergymapBuildingInfoMetric,
  EnergymapBuildingInfoPanel,
  EnergymapBuildingInfoPanelId,
  EnergymapBuildingInfoPrimaryMetric,
  EnergymapBuildingInfoPrimaryMetricId,
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
  energy_certificate_valid_until: '2031-12-31 00:00:00.0',
  energy_certificate_heated_net_area: 1355,
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

const getSection = (
  panel: EnergymapBuildingInfoPanel,
  sectionId: string
) => {
  const section = panel.sections.find((candidate) => candidate.id === sectionId)

  if (section == null) {
    throw new Error(`Section not found: ${sectionId}`)
  }

  return section
}

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

const getVentilationRow = ({
  properties,
  locale,
}: {
  properties: EnergymapSelectedBuilding['properties']
  locale: string
}) => {
  const panels = createEnergymapBuildingInfoPanels({
    selectedBuilding: createSelectedBuilding(properties),
    locale,
  })

  return getRow(getPanel(panels ?? [], 'buildingDetails'), 'ventilation')
}

const getCertificateRecommendationsRow = ({
  properties,
  locale,
}: {
  properties: EnergymapSelectedBuilding['properties']
  locale: string
}) => {
  const panels = createEnergymapBuildingInfoPanels({
    selectedBuilding: createSelectedBuilding(properties),
    locale,
  })

  return getRow(
    getPanel(panels ?? [], 'renovationRecommendations'),
    'energyCertificateRecommendations'
  )
}

const getCertificateValidityRow = ({
  properties,
  locale,
}: {
  properties: EnergymapSelectedBuilding['properties']
  locale: string
}) => {
  const panels = createEnergymapBuildingInfoPanels({
    selectedBuilding: createSelectedBuilding(properties),
    locale,
  })

  return getRow(
    getPanel(panels ?? [], 'buildingDetails'),
    'energyCertificateValidity'
  )
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

const getConsumptionControls = (
  panel: EnergymapBuildingInfoPanel
): EnergymapBuildingInfoConsumptionControls => {
  const controls = panel.sections.find(
    (section) => section.id === 'estimatedConsumption'
  )?.consumptionControls

  if (controls == null) {
    throw new Error('Consumption controls not found')
  }

  return controls
}

const getPrimaryMetric = (
  panel: EnergymapBuildingInfoPanel,
  metricId: EnergymapBuildingInfoPrimaryMetricId
): EnergymapBuildingInfoPrimaryMetric => {
  const metric = getConsumptionControls(panel).primaryMetrics.find(
    (candidate) => candidate.id === metricId
  )

  if (metric == null) {
    throw new Error(`Primary metric not found: ${metricId}`)
  }

  return metric
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

    expect(
      buildingPanel.sections.map((section) => ({
        id: section.id,
        variant: section.variant ?? 'default',
      }))
    ).toEqual([
      { id: 'buildingSubheader', variant: 'buildingSubheader' },
      { id: 'identity', variant: 'default' },
      { id: 'energyCertificate', variant: 'energyCertificate' },
      { id: 'previousEnergyClass', variant: 'previousEnergyClass' },
      { id: 'plannedMeasures', variant: 'measureList' },
      { id: 'technicalDetails', variant: 'default' },
    ])

    expect(getSection(buildingPanel, 'identity').rows?.map((row) => row.id))
      .not.toContain('address')
    expect(
      getSection(buildingPanel, 'energyCertificate').rows?.map((row) => row.id)
    ).toEqual(['energyClass', 'energyCertificateValidity'])
    expect(
      getSection(buildingPanel, 'previousEnergyClass').rows?.map(
        (row) => row.id
      )
    ).toEqual(['previousEnergyClass', 'energyClassMeasures'])
    expect(
      getSection(buildingPanel, 'technicalDetails').rows?.map((row) => row.id)
    ).toEqual([
      'heating',
      'heatedNetArea',
      'ventilation',
      'plotTenure',
      'residentCount',
    ])

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
    expect(constructionYear.sourceProperties).toEqual(['completion_date'])

    const buildingType = getRow(buildingPanel, 'buildingType')
    expect(buildingType.status).toBe('real')
    expectTranslation(
      buildingType.text,
      `${translationPrefix}.codes.main_purpose.05`
    )

    const energyClass = getRow(buildingPanel, 'energyClass')
    expect(energyClass.status).toBe('real')
    expectPlainText(energyClass.text, 'D')

    const energyCertificateValidity = getRow(
      buildingPanel,
      'energyCertificateValidity'
    )
    expect(energyCertificateValidity.status).toBe('real')
    expectPlainText(energyCertificateValidity.text, '12/31/2031')
    expect(energyCertificateValidity.sourceProperties).toEqual([
      'energy_certificate_valid_until',
    ])

    const propertyIdentifier = getRow(buildingPanel, 'propertyIdentifier')
    expect(propertyIdentifier.status).toBe('placeholder')
    expectTranslation(
      propertyIdentifier.text,
      `${translationPrefix}.placeholders.not_published`
    )

    const heatedNetArea = getRow(buildingPanel, 'heatedNetArea')
    expect(heatedNetArea.status).toBe('real')
    expectPlainText(heatedNetArea.text, '1,355')
    expect(heatedNetArea.unitKey).toBe(
      `${translationPrefix}.units.square_meters`
    )
    expect(heatedNetArea.sourceProperties).toEqual([
      'energy_certificate_heated_net_area',
    ])
  })

  it('formats a fractional certificate heated net area with locale rounding', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: createSelectedBuilding({
        building_key: 'fractional-heated-net-area',
        energy_certificate_heated_net_area: '1234.56',
      }),
      locale: 'en-US',
    })
    const heatedNetArea = getRow(
      getPanel(panels ?? [], 'buildingDetails'),
      'heatedNetArea'
    )

    expect(heatedNetArea.status).toBe('real')
    expectPlainText(heatedNetArea.text, '1,234.6')
    expect(heatedNetArea.unitKey).toBe(
      `${translationPrefix}.units.square_meters`
    )
    expect(heatedNetArea.sourceProperties).toEqual([
      'energy_certificate_heated_net_area',
    ])
  })

  it.each([
    ['en-US', '2031-12-31 00:00:00.0', '12/31/2031'],
    ['fi-FI', '2031-12-31T00:00:00', '31.12.2031'],
  ])(
    'formats certificate validity as a timezone-stable calendar date for %s',
    (locale, sourceValue, expectedDate) => {
      const validity = getCertificateValidityRow({
        properties: {
          building_key: `certificate-validity-${locale}-${sourceValue}`,
          energy_certificate_valid_until: sourceValue,
        },
        locale,
      })

      expect(validity.status).toBe('real')
      expectPlainText(validity.text, expectedDate)
      expect(validity.sourceProperties).toEqual([
        'energy_certificate_valid_until',
      ])
    }
  )

  it('preserves a DST-boundary calendar date west of UTC', () => {
    const previousTimezone = process.env.TZ

    try {
      process.env.TZ = 'America/Los_Angeles'
      const result = JSON.parse(
        execFileSync(
          process.execPath,
          [
            '--import',
            'tsx',
            '--input-type=module',
            '--eval',
            `
              const buildingInfo = (
                await import('./src/applets/energy/common/buildingInfo.ts')
              ).default
              const localDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              }).format(new Date(Date.UTC(2025, 2, 9)))
              const validityDate = buildingInfo.formatCalendarDate({
                value: '2025-03-09 00:00:00.0',
                locale: 'en-US',
              })

              process.stdout.write(JSON.stringify({ localDate, validityDate }))
            `,
          ],
          {
            cwd: process.cwd(),
            encoding: 'utf8',
            env: process.env,
          }
        )
      )

      expect(result.localDate).toBe('3/8/2025')
      expect(result.validityDate).toBe('3/9/2025')
    } finally {
      if (previousTimezone == null) {
        delete process.env.TZ
      } else {
        process.env.TZ = previousTimezone
      }
    }
  })

  it.each([
    ['absent', {}],
    ['undefined', { energy_certificate_valid_until: undefined }],
    ['null', { energy_certificate_valid_until: null }],
    ['empty', { energy_certificate_valid_until: '' }],
    ['whitespace', { energy_certificate_valid_until: '   ' }],
    ['non-string', { energy_certificate_valid_until: 20311231 }],
    ['malformed separators', { energy_certificate_valid_until: '2031/12/31' }],
    [
      'malformed timestamp',
      { energy_certificate_valid_until: '2031-12-31 midnight' },
    ],
    [
      'invalid clock time',
      { energy_certificate_valid_until: '2031-12-31 99:99:99' },
    ],
    [
      'invalid clock minute',
      { energy_certificate_valid_until: '2031-12-31 23:60:00' },
    ],
    [
      'invalid clock second',
      { energy_certificate_valid_until: '2031-12-31 23:59:60' },
    ],
    [
      'invalid offset hour',
      { energy_certificate_valid_until: '2031-12-31T23:59:59+14:01' },
    ],
    [
      'invalid offset minute',
      { energy_certificate_valid_until: '2031-12-31T23:59:59+12:60' },
    ],
    ['non-leap day', { energy_certificate_valid_until: '2025-02-29' }],
    ['invalid month', { energy_certificate_valid_until: '2031-13-01' }],
    ['invalid day', { energy_certificate_valid_until: '2031-12-00' }],
  ])('keeps %s certificate validity missing', (_caseName, properties) => {
    const validity = getCertificateValidityRow({
      properties: {
        building_key: `certificate-validity-${_caseName}`,
        ...properties,
      },
      locale: 'en-US',
    })

    expect(validity.status).toBe('missing')
    expectTranslation(
      validity.text,
      `${translationPrefix}.placeholders.missing_value`
    )
    expect(validity.sourceProperties).toEqual([
      'energy_certificate_valid_until',
    ])
  })

  it('does not infer certificate validity from other certificate or building dates', () => {
    const validity = getCertificateValidityRow({
      properties: {
        building_key: 'certificate-validity-no-fallback',
        energy_certificate_class_year: 2018,
        energy_certificate_signed_at: '2021-12-31 00:00:00',
        completion_date: '1967-01-01',
      },
      locale: 'en-US',
    })

    expect(validity.status).toBe('missing')
    expectTranslation(
      validity.text,
      `${translationPrefix}.placeholders.missing_value`
    )
    expect(validity.sourceProperties).toEqual([
      'energy_certificate_valid_until',
    ])
  })

  it('maps a populated previous certificate class with exact provenance', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: createSelectedBuilding({
        building_key: 'previous-class-populated',
        energy_certificate_previous_class: ' B ',
      }),
      locale: 'en-US',
    })
    const previousEnergyClass = getRow(
      getPanel(panels ?? [], 'buildingDetails'),
      'previousEnergyClass'
    )

    expect(previousEnergyClass.status).toBe('real')
    expectPlainText(previousEnergyClass.text, 'B')
    expect(previousEnergyClass.sourceProperties).toEqual([
      'energy_certificate_previous_class',
    ])
  })

  it('keeps a previous certificate class that matches the current class', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: createSelectedBuilding({
        building_key: 'previous-class-same-as-current',
        energy_certificate_class: 'D',
        energy_certificate_previous_class: 'D',
      }),
      locale: 'en-US',
    })
    const buildingPanel = getPanel(panels ?? [], 'buildingDetails')
    const currentEnergyClass = getRow(buildingPanel, 'energyClass')
    const previousEnergyClass = getRow(buildingPanel, 'previousEnergyClass')

    expectPlainText(currentEnergyClass.text, 'D')
    expectPlainText(previousEnergyClass.text, 'D')
    expect(previousEnergyClass.status).toBe('real')
    expect(previousEnergyClass.sourceProperties).toEqual([
      'energy_certificate_previous_class',
    ])
  })

  it('uses a different previous certificate class without deriving it from the current class', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: createSelectedBuilding({
        building_key: 'previous-class-different-from-current',
        energy_certificate_class: 'D',
        energy_certificate_previous_class: 'F',
      }),
      locale: 'en-US',
    })
    const buildingPanel = getPanel(panels ?? [], 'buildingDetails')
    const currentEnergyClass = getRow(buildingPanel, 'energyClass')
    const previousEnergyClass = getRow(buildingPanel, 'previousEnergyClass')

    expectPlainText(currentEnergyClass.text, 'D')
    expectPlainText(previousEnergyClass.text, 'F')
    expect(previousEnergyClass.status).toBe('real')
    expect(previousEnergyClass.sourceProperties).toEqual([
      'energy_certificate_previous_class',
    ])
  })

  it.each([
    ['absent', {}],
    ['null', { energy_certificate_previous_class: null }],
    ['empty', { energy_certificate_previous_class: '' }],
    ['whitespace', { energy_certificate_previous_class: '   ' }],
  ])(
    'keeps %s previous certificate history missing without falling back to the current class',
    (_caseName, previousClassProperties) => {
      const panels = createEnergymapBuildingInfoPanels({
        selectedBuilding: createSelectedBuilding({
          building_key: `previous-class-${_caseName}`,
          energy_certificate_class: 'D',
          ...previousClassProperties,
        }),
        locale: 'en-US',
      })
      const buildingPanel = getPanel(panels ?? [], 'buildingDetails')
      const currentEnergyClass = getRow(buildingPanel, 'energyClass')
      const previousEnergyClass = getRow(buildingPanel, 'previousEnergyClass')

      expectPlainText(currentEnergyClass.text, 'D')
      expect(previousEnergyClass.status).toBe('missing')
      expectTranslation(
        previousEnergyClass.text,
        `${translationPrefix}.placeholders.missing_value`
      )
      expect(previousEnergyClass.sourceProperties).toEqual([
        'energy_certificate_previous_class',
      ])
    }
  )

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

  it.each([
    [
      'Finnish prefers Finnish',
      'fi-FI',
      {
        energy_certificate_ventilation_description_fi:
          '  Koneellinen ilmanvaihto  ',
        energy_certificate_ventilation_description_sv: 'Mekanisk ventilation',
      },
      'Koneellinen ilmanvaihto',
      'fi',
      'energy_certificate_ventilation_description_fi',
    ],
    [
      'Finnish falls back from blank Finnish to Swedish',
      'fi',
      {
        energy_certificate_ventilation_description_fi: ' \n ',
        energy_certificate_ventilation_description_sv:
          '  Mekanisk ventilation  ',
      },
      'Mekanisk ventilation',
      'sv',
      'energy_certificate_ventilation_description_sv',
    ],
    [
      'English presents Finnish as Finnish source text',
      'en-US',
      {
        energy_certificate_ventilation_description_fi:
          'Painovoimainen ilmanvaihto',
        energy_certificate_ventilation_description_sv: 'Självdragsventilation',
      },
      'Painovoimainen ilmanvaihto',
      'fi',
      'energy_certificate_ventilation_description_fi',
    ],
    [
      'English falls back to Swedish source text',
      'en',
      {
        energy_certificate_ventilation_description_sv:
          'Från- och tilluftsventilation',
      },
      'Från- och tilluftsventilation',
      'sv',
      'energy_certificate_ventilation_description_sv',
    ],
    [
      'long source prose is preserved',
      'en',
      {
        energy_certificate_ventilation_description_fi:
          '  Koneellinen tulo- ja poistoilmanvaihto lämmöntalteenotolla. Kuvaus sisältää pitkän teknisen selosteen, välimerkkejä sekä Unicode-merkkejä: ääkköset säilyvät muuttumattomina.  ',
      },
      'Koneellinen tulo- ja poistoilmanvaihto lämmöntalteenotolla. Kuvaus sisältää pitkän teknisen selosteen, välimerkkejä sekä Unicode-merkkejä: ääkköset säilyvät muuttumattomina.',
      'fi',
      'energy_certificate_ventilation_description_fi',
    ],
    [
      'HTML-like source text stays plain',
      'en',
      {
        energy_certificate_ventilation_description_fi:
          '  <strong data-injected="true">Painovoimainen</strong><script>alert("unsafe")</script>  ',
      },
      '<strong data-injected="true">Painovoimainen</strong><script>alert("unsafe")</script>',
      'fi',
      'energy_certificate_ventilation_description_fi',
    ],
  ] as const)(
    'selects one ventilation description: %s',
    (_caseName, locale, properties, text, sourceLanguage, sourceProperty) => {
      const ventilation = getVentilationRow({ properties, locale })

      expect(ventilation.status).toBe('real')
      expectPlainText(ventilation.text, text)
      expect(ventilation.sourceLanguage).toBe(sourceLanguage)
      expect(ventilation.sourceProperties).toEqual([sourceProperty])
    }
  )

  it.each([
    {
      caseName: 'all fields missing',
      properties: {},
      hiddenText: undefined,
    },
    {
      caseName: 'descriptions blank',
      properties: {
        energy_certificate_ventilation_description_fi: ' \n ',
        energy_certificate_ventilation_description_sv: '\t',
      },
      hiddenText: undefined,
    },
    {
      caseName: 'descriptions are not strings',
      properties: {
        energy_certificate_ventilation_description_fi: 42,
        energy_certificate_ventilation_description_sv: Number.POSITIVE_INFINITY,
      },
      hiddenText: undefined,
    },
    {
      caseName: 'only an unmapped type code exists',
      properties: { energy_certificate_ventilation_type_id: '03' },
      hiddenText: '03',
    },
  ])(
    'uses the normal missing state when $caseName',
    ({ properties, hiddenText }) => {
      const ventilation = getVentilationRow({
        properties: {
          building_key: 'ventilation-missing',
          ...properties,
        },
        locale: 'fi',
      })

      expect(ventilation.status).toBe('missing')
      expectTranslation(
        ventilation.text,
        `${translationPrefix}.placeholders.missing_value`
      )
      expect(ventilation.sourceLanguage).toBeUndefined()
      expect(ventilation.sourceProperties).toEqual([
        'energy_certificate_ventilation_description_fi',
        'energy_certificate_ventilation_description_sv',
        'energy_certificate_ventilation_type_id',
      ])
      if (hiddenText != null) {
        expect(JSON.stringify(ventilation.text)).not.toContain(hiddenText)
      }
    }
  )

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

  it('exposes complete Cost, CO2, and resident-based Water controls', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: districtHeatingBuilding,
      locale: 'en-US',
    })
    const energyPanel = getPanel(panels ?? [], 'energyConsumption')
    const controls = getConsumptionControls(energyPanel)

    expect(controls.defaultPrimaryMetricId).toBe('energy')
    expect(controls.primaryMetrics.map((metric) => metric.id)).toEqual([
      'energy',
      'water',
      'cost',
      'co2',
    ])
    expect(
      controls.primaryMetrics.map((metric) => ({
        id: metric.id,
        supported: metric.supported,
        value: metric.value,
        unavailableNote: metric.unavailableNote?.text,
      }))
    ).toEqual([
      {
        id: 'energy',
        supported: true,
        value: undefined,
        unavailableNote: undefined,
      },
      {
        id: 'water',
        supported: true,
        value: {
          status: 'estimate',
          text: { type: 'plain', text: '481.8' },
          unitKey: `${translationPrefix}.units.cubic_meters_per_year`,
          sourceProperties: ['floor_area'],
        },
        unavailableNote: undefined,
      },
      {
        id: 'cost',
        supported: true,
        value: {
          status: 'estimate',
          text: { type: 'plain', text: '19,613' },
          unitKey: `${translationPrefix}.units.eur_per_year`,
          sourceProperties: [
            'main_purpose',
            'floor_area',
            'distr_default_elec',
            'distr_default_heat',
            'heating_energy_source',
            'heating_method',
          ],
        },
        unavailableNote: undefined,
      },
      {
        id: 'co2',
        supported: true,
        value: {
          status: 'estimate',
          text: { type: 'plain', text: '18,436' },
          unitKey: `${translationPrefix}.units.kg_co2_per_year`,
          sourceProperties: [
            'floor_area',
            'distr_default_elec',
            'distr_default_heat',
            'heating_energy_source',
            'heating_method',
          ],
        },
        unavailableNote: undefined,
      },
    ])
    expect(Object.keys(controls).sort()).toEqual([
      'combinedEnergyMetric',
      'defaultEnergySubmetricIds',
      'defaultPrimaryMetricId',
      'emptyEnergyMetric',
      'energySubmetrics',
      'primaryMetrics',
    ])
    expect(getPrimaryMetric(energyPanel, 'water').residentCountControl).toEqual({
      defaultValue: 11,
      minValue: 1,
      maxValue: 10000,
      label: {
        type: 'translation',
        keyName: `${translationPrefix}.panels.energy.water.resident_count`,
      },
      toggleLabel: {
        type: 'translation',
        keyName: `${translationPrefix}.panels.energy.water.change_resident_count`,
      },
      description: {
        type: 'translation',
        keyName: `${translationPrefix}.panels.energy.water.description`,
      },
      unavailableText: {
        type: 'translation',
        keyName: `${translationPrefix}.panels.energy.water.invalid_resident_count`,
      },
    })
    expect(
      getSection(energyPanel, 'calculationContext').rows?.map((row) => row.id)
    ).toEqual(['costMode', 'co2Mode', 'waterHeatingSplit'])
    expectTranslation(
      getRow(energyPanel, 'costMode').text,
      `${translationPrefix}.panels.energy.context.cost_current_reference`
    )
    expectTranslation(
      getRow(energyPanel, 'co2Mode').text,
      `${translationPrefix}.panels.energy.context.co2_current_reference`
    )
    expect(getRow(energyPanel, 'costMode').status).toBe('estimate')
    expect(getRow(energyPanel, 'co2Mode').status).toBe('estimate')
    expect(getRow(energyPanel, 'waterHeatingSplit').status).toBe('placeholder')
  })

  it('keeps apartment-pellet Cost complete-only while preserving scoped pellet CO2', () => {
    const apartmentPellet = createSelectedBuilding({
      building_key: 'apartment-pellet',
      main_purpose: '06',
      heating_method: '01',
      heating_energy_source: '07',
      floor_area: 100,
      wood_default_total: 30,
      wood_default_elec: 10,
      wood_default_heat: 20,
    })
    const energyPanel = getPanel(
      createEnergymapBuildingInfoPanels({
        selectedBuilding: apartmentPellet,
        locale: 'en-US',
      }) ?? [],
      'energyConsumption'
    )
    const cost = getPrimaryMetric(energyPanel, 'cost')
    const co2 = getPrimaryMetric(energyPanel, 'co2')

    expect(cost.supported).toBe(false)
    expect(cost.value?.status).toBe('placeholder')
    expectTranslation(
      cost.value?.text as EnergymapBuildingInfoText,
      `${translationPrefix}.panels.energy.unsupported.apartment_pellet_cost`
    )
    expect(cost.value?.text).not.toEqual(expect.objectContaining({ text: '0' }))
    expect(co2.supported).toBe(true)
    expectPlainText(co2.value?.text as EnergymapBuildingInfoText, '45')
    expect(co2.value?.unitKey).toBe(
      `${translationPrefix}.units.kg_co2_per_year`
    )

    const zeroHeatPanel = getPanel(
      createEnergymapBuildingInfoPanels({
        selectedBuilding: createSelectedBuilding({
          ...apartmentPellet.properties,
          building_key: 'apartment-pellet-zero-heat',
          wood_default_heat: 0,
        }),
        locale: 'en-US',
      }) ?? [],
      'energyConsumption'
    )

    expect(getPrimaryMetric(zeroHeatPanel, 'cost').supported).toBe(true)
    expectPlainText(
      getPrimaryMetric(zeroHeatPanel, 'cost').value
        ?.text as EnergymapBuildingInfoText,
      '263'
    )
  })

  it('keeps Cost class support independent from a complete CO2 estimate', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: createSelectedBuilding({
        ...districtHeatingBuilding.properties,
        building_key: 'unsupported-cost-class',
        main_purpose: '07',
      }),
      locale: 'en-US',
    })
    const energyPanel = getPanel(panels ?? [], 'energyConsumption')
    const cost = getPrimaryMetric(energyPanel, 'cost')
    const co2 = getPrimaryMetric(energyPanel, 'co2')

    expect(cost.supported).toBe(false)
    expectTranslation(
      cost.value?.text as EnergymapBuildingInfoText,
      `${translationPrefix}.panels.energy.unsupported.cost_building_class`
    )
    expect(co2.supported).toBe(true)
    expectPlainText(co2.value?.text as EnergymapBuildingInfoText, '18,436')
  })

  it.each([
    [
      'missing electricity',
      { distr_default_elec: undefined },
      'missing_reference_data',
    ],
    [
      'missing heating',
      { distr_default_heat: undefined },
      'missing_reference_data',
    ],
    ['missing area', { floor_area: undefined }, 'missing_reference_data'],
    ['negative heating', { distr_default_heat: -1 }, 'invalid_reference_data'],
    [
      'invalid electricity type',
      { distr_default_elec: '24.125' },
      'invalid_reference_data',
    ],
    ['non-finite area', { floor_area: NaN }, 'invalid_reference_data'],
    [
      'infinite heating',
      { distr_default_heat: Infinity },
      'invalid_reference_data',
    ],
  ])(
    'does not expose partial totals for %s',
    (_label, overrides, reasonKey) => {
      const panels = createEnergymapBuildingInfoPanels({
        selectedBuilding: createSelectedBuilding({
          ...districtHeatingBuilding.properties,
          ...overrides,
          building_key: `invalid-${reasonKey}`,
        }),
        locale: 'en-US',
      })
      const energyPanel = getPanel(panels ?? [], 'energyConsumption')

      for (const metricId of ['cost', 'co2'] as const) {
        const metric = getPrimaryMetric(energyPanel, metricId)

        expect(metric.supported).toBe(false)
        expect(metric.value?.status).toBe(
          reasonKey === 'missing_reference_data' ? 'missing' : 'placeholder'
        )
        expectTranslation(
          metric.value?.text as EnergymapBuildingInfoText,
          `${translationPrefix}.panels.energy.unsupported.${reasonKey}`
        )
        expect(metric.value?.text).not.toEqual(
          expect.objectContaining({
            text: expect.stringMatching(/NaN|Infinity/),
          })
        )
      }
    }
  )

  it('distinguishes an unknown heating carrier from missing building data', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: createSelectedBuilding({
        ...districtHeatingBuilding.properties,
        building_key: 'unknown-carrier',
        heating_energy_source: '99',
        heating_method: '07',
      }),
      locale: 'en-US',
    })
    const energyPanel = getPanel(panels ?? [], 'energyConsumption')

    for (const metricId of ['cost', 'co2'] as const) {
      const metric = getPrimaryMetric(energyPanel, metricId)

      expect(metric.supported).toBe(false)
      expect(metric.value?.status).toBe('placeholder')
      expectTranslation(
        metric.value?.text as EnergymapBuildingInfoText,
        `${translationPrefix}.panels.energy.unsupported.heating_carrier`
      )
    }
  })

  it('keeps the generated English and Finnish current-reference caveats accurate', () => {
    const enEnergy = enTranslations.sidebar.building_info.panels.energy
    const fiEnergy = fiTranslations.sidebar.building_info.panels.energy

    expect(enEnergy.context.cost_current_reference).toMatch(
      /Average current-reference estimate.*not a bill.*contract price.*market-price forecast/i
    )
    expect(fiEnergy.context.cost_current_reference).toMatch(
      /keskimääräinen arvio.*ei ole lasku.*sopimushinta.*markkinahinnasta/i
    )
    expect(enEnergy.context.co2_current_reference).toMatch(
      /not measured building emissions.*renewable energy.*Light fuel oil uses a fossil factor.*pellet factor is zero only within the supplied fossil-accounting boundary.*does not prove zero lifecycle or biogenic emissions/i
    )
    expect(fiEnergy.context.co2_current_reference).toMatch(
      /ei rakennuksen mitattuihin päästöihin.*uusiutuva energia.*Kevyen polttoöljyn kerroin on fossiilinen.*Pelletin kerroin on nolla vain toimitetun fossiililaskennan rajauksen sisällä.*elinkaaripäästöjä tai biogeenisiä päästöjä nollaksi/i
    )
  })

  it('keeps the certificate heated net area label explicit in both locales', () => {
    expect(
      enTranslations.sidebar.building_info.panels.building.rows.heated_net_area
    ).toBe('Heated net area on energy certificate')
    expect(
      fiTranslations.sidebar.building_info.panels.building.rows.heated_net_area
    ).toBe('Energiatodistuksen lämmitetty nettoala')
    expect(enTranslations.sidebar.building_info.units.square_meters).toBe('m²')
    expect(fiTranslations.sidebar.building_info.units.square_meters).toBe('m²')
  })

  it('keeps the certificate validity label explicit in both locales', () => {
    expect(
      enTranslations.sidebar.building_info.panels.building.rows
        .energy_certificate_validity
    ).toBe('Latest energy certificate valid until')
    expect(
      fiTranslations.sidebar.building_info.panels.building.rows
        .energy_certificate_validity
    ).toBe('Uusimman energiatodistuksen voimassaolo päättyy')
  })

  it('models supported energy submetrics and keeps water heating unsupported', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: districtHeatingBuilding,
      locale: 'en-US',
    })
    const controls = getConsumptionControls(
      getPanel(panels ?? [], 'energyConsumption')
    )

    expect(controls.defaultEnergySubmetricIds).toEqual([
      'electricity',
      'heating',
    ])
    expect(
      controls.energySubmetrics.map((submetric) => ({
        id: submetric.id,
        supported: submetric.supported,
        defaultSelected: submetric.defaultSelected,
        annualSources: getMetricValue(submetric.metric, 'annualTotal')
          .sourceProperties,
        unavailableNote: submetric.unavailableNote?.text,
      }))
    ).toEqual([
      {
        id: 'electricity',
        supported: true,
        defaultSelected: true,
        annualSources: ['distr_default_elec', 'floor_area'],
        unavailableNote: undefined,
      },
      {
        id: 'heating',
        supported: true,
        defaultSelected: true,
        annualSources: ['distr_default_heat', 'floor_area'],
        unavailableNote: undefined,
      },
      {
        id: 'waterHeating',
        supported: false,
        defaultSelected: false,
        annualSources: undefined,
        unavailableNote: {
          type: 'translation',
          keyName: `${translationPrefix}.panels.energy.unsupported.water_heating`,
        },
      },
    ])
  })

  it('derives the visible energy table from selected submetrics', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: districtHeatingBuilding,
      locale: 'en-US',
    })
    const controls = getConsumptionControls(
      getPanel(panels ?? [], 'energyConsumption')
    )
    const getAnnualText = (
      selectedSubmetricIds: EnergymapBuildingInfoEnergySubmetricId[]
    ): EnergymapBuildingInfoText => {
      const text = getSelectedEnergyConsumption({
        controls,
        selectedSubmetricIds,
      }).values.find((value) => value.id === 'annualTotal')?.text

      if (text == null) {
        throw new Error('Annual total text not found')
      }

      return text
    }

    expectPlainText(getAnnualText(['electricity']), '10,953')
    expectPlainText(getAnnualText(['heating']), '156,023')
    expectPlainText(getAnnualText(['electricity', 'heating']), '166,976')

    const selectedWithWaterHeating = getSelectedEnergyConsumption({
      controls,
      selectedSubmetricIds: ['electricity', 'heating', 'waterHeating'],
    })

    expectPlainText(
      selectedWithWaterHeating.values.find(
        (value) => value.id === 'annualTotal'
      )?.text as EnergymapBuildingInfoText,
      '166,976'
    )
    expect(selectedWithWaterHeating.notes.map((note) => note.id)).toEqual([
      'waterHeatingUnavailable',
    ])

    const noSupportedSelection = getSelectedEnergyConsumption({
      controls,
      selectedSubmetricIds: [],
    }).values.find((value) => value.id === 'annualTotal')

    expect(noSupportedSelection?.status).toBe('placeholder')
    expectTranslation(
      noSupportedSelection?.text as EnergymapBuildingInfoText,
      `${translationPrefix}.panels.energy.unsupported.no_selected_energy_submetrics`
    )
  })

  it('produces renovation scenario estimates from published baseline and measure columns', () => {
    const panels = createEnergymapBuildingInfoPanels({
      selectedBuilding: districtHeatingBuilding,
      locale: 'en-US',
    })
    const renovationPanel = getPanel(panels ?? [], 'renovationRecommendations')
    const publishedRecommendations = getSection(
      renovationPanel,
      'publishedRecommendations'
    )
    const scenarioComparison = renovationPanel.sections.find(
      (section) => section.id === 'scenarioComparison'
    )
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

    expect(renovationPanel.sections.map((section) => section.id)).toEqual([
      'publishedRecommendations',
      'scenarioComparison',
    ])
    expect(publishedRecommendations.rows?.map((row) => row.id)).toEqual([
      'renovationRecommendations',
      'energyRecommendations',
      'energyCertificateRecommendations',
    ])
    expect(certificateRecommendations.status).toBe('missing')
    expect(certificateRecommendations.presentation).toBe(
      'expandableSourceText'
    )
    expect(scenarioComparison?.notes).toBeUndefined()
    expectTranslation(
      certificateRecommendations.text,
      `${translationPrefix}.placeholders.missing_value`
    )
    expect(certificateRecommendations.sourceProperties).toEqual([
      'energy_certificate_recommendations_fi',
      'energy_certificate_recommendations_sv',
    ])
    expect(annualTotal?.status).toBe('estimate')
    expectPlainText(annualTotal?.text as EnergymapBuildingInfoText, '131,525')
    expect(savingsPercent?.status).toBe('estimate')
    expectTranslation(
      savingsPercent?.text as EnergymapBuildingInfoText,
      `${translationPrefix}.panels.renovation.savings_less`,
      { percent: '-21%' }
    )
  })

  it.each([
    [
      'Finnish prefers Finnish',
      'fi-FI',
      {
        energy_certificate_recommendations_fi:
          '  Tiivistä yläpohjan lämmöneristystä.  ',
        energy_certificate_recommendations_sv:
          'Förbättra vindsbjälklagets värmeisolering.',
      },
      'Tiivistä yläpohjan lämmöneristystä.',
      'fi',
      'energy_certificate_recommendations_fi',
    ],
    [
      'English presents Finnish as Finnish source text',
      'en-US',
      {
        energy_certificate_recommendations_fi:
          'Uusi lämmöntalteenottojärjestelmä.',
        energy_certificate_recommendations_sv: 'Installera värmeåtervinning.',
      },
      'Uusi lämmöntalteenottojärjestelmä.',
      'fi',
      'energy_certificate_recommendations_fi',
    ],
    [
      'Finnish-only source text',
      'en',
      {
        energy_certificate_recommendations_fi: 'Vaihda ikkunat.',
      },
      'Vaihda ikkunat.',
      'fi',
      'energy_certificate_recommendations_fi',
    ],
    [
      'Swedish-only source text',
      'fi',
      {
        energy_certificate_recommendations_sv: 'Byt fönster.',
      },
      'Byt fönster.',
      'sv',
      'energy_certificate_recommendations_sv',
    ],
    [
      'blank Finnish falls back to Swedish',
      'fi',
      {
        energy_certificate_recommendations_fi: ' \n ',
        energy_certificate_recommendations_sv: '  Täta ytterdörrarna.  ',
      },
      'Täta ytterdörrarna.',
      'sv',
      'energy_certificate_recommendations_sv',
    ],
    [
      'paragraph breaks in long source prose survive outer trimming',
      'en',
      {
        energy_certificate_recommendations_fi:
          '  Ensimmäinen pitkä suosituskappale säilyttää lähteen sanamuodon.\n\nToinen kappale sisältää lisätietoja ja ääkkösiä muuttumattomina.  ',
      },
      'Ensimmäinen pitkä suosituskappale säilyttää lähteen sanamuodon.\n\nToinen kappale sisältää lisätietoja ja ääkkösiä muuttumattomina.',
      'fi',
      'energy_certificate_recommendations_fi',
    ],
    [
      'HTML and Markdown-looking source stays plain',
      'en',
      {
        energy_certificate_recommendations_fi:
          '  <script>alert("unsafe")</script> **Ei Markdownia**  ',
      },
      '<script>alert("unsafe")</script> **Ei Markdownia**',
      'fi',
      'energy_certificate_recommendations_fi',
    ],
  ] as const)(
    'selects one certificate recommendation source: %s',
    (_caseName, locale, properties, text, sourceLanguage, sourceProperty) => {
      const recommendation = getCertificateRecommendationsRow({
        properties: {
          building_key: `certificate-recommendation-${sourceLanguage}`,
          ...properties,
        },
        locale,
      })

      expect(recommendation.status).toBe('real')
      expect(recommendation.presentation).toBe('expandableSourceText')
      expectPlainText(recommendation.text, text)
      expect(recommendation.sourceLanguage).toBe(sourceLanguage)
      expect(recommendation.sourceProperties).toEqual([sourceProperty])
    }
  )

  it.each([
    ['both fields missing', {}],
    [
      'both fields blank',
      {
        energy_certificate_recommendations_fi: ' \n ',
        energy_certificate_recommendations_sv: '\t',
      },
    ],
    [
      'both fields invalid',
      {
        energy_certificate_recommendations_fi: 42,
        energy_certificate_recommendations_sv: Number.POSITIVE_INFINITY,
      },
    ],
  ])(
    'uses the normal missing recommendation state when %s',
    (_caseName, properties) => {
      const recommendation = getCertificateRecommendationsRow({
        properties: {
          building_key: 'certificate-recommendation-missing',
          ...properties,
        },
        locale: 'en-US',
      })

      expect(recommendation.status).toBe('missing')
      expect(recommendation.presentation).toBe('expandableSourceText')
      expectTranslation(
        recommendation.text,
        `${translationPrefix}.placeholders.missing_value`
      )
      expect(recommendation.sourceLanguage).toBeUndefined()
      expect(recommendation.sourceProperties).toEqual([
        'energy_certificate_recommendations_fi',
        'energy_certificate_recommendations_sv',
      ])
    }
  )

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
    const heatedNetArea = getRow(buildingPanel, 'heatedNetArea')
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

    expect(heatedNetArea.status).toBe('missing')
    expectTranslation(
      heatedNetArea.text,
      `${translationPrefix}.placeholders.missing_value`
    )
    expect(heatedNetArea.sourceProperties).toEqual([
      'energy_certificate_heated_net_area',
    ])
    expect(heatedNetArea.unitKey).toBeUndefined()

    expect(buildingType.status).toBe('real')
    expectTranslation(
      buildingType.text,
      `${translationPrefix}.placeholders.unknown_code`,
      { code: '98' }
    )
  })

  it.each([null, '', 'not-a-number', NaN, Infinity, 0, -1])(
    'keeps invalid certificate heated net area %p unavailable without a fallback',
    (heatedNetAreaValue) => {
      const panels = createEnergymapBuildingInfoPanels({
        selectedBuilding: createSelectedBuilding({
          building_key: `invalid-heated-net-area-${String(heatedNetAreaValue)}`,
          energy_certificate_heated_net_area: heatedNetAreaValue,
          floor_area: 999,
          total_area: 888,
          gross_floor_area: 777,
        }),
        locale: 'en-US',
      })
      const heatedNetArea = getRow(
        getPanel(panels ?? [], 'buildingDetails'),
        'heatedNetArea'
      )

      expect(heatedNetArea.status).toBe('missing')
      expectTranslation(
        heatedNetArea.text,
        `${translationPrefix}.placeholders.missing_value`
      )
      expect(heatedNetArea.sourceProperties).toEqual([
        'energy_certificate_heated_net_area',
      ])
      expect(heatedNetArea.unitKey).toBeUndefined()
    }
  )

  it.each([undefined, 0, -1, NaN, Infinity])(
    'keeps Water unavailable without a resident override for invalid floor area %p',
    (floorArea) => {
      const panels = createEnergymapBuildingInfoPanels({
        selectedBuilding: createSelectedBuilding({
          building_key: `invalid-water-${String(floorArea)}`,
          floor_area: floorArea,
        }),
        locale: 'en-US',
      })
      const water = getPrimaryMetric(
        getPanel(panels ?? [], 'energyConsumption'),
        'water'
      )

      expect(water.supported).toBe(false)
      expect(water.residentCountControl).toBeUndefined()
      expect(water.value?.status).toBe('missing')
    }
  )
})
