import {
  ENERGY_CERTIFICATE_CLASS_CODES,
  ENERGY_CERTIFICATE_CLASS_PROPERTY,
} from '../layers/energyCertificateLayerConf'
import {
  ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY,
  ENERGYMAP_BUILDING_TYPE_CODES,
  ENERGYMAP_BUILDING_TYPE_PROPERTY,
} from '../layers/buildingPolygonsLayerConf'
import { HEATING_ENERGY_SOURCE_PROPERTY } from '../layers/heatingLayerConf'
import type { EnergyCertificateClassCode } from '../layers/energyCertificateLayerConf'
import {
  calculateCurrentReferenceAnnualWater,
  calculateCurrentReferenceAnnualCo2,
  calculateCurrentReferenceAnnualCost,
  deriveCurrentReferenceResidentCount,
} from './currentReferenceCalculations'
import type {
  CurrentReferenceAnnualCo2Result,
  CurrentReferenceAnnualCostResult,
  CurrentReferenceUnsupportedReason,
  CurrentReferenceUnsupportedResult,
} from './currentReferenceCalculations'
import { CURRENT_REFERENCE_DATA } from './currentReferenceData'
import type { EnergymapSelectedBuilding } from './types'

export type EnergymapBuildingInfoPanelId =
  | 'energyConsumption'
  | 'renovationRecommendations'
  | 'buildingDetails'

export type EnergymapBuildingInfoValueStatus =
  | 'real'
  | 'estimate'
  | 'missing'
  | 'placeholder'

export type EnergymapBuildingInfoTextParam = string | number

export type EnergymapBuildingInfoText =
  | {
      type: 'translation'
      keyName: string
      params?: Record<string, EnergymapBuildingInfoTextParam>
    }
  | {
      type: 'plain'
      text: string
    }
  | {
      type: 'sequence'
      parts: EnergymapBuildingInfoText[]
      separator: string
    }

export type EnergymapBuildingInfoValue = {
  text: EnergymapBuildingInfoText
  status: EnergymapBuildingInfoValueStatus
  sourceProperties?: string[]
  sourceLanguage?: 'fi' | 'sv'
  unitKey?: string
  note?: EnergymapBuildingInfoText
}

export type EnergymapBuildingInfoRow = EnergymapBuildingInfoValue & {
  id: string
  label: EnergymapBuildingInfoText
}

export type EnergymapBuildingInfoMetricValue = EnergymapBuildingInfoValue & {
  id: 'annualTotal' | 'perSquareMeter' | 'savingsPercent'
  label: EnergymapBuildingInfoText
}

export type EnergymapBuildingInfoMetric = {
  id: 'total' | 'heating' | 'electricity' | 'waterHeating'
  label: EnergymapBuildingInfoText
  values: EnergymapBuildingInfoMetricValue[]
}

export type EnergymapBuildingInfoPrimaryMetricId =
  | 'energy'
  | 'water'
  | 'cost'
  | 'co2'

export type EnergymapBuildingInfoEnergySubmetricId =
  | 'electricity'
  | 'heating'
  | 'waterHeating'

export type EnergymapBuildingInfoPrimaryMetric = {
  id: EnergymapBuildingInfoPrimaryMetricId
  label: EnergymapBuildingInfoText
  ariaLabelKey: string
  supported: boolean
  value?: EnergymapBuildingInfoValue
  unavailableNote?: EnergymapBuildingInfoNote
  residentCountControl?: EnergymapBuildingInfoResidentCountControl
}

export type EnergymapBuildingInfoResidentCountControl = {
  defaultValue: number
  minValue: number
  maxValue: number
  label: EnergymapBuildingInfoText
  toggleLabel: EnergymapBuildingInfoText
  description: EnergymapBuildingInfoText
  unavailableText: EnergymapBuildingInfoText
}

export type EnergymapBuildingInfoEnergySubmetric = {
  id: EnergymapBuildingInfoEnergySubmetricId
  label: EnergymapBuildingInfoText
  ariaLabelKey: string
  supported: boolean
  defaultSelected: boolean
  metric: EnergymapBuildingInfoMetric
  unavailableNote?: EnergymapBuildingInfoNote
}

export type EnergymapBuildingInfoConsumptionControls = {
  defaultPrimaryMetricId: EnergymapBuildingInfoPrimaryMetricId
  primaryMetrics: EnergymapBuildingInfoPrimaryMetric[]
  defaultEnergySubmetricIds: EnergymapBuildingInfoEnergySubmetricId[]
  energySubmetrics: EnergymapBuildingInfoEnergySubmetric[]
  combinedEnergyMetric: EnergymapBuildingInfoMetric
  emptyEnergyMetric: EnergymapBuildingInfoMetric
}

export type EnergymapBuildingInfoSelectedEnergyConsumption = {
  values: EnergymapBuildingInfoMetricValue[]
  notes: EnergymapBuildingInfoNote[]
}

export type EnergymapBuildingInfoScenario = {
  id: EnergymapEnergyMeasure
  label: EnergymapBuildingInfoText
  values: EnergymapBuildingInfoMetricValue[]
}

export type EnergymapBuildingInfoNote = {
  id: string
  text: EnergymapBuildingInfoText
  status: EnergymapBuildingInfoValueStatus
  sourceProperties?: string[]
}

export type EnergymapBuildingInfoSectionVariant =
  | 'default'
  | 'buildingSubheader'
  | 'energyCertificate'
  | 'previousEnergyClass'
  | 'measureList'

export type EnergymapBuildingInfoSection = {
  id: string
  variant?: EnergymapBuildingInfoSectionVariant
  title?: EnergymapBuildingInfoText
  description?: EnergymapBuildingInfoText
  rows?: EnergymapBuildingInfoRow[]
  metrics?: EnergymapBuildingInfoMetric[]
  consumptionControls?: EnergymapBuildingInfoConsumptionControls
  scenarios?: EnergymapBuildingInfoScenario[]
  notes?: EnergymapBuildingInfoNote[]
}

export type EnergymapBuildingInfoPanel = {
  id: EnergymapBuildingInfoPanelId
  title: EnergymapBuildingInfoText
  description?: EnergymapBuildingInfoText
  sections: EnergymapBuildingInfoSection[]
}

export type EnergymapEnergyScenarioPrefix =
  | 'awhp'
  | 'delec'
  | 'distr'
  | 'elecb'
  | 'gshp'
  | 'oil'
  | 'wood'

export type EnergymapEnergyMeasure =
  | 'default'
  | 'aahp'
  | 'solar'
  | 'windows'

export type EnergymapEnergyEstimateType = 'total' | 'heat' | 'elec'

