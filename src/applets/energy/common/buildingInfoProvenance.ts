import {
  calculateCurrentReferenceAnnualWater,
  deriveAnnualPurchasedEnergyComponents,
  resolveCurrentReferenceBuildingClass,
  resolveCurrentReferenceCarrier,
} from './currentReferenceCalculations'
import type { CurrentReferenceAnnualWaterResult } from './currentReferenceCalculations'
import type {
  EnergymapBuildingInfoResidentCountControl,
  EnergymapBuildingInfoValue,
} from './buildingInfo'
import {
  CURRENT_REFERENCE_BUILDING_CLASSES,
  CURRENT_REFERENCE_DATA,
  CURRENT_REFERENCE_ENERGY_CARRIERS,
} from './currentReferenceData'
import type {
  CurrentReferenceBuildingClass,
  CurrentReferenceEnergyCarrier,
} from './currentReferenceData'

const TRANSLATION_PREFIX = 'sidebar.building_info.provenance'
const provenanceKey = (suffix: string) => `${TRANSLATION_PREFIX}.${suffix}`

const ENERGYMAP_BUILDING_INFO_CATALOG_PROVENANCE_IDS = {
  CURRENT_TOTAL_ANNUAL:
    'energyConsumption.estimatedConsumption.metric.total.annualTotal',
  CURRENT_TOTAL_PER_SQUARE_METER:
    'energyConsumption.estimatedConsumption.metric.total.perSquareMeter',
  CURRENT_HEATING_ANNUAL:
    'energyConsumption.estimatedConsumption.metric.heating.annualTotal',
  CURRENT_HEATING_PER_SQUARE_METER:
    'energyConsumption.estimatedConsumption.metric.heating.perSquareMeter',
  CURRENT_ELECTRICITY_ANNUAL:
    'energyConsumption.estimatedConsumption.metric.electricity.annualTotal',
  CURRENT_ELECTRICITY_PER_SQUARE_METER:
    'energyConsumption.estimatedConsumption.metric.electricity.perSquareMeter',
  WATER_ANNUAL:
    'energyConsumption.estimatedConsumption.primary.water.annualTotal',
  COST_ANNUAL:
    'energyConsumption.estimatedConsumption.primary.cost.annualTotal',
  CO2_ANNUAL: 'energyConsumption.estimatedConsumption.primary.co2.annualTotal',
  WATER_RESIDENT_COUNT_CONTROL:
    'energyConsumption.estimatedConsumption.primary.water.residentCountControl',
  ESTIMATED_CONSUMPTION_NOTE:
    'energyConsumption.estimatedConsumption.note.estimatedConsumption',
  ESTIMATED_VALUE_NOTE: 'buildingInfo.value.note.estimated',
  COST_MODE_CONTEXT: 'energyConsumption.calculationContext.row.costMode',
  CO2_MODE_CONTEXT: 'energyConsumption.calculationContext.row.co2Mode',
  CERTIFICATE_RECOMMENDATIONS:
    'renovationRecommendations.publishedRecommendations.row.energyCertificateRecommendations',
  SCENARIO_AAHP_ANNUAL:
    'renovationRecommendations.scenarioComparison.scenario.aahp.annualTotal',
  SCENARIO_AAHP_PER_SQUARE_METER:
    'renovationRecommendations.scenarioComparison.scenario.aahp.perSquareMeter',
  SCENARIO_AAHP_SAVINGS:
    'renovationRecommendations.scenarioComparison.scenario.aahp.savingsPercent',
  SCENARIO_SOLAR_ANNUAL:
    'renovationRecommendations.scenarioComparison.scenario.solar.annualTotal',
  SCENARIO_SOLAR_PER_SQUARE_METER:
    'renovationRecommendations.scenarioComparison.scenario.solar.perSquareMeter',
  SCENARIO_SOLAR_SAVINGS:
    'renovationRecommendations.scenarioComparison.scenario.solar.savingsPercent',
  SCENARIO_WINDOWS_ANNUAL:
    'renovationRecommendations.scenarioComparison.scenario.windows.annualTotal',
  SCENARIO_WINDOWS_PER_SQUARE_METER:
    'renovationRecommendations.scenarioComparison.scenario.windows.perSquareMeter',
  SCENARIO_WINDOWS_SAVINGS:
    'renovationRecommendations.scenarioComparison.scenario.windows.savingsPercent',
  BUILDING_ADDRESS: 'buildingDetails.buildingSubheader.row.address',
  BUILDING_IDENTIFIER: 'buildingDetails.identity.row.buildingIdentifier',
  CONSTRUCTION_YEAR: 'buildingDetails.identity.row.constructionYear',
  BUILDING_TYPE: 'buildingDetails.identity.row.buildingType',
  ENERGY_CLASS_OFFICIAL:
    'buildingDetails.energyCertificate.row.energyClass.official',
  ENERGY_CLASS_MODELED:
    'buildingDetails.energyCertificate.row.energyClass.modeled',
  ENERGY_CLASS_ORIGIN_UNAVAILABLE:
    'buildingDetails.energyCertificate.row.energyClass.originUnavailable',
  ENERGY_CLASS_MODELED_INDICATOR:
    'buildingDetails.energyCertificate.modeledIndicator',
  CERTIFICATE_VALIDITY:
    'buildingDetails.energyCertificate.row.energyCertificateValidity',
  PREVIOUS_ENERGY_CLASS:
    'buildingDetails.previousEnergyClass.row.previousEnergyClass',
  HEATING: 'buildingDetails.technicalDetails.row.heating',
  HEATED_NET_AREA: 'buildingDetails.technicalDetails.row.heatedNetArea',
  VENTILATION: 'buildingDetails.technicalDetails.row.ventilation',
} as const

export const ENERGYMAP_BUILDING_INFO_PROVENANCE_IDS =
  ENERGYMAP_BUILDING_INFO_CATALOG_PROVENANCE_IDS

export type EnergymapBuildingInfoProvenanceId =
  (typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_IDS)[keyof typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_IDS]

type EnergymapBuildingInfoCatalogProvenanceId =
  (typeof ENERGYMAP_BUILDING_INFO_CATALOG_PROVENANCE_IDS)[keyof typeof ENERGYMAP_BUILDING_INFO_CATALOG_PROVENANCE_IDS]

export const ENERGYMAP_BUILDING_INFO_PROVENANCE_CATEGORIES = {
  officialCertificate: {
    id: 'officialCertificate',
    key: provenanceKey('categories.official_certificate'),
  },
  buildingRegistry: {
    id: 'buildingRegistry',
    key: provenanceKey('categories.building_registry'),
  },
  modeledOutput: {
    id: 'modeledOutput',
    key: provenanceKey('categories.modeled_output'),
  },
  frontendDerived: {
    id: 'frontendDerived',
    key: provenanceKey('categories.frontend_derived'),
  },
  compositeCalculation: {
    id: 'compositeCalculation',
    key: provenanceKey('categories.composite_calculation'),
  },
  originUnavailable: {
    id: 'originUnavailable',
    key: provenanceKey('categories.origin_unavailable'),
  },
} as const

export type EnergymapBuildingInfoProvenanceCategoryId =
  keyof typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_CATEGORIES

export const ENERGYMAP_BUILDING_INFO_PROVENANCE_SOURCES = {
  ryhtiBuildingData: {
    id: 'ryhtiBuildingData',
    key: provenanceKey('sources.ryhti_building_data'),
  },
  energyCertificateRegister: {
    id: 'energyCertificateRegister',
    key: provenanceKey('sources.energy_certificate_register'),
  },
  energyMapConsumptionModel: {
    id: 'energyMapConsumptionModel',
    key: provenanceKey('sources.energy_map_consumption_model'),
  },
  energyMapModeledClass: {
    id: 'energyMapModeledClass',
    key: provenanceKey('sources.energy_map_modeled_class'),
  },
  currentReferencePrices: {
    id: 'currentReferencePrices',
    key: provenanceKey('sources.current_reference_prices'),
  },
  currentReferenceEmissionFactors: {
    id: 'currentReferenceEmissionFactors',
    key: provenanceKey('sources.current_reference_emission_factors'),
  },
  currentReferenceWater: {
    id: 'currentReferenceWater',
    key: provenanceKey('sources.current_reference_water'),
  },
  currentReferenceOccupancy: {
    id: 'currentReferenceOccupancy',
    key: provenanceKey('sources.current_reference_occupancy'),
  },
  userResidentCount: {
    id: 'userResidentCount',
    key: provenanceKey('sources.user_resident_count'),
  },
  energyMapSelectedBuildingDataset: {
    id: 'energyMapSelectedBuildingDataset',
    key: provenanceKey('sources.energy_map_selected_building_dataset'),
  },
} as const

export type EnergymapBuildingInfoProvenanceSourceId =
  keyof typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_SOURCES

export const ENERGYMAP_BUILDING_INFO_PROVENANCE_PROVIDERS = {
  ryhti: {
    id: 'ryhti',
    key: provenanceKey('providers.ryhti'),
  },
  energyCertificateRegister: {
    id: 'energyCertificateRegister',
    key: provenanceKey('providers.energy_certificate_register'),
  },
  energyMap: {
    id: 'energyMap',
    key: provenanceKey('providers.energy_map'),
  },
  energiavirasto: {
    id: 'energiavirasto',
    key: provenanceKey('providers.energiavirasto'),
  },
  energiateollisuus: {
    id: 'energiateollisuus',
    key: provenanceKey('providers.energiateollisuus'),
  },
  statisticsFinland: {
    id: 'statisticsFinland',
    key: provenanceKey('providers.statistics_finland'),
  },
  motiva: {
    id: 'motiva',
    key: provenanceKey('providers.motiva'),
  },
  user: {
    id: 'user',
    key: provenanceKey('providers.user'),
  },
} as const

export type EnergymapBuildingInfoProvenanceProviderId =
  keyof typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_PROVIDERS

export const ENERGYMAP_BUILDING_INFO_PROVENANCE_CALCULATIONS = {
  composeAddress: {
    id: 'composeAddress',
    key: provenanceKey('calculations.compose_address'),
  },
  parseConstructionYear: {
    id: 'parseConstructionYear',
    key: provenanceKey('calculations.parse_construction_year'),
  },
  localizeBuildingType: {
    id: 'localizeBuildingType',
    key: provenanceKey('calculations.localize_building_type'),
  },
  combineHeatingFacts: {
    id: 'combineHeatingFacts',
    key: provenanceKey('calculations.combine_heating_facts'),
  },
  intensityTimesArea: {
    id: 'intensityTimesArea',
    key: provenanceKey('calculations.intensity_times_area'),
  },
  scenarioSavings: {
    id: 'scenarioSavings',
    key: provenanceKey('calculations.scenario_savings'),
  },
  buildingClassResolution: {
    id: 'buildingClassResolution',
    key: provenanceKey('calculations.building_class_resolution'),
  },
  carrierResolution: {
    id: 'carrierResolution',
    key: provenanceKey('calculations.carrier_resolution'),
  },
  residentEstimate: {
    id: 'residentEstimate',
    key: provenanceKey('calculations.resident_estimate'),
  },
  annualWater: {
    id: 'annualWater',
    key: provenanceKey('calculations.annual_water'),
  },
  currentReferenceCost: {
    id: 'currentReferenceCost',
    key: provenanceKey('calculations.current_reference_cost'),
  },
  currentReferenceCo2: {
    id: 'currentReferenceCo2',
    key: provenanceKey('calculations.current_reference_co2'),
  },
  kwhToMwh: {
    id: 'kwhToMwh',
    key: provenanceKey('calculations.kwh_to_mwh'),
  },
  componentFactorMultiplication: {
    id: 'componentFactorMultiplication',
    key: provenanceKey('calculations.component_factor_multiplication'),
  },
  completeOnlyAggregation: {
    id: 'completeOnlyAggregation',
    key: provenanceKey('calculations.complete_only_aggregation'),
  },
  modeledClass2018: {
    id: 'modeledClass2018',
    key: provenanceKey('calculations.modeled_class_2018'),
  },
} as const

export type EnergymapBuildingInfoProvenanceCalculationId =
  keyof typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_CALCULATIONS