export type CreateEnergymapBuildingInfoPanelsOptions = {
  selectedBuilding: EnergymapSelectedBuilding | null
  locale: string
}

const TRANSLATION_PREFIX = 'sidebar.building_info'
const HEATING_METHOD_PROPERTY = 'heating_method'
const FLOOR_AREA_PROPERTY = 'floor_area'
const PERMANENT_BUILDING_IDENTIFIER_PROPERTY =
  'permanent_building_identifier'
const ADDRESS_FIN_PROPERTY = 'address_fin'
const POSTAL_CODE_PROPERTY = 'postal_code'
const POSTAL_OFFICE_FIN_PROPERTY = 'postal_office_fin'
const ENERGY_CERTIFICATE_VENTILATION_TYPE_PROPERTY =
  'energy_certificate_ventilation_type_id'
const ENERGY_CERTIFICATE_VENTILATION_DESCRIPTION_FI_PROPERTY =
  'energy_certificate_ventilation_description_fi'
const ENERGY_CERTIFICATE_VENTILATION_DESCRIPTION_SV_PROPERTY =
  'energy_certificate_ventilation_description_sv'
const ENERGY_CERTIFICATE_VENTILATION_DESCRIPTION_PROPERTIES = {
  fi: ENERGY_CERTIFICATE_VENTILATION_DESCRIPTION_FI_PROPERTY,
  sv: ENERGY_CERTIFICATE_VENTILATION_DESCRIPTION_SV_PROPERTY,
} as const
// Energy supports Finnish and English UI locales, so registry descriptions use
// Finnish first and the Swedish source only as a fallback.
const ENERGY_CERTIFICATE_VENTILATION_DESCRIPTION_SOURCE_ORDER = [
  'fi',
  'sv',
] as const

const HEATING_METHOD_CODES = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '99',
] as const

const HEATING_ENERGY_SOURCE_CODES = [
  '01',
  '02',
  '03',
  '04',
  '07',
  '09',
  '10',
  '99',
] as const

const PUBLISHED_SCENARIO_MEASURES_BY_PREFIX: Record<
  EnergymapEnergyScenarioPrefix,
  readonly EnergymapEnergyMeasure[]
> = {
  awhp: ['default', 'solar', 'windows'],
  delec: ['default', 'aahp', 'solar', 'windows'],
  distr: ['default', 'aahp', 'solar', 'windows'],
  elecb: ['default', 'aahp', 'solar', 'windows'],
  gshp: ['default', 'solar', 'windows'],
  oil: ['default', 'aahp', 'solar', 'windows'],
  wood: ['default', 'aahp', 'solar', 'windows'],
}

const translationText = (
  keyName: string,
  params?: Record<string, EnergymapBuildingInfoTextParam>
): EnergymapBuildingInfoText => ({
  type: 'translation',
  keyName,
  ...(params == null ? {} : { params }),
})

const plainText = (text: string): EnergymapBuildingInfoText => ({
  type: 'plain',
  text,
})

const sequenceText = (
  parts: EnergymapBuildingInfoText[],
  separator = ', '
): EnergymapBuildingInfoText => ({
  type: 'sequence',
  parts,
  separator,
})

const key = (suffix: string) => `${TRANSLATION_PREFIX}.${suffix}`

const placeholderValue = ({
  keyName,
  sourceProperties,
}: {
  keyName: string
  sourceProperties?: string[]
}): EnergymapBuildingInfoValue => ({
  text: translationText(keyName),
  status: 'placeholder',
  ...(sourceProperties == null ? {} : { sourceProperties }),
})

const missingValue = ({
  keyName = key('placeholders.missing_value'),
  sourceProperties,
}: {
  keyName?: string
  sourceProperties?: string[]
} = {}): EnergymapBuildingInfoValue => ({
  text: translationText(keyName),
  status: 'missing',
  ...(sourceProperties == null ? {} : { sourceProperties }),
})

const realValue = ({
  text,
  sourceProperties,
  sourceLanguage,
  unitKey,
  note,
}: {
  text: EnergymapBuildingInfoText
  sourceProperties: string[]
  sourceLanguage?: 'fi' | 'sv'
  unitKey?: string
  note?: EnergymapBuildingInfoText
}): EnergymapBuildingInfoValue => ({
  text,
  status: 'real',
  sourceProperties,
  ...(sourceLanguage == null ? {} : { sourceLanguage }),
  ...(unitKey == null ? {} : { unitKey }),
  ...(note == null ? {} : { note }),
})

const estimateValue = ({
  text,
  sourceProperties,
  unitKey,
  note,
}: {
  text: EnergymapBuildingInfoText
  sourceProperties: string[]
  unitKey?: string
  note?: EnergymapBuildingInfoText
}): EnergymapBuildingInfoValue => ({
  text,
  status: 'estimate',
  sourceProperties,
  ...(unitKey == null ? {} : { unitKey }),
  ...(note == null ? {} : { note }),
})

const row = ({
  id,
  labelKey,
  value,
}: {
  id: string
  labelKey: string
  value: EnergymapBuildingInfoValue
}): EnergymapBuildingInfoRow => ({
  id,
  label: translationText(labelKey),
  ...value,
})

const metricValue = ({
  id,
  labelKey,
  value,
}: {
  id: EnergymapBuildingInfoMetricValue['id']
  labelKey: string
  value: EnergymapBuildingInfoValue
}): EnergymapBuildingInfoMetricValue => ({
  id,
  label: translationText(labelKey),
  ...value,
})

const note = ({
  id,
  keyName,
  status,
  sourceProperties,
}: {
  id: string
  keyName: string
  status: EnergymapBuildingInfoValueStatus
  sourceProperties?: string[]
}): EnergymapBuildingInfoNote => ({
  id,
  text: translationText(keyName),
  status,
  ...(sourceProperties == null ? {} : { sourceProperties }),
})

const getStringProperty = (
  properties: EnergymapSelectedBuilding['properties'],
  propertyName: string
): string | null => {
  const value = properties[propertyName]

  if (typeof value === 'string') {
    const trimmedValue = value.trim()
    return trimmedValue === '' ? null : trimmedValue
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

const getCodeProperty = (
  properties: EnergymapSelectedBuilding['properties'],
  propertyName: string
): string | null => {
  const value = properties[propertyName]

  if (typeof value === 'number' && Number.isInteger(value)) {
    return String(value).padStart(2, '0')
  }

  return getStringProperty(properties, propertyName)
}

const getNumberProperty = (
  properties: EnergymapSelectedBuilding['properties'],
  propertyName: string
): number | null => {
  const value = properties[propertyName]

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value.trim().replace(',', '.'))
    return Number.isFinite(parsedValue) ? parsedValue : null
  }

  return null
}

const getPositiveNumberProperty = (
  properties: EnergymapSelectedBuilding['properties'],
  propertyName: string
) => {
  const value = getNumberProperty(properties, propertyName)
  return value != null && value > 0 ? value : null
}

const formatNumber = ({
  value,
  locale,
  maximumFractionDigits = 0,
  minimumFractionDigits = 0,
}: {
  value: number
  locale: string
  maximumFractionDigits?: number
  minimumFractionDigits?: number
}) =>
  new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(value)

export const formatYearFromDate = (value: unknown): string | null => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  const valueAsString = String(value).trim()
  const leadingYearMatch = valueAsString.match(/^(\d{4})/)

  if (leadingYearMatch != null) {
    return leadingYearMatch[1]
  }

  const timestamp = Date.parse(valueAsString)

  if (!Number.isFinite(timestamp)) {
    return null
  }

  return String(new Date(timestamp).getUTCFullYear())
}

export const composeEnergymapBuildingAddress = (
  properties: EnergymapSelectedBuilding['properties']
): string | null => {
  const address = getStringProperty(properties, ADDRESS_FIN_PROPERTY)
  const postalCode = getStringProperty(properties, POSTAL_CODE_PROPERTY)
  const postalOffice = getStringProperty(properties, POSTAL_OFFICE_FIN_PROPERTY)
  const postalAddress = [postalCode, postalOffice].filter(Boolean).join(' ')

  if (address == null && postalAddress === '') {
    return null
  }

  if (address == null) {
    return postalAddress
  }

  if (postalAddress === '') {
    return address
  }

  return `${address}, ${postalAddress}`
}

export const resolveCurrentEnergyScenarioPrefix = ({
  heatingEnergySource,
  heatingMethod,
}: {
  heatingEnergySource: string | null
  heatingMethod: string | null
}): EnergymapEnergyScenarioPrefix | null => {
  if (heatingEnergySource === '01') {
    return 'distr'
  }

  if (heatingEnergySource === '02') {
    return 'oil'
  }

  if (heatingEnergySource === '07') {
    return 'wood'
  }

  if (heatingEnergySource === '09') {
    return 'gshp'
  }

  if (heatingEnergySource === '04' && heatingMethod === '01') {
    return 'elecb'
  }

  if (heatingEnergySource === '04' && heatingMethod === '03') {
    return 'delec'
  }

  return null
}

const getScenarioProperty = ({
  prefix,
  measure,
  estimateType,
}: {
  prefix: EnergymapEnergyScenarioPrefix
  measure: EnergymapEnergyMeasure
  estimateType: EnergymapEnergyEstimateType
}) => `${prefix}_${measure}_${estimateType}`

const isScenarioMeasurePublished = ({
  prefix,
  measure,
}: {
  prefix: EnergymapEnergyScenarioPrefix
  measure: EnergymapEnergyMeasure
}) => PUBLISHED_SCENARIO_MEASURES_BY_PREFIX[prefix].includes(measure)

const getUnsupportedEstimateValue = (sourceProperties: string[]) =>
  missingValue({
    keyName: key('placeholders.unsupported_energy_estimate'),
    sourceProperties,
  })

const getPerSquareMeterEstimateValue = ({
  properties,
  prefix,
  measure,
  estimateType,
  locale,
}: {
  properties: EnergymapSelectedBuilding['properties']
  prefix: EnergymapEnergyScenarioPrefix | null
  measure: EnergymapEnergyMeasure
  estimateType: EnergymapEnergyEstimateType
  locale: string
}): EnergymapBuildingInfoValue => {
  if (prefix == null) {
    return getUnsupportedEstimateValue([
      HEATING_METHOD_PROPERTY,
      HEATING_ENERGY_SOURCE_PROPERTY,
    ])
  }

  const sourceProperty = getScenarioProperty({
    prefix,
    measure,
    estimateType,
  })

  if (!isScenarioMeasurePublished({ prefix, measure })) {
    return placeholderValue({
      keyName: key('placeholders.not_published'),
      sourceProperties: [sourceProperty],
    })
  }

  const perSquareMeterValue = getNumberProperty(properties, sourceProperty)

  if (perSquareMeterValue == null) {
    return missingValue({ sourceProperties: [sourceProperty] })
  }

  return estimateValue({
    text: plainText(
      formatNumber({
        value: perSquareMeterValue,
        locale,
        maximumFractionDigits: 1,
      })
    ),
    unitKey: key('units.kwh_per_square_meter_year'),
    sourceProperties: [sourceProperty],
    note: translationText(key('panels.energy.note.estimated')),
  })
}

const getAnnualEstimateValue = ({
  properties,
  prefix,
  measure,
  estimateType,
  locale,
}: {
  properties: EnergymapSelectedBuilding['properties']
  prefix: EnergymapEnergyScenarioPrefix | null
  measure: EnergymapEnergyMeasure
  estimateType: EnergymapEnergyEstimateType
  locale: string
}): EnergymapBuildingInfoValue => {
  if (prefix == null) {
    return getUnsupportedEstimateValue([
      HEATING_METHOD_PROPERTY,
      HEATING_ENERGY_SOURCE_PROPERTY,
    ])
  }

  const sourceProperty = getScenarioProperty({
    prefix,
    measure,
    estimateType,
  })

  if (!isScenarioMeasurePublished({ prefix, measure })) {
    return placeholderValue({
      keyName: key('placeholders.not_published'),
      sourceProperties: [sourceProperty],
    })
  }

  const perSquareMeterValue = getNumberProperty(properties, sourceProperty)
  const floorArea = getPositiveNumberProperty(properties, FLOOR_AREA_PROPERTY)

  if (perSquareMeterValue == null) {
    return missingValue({
      sourceProperties: [sourceProperty, FLOOR_AREA_PROPERTY],
    })
  }

  if (floorArea == null) {
    return missingValue({
      sourceProperties: [sourceProperty, FLOOR_AREA_PROPERTY],
    })
  }

  return estimateValue({
    text: plainText(
      formatNumber({
        value: perSquareMeterValue * floorArea,
        locale,
        maximumFractionDigits: 0,
      })
    ),
    unitKey: key('units.kwh_per_year'),
    sourceProperties: [sourceProperty, FLOOR_AREA_PROPERTY],
    note: translationText(key('panels.energy.note.estimated')),
  })
}