export const ENERGYMAP_BUILDING_INFO_PROVENANCE_METADATA = {
  sourceLanguage: {
    id: 'sourceLanguage',
    key: provenanceKey('metadata.source_language'),
  },
  referenceVersion: {
    id: 'referenceVersion',
    key: provenanceKey('metadata.reference_version'),
  },
  referenceLastReviewed: {
    id: 'referenceLastReviewed',
    key: provenanceKey('metadata.reference_last_reviewed'),
  },
  modeledClass2018: {
    id: 'modeledClass2018',
    key: provenanceKey('metadata.modeled_class_2018'),
  },
  floorAreaProxyCaveat: {
    id: 'floorAreaProxyCaveat',
    key: provenanceKey('metadata.floor_area_proxy_caveat'),
  },
  modeledNotMeasuredCaveat: {
    id: 'modeledNotMeasuredCaveat',
    key: provenanceKey('metadata.modeled_not_measured_caveat'),
  },
  costReferenceCaveat: {
    id: 'costReferenceCaveat',
    key: provenanceKey('metadata.cost_reference_caveat'),
  },
  co2AccountingBoundary: {
    id: 'co2AccountingBoundary',
    key: provenanceKey('metadata.co2_accounting_boundary'),
  },
  energyClassOriginUnavailable: {
    id: 'energyClassOriginUnavailable',
    key: provenanceKey('metadata.energy_class_origin_unavailable'),
  },
} as const

export type EnergymapBuildingInfoProvenanceMetadataId =
  keyof typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_METADATA

export type EnergymapBuildingInfoProvenanceInputRole =
  | 'source-field'
  | 'model-output'
  | 'model-input'
  | 'model-calculation'
  | 'reference-factor'
  | 'user-input'
  | 'frontend-arithmetic'

const STATIC_INPUT_IDS = {
  RYHTI_ADDRESS: 'sourceField.ryhti.address',
  RYHTI_POSTAL_CODE: 'sourceField.ryhti.postalCode',
  RYHTI_POSTAL_OFFICE: 'sourceField.ryhti.postalOffice',
  RYHTI_BUILDING_IDENTIFIER: 'sourceField.ryhti.buildingIdentifier',
  RYHTI_COMPLETION_DATE: 'sourceField.ryhti.completionDate',
  RYHTI_BUILDING_TYPE: 'sourceField.ryhti.buildingType',
  RYHTI_HEATING_SOURCE: 'sourceField.ryhti.heatingSource',
  RYHTI_HEATING_METHOD: 'sourceField.ryhti.heatingMethod',
  RYHTI_FLOOR_AREA: 'sourceField.ryhti.floorArea',
  SELECTED_BUILDING_CURRENT_CLASS:
    'sourceField.energyMapSelectedBuilding.currentEnergyClass',
  SELECTED_BUILDING_INVALID_CLASS_ORIGIN:
    'sourceField.energyMapSelectedBuilding.invalidEnergyClassOrigin',
  CERTIFICATE_CURRENT_CLASS: 'sourceField.certificate.currentEnergyClass',
  CERTIFICATE_PREVIOUS_CLASS: 'sourceField.certificate.previousEnergyClass',
  CERTIFICATE_VALID_UNTIL: 'sourceField.certificate.validUntil',
  CERTIFICATE_HEATED_NET_AREA: 'sourceField.certificate.heatedNetArea',
  CERTIFICATE_RECOMMENDATIONS_FI: 'sourceField.certificate.recommendations.fi',
  CERTIFICATE_RECOMMENDATIONS_SV: 'sourceField.certificate.recommendations.sv',
  CERTIFICATE_VENTILATION_FI: 'sourceField.certificate.ventilation.fi',
  CERTIFICATE_VENTILATION_SV: 'sourceField.certificate.ventilation.sv',
  CLASS_ORIGIN_OFFICIAL: 'sourceField.energyClassOrigin.official',
  CLASS_ORIGIN_MODELED: 'sourceField.energyClassOrigin.modeled',
  MODELED_CLASS_OUTPUT: 'modelOutput.modeledClass.energyClass',
  MODEL_CONSUMPTION_REFERENCE: 'modelInput.consumptionReferenceTables',
  MODEL_CLASS_BUILDING_TYPE: 'modelInput.modeledClass.buildingType',
  MODEL_CLASS_COMPLETION_DATE: 'modelInput.modeledClass.completionDate',
  MODEL_CLASS_HEATING_SOURCE: 'modelInput.modeledClass.heatingSource',
  MODEL_CLASS_HEATING_METHOD: 'modelInput.modeledClass.heatingMethod',
  MODEL_CLASS_FLOOR_AREA: 'modelInput.modeledClass.floorArea',
  MODEL_CLASS_TOTAL_AREA: 'modelInput.modeledClass.totalArea',
  MODEL_CLASS_GROSS_FLOOR_AREA: 'modelInput.modeledClass.grossFloorArea',
  MODEL_CLASS_STOREYS: 'modelInput.modeledClass.numberOfStoreys',
  MODEL_CLASS_AREA_SOURCE: 'modelInput.modeledClass.areaSource',
  MODEL_CLASS_REFERENCE_TABLES: 'modelInput.modeledClass.referenceTables',
  MODEL_CLASS_2018_LIMITS: 'modelInput.modeledClass.classLimits2018',
  OCCUPANCY_REFERENCE: 'referenceFactor.water.occupancy',
  WATER_CUBIC_METERS_PER_YEAR:
    'referenceFactor.water.cubicMetersPerResidentPerYear',
  USER_RESIDENT_COUNT: 'userInput.residentCount',
  COMPOSE_ADDRESS: 'frontendArithmetic.composeAddress',
  PARSE_CONSTRUCTION_YEAR: 'frontendArithmetic.parseConstructionYear',
  LOCALIZE_BUILDING_TYPE: 'frontendArithmetic.localizeBuildingType',
  COMBINE_HEATING_FACTS: 'frontendArithmetic.combineHeatingFacts',
  INTENSITY_TIMES_AREA: 'frontendArithmetic.intensityTimesArea',
  SCENARIO_SAVINGS: 'frontendArithmetic.scenarioSavings',
  BUILDING_CLASS_RESOLUTION: 'frontendArithmetic.buildingClassResolution',
  CARRIER_RESOLUTION: 'frontendArithmetic.carrierResolution',
  RESIDENT_ESTIMATE: 'frontendArithmetic.residentEstimate',
  ANNUAL_WATER: 'frontendArithmetic.annualWater',
  KWH_TO_MWH: 'frontendArithmetic.kwhToMwh',
  COMPONENT_FACTOR_MULTIPLICATION:
    'frontendArithmetic.componentFactorMultiplication',
  COMPLETE_ONLY_AGGREGATION: 'frontendArithmetic.completeOnlyAggregation',
  MODELED_CLASS_METHOD: 'modelCalculation.modeledClass2018',
} as const

export const ENERGYMAP_BUILDING_INFO_PROVENANCE_INPUT_IDS = STATIC_INPUT_IDS

type StaticInputId = (typeof STATIC_INPUT_IDS)[keyof typeof STATIC_INPUT_IDS]

type ScenarioPrefix =
  | 'awhp'
  | 'delec'
  | 'distr'
  | 'elecb'
  | 'gshp'
  | 'oil'
  | 'wood'
type ScenarioMeasure = 'default' | 'aahp' | 'solar' | 'windows'
type EnergyEstimateType = 'total' | 'heat' | 'elec'
type ScenarioProperty =
  `${ScenarioPrefix}_${ScenarioMeasure}_${EnergyEstimateType}`
type ModelOutputInputId = `modelOutput.energyIntensity.${ScenarioProperty}`
type CostFactorInputId =
  `referenceFactor.cost.${CurrentReferenceBuildingClass}.${CurrentReferenceEnergyCarrier}`
type Co2FactorInputId = `referenceFactor.co2.${CurrentReferenceEnergyCarrier}`

export type EnergymapBuildingInfoProvenanceInputId =
  | StaticInputId
  | ModelOutputInputId
  | CostFactorInputId
  | Co2FactorInputId

export type EnergymapBuildingInfoProvenanceRef = {
  id: EnergymapBuildingInfoProvenanceId
  inputIds?: readonly EnergymapBuildingInfoProvenanceInputId[]
}

export type EnergymapBuildingInfoProvenanceInputDefinition = Readonly<{
  id: EnergymapBuildingInfoProvenanceInputId
  role: EnergymapBuildingInfoProvenanceInputRole
  labelKey: string
  sourceId?: EnergymapBuildingInfoProvenanceSourceId
  providerIds?: readonly EnergymapBuildingInfoProvenanceProviderId[]
  calculationId?: EnergymapBuildingInfoProvenanceCalculationId
  metadataIds?: readonly EnergymapBuildingInfoProvenanceMetadataId[]
  sourceProperty?: string
  supported?: boolean
  value?: number
  unit?: string
  details?: Readonly<Record<string, string | number | boolean>>
}>

type EvidenceVariant = Readonly<{
  inputIds: readonly EnergymapBuildingInfoProvenanceInputId[]
  sourceProperties: readonly string[]
  sourceLanguage?: 'fi' | 'sv'
  valueSourceIds?: readonly EnergymapBuildingInfoProvenanceSourceId[]
  valueProviderIds?: readonly EnergymapBuildingInfoProvenanceProviderId[]
  valueCalculationIds?: readonly EnergymapBuildingInfoProvenanceCalculationId[]
}>

type EvidencePolicy = Readonly<{
  requiredInputIds: readonly EnergymapBuildingInfoProvenanceInputId[]
  optionalInputIds: readonly EnergymapBuildingInfoProvenanceInputId[]
}>

export type EnergymapBuildingInfoProvenanceDefinition = Readonly<{
  id: EnergymapBuildingInfoCatalogProvenanceId
  fieldKey: string
  categoryId: EnergymapBuildingInfoProvenanceCategoryId
  categoryKey: string
  sourceIds: readonly EnergymapBuildingInfoProvenanceSourceId[]
  providerIds?: readonly EnergymapBuildingInfoProvenanceProviderId[]
  calculationIds?: readonly EnergymapBuildingInfoProvenanceCalculationId[]
  metadataIds?: readonly EnergymapBuildingInfoProvenanceMetadataId[]
  includeCurrentReferenceMetadata?: boolean
  modelYear?: 2018
  evidenceVariants?: readonly EvidenceVariant[]
  evidencePolicy?: EvidencePolicy
  documentedMethodInputIds?: readonly EnergymapBuildingInfoProvenanceInputId[]
}>

const inputDefinition = ({
  id,
  role,
  label,
  ...rest
}: Omit<EnergymapBuildingInfoProvenanceInputDefinition, 'labelKey'> & {
  label: string
}): EnergymapBuildingInfoProvenanceInputDefinition => ({
  id,
  role,
  labelKey: provenanceKey(`inputs.${label}`),
  ...rest,
})