const createEnergyMetric = ({
  id,
  seriesKey,
  estimateType,
  properties,
  prefix,
  locale,
}: {
  id: EnergymapBuildingInfoMetric['id']
  seriesKey: string
  estimateType: EnergymapEnergyEstimateType
  properties: EnergymapSelectedBuilding['properties']
  prefix: EnergymapEnergyScenarioPrefix | null
  locale: string
}): EnergymapBuildingInfoMetric => ({
  id,
  label: translationText(seriesKey),
  values: [
    metricValue({
      id: 'annualTotal',
      labelKey: key('panels.energy.metric.annual_total'),
      value: getAnnualEstimateValue({
        properties,
        prefix,
        measure: 'default',
        estimateType,
        locale,
      }),
    }),
    metricValue({
      id: 'perSquareMeter',
      labelKey: key('panels.energy.metric.per_square_meter'),
      value: getPerSquareMeterEstimateValue({
        properties,
        prefix,
        measure: 'default',
        estimateType,
        locale,
      }),
    }),
  ],
})

const createWaterHeatingMetric = (): EnergymapBuildingInfoMetric => ({
  id: 'waterHeating',
  label: translationText(key('panels.energy.series.water_heating')),
  values: [
    metricValue({
      id: 'annualTotal',
      labelKey: key('panels.energy.metric.annual_total'),
      value: placeholderValue({
        keyName: key('placeholders.not_published'),
      }),
    }),
    metricValue({
      id: 'perSquareMeter',
      labelKey: key('panels.energy.metric.per_square_meter'),
      value: placeholderValue({
        keyName: key('placeholders.not_published'),
      }),
    }),
  ],
})

const createEmptyEnergyMetric = (): EnergymapBuildingInfoMetric => ({
  id: 'total',
  label: translationText(key('panels.energy.series.total')),
  values: [
    metricValue({
      id: 'annualTotal',
      labelKey: key('panels.energy.metric.annual_total'),
      value: placeholderValue({
        keyName: key('panels.energy.unsupported.no_selected_energy_submetrics'),
      }),
    }),
    metricValue({
      id: 'perSquareMeter',
      labelKey: key('panels.energy.metric.per_square_meter'),
      value: placeholderValue({
        keyName: key('panels.energy.unsupported.no_selected_energy_submetrics'),
      }),
    }),
  ],
})

const ENERGY_SUBMETRIC_ORDER: readonly EnergymapBuildingInfoEnergySubmetricId[] =
  ['electricity', 'heating', 'waterHeating']

export const getSelectedEnergyConsumption = ({
  controls,
  selectedSubmetricIds,
}: {
  controls: EnergymapBuildingInfoConsumptionControls
  selectedSubmetricIds: readonly EnergymapBuildingInfoEnergySubmetricId[]
}): EnergymapBuildingInfoSelectedEnergyConsumption => {
  const selectedIds = new Set(selectedSubmetricIds)
  const submetricById = new Map(
    controls.energySubmetrics.map((submetric) => [submetric.id, submetric])
  )
  const selectedSubmetrics = ENERGY_SUBMETRIC_ORDER.map((id) =>
    submetricById.get(id)
  ).filter(
    (submetric): submetric is EnergymapBuildingInfoEnergySubmetric =>
      submetric != null && selectedIds.has(submetric.id)
  )
  const selectedSupportedSubmetrics = selectedSubmetrics.filter(
    (submetric) => submetric.supported
  )
  const selectedUnsupportedNotes = selectedSubmetrics
    .map((submetric) => submetric.unavailableNote)
    .filter((note): note is EnergymapBuildingInfoNote => note != null)
  const supportedIds = new Set(
    selectedSupportedSubmetrics.map((submetric) => submetric.id)
  )
  const metric =
    supportedIds.has('electricity') && supportedIds.has('heating')
      ? controls.combinedEnergyMetric
      : selectedSupportedSubmetrics[0]?.metric ?? controls.emptyEnergyMetric

  return {
    values: metric.values,
    notes: selectedUnsupportedNotes,
  }
}

const createUnsupportedPrimaryMetric = ({
  id,
  labelKey,
  unavailableNoteKey,
  sourceProperties,
  status = 'placeholder',
}: {
  id: Exclude<EnergymapBuildingInfoPrimaryMetricId, 'energy'>
  labelKey: string
  unavailableNoteKey: string
  sourceProperties?: string[]
  status?: Extract<EnergymapBuildingInfoValueStatus, 'missing' | 'placeholder'>
}): EnergymapBuildingInfoPrimaryMetric => ({
  id,
  label: translationText(labelKey),
  ariaLabelKey: labelKey,
  supported: false,
  value:
    status === 'missing'
      ? missingValue({
          keyName: unavailableNoteKey,
          sourceProperties,
        })
      : placeholderValue({
          keyName: unavailableNoteKey,
          sourceProperties,
        }),
  unavailableNote: note({
    id: `${id}Unavailable`,
    keyName: unavailableNoteKey,
    status,
    sourceProperties,
  }),
})

type CurrentReferencePrimaryMetricId = Extract<
  EnergymapBuildingInfoPrimaryMetricId,
  'cost' | 'co2'
>

type CurrentReferencePrimaryMetricResult =
  | CurrentReferenceAnnualCostResult
  | CurrentReferenceAnnualCo2Result

const getCurrentReferenceSourceProperties = ({
  id,
  prefix,
}: {
  id: CurrentReferencePrimaryMetricId
  prefix: EnergymapEnergyScenarioPrefix | null
}) => [
  ...(id === 'cost' ? [ENERGYMAP_BUILDING_TYPE_PROPERTY] : []),
  FLOOR_AREA_PROPERTY,
  ...(prefix == null
    ? []
    : [
        getScenarioProperty({
          prefix,
          measure: 'default',
          estimateType: 'elec',
        }),
        getScenarioProperty({
          prefix,
          measure: 'default',
          estimateType: 'heat',
        }),
      ]),
  HEATING_ENERGY_SOURCE_PROPERTY,
  HEATING_METHOD_PROPERTY,
]

const getRootUnsupportedReason = (
  result: CurrentReferenceUnsupportedResult
): CurrentReferenceUnsupportedReason =>
  result.reason === 'incomplete-component' && result.cause != null
    ? result.cause
    : result.reason

const getCurrentReferenceUnsupportedPresentation = ({
  id,
  result,
  prefix,
  properties,
}: {
  id: CurrentReferencePrimaryMetricId
  result: CurrentReferenceUnsupportedResult
  prefix: EnergymapEnergyScenarioPrefix | null
  properties: EnergymapSelectedBuilding['properties']
}): {
  keyName: string
  status: Extract<EnergymapBuildingInfoValueStatus, 'missing' | 'placeholder'>
} => {
  const reason = getRootUnsupportedReason(result)

  if (reason === 'unsupported-building-class') {
    return {
      keyName: key('panels.energy.unsupported.cost_building_class'),
      status: 'placeholder',
    }
  }

  if (reason === 'unsupported-carrier') {
    return {
      keyName: key('panels.energy.unsupported.heating_carrier'),
      status: 'placeholder',
    }
  }

  if (reason === 'unsupported-reference-value') {
    const isApartmentPelletCost =
      id === 'cost' &&
      prefix === 'wood' &&
      getCodeProperty(properties, ENERGYMAP_BUILDING_TYPE_PROPERTY) === '06'

    return {
      keyName: key(
        isApartmentPelletCost
          ? 'panels.energy.unsupported.apartment_pellet_cost'
          : 'panels.energy.unsupported.reference_value'
      ),
      status: 'placeholder',
    }
  }

  if (reason === 'missing-input') {
    const heatingSource = getCodeProperty(
      properties,
      HEATING_ENERGY_SOURCE_PROPERTY
    )
    const heatingMethod = getCodeProperty(properties, HEATING_METHOD_PROPERTY)
    const scenarioInputIsMissing =
      heatingSource == null || (heatingSource === '04' && heatingMethod == null)
    const unresolvedKnownInputs =
      result.field === 'scenarioPrefix' &&
      prefix == null &&
      !scenarioInputIsMissing

    return unresolvedKnownInputs
      ? {
          keyName: key('panels.energy.unsupported.heating_carrier'),
          status: 'placeholder',
        }
      : {
          keyName: key('panels.energy.unsupported.missing_reference_data'),
          status: 'missing',
        }
  }

  return {
    keyName: key('panels.energy.unsupported.invalid_reference_data'),
    status: 'placeholder',
  }
}

const createCurrentReferencePrimaryMetric = ({
  id,
  result,
  prefix,
  properties,
  locale,
}: {
  id: CurrentReferencePrimaryMetricId
  result: CurrentReferencePrimaryMetricResult
  prefix: EnergymapEnergyScenarioPrefix | null
  properties: EnergymapSelectedBuilding['properties']
  locale: string
}): EnergymapBuildingInfoPrimaryMetric => {
  const labelKey = key(`panels.energy.primary.${id}`)
  const sourceProperties = getCurrentReferenceSourceProperties({ id, prefix })

  if (result.status === 'unsupported') {
    const presentation = getCurrentReferenceUnsupportedPresentation({
      id,
      result,
      prefix,
      properties,
    })

    return createUnsupportedPrimaryMetric({
      id,
      labelKey,
      unavailableNoteKey: presentation.keyName,
      sourceProperties,
      status: presentation.status,
    })
  }

  return {
    id,
    label: translationText(labelKey),
    ariaLabelKey: labelKey,
    supported: true,
    value: estimateValue({
      text: plainText(
        formatNumber({
          value: result.total,
          locale,
        })
      ),
      unitKey: key(
        id === 'cost' ? 'units.eur_per_year' : 'units.kg_co2_per_year'
      ),
      sourceProperties,
    }),
  }
}

const createCurrentReferenceWaterPrimaryMetric = ({
  floorAreaSquareMeters,
  locale,
}: {
  floorAreaSquareMeters: unknown
  locale: string
}): EnergymapBuildingInfoPrimaryMetric => {
  const labelKey = key('panels.energy.primary.water')
  const sourceProperties = [FLOOR_AREA_PROPERTY]
  const residentCountResult = deriveCurrentReferenceResidentCount(
    floorAreaSquareMeters
  )

  if (residentCountResult.status === 'unsupported') {
    return createUnsupportedPrimaryMetric({
      id: 'water',
      labelKey,
      unavailableNoteKey: key('panels.energy.unsupported.water'),
      sourceProperties,
      status: 'missing',
    })
  }

  const annualWaterResult = calculateCurrentReferenceAnnualWater(
    residentCountResult.residentCount
  )
  if (annualWaterResult.status === 'unsupported') {
    return createUnsupportedPrimaryMetric({
      id: 'water',
      labelKey,
      unavailableNoteKey: key('panels.energy.unsupported.water'),
      sourceProperties,
      status: 'missing',
    })
  }

  const { occupancy } = CURRENT_REFERENCE_DATA.water
  return {
    id: 'water',
    label: translationText(labelKey),
    ariaLabelKey: labelKey,
    supported: true,
    value: estimateValue({
      text: plainText(
        formatNumber({
          value: annualWaterResult.cubicMetersPerYear,
          locale,
          maximumFractionDigits: 1,
        })
      ),
      unitKey: key('units.cubic_meters_per_year'),
      sourceProperties,
    }),
    residentCountControl: {
      defaultValue: residentCountResult.residentCount,
      minValue: occupancy.minimumResidents,
      maxValue: occupancy.maximumResidents,
      label: translationText(key('panels.energy.water.resident_count')),
      toggleLabel: translationText(
        key('panels.energy.water.change_resident_count')
      ),
      description: translationText(key('panels.energy.water.description')),
      unavailableText: translationText(
        key('panels.energy.water.invalid_resident_count')
      ),
    },
  }
}

const createConsumptionControls = ({
  totalMetric,
  heatingMetric,
  electricityMetric,
  waterHeatingMetric,
  waterMetric,
  costMetric,
  co2Metric,
}: {
  totalMetric: EnergymapBuildingInfoMetric
  heatingMetric: EnergymapBuildingInfoMetric
  electricityMetric: EnergymapBuildingInfoMetric
  waterHeatingMetric: EnergymapBuildingInfoMetric
  waterMetric: EnergymapBuildingInfoPrimaryMetric
  costMetric: EnergymapBuildingInfoPrimaryMetric
  co2Metric: EnergymapBuildingInfoPrimaryMetric
}): EnergymapBuildingInfoConsumptionControls => {
  const waterHeatingUnavailableNote = note({
    id: 'waterHeatingUnavailable',
    keyName: key('panels.energy.unsupported.water_heating'),
    status: 'placeholder',
  })

  return {
    defaultPrimaryMetricId: 'energy',
    primaryMetrics: [
      {
        id: 'energy',
        label: translationText(key('panels.energy.primary.energy')),
        ariaLabelKey: key('panels.energy.primary.energy'),
        supported: true,
      },
      waterMetric,
      costMetric,
      co2Metric,
    ],
    defaultEnergySubmetricIds: ['electricity', 'heating'],
    energySubmetrics: [
      {
        id: 'electricity',
        label: translationText(key('panels.energy.series.electricity')),
        ariaLabelKey: key('panels.energy.series.electricity'),
        supported: true,
        defaultSelected: true,
        metric: electricityMetric,
      },
      {
        id: 'heating',
        label: translationText(key('panels.energy.series.heating')),
        ariaLabelKey: key('panels.energy.series.heating'),
        supported: true,
        defaultSelected: true,
        metric: heatingMetric,
      },
      {
        id: 'waterHeating',
        label: translationText(key('panels.energy.series.water_heating')),
        ariaLabelKey: key('panels.energy.series.water_heating'),
        supported: false,
        defaultSelected: false,
        metric: waterHeatingMetric,
        unavailableNote: waterHeatingUnavailableNote,
      },
    ],
    combinedEnergyMetric: totalMetric,
    emptyEnergyMetric: createEmptyEnergyMetric(),
  }
}