const staticInputDefinitions: readonly EnergymapBuildingInfoProvenanceInputDefinition[] =
  [
    inputDefinition({
      id: STATIC_INPUT_IDS.RYHTI_ADDRESS,
      role: 'source-field',
      label: 'address',
      sourceId: 'ryhtiBuildingData',
      providerIds: ['ryhti'],
      sourceProperty: 'address_fin',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.RYHTI_POSTAL_CODE,
      role: 'source-field',
      label: 'postal_code',
      sourceId: 'ryhtiBuildingData',
      providerIds: ['ryhti'],
      sourceProperty: 'postal_code',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.RYHTI_POSTAL_OFFICE,
      role: 'source-field',
      label: 'postal_office',
      sourceId: 'ryhtiBuildingData',
      providerIds: ['ryhti'],
      sourceProperty: 'postal_office_fin',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.RYHTI_BUILDING_IDENTIFIER,
      role: 'source-field',
      label: 'building_identifier',
      sourceId: 'ryhtiBuildingData',
      providerIds: ['ryhti'],
      sourceProperty: 'permanent_building_identifier',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.RYHTI_COMPLETION_DATE,
      role: 'source-field',
      label: 'completion_date',
      sourceId: 'ryhtiBuildingData',
      providerIds: ['ryhti'],
      sourceProperty: 'completion_date',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.RYHTI_BUILDING_TYPE,
      role: 'source-field',
      label: 'building_type',
      sourceId: 'ryhtiBuildingData',
      providerIds: ['ryhti'],
      sourceProperty: 'main_purpose',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.RYHTI_HEATING_SOURCE,
      role: 'source-field',
      label: 'heating_source',
      sourceId: 'ryhtiBuildingData',
      providerIds: ['ryhti'],
      sourceProperty: 'heating_energy_source',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.RYHTI_HEATING_METHOD,
      role: 'source-field',
      label: 'heating_method',
      sourceId: 'ryhtiBuildingData',
      providerIds: ['ryhti'],
      sourceProperty: 'heating_method',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.RYHTI_FLOOR_AREA,
      role: 'source-field',
      label: 'floor_area',
      sourceId: 'ryhtiBuildingData',
      providerIds: ['ryhti'],
      sourceProperty: 'floor_area',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.SELECTED_BUILDING_CURRENT_CLASS,
      role: 'source-field',
      label: 'selected_building_current_energy_class',
      sourceId: 'energyMapSelectedBuildingDataset',
      sourceProperty: 'energy_class',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.SELECTED_BUILDING_INVALID_CLASS_ORIGIN,
      role: 'source-field',
      label: 'selected_building_invalid_energy_class_origin',
      sourceId: 'energyMapSelectedBuildingDataset',
      sourceProperty: 'is_energy_class_modeled',
      details: { expectedType: 'boolean', establishesOrigin: false },
    }),
    ...(
      [
        [
          STATIC_INPUT_IDS.CERTIFICATE_CURRENT_CLASS,
          'current_energy_class',
          'energy_class',
        ],
        [
          STATIC_INPUT_IDS.CERTIFICATE_PREVIOUS_CLASS,
          'previous_energy_class',
          'energy_certificate_previous_class',
        ],
        [
          STATIC_INPUT_IDS.CERTIFICATE_VALID_UNTIL,
          'certificate_valid_until',
          'energy_certificate_valid_until',
        ],
        [
          STATIC_INPUT_IDS.CERTIFICATE_HEATED_NET_AREA,
          'certificate_heated_net_area',
          'energy_certificate_heated_net_area',
        ],
        [
          STATIC_INPUT_IDS.CERTIFICATE_RECOMMENDATIONS_FI,
          'certificate_recommendations',
          'energy_certificate_recommendations_fi',
        ],
        [
          STATIC_INPUT_IDS.CERTIFICATE_RECOMMENDATIONS_SV,
          'certificate_recommendations',
          'energy_certificate_recommendations_sv',
        ],
        [
          STATIC_INPUT_IDS.CERTIFICATE_VENTILATION_FI,
          'certificate_ventilation',
          'energy_certificate_ventilation_description_fi',
        ],
        [
          STATIC_INPUT_IDS.CERTIFICATE_VENTILATION_SV,
          'certificate_ventilation',
          'energy_certificate_ventilation_description_sv',
        ],
      ] as const
    ).map(([id, label, sourceProperty]) =>
      inputDefinition({
        id,
        role: 'source-field',
        label,
        sourceId: 'energyCertificateRegister',
        providerIds: ['energyCertificateRegister'],
        sourceProperty,
      })
    ),
    inputDefinition({
      id: STATIC_INPUT_IDS.CLASS_ORIGIN_OFFICIAL,
      role: 'source-field',
      label: 'official_class_origin',
      sourceId: 'energyMapSelectedBuildingDataset',
      sourceProperty: 'is_energy_class_modeled',
      details: { expectedValue: false },
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.CLASS_ORIGIN_MODELED,
      role: 'source-field',
      label: 'modeled_class_origin',
      sourceId: 'energyMapSelectedBuildingDataset',
      sourceProperty: 'is_energy_class_modeled',
      details: { expectedValue: true },
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.MODELED_CLASS_OUTPUT,
      role: 'model-output',
      label: 'modeled_class_output',
      sourceId: 'energyMapSelectedBuildingDataset',
      sourceProperty: 'energy_class',
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.MODEL_CONSUMPTION_REFERENCE,
      role: 'model-input',
      label: 'consumption_reference_tables',
      sourceId: 'energyMapConsumptionModel',
      providerIds: ['energyMap'],
    }),
    ...(
      [
        [
          STATIC_INPUT_IDS.MODEL_CLASS_BUILDING_TYPE,
          'modeled_class_building_type',
          'main_purpose',
        ],
        [
          STATIC_INPUT_IDS.MODEL_CLASS_COMPLETION_DATE,
          'modeled_class_completion_date',
          'completion_date',
        ],
        [
          STATIC_INPUT_IDS.MODEL_CLASS_HEATING_SOURCE,
          'modeled_class_heating_source',
          'heating_energy_source',
        ],
        [
          STATIC_INPUT_IDS.MODEL_CLASS_HEATING_METHOD,
          'modeled_class_heating_method',
          'heating_method',
        ],
        [
          STATIC_INPUT_IDS.MODEL_CLASS_FLOOR_AREA,
          'modeled_class_floor_area',
          'floor_area',
        ],
        [
          STATIC_INPUT_IDS.MODEL_CLASS_TOTAL_AREA,
          'modeled_class_total_area',
          'total_area',
        ],
        [
          STATIC_INPUT_IDS.MODEL_CLASS_GROSS_FLOOR_AREA,
          'modeled_class_gross_floor_area',
          'gross_floor_area',
        ],
        [
          STATIC_INPUT_IDS.MODEL_CLASS_STOREYS,
          'modeled_class_storeys',
          'number_of_storeys',
        ],
      ] as const
    ).map(([id, label, sourceProperty]) =>
      inputDefinition({
        id,
        role: 'model-input',
        label,
        sourceId: 'ryhtiBuildingData',
        providerIds: ['ryhti'],
        sourceProperty,
      })
    ),
    inputDefinition({
      id: STATIC_INPUT_IDS.MODEL_CLASS_AREA_SOURCE,
      role: 'source-field',
      label: 'modeled_class_area_source',
      sourceId: 'energyMapSelectedBuildingDataset',
      providerIds: ['energyMap'],
      sourceProperty: 'modeled_energy_class_area_source',
      details: {
        supportedValues: 'floor_area,total_area,gross_floor_area',
      },
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.MODEL_CLASS_REFERENCE_TABLES,
      role: 'model-input',
      label: 'modeled_class_reference_tables',
      sourceId: 'energyMapModeledClass',
      providerIds: ['energyMap'],
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.MODEL_CLASS_2018_LIMITS,
      role: 'model-input',
      label: 'modeled_class_2018_limits',
      sourceId: 'energyMapModeledClass',
      providerIds: ['energyMap'],
      details: { modelYear: 2018 },
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.OCCUPANCY_REFERENCE,
      role: 'reference-factor',
      label: 'occupancy_reference',
      sourceId: 'currentReferenceOccupancy',
      providerIds: ['statisticsFinland'],
      value: CURRENT_REFERENCE_DATA.water.occupancy.squareMetresPerResident,
      unit: 'm²/resident',
      details: {
        rounding: CURRENT_REFERENCE_DATA.water.occupancy.rounding,
        minimumResidents:
          CURRENT_REFERENCE_DATA.water.occupancy.minimumResidents,
        maximumResidents:
          CURRENT_REFERENCE_DATA.water.occupancy.maximumResidents,
        approvedAt: CURRENT_REFERENCE_DATA.water.occupancy.approvedAt,
      },
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.WATER_CUBIC_METERS_PER_YEAR,
      role: 'reference-factor',
      label: 'water_cubic_meters_per_resident_year',
      sourceId: 'currentReferenceWater',
      providerIds: ['motiva'],
      value: CURRENT_REFERENCE_DATA.water.cubicMetersPerResidentPerYear.value,
      unit: CURRENT_REFERENCE_DATA.water.cubicMetersPerResidentPerYear.unit,
    }),
    inputDefinition({
      id: STATIC_INPUT_IDS.USER_RESIDENT_COUNT,
      role: 'user-input',
      label: 'user_resident_count',
      sourceId: 'userResidentCount',
      providerIds: ['user'],
    }),
    ...(
      [
        [STATIC_INPUT_IDS.COMPOSE_ADDRESS, 'compose_address', 'composeAddress'],
        [
          STATIC_INPUT_IDS.PARSE_CONSTRUCTION_YEAR,
          'parse_construction_year',
          'parseConstructionYear',
        ],
        [
          STATIC_INPUT_IDS.LOCALIZE_BUILDING_TYPE,
          'localize_building_type',
          'localizeBuildingType',
        ],
        [
          STATIC_INPUT_IDS.COMBINE_HEATING_FACTS,
          'combine_heating_facts',
          'combineHeatingFacts',
        ],
        [
          STATIC_INPUT_IDS.INTENSITY_TIMES_AREA,
          'intensity_times_area',
          'intensityTimesArea',
        ],
        [
          STATIC_INPUT_IDS.SCENARIO_SAVINGS,
          'scenario_savings',
          'scenarioSavings',
        ],
        [
          STATIC_INPUT_IDS.BUILDING_CLASS_RESOLUTION,
          'building_class_resolution',
          'buildingClassResolution',
        ],
        [
          STATIC_INPUT_IDS.CARRIER_RESOLUTION,
          'carrier_resolution',
          'carrierResolution',
        ],
        [
          STATIC_INPUT_IDS.RESIDENT_ESTIMATE,
          'resident_estimate',
          'residentEstimate',
        ],
        [STATIC_INPUT_IDS.ANNUAL_WATER, 'annual_water', 'annualWater'],
        [STATIC_INPUT_IDS.KWH_TO_MWH, 'kwh_to_mwh', 'kwhToMwh'],
        [
          STATIC_INPUT_IDS.COMPONENT_FACTOR_MULTIPLICATION,
          'component_factor_multiplication',
          'componentFactorMultiplication',
        ],
        [
          STATIC_INPUT_IDS.COMPLETE_ONLY_AGGREGATION,
          'complete_only_aggregation',
          'completeOnlyAggregation',
        ],
      ] as const
    ).map(([id, label, calculationId]) =>
      inputDefinition({
        id,
        role: 'frontend-arithmetic',
        label,
        providerIds: ['energyMap'],
        calculationId,
        ...(id === STATIC_INPUT_IDS.RESIDENT_ESTIMATE
          ? { metadataIds: ['floorAreaProxyCaveat'] as const }
          : {}),
      })
    ),
    inputDefinition({
      id: STATIC_INPUT_IDS.MODELED_CLASS_METHOD,
      role: 'model-calculation',
      label: 'modeled_class_method',
      sourceId: 'energyMapModeledClass',
      providerIds: ['energyMap'],
      calculationId: 'modeledClass2018',
    }),
  ]

const SCENARIO_PREFIXES = [
  'awhp',
  'delec',
  'distr',
  'elecb',
  'gshp',
  'oil',
  'wood',
] as const satisfies readonly ScenarioPrefix[]

const PUBLISHED_SCENARIO_MEASURES = {
  awhp: ['default', 'solar', 'windows'],
  delec: ['default', 'aahp', 'solar', 'windows'],
  distr: ['default', 'aahp', 'solar', 'windows'],
  elecb: ['default', 'aahp', 'solar', 'windows'],
  gshp: ['default', 'solar', 'windows'],
  oil: ['default', 'aahp', 'solar', 'windows'],
  wood: ['default', 'aahp', 'solar', 'windows'],
} as const satisfies Record<ScenarioPrefix, readonly ScenarioMeasure[]>

const isPublishedScenarioMeasure = ({
  prefix,
  measure,
}: {
  prefix: ScenarioPrefix
  measure: ScenarioMeasure
}) => {
  if (!Object.hasOwn(PUBLISHED_SCENARIO_MEASURES, prefix)) return false

  return (
    PUBLISHED_SCENARIO_MEASURES[prefix] as readonly ScenarioMeasure[]
  ).includes(measure)
}

export const getEnergymapModelOutputProvenanceInputId = ({
  prefix,
  measure,
  estimateType,
}: {
  prefix: ScenarioPrefix
  measure: ScenarioMeasure
  estimateType: EnergyEstimateType
}): ModelOutputInputId | null => {
  if (
    !isPublishedScenarioMeasure({ prefix, measure }) ||
    (measure !== 'default' && estimateType !== 'total')
  ) {
    return null
  }

  return `modelOutput.energyIntensity.${prefix}_${measure}_${estimateType}`
}