const getCodeLabelValue = ({
  codeValue,
  codeType,
  knownCodes,
  sourceProperty,
}: {
  codeValue: string | null
  codeType: 'main_purpose' | 'heating_method' | 'heating_energy_source'
  knownCodes: readonly string[]
  sourceProperty: string
}): EnergymapBuildingInfoValue => {
  if (codeValue == null) {
    return missingValue({ sourceProperties: [sourceProperty] })
  }

  if (knownCodes.includes(codeValue)) {
    return realValue({
      text: translationText(key(`codes.${codeType}.${codeValue}`)),
      sourceProperties: [sourceProperty],
    })
  }

  return realValue({
    text: translationText(key('placeholders.unknown_code'), {
      code: codeValue,
    }),
    sourceProperties: [sourceProperty],
  })
}

const getHeatingValue = (
  properties: EnergymapSelectedBuilding['properties']
): EnergymapBuildingInfoValue => {
  const methodCode = getCodeProperty(properties, HEATING_METHOD_PROPERTY)
  const sourceCode = getCodeProperty(properties, HEATING_ENERGY_SOURCE_PROPERTY)
  const methodValue = getCodeLabelValue({
    codeValue: methodCode,
    codeType: 'heating_method',
    knownCodes: HEATING_METHOD_CODES,
    sourceProperty: HEATING_METHOD_PROPERTY,
  })
  const sourceValue = getCodeLabelValue({
    codeValue: sourceCode,
    codeType: 'heating_energy_source',
    knownCodes: HEATING_ENERGY_SOURCE_CODES,
    sourceProperty: HEATING_ENERGY_SOURCE_PROPERTY,
  })
  const realParts = [sourceValue, methodValue].filter(
    (value) => value.status === 'real'
  )

  if (realParts.length === 0) {
    return missingValue({
      sourceProperties: [HEATING_ENERGY_SOURCE_PROPERTY, HEATING_METHOD_PROPERTY],
    })
  }

  return realValue({
    text: sequenceText(realParts.map((part) => part.text)),
    sourceProperties: realParts.flatMap((part) => part.sourceProperties ?? []),
  })
}

const getVentilationValue = (
  properties: EnergymapSelectedBuilding['properties']
): EnergymapBuildingInfoValue => {
  for (
    const sourceLanguage of ENERGY_CERTIFICATE_VENTILATION_DESCRIPTION_SOURCE_ORDER
  ) {
    const propertyName =
      ENERGY_CERTIFICATE_VENTILATION_DESCRIPTION_PROPERTIES[sourceLanguage]

    if (typeof properties[propertyName] !== 'string') {
      continue
    }

    const description = getStringProperty(properties, propertyName)

    if (description != null) {
      return realValue({
        text: plainText(description),
        sourceProperties: [propertyName],
        sourceLanguage,
      })
    }
  }

  return missingValue({
    sourceProperties: [
      ENERGY_CERTIFICATE_VENTILATION_DESCRIPTION_FI_PROPERTY,
      ENERGY_CERTIFICATE_VENTILATION_DESCRIPTION_SV_PROPERTY,
      ENERGY_CERTIFICATE_VENTILATION_TYPE_PROPERTY,
    ],
  })
}

const getEnergyCertificateClassValue = (
  properties: EnergymapSelectedBuilding['properties']
): EnergymapBuildingInfoValue => {
  const classCode = getStringProperty(properties, ENERGY_CERTIFICATE_CLASS_PROPERTY)

  if (classCode == null) {
    return missingValue({ sourceProperties: [ENERGY_CERTIFICATE_CLASS_PROPERTY] })
  }

  if (
    ENERGY_CERTIFICATE_CLASS_CODES.includes(
      classCode as EnergyCertificateClassCode
    )
  ) {
    return realValue({
      text: plainText(classCode),
      sourceProperties: [ENERGY_CERTIFICATE_CLASS_PROPERTY],
    })
  }

  return realValue({
    text: translationText(key('placeholders.unknown_code'), {
      code: classCode,
    }),
    sourceProperties: [ENERGY_CERTIFICATE_CLASS_PROPERTY],
  })
}

const getYearValue = (
  properties: EnergymapSelectedBuilding['properties']
): EnergymapBuildingInfoValue => {
  const year = formatYearFromDate(
    properties[ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY]
  )

  if (year == null) {
    return missingValue({
      sourceProperties: [ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY],
    })
  }

  return realValue({
    text: plainText(year),
    sourceProperties: [ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY],
  })
}

const getAddressValue = (
  properties: EnergymapSelectedBuilding['properties']
): EnergymapBuildingInfoValue => {
  const address = composeEnergymapBuildingAddress(properties)

  if (address == null) {
    return missingValue({
      sourceProperties: [
        ADDRESS_FIN_PROPERTY,
        POSTAL_CODE_PROPERTY,
        POSTAL_OFFICE_FIN_PROPERTY,
      ],
    })
  }

  return realValue({
    text: plainText(address),
    sourceProperties: [
      ADDRESS_FIN_PROPERTY,
      POSTAL_CODE_PROPERTY,
      POSTAL_OFFICE_FIN_PROPERTY,
    ],
  })
}

const getStringValue = ({
  properties,
  propertyName,
}: {
  properties: EnergymapSelectedBuilding['properties']
  propertyName: string
}): EnergymapBuildingInfoValue => {
  const value = getStringProperty(properties, propertyName)

  if (value == null) {
    return missingValue({ sourceProperties: [propertyName] })
  }

  return realValue({
    text: plainText(value),
    sourceProperties: [propertyName],
  })
}

const getMeasurementValue = ({
  properties,
  propertyName,
  unitKey,
  locale,
}: {
  properties: EnergymapSelectedBuilding['properties']
  propertyName: string
  unitKey: string
  locale: string
}): EnergymapBuildingInfoValue => {
  const value = getPositiveNumberProperty(properties, propertyName)

  if (value == null) {
    return missingValue({ sourceProperties: [propertyName] })
  }

  return realValue({
    text: plainText(
      formatNumber({
        value,
        locale,
        maximumFractionDigits: 1,
      })
    ),
    unitKey,
    sourceProperties: [propertyName],
  })
}

const createPlaceholderRow = ({
  id,
  labelKey,
  placeholderKey = key('placeholders.not_published'),
}: {
  id: string
  labelKey: string
  placeholderKey?: string
}) =>
  row({
    id,
    labelKey,
    value: placeholderValue({ keyName: placeholderKey }),
  })

const createEnergyConsumptionPanel = ({
  properties,
  prefix,
  locale,
}: {
  properties: EnergymapSelectedBuilding['properties']
  prefix: EnergymapEnergyScenarioPrefix | null
  locale: string
}): EnergymapBuildingInfoPanel => {
  const totalMetric = createEnergyMetric({
    id: 'total',
    seriesKey: key('panels.energy.series.total'),
    estimateType: 'total',
    properties,
    prefix,
    locale,
  })
  const heatingMetric = createEnergyMetric({
    id: 'heating',
    seriesKey: key('panels.energy.series.heating'),
    estimateType: 'heat',
    properties,
    prefix,
    locale,
  })
  const electricityMetric = createEnergyMetric({
    id: 'electricity',
    seriesKey: key('panels.energy.series.electricity'),
    estimateType: 'elec',
    properties,
    prefix,
    locale,
  })
  const waterHeatingMetric = createWaterHeatingMetric()
  const electricityProperty =
    prefix == null
      ? null
      : getScenarioProperty({
          prefix,
          measure: 'default',
          estimateType: 'elec',
        })
  const heatingProperty =
    prefix == null
      ? null
      : getScenarioProperty({
          prefix,
          measure: 'default',
          estimateType: 'heat',
        })
  const currentReferenceEnergyInput = {
    scenarioPrefix: prefix,
    floorAreaSquareMeters: properties[FLOOR_AREA_PROPERTY],
    defaultElectricityIntensityKwhPerSquareMeterYear:
      electricityProperty == null ? undefined : properties[electricityProperty],
    defaultHeatingIntensityKwhPerSquareMeterYear:
      heatingProperty == null ? undefined : properties[heatingProperty],
  }
  const costMetric = createCurrentReferencePrimaryMetric({
    id: 'cost',
    result: calculateCurrentReferenceAnnualCost({
      ...currentReferenceEnergyInput,
      mainPurpose: properties[ENERGYMAP_BUILDING_TYPE_PROPERTY],
    }),
    prefix,
    properties,
    locale,
  })
  const co2Metric = createCurrentReferencePrimaryMetric({
    id: 'co2',
    result: calculateCurrentReferenceAnnualCo2(currentReferenceEnergyInput),
    prefix,
    properties,
    locale,
  })
  const waterMetric = createCurrentReferenceWaterPrimaryMetric({
    floorAreaSquareMeters: properties[FLOOR_AREA_PROPERTY],
    locale,
  })

  return {
    id: 'energyConsumption',
    title: translationText(key('panels.energy.title')),
    description: translationText(key('panels.energy.description')),
    sections: [
      {
        id: 'estimatedConsumption',
        title: translationText(
          key('panels.energy.sections.estimated_consumption')
        ),
        metrics: [
          totalMetric,
          heatingMetric,
          electricityMetric,
          waterHeatingMetric,
        ],
        consumptionControls: createConsumptionControls({
          totalMetric,
          heatingMetric,
          electricityMetric,
          waterHeatingMetric,
          waterMetric,
          costMetric,
          co2Metric,
        }),
        notes: [
          note({
            id: 'estimatedConsumption',
            keyName: key('panels.energy.note.estimated'),
            status: 'estimate',
          }),
        ],
      },
      {
        id: 'calculationContext',
        title: translationText(key('panels.energy.sections.calculation_context')),
        rows: [
          row({
            id: 'costMode',
            labelKey: key('panels.energy.rows.cost_mode'),
            value: {
              text: translationText(
                key('panels.energy.context.cost_current_reference')
              ),
              status: 'estimate',
            },
          }),
          row({
            id: 'co2Mode',
            labelKey: key('panels.energy.rows.co2_mode'),
            value: {
              text: translationText(
                key('panels.energy.context.co2_current_reference')
              ),
              status: 'estimate',
            },
          }),
          createPlaceholderRow({
            id: 'waterHeatingSplit',
            labelKey: key('panels.energy.rows.water_heating_split'),
          }),
        ],
      },
    ],
  }
}

const getSavingsPercentValue = ({
  properties,
  prefix,
  measure,
  locale,
}: {
  properties: EnergymapSelectedBuilding['properties']
  prefix: EnergymapEnergyScenarioPrefix | null
  measure: EnergymapEnergyMeasure
  locale: string
}): EnergymapBuildingInfoValue => {
  if (prefix == null) {
    return getUnsupportedEstimateValue([
      HEATING_METHOD_PROPERTY,
      HEATING_ENERGY_SOURCE_PROPERTY,
    ])
  }

  const baselineProperty = getScenarioProperty({
    prefix,
    measure: 'default',
    estimateType: 'total',
  })
  const measureProperty = getScenarioProperty({
    prefix,
    measure,
    estimateType: 'total',
  })

  if (!isScenarioMeasurePublished({ prefix, measure })) {
    return placeholderValue({
      keyName: key('placeholders.not_published'),
      sourceProperties: [baselineProperty, measureProperty],
    })
  }

  const baselineValue = getNumberProperty(properties, baselineProperty)
  const measureValue = getNumberProperty(properties, measureProperty)

  if (baselineValue == null || baselineValue <= 0 || measureValue == null) {
    return missingValue({ sourceProperties: [baselineProperty, measureProperty] })
  }

  const savings = (baselineValue - measureValue) / baselineValue
  const savingsText = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    style: 'percent',
  }).format(Math.abs(savings))
  const keyName =
    savings >= 0
      ? key('panels.renovation.savings_less')
      : key('panels.renovation.savings_more')

  return estimateValue({
    text: translationText(keyName, {
      percent: `${savings >= 0 ? '-' : '+'}${savingsText}`,
    }),
    sourceProperties: [baselineProperty, measureProperty],
    note: translationText(key('panels.energy.note.estimated')),
  })
}