const modelOutputInputDefinitions = SCENARIO_PREFIXES.flatMap((prefix) =>
  PUBLISHED_SCENARIO_MEASURES[prefix].flatMap((measure) => {
    const estimateTypes =
      measure === 'default'
        ? (['total', 'heat', 'elec'] as const)
        : (['total'] as const)

    return estimateTypes.map((estimateType) => {
      const id = getEnergymapModelOutputProvenanceInputId({
        prefix,
        measure,
        estimateType,
      })

      if (id == null) {
        throw new Error('Published model-output input could not be defined')
      }

      return inputDefinition({
        id,
        role: 'model-output',
        label:
          measure === 'default'
            ? `modeled_default_${estimateType}_intensity`
            : `modeled_${measure}_total_intensity`,
        sourceId: 'energyMapConsumptionModel',
        providerIds: ['energyMap'],
        sourceProperty: `${prefix}_${measure}_${estimateType}`,
      })
    })
  })
)

const COST_FACTOR_PROVIDERS = {
  electricity: 'energiavirasto',
  districtHeat: 'energiateollisuus',
  lightFuelOil: 'statisticsFinland',
  pellet: 'statisticsFinland',
} as const satisfies Record<
  CurrentReferenceEnergyCarrier,
  EnergymapBuildingInfoProvenanceProviderId
>

const CO2_FACTOR_PROVIDERS = {
  electricity: 'motiva',
  districtHeat: 'motiva',
  lightFuelOil: 'statisticsFinland',
  pellet: 'statisticsFinland',
} as const satisfies Record<
  CurrentReferenceEnergyCarrier,
  EnergymapBuildingInfoProvenanceProviderId
>

const BUILDING_CLASS_KEY_PARTS = {
  apartmentBuilding: 'apartment_building',
  detachedHouse: 'detached_house',
} as const satisfies Record<CurrentReferenceBuildingClass, string>

const ENERGY_CARRIER_KEY_PARTS = {
  electricity: 'electricity',
  districtHeat: 'district_heat',
  lightFuelOil: 'light_fuel_oil',
  pellet: 'pellet',
} as const satisfies Record<CurrentReferenceEnergyCarrier, string>

const costFactorInputDefinitions = CURRENT_REFERENCE_BUILDING_CLASSES.flatMap(
  (buildingClass) =>
    CURRENT_REFERENCE_ENERGY_CARRIERS.map((carrier) => {
      const reference =
        CURRENT_REFERENCE_DATA.annualEnergyCostPrices.byBuildingClass[
          buildingClass
        ][carrier]

      return inputDefinition({
        id: `referenceFactor.cost.${buildingClass}.${carrier}`,
        role: 'reference-factor',
        label: `cost_${BUILDING_CLASS_KEY_PARTS[buildingClass]}_${ENERGY_CARRIER_KEY_PARTS[carrier]}`,
        sourceId: 'currentReferencePrices',
        providerIds: [COST_FACTOR_PROVIDERS[carrier]],
        supported: reference.status === 'supported',
        ...(reference.status === 'supported'
          ? {
              value: reference.value,
              unit: CURRENT_REFERENCE_DATA.annualEnergyCostPrices.unit,
            }
          : {}),
      })
    })
)

const co2FactorInputDefinitions = CURRENT_REFERENCE_ENERGY_CARRIERS.map(
  (carrier) => {
    const reference = CURRENT_REFERENCE_DATA.emissionFactors.byCarrier[carrier]

    return inputDefinition({
      id: `referenceFactor.co2.${carrier}`,
      role: 'reference-factor',
      label: `co2_${ENERGY_CARRIER_KEY_PARTS[carrier]}`,
      sourceId: 'currentReferenceEmissionFactors',
      providerIds: [CO2_FACTOR_PROVIDERS[carrier]],
      supported: reference.status === 'supported',
      ...(reference.status === 'supported'
        ? {
            value: reference.value,
            unit: CURRENT_REFERENCE_DATA.emissionFactors.unit,
          }
        : {}),
    })
  }
)

const createInputDefinitionIndex = (
  definitions: readonly EnergymapBuildingInfoProvenanceInputDefinition[]
) => {
  const index: Partial<
    Record<
      EnergymapBuildingInfoProvenanceInputId,
      EnergymapBuildingInfoProvenanceInputDefinition
    >
  > = {}

  for (const definition of definitions) {
    if (Object.hasOwn(index, definition.id)) {
      throw new Error(`Duplicate provenance input definition: ${definition.id}`)
    }
    index[definition.id] = definition
  }

  return index as Readonly<
    Record<
      EnergymapBuildingInfoProvenanceInputId,
      EnergymapBuildingInfoProvenanceInputDefinition
    >
  >
}

export const ENERGYMAP_BUILDING_INFO_PROVENANCE_INPUT_DEFINITIONS =
  createInputDefinitionIndex([
    ...staticInputDefinitions,
    ...modelOutputInputDefinitions,
    ...costFactorInputDefinitions,
    ...co2FactorInputDefinitions,
  ])

const unique = <Value extends string>(values: readonly Value[]): Value[] => [
  ...new Set(values),
]

export const getEnergymapCurrentReferenceProvenanceInputIds = ({
  kind,
  scenarioPrefix,
  mainPurpose,
  floorAreaSquareMeters,
  defaultElectricityIntensityKwhPerSquareMeterYear,
  defaultHeatingIntensityKwhPerSquareMeterYear,
}: {
  kind: 'cost' | 'co2'
  scenarioPrefix: ScenarioPrefix | null
  mainPurpose?: unknown
  floorAreaSquareMeters: unknown
  defaultElectricityIntensityKwhPerSquareMeterYear: unknown
  defaultHeatingIntensityKwhPerSquareMeterYear: unknown
}): readonly EnergymapBuildingInfoProvenanceInputId[] | null => {
  const carrier = resolveCurrentReferenceCarrier(scenarioPrefix)
  if (carrier.status === 'unsupported' || scenarioPrefix == null) {
    return null
  }

  const electricityInput = getEnergymapModelOutputProvenanceInputId({
    prefix: scenarioPrefix,
    measure: 'default',
    estimateType: 'elec',
  })
  const heatingInput = getEnergymapModelOutputProvenanceInputId({
    prefix: scenarioPrefix,
    measure: 'default',
    estimateType: 'heat',
  })
  if (electricityInput == null || heatingInput == null) {
    return null
  }

  const energy = deriveAnnualPurchasedEnergyComponents({
    heatingCarrier: carrier.value,
    floorAreaSquareMeters,
    defaultElectricityIntensityKwhPerSquareMeterYear,
    defaultHeatingIntensityKwhPerSquareMeterYear,
  })
  if (energy.status === 'unsupported') return null

  const usesElectricityFactor = energy.electricity.energyKwhPerYear > 0
  const usesHeatingFactor = energy.heating.energyKwhPerYear > 0
  const usesAnyFactor = usesElectricityFactor || usesHeatingFactor

  const commonInputs: EnergymapBuildingInfoProvenanceInputId[] = [
    STATIC_INPUT_IDS.RYHTI_FLOOR_AREA,
    electricityInput,
    heatingInput,
    STATIC_INPUT_IDS.RYHTI_HEATING_SOURCE,
    ...(scenarioPrefix === 'elecb' || scenarioPrefix === 'delec'
      ? [STATIC_INPUT_IDS.RYHTI_HEATING_METHOD]
      : []),
    STATIC_INPUT_IDS.CARRIER_RESOLUTION,
    STATIC_INPUT_IDS.INTENSITY_TIMES_AREA,
    ...(usesAnyFactor
      ? [
          STATIC_INPUT_IDS.KWH_TO_MWH,
          STATIC_INPUT_IDS.COMPONENT_FACTOR_MULTIPLICATION,
        ]
      : []),
    STATIC_INPUT_IDS.COMPLETE_ONLY_AGGREGATION,
  ]

  if (kind === 'co2') {
    return unique([
      ...commonInputs,
      ...(usesElectricityFactor
        ? (['referenceFactor.co2.electricity'] as const)
        : []),
      ...(usesHeatingFactor
        ? ([`referenceFactor.co2.${carrier.value}`] as const)
        : []),
    ])
  }

  const buildingClass = resolveCurrentReferenceBuildingClass(mainPurpose)
  if (buildingClass.status === 'unsupported') {
    return null
  }

  const electricityFactorId =
    `referenceFactor.cost.${buildingClass.value}.electricity` as const
  const heatingFactorId =
    `referenceFactor.cost.${buildingClass.value}.${carrier.value}` as const
  const activeFactorIds = unique([
    ...(usesElectricityFactor ? [electricityFactorId] : []),
    ...(usesHeatingFactor ? [heatingFactorId] : []),
  ])
  if (
    activeFactorIds.some(
      (factorId) =>
        ENERGYMAP_BUILDING_INFO_PROVENANCE_INPUT_DEFINITIONS[factorId]
          .supported === false
    )
  ) {
    return null
  }

  return unique([
    STATIC_INPUT_IDS.RYHTI_BUILDING_TYPE,
    STATIC_INPUT_IDS.BUILDING_CLASS_RESOLUTION,
    ...commonInputs,
    ...activeFactorIds,
  ])
}

const evidenceVariant = ({
  inputIds,
  sourceProperties = [],
  sourceLanguage,
  valueSourceIds,
  valueProviderIds,
  valueCalculationIds,
}: {
  inputIds: readonly EnergymapBuildingInfoProvenanceInputId[]
  sourceProperties?: readonly string[]
  sourceLanguage?: 'fi' | 'sv'
  valueSourceIds?: readonly EnergymapBuildingInfoProvenanceSourceId[]
  valueProviderIds?: readonly EnergymapBuildingInfoProvenanceProviderId[]
  valueCalculationIds?: readonly EnergymapBuildingInfoProvenanceCalculationId[]
}): EvidenceVariant => ({
  inputIds: unique(inputIds),
  sourceProperties: unique(sourceProperties),
  ...(sourceLanguage == null ? {} : { sourceLanguage }),
  ...(valueSourceIds == null
    ? {}
    : { valueSourceIds: unique(valueSourceIds) }),
  ...(valueProviderIds == null
    ? {}
    : { valueProviderIds: unique(valueProviderIds) }),
  ...(valueCalculationIds == null
    ? {}
    : { valueCalculationIds: unique(valueCalculationIds) }),
})

const modelOutputVariants = ({
  measure,
  estimateType,
  annual,
}: {
  measure: ScenarioMeasure
  estimateType: EnergyEstimateType
  annual: boolean
}) =>
  SCENARIO_PREFIXES.flatMap((prefix) => {
    const modelOutputId = getEnergymapModelOutputProvenanceInputId({
      prefix,
      measure,
      estimateType,
    })
    if (modelOutputId == null) return []

    const sourceProperty = `${prefix}_${measure}_${estimateType}`
    return [
      evidenceVariant({
        inputIds: [
          modelOutputId,
          ...(annual
            ? ([
                STATIC_INPUT_IDS.RYHTI_FLOOR_AREA,
                STATIC_INPUT_IDS.INTENSITY_TIMES_AREA,
              ] as const)
            : []),
        ],
        sourceProperties: [sourceProperty, ...(annual ? ['floor_area'] : [])],
      }),
    ]
  })

const scenarioSavingsVariants = (
  measure: Exclude<ScenarioMeasure, 'default'>
) =>
  SCENARIO_PREFIXES.flatMap((prefix) => {
    const baselineInputId = getEnergymapModelOutputProvenanceInputId({
      prefix,
      measure: 'default',
      estimateType: 'total',
    })
    const scenarioInputId = getEnergymapModelOutputProvenanceInputId({
      prefix,
      measure,
      estimateType: 'total',
    })
    if (baselineInputId == null || scenarioInputId == null) return []

    return [
      evidenceVariant({
        inputIds: [
          baselineInputId,
          scenarioInputId,
          STATIC_INPUT_IDS.SCENARIO_SAVINGS,
        ],
        sourceProperties: [
          `${prefix}_default_total`,
          `${prefix}_${measure}_total`,
        ],
      }),
    ]
  })

const estimatedValueNoteVariants = [
  ...(['total', 'heat', 'elec'] as const).flatMap((estimateType) => [
    ...modelOutputVariants({
      measure: 'default',
      estimateType,
      annual: false,
    }),
    ...modelOutputVariants({
      measure: 'default',
      estimateType,
      annual: true,
    }),
  ]),
  ...(['aahp', 'solar', 'windows'] as const).flatMap((measure) => [
    ...modelOutputVariants({
      measure,
      estimateType: 'total',
      annual: false,
    }),
    ...modelOutputVariants({
      measure,
      estimateType: 'total',
      annual: true,
    }),
    ...scenarioSavingsVariants(measure),
  ]),
]

const currentReferenceSourceProperties = ({
  kind,
  prefix,
}: {
  kind: 'cost' | 'co2'
  prefix: ScenarioPrefix
}) => [
  ...(kind === 'cost' ? ['main_purpose'] : []),
  'floor_area',
  `${prefix}_default_elec`,
  `${prefix}_default_heat`,
  'heating_energy_source',
  ...(prefix === 'elecb' || prefix === 'delec' ? ['heating_method'] : []),
]

const currentReferenceVariants = (kind: 'cost' | 'co2') => {
  const mainPurposes =
    kind === 'cost' ? (['05', '06'] as const) : ([undefined] as const)
  const componentActivityCases = [
    { electricityIntensity: 1, heatingIntensity: 1 },
    { electricityIntensity: 1, heatingIntensity: 0 },
    { electricityIntensity: 0, heatingIntensity: 1 },
    { electricityIntensity: 0, heatingIntensity: 0 },
  ] as const

  return mainPurposes.flatMap((mainPurpose) =>
    SCENARIO_PREFIXES.flatMap((prefix) =>
      componentActivityCases.flatMap(
        ({ electricityIntensity, heatingIntensity }) => {
          const inputIds = getEnergymapCurrentReferenceProvenanceInputIds({
            kind,
            scenarioPrefix: prefix,
            mainPurpose,
            floorAreaSquareMeters: 1,
            defaultElectricityIntensityKwhPerSquareMeterYear:
              electricityIntensity,
            defaultHeatingIntensityKwhPerSquareMeterYear: heatingIntensity,
          })
          return inputIds == null
            ? []
            : [
                evidenceVariant({
                  inputIds,
                  valueSourceIds: unique(
                    inputIds.flatMap((inputId) => {
                      const sourceId =
                        ENERGYMAP_BUILDING_INFO_PROVENANCE_INPUT_DEFINITIONS[
                          inputId
                        ].sourceId
                      return sourceId == null ? [] : [sourceId]
                    })
                  ),
                  valueProviderIds: unique(
                    inputIds.flatMap(
                      (inputId) =>
                        ENERGYMAP_BUILDING_INFO_PROVENANCE_INPUT_DEFINITIONS[
                          inputId
                        ].providerIds ?? []
                    )
                  ),
                  valueCalculationIds: unique([
                    kind === 'cost'
                      ? 'currentReferenceCost'
                      : 'currentReferenceCo2',
                    ...inputIds.flatMap((inputId) => {
                      const calculationId =
                        ENERGYMAP_BUILDING_INFO_PROVENANCE_INPUT_DEFINITIONS[
                          inputId
                        ].calculationId
                      return calculationId == null ? [] : [calculationId]
                    }),
                  ]),
                  sourceProperties: currentReferenceSourceProperties({
                    kind,
                    prefix,
                  }),
                }),
              ]
        }
      )
    )
  )
}

export const ENERGYMAP_MODELED_CLASS_REQUIRED_PROVENANCE_INPUT_IDS = [
  STATIC_INPUT_IDS.MODELED_CLASS_OUTPUT,
  STATIC_INPUT_IDS.CLASS_ORIGIN_MODELED,
] as const satisfies readonly EnergymapBuildingInfoProvenanceInputId[]

export const ENERGYMAP_MODELED_CLASS_OPTIONAL_PROVENANCE_INPUT_IDS = [
  STATIC_INPUT_IDS.MODEL_CLASS_BUILDING_TYPE,
  STATIC_INPUT_IDS.MODEL_CLASS_COMPLETION_DATE,
  STATIC_INPUT_IDS.MODEL_CLASS_HEATING_SOURCE,
  STATIC_INPUT_IDS.MODEL_CLASS_HEATING_METHOD,
  STATIC_INPUT_IDS.MODEL_CLASS_FLOOR_AREA,
  STATIC_INPUT_IDS.MODEL_CLASS_TOTAL_AREA,
  STATIC_INPUT_IDS.MODEL_CLASS_GROSS_FLOOR_AREA,
  STATIC_INPUT_IDS.MODEL_CLASS_STOREYS,
  STATIC_INPUT_IDS.MODEL_CLASS_AREA_SOURCE,
] as const satisfies readonly EnergymapBuildingInfoProvenanceInputId[]

export const ENERGYMAP_MODELED_CLASS_DOCUMENTED_METHOD_INPUT_IDS = [
  STATIC_INPUT_IDS.MODEL_CLASS_BUILDING_TYPE,
  STATIC_INPUT_IDS.MODEL_CLASS_COMPLETION_DATE,
  STATIC_INPUT_IDS.MODEL_CLASS_HEATING_SOURCE,
  STATIC_INPUT_IDS.MODEL_CLASS_HEATING_METHOD,
  STATIC_INPUT_IDS.MODEL_CLASS_FLOOR_AREA,
  STATIC_INPUT_IDS.MODEL_CLASS_TOTAL_AREA,
  STATIC_INPUT_IDS.MODEL_CLASS_GROSS_FLOOR_AREA,
  STATIC_INPUT_IDS.MODEL_CLASS_STOREYS,
  STATIC_INPUT_IDS.MODEL_CLASS_REFERENCE_TABLES,
  STATIC_INPUT_IDS.MODEL_CLASS_2018_LIMITS,
  STATIC_INPUT_IDS.MODELED_CLASS_METHOD,
] as const satisfies readonly EnergymapBuildingInfoProvenanceInputId[]

const getPositiveModeledClassNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null
  }

  if (typeof value !== 'string' || value.trim() === '') return null

  const parsedValue = Number(value.trim().replace(',', '.'))
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null
}

const getModeledClassCode = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return String(value).padStart(2, '0')
  }

  if (typeof value !== 'string') return null

  const normalizedValue = value.trim()
  return normalizedValue === '' ? null : normalizedValue
}

const getModeledClassCompletionYear = (value: unknown): string | null => {
  if (typeof value !== 'string' && typeof value !== 'number') return null

  const normalizedValue = String(value).trim()
  const leadingYearMatch = normalizedValue.match(/^(\d{4})/)
  if (leadingYearMatch != null) return leadingYearMatch[1]

  const timestamp = Date.parse(normalizedValue)
  return Number.isFinite(timestamp)
    ? String(new Date(timestamp).getUTCFullYear())
    : null
}

const MODELED_CLASS_AREA_INPUT_BY_SOURCE = {
  floor_area: STATIC_INPUT_IDS.MODEL_CLASS_FLOOR_AREA,
  total_area: STATIC_INPUT_IDS.MODEL_CLASS_TOTAL_AREA,
  gross_floor_area: STATIC_INPUT_IDS.MODEL_CLASS_GROSS_FLOOR_AREA,
} as const

const getModeledClassHeatingInputIds = ({
  mainPurpose,
  heatingEnergySource,
  heatingMethod,
}: {
  mainPurpose: unknown
  heatingEnergySource: unknown
  heatingMethod: unknown
}): readonly EnergymapBuildingInfoProvenanceInputId[] => {
  const buildingClass = resolveCurrentReferenceBuildingClass(mainPurpose)
  const source = getModeledClassCode(heatingEnergySource)
  const method = getModeledClassCode(heatingMethod)
  if (buildingClass.status === 'unsupported' || source == null) return []

  const sourceOnlySupported = ['01', '02', '09', '1101', '1104'].includes(
    source
  )
  const woodSupported =
    source === '07' && buildingClass.value === 'detachedHouse'
  const electricSupported =
    source === '04' &&
    (method === '03' ||
      (method === '01' && buildingClass.value === 'detachedHouse'))

  if (!sourceOnlySupported && !woodSupported && !electricSupported) return []

  return [
    STATIC_INPUT_IDS.MODEL_CLASS_HEATING_SOURCE,
    ...(electricSupported
      ? ([STATIC_INPUT_IDS.MODEL_CLASS_HEATING_METHOD] as const)
      : []),
  ]
}

export const getEnergymapModeledClassProvenanceEvidence = ({
  mainPurpose,
  completionDate,
  heatingEnergySource,
  heatingMethod,
  floorArea,
  totalArea,
  grossFloorArea,
  numberOfStoreys,
  areaSource,
  includeOutput = true,
}: {
  mainPurpose: unknown
  completionDate?: unknown
  heatingEnergySource?: unknown
  heatingMethod?: unknown
  floorArea: unknown
  totalArea: unknown
  grossFloorArea: unknown
  numberOfStoreys: unknown
  areaSource?: unknown
  includeOutput?: boolean
}): EvidenceVariant => {
  const buildingClass = resolveCurrentReferenceBuildingClass(mainPurpose)
  const normalizedAreaSource =
    typeof areaSource === 'string' ? areaSource.trim() : ''
  const areaInputId = Object.hasOwn(
    MODELED_CLASS_AREA_INPUT_BY_SOURCE,
    normalizedAreaSource
  )
    ? MODELED_CLASS_AREA_INPUT_BY_SOURCE[
        normalizedAreaSource as keyof typeof MODELED_CLASS_AREA_INPUT_BY_SOURCE
      ]
    : null
  const areaValue =
    normalizedAreaSource === 'floor_area'
      ? floorArea
      : normalizedAreaSource === 'total_area'
        ? totalArea
        : normalizedAreaSource === 'gross_floor_area'
          ? grossFloorArea
          : null
  const hasDirectAreaEvidence =
    buildingClass.status === 'supported' &&
    buildingClass.value === 'detachedHouse' &&
    areaInputId != null &&
    getPositiveModeledClassNumber(areaValue) != null

  const inputIds = unique([
    ...(includeOutput ? [STATIC_INPUT_IDS.MODELED_CLASS_OUTPUT] : []),
    STATIC_INPUT_IDS.CLASS_ORIGIN_MODELED,
    ...(buildingClass.status === 'supported'
      ? [STATIC_INPUT_IDS.MODEL_CLASS_BUILDING_TYPE]
      : []),
    ...(getModeledClassCompletionYear(completionDate) == null
      ? []
      : [STATIC_INPUT_IDS.MODEL_CLASS_COMPLETION_DATE]),
    ...getModeledClassHeatingInputIds({
      mainPurpose,
      heatingEnergySource,
      heatingMethod,
    }),
    ...(buildingClass.status === 'supported' &&
    buildingClass.value === 'apartmentBuilding' &&
    getPositiveModeledClassNumber(numberOfStoreys) != null
      ? [STATIC_INPUT_IDS.MODEL_CLASS_STOREYS]
      : []),
    ...(hasDirectAreaEvidence && areaInputId != null
      ? [areaInputId, STATIC_INPUT_IDS.MODEL_CLASS_AREA_SOURCE]
      : []),
  ])

  return evidenceVariant({
    inputIds,
    sourceProperties: inputIds.flatMap((inputId) => {
      const sourceProperty =
        ENERGYMAP_BUILDING_INFO_PROVENANCE_INPUT_DEFINITIONS[inputId]
          .sourceProperty
      return sourceProperty == null ? [] : [sourceProperty]
    }),
  })
}

export const getEnergymapModeledClassProvenanceInputIds = ({
  mainPurpose,
  completionDate,
  heatingEnergySource,
  heatingMethod,
  floorArea,
  totalArea,
  grossFloorArea,
  numberOfStoreys,
  areaSource,
}: {
  mainPurpose: unknown
  completionDate?: unknown
  heatingEnergySource?: unknown
  heatingMethod?: unknown
  floorArea: unknown
  totalArea: unknown
  grossFloorArea: unknown
  numberOfStoreys: unknown
  areaSource?: unknown
}): readonly EnergymapBuildingInfoProvenanceInputId[] =>
  getEnergymapModeledClassProvenanceEvidence({
    mainPurpose,
    completionDate,
    heatingEnergySource,
    heatingMethod,
    floorArea,
    totalArea,
    grossFloorArea,
    numberOfStoreys,
    areaSource,
  }).inputIds

export const ENERGYMAP_DERIVED_WATER_PROVENANCE_INPUT_IDS = [
  STATIC_INPUT_IDS.RYHTI_FLOOR_AREA,
  STATIC_INPUT_IDS.OCCUPANCY_REFERENCE,
  STATIC_INPUT_IDS.RESIDENT_ESTIMATE,
  STATIC_INPUT_IDS.WATER_CUBIC_METERS_PER_YEAR,
  STATIC_INPUT_IDS.ANNUAL_WATER,
] as const satisfies readonly EnergymapBuildingInfoProvenanceInputId[]