const createRenovationScenario = ({
  properties,
  prefix,
  measure,
  locale,
}: {
  properties: EnergymapSelectedBuilding['properties']
  prefix: EnergymapEnergyScenarioPrefix | null
  measure: EnergymapEnergyMeasure
  locale: string
}): EnergymapBuildingInfoScenario => ({
  id: measure,
  label: translationText(key(`panels.renovation.measures.${measure}`)),
  values: [
    metricValue({
      id: 'annualTotal',
      labelKey: key('panels.energy.metric.annual_total'),
      value: getAnnualEstimateValue({
        properties,
        prefix,
        measure,
        estimateType: 'total',
        locale,
      }),
    }),
    metricValue({
      id: 'perSquareMeter',
      labelKey: key('panels.energy.metric.per_square_meter'),
      value: getPerSquareMeterEstimateValue({
        properties,
        prefix,
        measure,
        estimateType: 'total',
        locale,
      }),
    }),
    metricValue({
      id: 'savingsPercent',
      labelKey: key('panels.renovation.metric.savings'),
      value: getSavingsPercentValue({
        properties,
        prefix,
        measure,
        locale,
      }),
    }),
  ],
})

const createRenovationRecommendationsPanel = ({
  properties,
  prefix,
  locale,
}: {
  properties: EnergymapSelectedBuilding['properties']
  prefix: EnergymapEnergyScenarioPrefix | null
  locale: string
}): EnergymapBuildingInfoPanel => ({
  id: 'renovationRecommendations',
  title: translationText(key('panels.renovation.title')),
  description: translationText(key('panels.renovation.description')),
  sections: [
    {
      id: 'publishedRecommendations',
      rows: [
        createPlaceholderRow({
          id: 'renovationRecommendations',
          labelKey: key(
            'panels.renovation.sections.renovation_recommendations'
          ),
        }),
        createPlaceholderRow({
          id: 'energyRecommendations',
          labelKey: key('panels.renovation.sections.energy_recommendations'),
        }),
        createPlaceholderRow({
          id: 'energyCertificateRecommendations',
          labelKey: key(
            'panels.renovation.sections.energy_certificate_recommendations'
          ),
        }),
      ],
    },
    {
      id: 'scenarioComparison',
      title: translationText(
        key('panels.renovation.sections.scenario_comparison')
      ),
      description: translationText(
        key('panels.renovation.scenario_comparison_description')
      ),
      scenarios: (['aahp', 'solar', 'windows'] as const).map((measure) =>
        createRenovationScenario({
          properties,
          prefix,
          measure,
          locale,
        })
      ),
    },
  ],
})

const createBuildingDetailsPanel = (
  properties: EnergymapSelectedBuilding['properties']
): EnergymapBuildingInfoPanel => ({
  id: 'buildingDetails',
  title: translationText(key('panels.building.title')),
  sections: [
    {
      id: 'buildingSubheader',
      variant: 'buildingSubheader',
      rows: [
        row({
          id: 'address',
          labelKey: key('panels.building.rows.address'),
          value: getAddressValue(properties),
        }),
      ],
    },
    {
      id: 'identity',
      rows: [
        row({
          id: 'buildingIdentifier',
          labelKey: key('panels.building.rows.building_identifier'),
          value: getStringValue({
            properties,
            propertyName: PERMANENT_BUILDING_IDENTIFIER_PROPERTY,
          }),
        }),
        createPlaceholderRow({
          id: 'propertyIdentifier',
          labelKey: key('panels.building.rows.property_identifier'),
        }),
        row({
          id: 'constructionYear',
          labelKey: key('panels.building.rows.construction_year'),
          value: getYearValue(properties),
        }),
        row({
          id: 'buildingType',
          labelKey: key('panels.building.rows.building_type'),
          value: getCodeLabelValue({
            codeValue: getCodeProperty(properties, ENERGYMAP_BUILDING_TYPE_PROPERTY),
            codeType: 'main_purpose',
            knownCodes: ENERGYMAP_BUILDING_TYPE_CODES,
            sourceProperty: ENERGYMAP_BUILDING_TYPE_PROPERTY,
          }),
        }),
      ],
    },
    {
      id: 'energyCertificate',
      variant: 'energyCertificate',
      rows: [
        row({
          id: 'energyClass',
          labelKey: key('panels.building.rows.energy_class'),
          value: getEnergyCertificateClassValue(properties),
        }),
        createPlaceholderRow({
          id: 'energyCertificateValidity',
          labelKey: key('panels.building.rows.energy_certificate_validity'),
        }),
      ],
    },
    {
      id: 'previousEnergyClass',
      variant: 'previousEnergyClass',
      rows: [
        createPlaceholderRow({
          id: 'previousEnergyClass',
          labelKey: key('panels.building.rows.previous_energy_class'),
        }),
        createPlaceholderRow({
          id: 'energyClassMeasures',
          labelKey: key('panels.building.rows.energy_class_measures'),
        }),
      ],
    },
    {
      id: 'plannedMeasures',
      variant: 'measureList',
      rows: [
        createPlaceholderRow({
          id: 'plannedMeasures',
          labelKey: key('panels.building.rows.planned_measures'),
        }),
      ],
    },
    {
      id: 'technicalDetails',
      rows: [
        row({
          id: 'heating',
          labelKey: key('panels.building.rows.heating'),
          value: getHeatingValue(properties),
        }),
        createPlaceholderRow({
          id: 'heatedNetArea',
          labelKey: key('panels.building.rows.heated_net_area'),
        }),
        row({
          id: 'ventilation',
          labelKey: key('panels.building.rows.ventilation'),
          value: getVentilationValue(properties),
        }),
        createPlaceholderRow({
          id: 'plotTenure',
          labelKey: key('panels.building.rows.plot_tenure'),
        }),
        createPlaceholderRow({
          id: 'residentCount',
          labelKey: key('panels.building.rows.resident_count'),
        }),
      ],
    },
  ],
})

export const createEnergymapBuildingInfoPanels = ({
  selectedBuilding,
  locale,
}: CreateEnergymapBuildingInfoPanelsOptions): EnergymapBuildingInfoPanel[] | null => {
  if (selectedBuilding == null) {
    return null
  }

  const { properties } = selectedBuilding
  const heatingMethod = getCodeProperty(properties, HEATING_METHOD_PROPERTY)
  const heatingEnergySource = getCodeProperty(
    properties,
    HEATING_ENERGY_SOURCE_PROPERTY
  )
  const prefix = resolveCurrentEnergyScenarioPrefix({
    heatingEnergySource,
    heatingMethod,
  })

  return [
    createEnergyConsumptionPanel({ properties, prefix, locale }),
    createRenovationRecommendationsPanel({ properties, prefix, locale }),
    createBuildingDetailsPanel(properties),
  ]
}