export const ENERGYMAP_USER_OVERRIDE_WATER_PROVENANCE_INPUT_IDS = [
  STATIC_INPUT_IDS.USER_RESIDENT_COUNT,
  STATIC_INPUT_IDS.WATER_CUBIC_METERS_PER_YEAR,
  STATIC_INPUT_IDS.ANNUAL_WATER,
] as const satisfies readonly EnergymapBuildingInfoProvenanceInputId[]

export const ENERGYMAP_DERIVED_WATER_RESIDENT_CONTROL_PROVENANCE_INPUT_IDS = [
  STATIC_INPUT_IDS.RYHTI_FLOOR_AREA,
  STATIC_INPUT_IDS.OCCUPANCY_REFERENCE,
  STATIC_INPUT_IDS.RESIDENT_ESTIMATE,
] as const satisfies readonly EnergymapBuildingInfoProvenanceInputId[]

export const ENERGYMAP_USER_OVERRIDE_WATER_RESIDENT_CONTROL_PROVENANCE_INPUT_IDS =
  [
    STATIC_INPUT_IDS.USER_RESIDENT_COUNT,
  ] as const satisfies readonly EnergymapBuildingInfoProvenanceInputId[]

export type EnergymapEffectiveWaterProjection = {
  calculationResult: CurrentReferenceAnnualWaterResult
  value: EnergymapBuildingInfoValue
  residentCountControl: EnergymapBuildingInfoResidentCountControl
}

export const getEnergymapEffectiveWaterProjection = ({
  value,
  residentCountControl,
  isOverrideEnabled,
  manualResidentCount,
}: {
  value: EnergymapBuildingInfoValue
  residentCountControl: EnergymapBuildingInfoResidentCountControl
  isOverrideEnabled: boolean
  manualResidentCount: number | null
}): EnergymapEffectiveWaterProjection => {
  const calculationResult = calculateCurrentReferenceAnnualWater(
    isOverrideEnabled ? manualResidentCount : residentCountControl.defaultValue
  )

  if (!isOverrideEnabled) {
    return {
      calculationResult,
      value: { ...value },
      residentCountControl: { ...residentCountControl },
    }
  }

  const {
    sourceProperties: _valueSourceProperties,
    provenance: _valueProvenance,
    ...valueWithoutDefaultEvidence
  } = value
  const {
    sourceProperties: _controlSourceProperties,
    provenance: _controlProvenance,
    ...controlWithoutDefaultEvidence
  } = residentCountControl
  const effectiveResidentCountControl = {
    ...controlWithoutDefaultEvidence,
    provenance: {
      id: ENERGYMAP_BUILDING_INFO_PROVENANCE_IDS.WATER_RESIDENT_COUNT_CONTROL,
      inputIds:
        ENERGYMAP_USER_OVERRIDE_WATER_RESIDENT_CONTROL_PROVENANCE_INPUT_IDS,
    },
  }

  if (calculationResult.status === 'unsupported') {
    return {
      calculationResult,
      value: {
        text: residentCountControl.unavailableText,
        status: 'missing',
      },
      residentCountControl: effectiveResidentCountControl,
    }
  }

  return {
    calculationResult,
    value: {
      ...valueWithoutDefaultEvidence,
      provenance: {
        id: ENERGYMAP_BUILDING_INFO_PROVENANCE_IDS.WATER_ANNUAL,
        inputIds: ENERGYMAP_USER_OVERRIDE_WATER_PROVENANCE_INPUT_IDS,
      },
    },
    residentCountControl: effectiveResidentCountControl,
  }
}

const defineCatalogEntry = ({
  categoryId,
  ...definition
}: Omit<EnergymapBuildingInfoProvenanceDefinition, 'categoryKey'>) => ({
  ...definition,
  categoryId,
  categoryKey: ENERGYMAP_BUILDING_INFO_PROVENANCE_CATEGORIES[categoryId].key,
})

const modeledDefinition = ({
  id,
  field,
  estimateType,
  annual,
}: {
  id: EnergymapBuildingInfoCatalogProvenanceId
  field: string
  estimateType: EnergyEstimateType
  annual: boolean
}) =>
  defineCatalogEntry({
    id,
    fieldKey: provenanceKey(`fields.${field}`),
    categoryId: annual ? 'compositeCalculation' : 'modeledOutput',
    sourceIds: [
      'energyMapConsumptionModel',
      ...(annual ? (['ryhtiBuildingData'] as const) : []),
    ],
    providerIds: ['energyMap'],
    ...(annual ? { calculationIds: ['intensityTimesArea'] as const } : {}),
    metadataIds: ['modeledNotMeasuredCaveat'],
    evidenceVariants: modelOutputVariants({
      measure: 'default',
      estimateType,
      annual,
    }),
  })

const scenarioDefinition = ({
  id,
  field,
  measure,
  kind,
}: {
  id: EnergymapBuildingInfoCatalogProvenanceId
  field: string
  measure: Exclude<ScenarioMeasure, 'default'>
  kind: 'annual' | 'perSquareMeter' | 'savings'
}) =>
  defineCatalogEntry({
    id,
    fieldKey: provenanceKey(`fields.${field}`),
    categoryId:
      kind === 'perSquareMeter' ? 'modeledOutput' : 'compositeCalculation',
    sourceIds: [
      'energyMapConsumptionModel',
      ...(kind === 'annual' ? (['ryhtiBuildingData'] as const) : []),
    ],
    providerIds: ['energyMap'],
    ...(kind === 'annual'
      ? { calculationIds: ['intensityTimesArea'] as const }
      : kind === 'savings'
        ? { calculationIds: ['scenarioSavings'] as const }
        : {}),
    metadataIds: ['modeledNotMeasuredCaveat'],
    evidenceVariants:
      kind === 'savings'
        ? scenarioSavingsVariants(measure)
        : modelOutputVariants({
            measure,
            estimateType: 'total',
            annual: kind === 'annual',
          }),
  })

const currentReferenceDefinition = ({
  id,
  field,
  kind,
}: {
  id: EnergymapBuildingInfoCatalogProvenanceId
  field: string
  kind: 'cost' | 'co2'
}) =>
  defineCatalogEntry({
    id,
    fieldKey: provenanceKey(`fields.${field}`),
    categoryId: 'compositeCalculation',
    sourceIds: [
      'ryhtiBuildingData',
      'energyMapConsumptionModel',
      kind === 'cost'
        ? 'currentReferencePrices'
        : 'currentReferenceEmissionFactors',
    ],
    providerIds: ['energyMap'],
    calculationIds: [
      ...(kind === 'cost' ? (['buildingClassResolution'] as const) : []),
      'carrierResolution',
      kind === 'cost' ? 'currentReferenceCost' : 'currentReferenceCo2',
      'intensityTimesArea',
      'completeOnlyAggregation',
    ],
    metadataIds: [
      'referenceVersion',
      'referenceLastReviewed',
      'modeledNotMeasuredCaveat',
      kind === 'cost' ? 'costReferenceCaveat' : 'co2AccountingBoundary',
    ],
    includeCurrentReferenceMetadata: true,
    evidenceVariants: currentReferenceVariants(kind),
  })

const IDS = ENERGYMAP_BUILDING_INFO_PROVENANCE_IDS
const I = STATIC_INPUT_IDS

const ADDRESS_EVIDENCE_VARIANTS = [
  evidenceVariant({
    inputIds: [I.RYHTI_ADDRESS, I.COMPOSE_ADDRESS],
    sourceProperties: ['address_fin'],
  }),
  evidenceVariant({
    inputIds: [I.RYHTI_POSTAL_CODE, I.COMPOSE_ADDRESS],
    sourceProperties: ['postal_code'],
  }),
  evidenceVariant({
    inputIds: [I.RYHTI_POSTAL_OFFICE, I.COMPOSE_ADDRESS],
    sourceProperties: ['postal_office_fin'],
  }),
  evidenceVariant({
    inputIds: [I.RYHTI_ADDRESS, I.RYHTI_POSTAL_CODE, I.COMPOSE_ADDRESS],
    sourceProperties: ['address_fin', 'postal_code'],
  }),
  evidenceVariant({
    inputIds: [I.RYHTI_ADDRESS, I.RYHTI_POSTAL_OFFICE, I.COMPOSE_ADDRESS],
    sourceProperties: ['address_fin', 'postal_office_fin'],
  }),
  evidenceVariant({
    inputIds: [I.RYHTI_POSTAL_CODE, I.RYHTI_POSTAL_OFFICE, I.COMPOSE_ADDRESS],
    sourceProperties: ['postal_code', 'postal_office_fin'],
  }),
  evidenceVariant({
    inputIds: [
      I.RYHTI_ADDRESS,
      I.RYHTI_POSTAL_CODE,
      I.RYHTI_POSTAL_OFFICE,
      I.COMPOSE_ADDRESS,
    ],
    sourceProperties: ['address_fin', 'postal_code', 'postal_office_fin'],
  }),
] as const

export const ENERGYMAP_BUILDING_INFO_PROVENANCE_CATALOG = {
  [IDS.CURRENT_TOTAL_ANNUAL]: modeledDefinition({
    id: IDS.CURRENT_TOTAL_ANNUAL,
    field: 'current_total_annual',
    estimateType: 'total',
    annual: true,
  }),
  [IDS.CURRENT_TOTAL_PER_SQUARE_METER]: modeledDefinition({
    id: IDS.CURRENT_TOTAL_PER_SQUARE_METER,
    field: 'current_total_per_square_meter',
    estimateType: 'total',
    annual: false,
  }),
  [IDS.CURRENT_HEATING_ANNUAL]: modeledDefinition({
    id: IDS.CURRENT_HEATING_ANNUAL,
    field: 'current_heating_annual',
    estimateType: 'heat',
    annual: true,
  }),
  [IDS.CURRENT_HEATING_PER_SQUARE_METER]: modeledDefinition({
    id: IDS.CURRENT_HEATING_PER_SQUARE_METER,
    field: 'current_heating_per_square_meter',
    estimateType: 'heat',
    annual: false,
  }),
  [IDS.CURRENT_ELECTRICITY_ANNUAL]: modeledDefinition({
    id: IDS.CURRENT_ELECTRICITY_ANNUAL,
    field: 'current_electricity_annual',
    estimateType: 'elec',
    annual: true,
  }),
  [IDS.CURRENT_ELECTRICITY_PER_SQUARE_METER]: modeledDefinition({
    id: IDS.CURRENT_ELECTRICITY_PER_SQUARE_METER,
    field: 'current_electricity_per_square_meter',
    estimateType: 'elec',
    annual: false,
  }),
  [IDS.WATER_ANNUAL]: defineCatalogEntry({
    id: IDS.WATER_ANNUAL,
    fieldKey: provenanceKey('fields.water_annual'),
    categoryId: 'compositeCalculation',
    sourceIds: ['currentReferenceWater'],
    providerIds: ['energyMap'],
    calculationIds: ['annualWater'],
    metadataIds: ['referenceVersion', 'referenceLastReviewed'],
    includeCurrentReferenceMetadata: true,
    evidenceVariants: [
      evidenceVariant({
        inputIds: ENERGYMAP_DERIVED_WATER_PROVENANCE_INPUT_IDS,
        sourceProperties: ['floor_area'],
      }),
      evidenceVariant({
        inputIds: ENERGYMAP_USER_OVERRIDE_WATER_PROVENANCE_INPUT_IDS,
      }),
    ],
  }),
  [IDS.COST_ANNUAL]: currentReferenceDefinition({
    id: IDS.COST_ANNUAL,
    field: 'cost_annual',
    kind: 'cost',
  }),
  [IDS.CO2_ANNUAL]: currentReferenceDefinition({
    id: IDS.CO2_ANNUAL,
    field: 'co2_annual',
    kind: 'co2',
  }),
  [IDS.WATER_RESIDENT_COUNT_CONTROL]: defineCatalogEntry({
    id: IDS.WATER_RESIDENT_COUNT_CONTROL,
    fieldKey: provenanceKey('fields.water_resident_count_control'),
    categoryId: 'frontendDerived',
    sourceIds: [],
    metadataIds: ['referenceVersion', 'referenceLastReviewed'],
    includeCurrentReferenceMetadata: true,
    evidenceVariants: [
      evidenceVariant({
        inputIds: ENERGYMAP_DERIVED_WATER_RESIDENT_CONTROL_PROVENANCE_INPUT_IDS,
        sourceProperties: ['floor_area'],
        valueSourceIds: ['currentReferenceOccupancy'],
        valueProviderIds: ['energyMap'],
      }),
      evidenceVariant({
        inputIds:
          ENERGYMAP_USER_OVERRIDE_WATER_RESIDENT_CONTROL_PROVENANCE_INPUT_IDS,
        valueSourceIds: ['userResidentCount'],
        valueProviderIds: ['user'],
      }),
    ],
  }),
  [IDS.ESTIMATED_CONSUMPTION_NOTE]: defineCatalogEntry({
    id: IDS.ESTIMATED_CONSUMPTION_NOTE,
    fieldKey: provenanceKey('fields.estimated_consumption_note'),
    categoryId: 'modeledOutput',
    sourceIds: ['energyMapConsumptionModel'],
    providerIds: ['energyMap'],
    metadataIds: ['modeledNotMeasuredCaveat'],
    evidenceVariants: [
      evidenceVariant({ inputIds: [I.MODEL_CONSUMPTION_REFERENCE] }),
    ],
  }),
  [IDS.ESTIMATED_VALUE_NOTE]: defineCatalogEntry({
    id: IDS.ESTIMATED_VALUE_NOTE,
    fieldKey: provenanceKey('fields.estimated_consumption_note'),
    categoryId: 'modeledOutput',
    sourceIds: ['energyMapConsumptionModel'],
    providerIds: ['energyMap'],
    metadataIds: ['modeledNotMeasuredCaveat'],
    evidenceVariants: estimatedValueNoteVariants,
  }),
  [IDS.COST_MODE_CONTEXT]: currentReferenceDefinition({
    id: IDS.COST_MODE_CONTEXT,
    field: 'cost_mode_context',
    kind: 'cost',
  }),
  [IDS.CO2_MODE_CONTEXT]: currentReferenceDefinition({
    id: IDS.CO2_MODE_CONTEXT,
    field: 'co2_mode_context',
    kind: 'co2',
  }),
  [IDS.CERTIFICATE_RECOMMENDATIONS]: defineCatalogEntry({
    id: IDS.CERTIFICATE_RECOMMENDATIONS,
    fieldKey: provenanceKey('fields.certificate_recommendations'),
    categoryId: 'officialCertificate',
    sourceIds: ['energyCertificateRegister'],
    providerIds: ['energyCertificateRegister'],
    metadataIds: ['sourceLanguage'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.CERTIFICATE_RECOMMENDATIONS_FI],
        sourceProperties: ['energy_certificate_recommendations_fi'],
        sourceLanguage: 'fi',
      }),
      evidenceVariant({
        inputIds: [I.CERTIFICATE_RECOMMENDATIONS_SV],
        sourceProperties: ['energy_certificate_recommendations_sv'],
        sourceLanguage: 'sv',
      }),
    ],
  }),
  [IDS.SCENARIO_AAHP_ANNUAL]: scenarioDefinition({
    id: IDS.SCENARIO_AAHP_ANNUAL,
    field: 'scenario_aahp_annual',
    measure: 'aahp',
    kind: 'annual',
  }),
  [IDS.SCENARIO_AAHP_PER_SQUARE_METER]: scenarioDefinition({
    id: IDS.SCENARIO_AAHP_PER_SQUARE_METER,
    field: 'scenario_aahp_per_square_meter',
    measure: 'aahp',
    kind: 'perSquareMeter',
  }),
  [IDS.SCENARIO_AAHP_SAVINGS]: scenarioDefinition({
    id: IDS.SCENARIO_AAHP_SAVINGS,
    field: 'scenario_aahp_savings',
    measure: 'aahp',
    kind: 'savings',
  }),
  [IDS.SCENARIO_SOLAR_ANNUAL]: scenarioDefinition({
    id: IDS.SCENARIO_SOLAR_ANNUAL,
    field: 'scenario_solar_annual',
    measure: 'solar',
    kind: 'annual',
  }),
  [IDS.SCENARIO_SOLAR_PER_SQUARE_METER]: scenarioDefinition({
    id: IDS.SCENARIO_SOLAR_PER_SQUARE_METER,
    field: 'scenario_solar_per_square_meter',
    measure: 'solar',
    kind: 'perSquareMeter',
  }),
  [IDS.SCENARIO_SOLAR_SAVINGS]: scenarioDefinition({
    id: IDS.SCENARIO_SOLAR_SAVINGS,
    field: 'scenario_solar_savings',
    measure: 'solar',
    kind: 'savings',
  }),
  [IDS.SCENARIO_WINDOWS_ANNUAL]: scenarioDefinition({
    id: IDS.SCENARIO_WINDOWS_ANNUAL,
    field: 'scenario_windows_annual',
    measure: 'windows',
    kind: 'annual',
  }),
  [IDS.SCENARIO_WINDOWS_PER_SQUARE_METER]: scenarioDefinition({
    id: IDS.SCENARIO_WINDOWS_PER_SQUARE_METER,
    field: 'scenario_windows_per_square_meter',
    measure: 'windows',
    kind: 'perSquareMeter',
  }),
  [IDS.SCENARIO_WINDOWS_SAVINGS]: scenarioDefinition({
    id: IDS.SCENARIO_WINDOWS_SAVINGS,
    field: 'scenario_windows_savings',
    measure: 'windows',
    kind: 'savings',
  }),
  [IDS.BUILDING_ADDRESS]: defineCatalogEntry({
    id: IDS.BUILDING_ADDRESS,
    fieldKey: provenanceKey('fields.building_address'),
    categoryId: 'frontendDerived',
    sourceIds: ['ryhtiBuildingData'],
    providerIds: ['ryhti', 'energyMap'],
    calculationIds: ['composeAddress'],
    evidenceVariants: ADDRESS_EVIDENCE_VARIANTS,
  }),
  [IDS.BUILDING_IDENTIFIER]: defineCatalogEntry({
    id: IDS.BUILDING_IDENTIFIER,
    fieldKey: provenanceKey('fields.building_identifier'),
    categoryId: 'buildingRegistry',
    sourceIds: ['ryhtiBuildingData'],
    providerIds: ['ryhti'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.RYHTI_BUILDING_IDENTIFIER],
        sourceProperties: ['permanent_building_identifier'],
      }),
    ],
  }),
  [IDS.CONSTRUCTION_YEAR]: defineCatalogEntry({
    id: IDS.CONSTRUCTION_YEAR,
    fieldKey: provenanceKey('fields.construction_year'),
    categoryId: 'frontendDerived',
    sourceIds: ['ryhtiBuildingData'],
    providerIds: ['ryhti', 'energyMap'],
    calculationIds: ['parseConstructionYear'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.RYHTI_COMPLETION_DATE, I.PARSE_CONSTRUCTION_YEAR],
        sourceProperties: ['completion_date'],
      }),
    ],
  }),
  [IDS.BUILDING_TYPE]: defineCatalogEntry({
    id: IDS.BUILDING_TYPE,
    fieldKey: provenanceKey('fields.building_type'),
    categoryId: 'buildingRegistry',
    sourceIds: ['ryhtiBuildingData'],
    providerIds: ['ryhti'],
    calculationIds: ['localizeBuildingType'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.RYHTI_BUILDING_TYPE, I.LOCALIZE_BUILDING_TYPE],
        sourceProperties: ['main_purpose'],
      }),
    ],
  }),
  [IDS.ENERGY_CLASS_OFFICIAL]: defineCatalogEntry({
    id: IDS.ENERGY_CLASS_OFFICIAL,
    fieldKey: provenanceKey('fields.energy_class_official'),
    categoryId: 'officialCertificate',
    sourceIds: ['energyCertificateRegister'],
    providerIds: ['energyCertificateRegister'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.CERTIFICATE_CURRENT_CLASS, I.CLASS_ORIGIN_OFFICIAL],
        sourceProperties: ['energy_class', 'is_energy_class_modeled'],
      }),
    ],
  }),
  [IDS.ENERGY_CLASS_MODELED]: defineCatalogEntry({
    id: IDS.ENERGY_CLASS_MODELED,
    fieldKey: provenanceKey('fields.energy_class_modeled'),
    categoryId: 'modeledOutput',
    sourceIds: ['energyMapModeledClass'],
    providerIds: ['energyMap'],
    calculationIds: ['modeledClass2018'],
    metadataIds: ['modeledClass2018'],
    modelYear: 2018,
    evidencePolicy: {
      requiredInputIds: ENERGYMAP_MODELED_CLASS_REQUIRED_PROVENANCE_INPUT_IDS,
      optionalInputIds: ENERGYMAP_MODELED_CLASS_OPTIONAL_PROVENANCE_INPUT_IDS,
    },
    documentedMethodInputIds:
      ENERGYMAP_MODELED_CLASS_DOCUMENTED_METHOD_INPUT_IDS,
  }),
  [IDS.ENERGY_CLASS_ORIGIN_UNAVAILABLE]: defineCatalogEntry({
    id: IDS.ENERGY_CLASS_ORIGIN_UNAVAILABLE,
    fieldKey: provenanceKey('fields.energy_class_origin_unavailable'),
    categoryId: 'originUnavailable',
    sourceIds: ['energyMapSelectedBuildingDataset'],
    metadataIds: ['energyClassOriginUnavailable'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.SELECTED_BUILDING_CURRENT_CLASS],
        sourceProperties: ['energy_class'],
      }),
      evidenceVariant({
        inputIds: [
          I.SELECTED_BUILDING_CURRENT_CLASS,
          I.SELECTED_BUILDING_INVALID_CLASS_ORIGIN,
        ],
        sourceProperties: ['energy_class', 'is_energy_class_modeled'],
      }),
    ],
  }),
  [IDS.ENERGY_CLASS_MODELED_INDICATOR]: defineCatalogEntry({
    id: IDS.ENERGY_CLASS_MODELED_INDICATOR,
    fieldKey: provenanceKey('fields.energy_class_modeled_indicator'),
    categoryId: 'modeledOutput',
    sourceIds: ['energyMapModeledClass'],
    providerIds: ['energyMap'],
    calculationIds: ['modeledClass2018'],
    metadataIds: ['modeledClass2018'],
    modelYear: 2018,
    evidencePolicy: {
      requiredInputIds: [I.CLASS_ORIGIN_MODELED],
      optionalInputIds: ENERGYMAP_MODELED_CLASS_OPTIONAL_PROVENANCE_INPUT_IDS,
    },
    documentedMethodInputIds:
      ENERGYMAP_MODELED_CLASS_DOCUMENTED_METHOD_INPUT_IDS,
  }),
  [IDS.CERTIFICATE_VALIDITY]: defineCatalogEntry({
    id: IDS.CERTIFICATE_VALIDITY,
    fieldKey: provenanceKey('fields.certificate_validity'),
    categoryId: 'officialCertificate',
    sourceIds: ['energyCertificateRegister'],
    providerIds: ['energyCertificateRegister'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.CERTIFICATE_VALID_UNTIL],
        sourceProperties: ['energy_certificate_valid_until'],
      }),
    ],
  }),
  [IDS.PREVIOUS_ENERGY_CLASS]: defineCatalogEntry({
    id: IDS.PREVIOUS_ENERGY_CLASS,
    fieldKey: provenanceKey('fields.previous_energy_class'),
    categoryId: 'officialCertificate',
    sourceIds: ['energyCertificateRegister'],
    providerIds: ['energyCertificateRegister'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.CERTIFICATE_PREVIOUS_CLASS],
        sourceProperties: ['energy_certificate_previous_class'],
      }),
    ],
  }),
  [IDS.HEATING]: defineCatalogEntry({
    id: IDS.HEATING,
    fieldKey: provenanceKey('fields.heating'),
    categoryId: 'frontendDerived',
    sourceIds: ['ryhtiBuildingData'],
    providerIds: ['ryhti', 'energyMap'],
    calculationIds: ['combineHeatingFacts'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.RYHTI_HEATING_SOURCE, I.COMBINE_HEATING_FACTS],
        sourceProperties: ['heating_energy_source'],
      }),
      evidenceVariant({
        inputIds: [I.RYHTI_HEATING_METHOD, I.COMBINE_HEATING_FACTS],
        sourceProperties: ['heating_method'],
      }),
      evidenceVariant({
        inputIds: [
          I.RYHTI_HEATING_SOURCE,
          I.RYHTI_HEATING_METHOD,
          I.COMBINE_HEATING_FACTS,
        ],
        sourceProperties: ['heating_energy_source', 'heating_method'],
      }),
    ],
  }),
  [IDS.HEATED_NET_AREA]: defineCatalogEntry({
    id: IDS.HEATED_NET_AREA,
    fieldKey: provenanceKey('fields.heated_net_area'),
    categoryId: 'officialCertificate',
    sourceIds: ['energyCertificateRegister'],
    providerIds: ['energyCertificateRegister'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.CERTIFICATE_HEATED_NET_AREA],
        sourceProperties: ['energy_certificate_heated_net_area'],
      }),
    ],
  }),
  [IDS.VENTILATION]: defineCatalogEntry({
    id: IDS.VENTILATION,
    fieldKey: provenanceKey('fields.ventilation'),
    categoryId: 'officialCertificate',
    sourceIds: ['energyCertificateRegister'],
    providerIds: ['energyCertificateRegister'],
    metadataIds: ['sourceLanguage'],
    evidenceVariants: [
      evidenceVariant({
        inputIds: [I.CERTIFICATE_VENTILATION_FI],
        sourceProperties: ['energy_certificate_ventilation_description_fi'],
        sourceLanguage: 'fi',
      }),
      evidenceVariant({
        inputIds: [I.CERTIFICATE_VENTILATION_SV],
        sourceProperties: ['energy_certificate_ventilation_description_sv'],
        sourceLanguage: 'sv',
      }),
    ],
  }),
} as const satisfies Record<
  EnergymapBuildingInfoCatalogProvenanceId,
  EnergymapBuildingInfoProvenanceDefinition
>

export type EnergymapBuildingInfoProvenanceUnsupportedReason =
  | 'missing-provenance'
  | 'unknown-identity'
  | 'unknown-input'
  | 'unsupported-input'
  | 'invalid-input-set'
  | 'source-property-mismatch'
  | 'unsupported-source-language'
  | 'insufficient-class-origin-evidence'

export type EnergymapBuildingInfoProvenanceResolution =
  | {
      status: 'resolved'
      definition: EnergymapBuildingInfoProvenanceDefinition
      category: (typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_CATEGORIES)[EnergymapBuildingInfoProvenanceCategoryId]
      valueSources: readonly (typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_SOURCES)[EnergymapBuildingInfoProvenanceSourceId][]
      valueProviders: readonly (typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_PROVIDERS)[EnergymapBuildingInfoProvenanceProviderId][]
      valueCalculations: readonly (typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_CALCULATIONS)[EnergymapBuildingInfoProvenanceCalculationId][]
      sources: readonly (typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_SOURCES)[EnergymapBuildingInfoProvenanceSourceId][]
      providers: readonly (typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_PROVIDERS)[EnergymapBuildingInfoProvenanceProviderId][]
      calculations: readonly (typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_CALCULATIONS)[EnergymapBuildingInfoProvenanceCalculationId][]
      inputs: readonly EnergymapBuildingInfoProvenanceInputDefinition[]
      selectedEvidence: readonly EnergymapBuildingInfoProvenanceInputDefinition[]
      documentedMethodInputs: readonly EnergymapBuildingInfoProvenanceInputDefinition[]
      metadata: {
        descriptors: readonly (typeof ENERGYMAP_BUILDING_INFO_PROVENANCE_METADATA)[EnergymapBuildingInfoProvenanceMetadataId][]
        sourceLanguage?: 'fi' | 'sv'
        referenceVersion?: string
        referenceLastReviewed?: string
        modelYear?: 2018
      }
    }
  | {
      status: 'unsupported'
      reason: EnergymapBuildingInfoProvenanceUnsupportedReason
      id?: string
      inputId?: string
    }

const hasDuplicates = (values: readonly string[]) =>
  new Set(values).size !== values.length

const hasSameValues = (left: readonly string[], right: readonly string[]) => {
  if (
    left.length !== right.length ||
    hasDuplicates(left) ||
    hasDuplicates(right)
  ) {
    return false
  }

  const rightValues = new Set(right)
  return left.every((value) => rightValues.has(value))
}

const getCatalogDefinition = (
  id: string
): EnergymapBuildingInfoProvenanceDefinition | null =>
  Object.hasOwn(ENERGYMAP_BUILDING_INFO_PROVENANCE_CATALOG, id)
    ? ENERGYMAP_BUILDING_INFO_PROVENANCE_CATALOG[
        id as EnergymapBuildingInfoCatalogProvenanceId
      ]
    : null

export const resolveEnergymapBuildingInfoProvenance = ({
  provenance,
  sourceProperties = [],
  sourceLanguage,
}: {
  provenance:
    | EnergymapBuildingInfoProvenanceRef
    | { id: string; inputIds?: readonly string[] }
    | null
    | undefined
  sourceProperties?: readonly string[]
  sourceLanguage?: string
}): EnergymapBuildingInfoProvenanceResolution => {
  if (provenance == null) {
    return { status: 'unsupported', reason: 'missing-provenance' }
  }

  const definition = getCatalogDefinition(provenance.id)
  if (definition == null) {
    return {
      status: 'unsupported',
      reason: 'unknown-identity',
      id: provenance.id,
    }
  }

  const inputIds = provenance.inputIds ?? []
  const inputs: EnergymapBuildingInfoProvenanceInputDefinition[] = []
  for (const inputId of inputIds) {
    if (
      !Object.hasOwn(
        ENERGYMAP_BUILDING_INFO_PROVENANCE_INPUT_DEFINITIONS,
        inputId
      )
    ) {
      return {
        status: 'unsupported',
        reason: 'unknown-input',
        id: provenance.id,
        inputId,
      }
    }

    const input =
      ENERGYMAP_BUILDING_INFO_PROVENANCE_INPUT_DEFINITIONS[
        inputId as EnergymapBuildingInfoProvenanceInputId
      ]
    if (input.supported === false) {
      return {
        status: 'unsupported',
        reason: 'unsupported-input',
        id: provenance.id,
        inputId,
      }
    }
    inputs.push(input)
  }
  const validatedInputIds = inputs.map(({ id }) => id)

  if (
    (definition.id === IDS.ENERGY_CLASS_OFFICIAL &&
      !validatedInputIds.includes(I.CLASS_ORIGIN_OFFICIAL)) ||
    ((definition.id === IDS.ENERGY_CLASS_MODELED ||
      definition.id === IDS.ENERGY_CLASS_MODELED_INDICATOR) &&
      !validatedInputIds.includes(I.CLASS_ORIGIN_MODELED))
  ) {
    return {
      status: 'unsupported',
      reason: 'insufficient-class-origin-evidence',
      id: provenance.id,
    }
  }

  let evidence: EvidenceVariant | undefined
  if (definition.evidencePolicy != null) {
    const { requiredInputIds, optionalInputIds } = definition.evidencePolicy
    const allowedInputIds = new Set([...requiredInputIds, ...optionalInputIds])
    if (
      hasDuplicates(inputIds) ||
      requiredInputIds.some(
        (inputId) => !validatedInputIds.includes(inputId)
      ) ||
      validatedInputIds.some((inputId) => !allowedInputIds.has(inputId))
    ) {
      return {
        status: 'unsupported',
        reason: 'invalid-input-set',
        id: provenance.id,
      }
    }

    const selectedAreaInputCount = [
      I.MODEL_CLASS_FLOOR_AREA,
      I.MODEL_CLASS_TOTAL_AREA,
      I.MODEL_CLASS_GROSS_FLOOR_AREA,
    ].filter((inputId) => validatedInputIds.includes(inputId)).length
    const hasAreaSource = validatedInputIds.includes(I.MODEL_CLASS_AREA_SOURCE)
    if (
      (hasAreaSource && selectedAreaInputCount !== 1) ||
      (!hasAreaSource && selectedAreaInputCount !== 0)
    ) {
      return {
        status: 'unsupported',
        reason: 'invalid-input-set',
        id: provenance.id,
      }
    }

    const expectedSourceProperties = unique(
      inputs.flatMap((input) =>
        input.sourceProperty == null ? [] : [input.sourceProperty]
      )
    )
    if (!hasSameValues(expectedSourceProperties, sourceProperties)) {
      return {
        status: 'unsupported',
        reason: 'source-property-mismatch',
        id: provenance.id,
      }
    }
    if (sourceLanguage != null) {
      return {
        status: 'unsupported',
        reason: 'unsupported-source-language',
        id: provenance.id,
      }
    }

    evidence = evidenceVariant({
      inputIds: validatedInputIds,
      sourceProperties,
    })
  } else {
    const inputVariants = (definition.evidenceVariants ?? []).filter(
      (variant) => hasSameValues(variant.inputIds, validatedInputIds)
    )
    if (inputVariants.length === 0) {
      return {
        status: 'unsupported',
        reason: 'invalid-input-set',
        id: provenance.id,
      }
    }

    const sourceVariants = inputVariants.filter((variant) =>
      hasSameValues(variant.sourceProperties, sourceProperties)
    )
    if (sourceVariants.length === 0) {
      return {
        status: 'unsupported',
        reason: 'source-property-mismatch',
        id: provenance.id,
      }
    }

    evidence = sourceVariants.find(
      (variant) => variant.sourceLanguage === sourceLanguage
    )
    if (evidence == null) {
      return {
        status: 'unsupported',
        reason: 'unsupported-source-language',
        id: provenance.id,
      }
    }
  }

  const documentedMethodInputs = (
    definition.documentedMethodInputIds ?? []
  ).map(
    (inputId) => ENERGYMAP_BUILDING_INFO_PROVENANCE_INPUT_DEFINITIONS[inputId]
  )

  const valueSourceIds = evidence.valueSourceIds ?? definition.sourceIds
  const valueProviderIds =
    evidence.valueProviderIds ?? definition.providerIds ?? []
  const valueCalculationIds =
    evidence.valueCalculationIds ?? definition.calculationIds ?? []
  const sourceIds = unique([
    ...valueSourceIds,
    ...inputs.flatMap((input) =>
      input.sourceId == null ? [] : [input.sourceId]
    ),
  ])
  const providerIds = unique([
    ...valueProviderIds,
    ...inputs.flatMap((input) => input.providerIds ?? []),
  ])
  const calculationIds = unique([
    ...valueCalculationIds,
    ...inputs.flatMap((input) =>
      input.calculationId == null ? [] : [input.calculationId]
    ),
  ])
  const metadataIds = unique([
    ...(definition.metadataIds ?? []),
    ...inputs.flatMap((input) => input.metadataIds ?? []),
  ])

  return {
    status: 'resolved',
    definition,
    category:
      ENERGYMAP_BUILDING_INFO_PROVENANCE_CATEGORIES[definition.categoryId],
    valueSources: valueSourceIds.map(
      (sourceId) => ENERGYMAP_BUILDING_INFO_PROVENANCE_SOURCES[sourceId]
    ),
    valueProviders: valueProviderIds.map(
      (providerId) => ENERGYMAP_BUILDING_INFO_PROVENANCE_PROVIDERS[providerId]
    ),
    valueCalculations: valueCalculationIds.map(
      (calculationId) =>
        ENERGYMAP_BUILDING_INFO_PROVENANCE_CALCULATIONS[calculationId]
    ),
    sources: sourceIds.map(
      (sourceId) => ENERGYMAP_BUILDING_INFO_PROVENANCE_SOURCES[sourceId]
    ),
    providers: providerIds.map(
      (providerId) => ENERGYMAP_BUILDING_INFO_PROVENANCE_PROVIDERS[providerId]
    ),
    calculations: calculationIds.map(
      (calculationId) =>
        ENERGYMAP_BUILDING_INFO_PROVENANCE_CALCULATIONS[calculationId]
    ),
    inputs,
    selectedEvidence: inputs,
    documentedMethodInputs,
    metadata: {
      descriptors: metadataIds.map(
        (metadataId) => ENERGYMAP_BUILDING_INFO_PROVENANCE_METADATA[metadataId]
      ),
      ...(evidence.sourceLanguage == null
        ? {}
        : { sourceLanguage: evidence.sourceLanguage }),
      ...(definition.includeCurrentReferenceMetadata
        ? {
            referenceVersion: CURRENT_REFERENCE_DATA.version,
            referenceLastReviewed: CURRENT_REFERENCE_DATA.lastReviewed,
          }
        : {}),
      ...(definition.modelYear == null
        ? {}
        : { modelYear: definition.modelYear }),
    },
  }
}
