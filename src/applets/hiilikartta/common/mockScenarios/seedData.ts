import type { Feature, Polygon } from 'geojson'

import { MOCK_AUTH_USER_ID } from '#/common/auth/mock'

import { DEFAULT_FORESTRY_SCENARIO } from '../constants'
import type {
  CalcFeature,
  CalcFeatureCollection,
  CalcFeatureProperties,
  CarbonData,
  FeatureCalcs,
  FeatureProperties,
  ForestryScenarioId,
  PlanData,
  ReportData,
} from '../types'
import { featureCols } from '../types'
import { getAggregatedCalcs } from '../utils'

type MockPolygon = Polygon & CalcFeature['geometry']

export const MOCK_PLAN_CREATED_AT = 1_735_689_600_000
export const MOCK_PLAN_SAVED_AT = 1_735_776_000_000
export const MOCK_REPORT_CALCULATED_AT = 1_735_776_120
export const MOCK_FEATURE_YEARS = ['2024', '2030', '2040', '2050'] as const
export const MOCK_PLAN_USER_ID = MOCK_AUTH_USER_ID

type LandUseDistribution = Pick<
  FeatureProperties,
  | 'landuse_built'
  | 'landuse_new_open_vegetation'
  | 'landuse_new_tree_vegetation'
  | 'landuse_existing'
  | 'soil_change_new_vegetation_pct'
>

const LAND_USE_BY_ZONING_CODE: Record<string, LandUseDistribution> = {
  AK: {
    landuse_built: 72,
    landuse_new_open_vegetation: 12,
    landuse_new_tree_vegetation: 11,
    landuse_existing: 5,
    soil_change_new_vegetation_pct: 0,
  },
  VP: {
    landuse_built: 7,
    landuse_new_open_vegetation: 7,
    landuse_new_tree_vegetation: 6,
    landuse_existing: 80,
    soil_change_new_vegetation_pct: 0,
  },
  VL: {
    landuse_built: 0,
    landuse_new_open_vegetation: 0,
    landuse_new_tree_vegetation: 0,
    landuse_existing: 100,
    soil_change_new_vegetation_pct: 0,
  },
}

const INVALID_LAND_USE_DISTRIBUTION: LandUseDistribution = {
  landuse_built: 72,
  landuse_new_open_vegetation: 12,
  landuse_new_tree_vegetation: 11,
  landuse_existing: 4,
  soil_change_new_vegetation_pct: 0,
}

const round = (value: number) => Math.round(value * 100) / 100

const createPolygon = ({
  offsetX,
  offsetY,
}: {
  offsetX: number
  offsetY: number
}): MockPolygon => {
  const coordinates: [number, number][][] = [
    [
      [24.93 + offsetX, 60.17 + offsetY],
      [24.934 + offsetX, 60.17 + offsetY],
      [24.934 + offsetX, 60.173 + offsetY],
      [24.93 + offsetX, 60.173 + offsetY],
      [24.93 + offsetX, 60.17 + offsetY],
    ],
  ]

  return {
    type: 'Polygon',
    coordinates,
  }
}

const createPlanFeature = ({
  areaHa,
  hasValidZoningCode = true,
  id,
  landUseDistribution,
  name,
  offsetX,
  offsetY,
  zoningCode,
}: {
  areaHa: number
  hasValidZoningCode?: boolean
  id: string
  landUseDistribution: LandUseDistribution
  name: FeatureProperties['name']
  offsetX: number
  offsetY: number
  zoningCode: string
}): Feature<Polygon, FeatureProperties> => ({
  id,
  type: 'Feature',
  geometry: createPolygon({ offsetX, offsetY }),
  properties: {
    id,
    name,
    area_ha: areaHa,
    zoning_code: zoningCode,
    ...landUseDistribution,
    extras: {
      hasValidZoningCode,
    },
  },
})

export const createMockValidPlanData = (): PlanData<Polygon> => ({
  type: 'FeatureCollection',
  features: [
    createPlanFeature({
      areaHa: 1.25,
      id: 'mock-area-ak',
      landUseDistribution: LAND_USE_BY_ZONING_CODE.AK,
      name: 'Mock residential block',
      offsetX: 0,
      offsetY: 0,
      zoningCode: 'AK',
    }),
    createPlanFeature({
      areaHa: 0.85,
      id: 'mock-area-vp',
      landUseDistribution: LAND_USE_BY_ZONING_CODE.VP,
      name: 'Mock park edge',
      offsetX: 0.006,
      offsetY: 0.001,
      zoningCode: 'VP',
    }),
    createPlanFeature({
      areaHa: 1.1,
      id: 'mock-area-vl',
      landUseDistribution: LAND_USE_BY_ZONING_CODE.VL,
      name: 'Mock recreation forest',
      offsetX: 0.012,
      offsetY: 0.003,
      zoningCode: 'VL',
    }),
  ],
})

export const createMockEmptyPlanData = (): PlanData => ({
  type: 'FeatureCollection',
  features: [],
})

export const createMockInvalidZoningPlanData = (): PlanData<Polygon> => ({
  type: 'FeatureCollection',
  features: [
    createPlanFeature({
      areaHa: 1.4,
      hasValidZoningCode: false,
      id: 'mock-invalid-zoning-area',
      landUseDistribution: LAND_USE_BY_ZONING_CODE.AK,
      name: 'Mock invalid zoning area',
      offsetX: 0.018,
      offsetY: 0.004,
      zoningCode: 'INVALID',
    }),
  ],
})

export const createMockAreasInvalidZoningPlanData = (): PlanData<Polygon> => ({
  type: 'FeatureCollection',
  features: [
    createPlanFeature({
      areaHa: 1.4,
      hasValidZoningCode: false,
      id: 'mock-invalid-zoning-area',
      landUseDistribution: LAND_USE_BY_ZONING_CODE.AK,
      name: 1,
      offsetX: 0.018,
      offsetY: 0.004,
      zoningCode: '',
    }),
  ],
})

export const createMockInvalidLandUsePlanData = (): PlanData<Polygon> => ({
  type: 'FeatureCollection',
  features: [
    createPlanFeature({
      areaHa: 1.4,
      id: 'mock-invalid-land-use-area',
      landUseDistribution: INVALID_LAND_USE_DISTRIBUTION,
      name: 'Mock invalid land use area',
      offsetX: 0.018,
      offsetY: 0.004,
      zoningCode: 'AK',
    }),
  ],
})

export const getMockPlanAreaHa = (data: PlanData) =>
  round(
    data.features.reduce(
      (sum, feature) => sum + (feature.properties.area_ha ?? 0),
      0
    )
  )

const createCarbonData = ({
  area,
  colIndex,
  featureIndex,
  forestryScenario,
  perHectare,
  zoningCode,
}: {
  area: number
  colIndex: number
  featureIndex: number
  forestryScenario: ForestryScenarioId
  perHectare: boolean
  zoningCode: string
}): CarbonData => {
  const zoningFactor =
    zoningCode === 'VL' || zoningCode === 'VP'
      ? 1.22
      : zoningCode === 'AK'
        ? 0.9
        : 1
  const scenarioFactor = 1 + forestryScenario * 0.045
  const base =
    (perHectare
      ? 7 + featureIndex * 1.75 + colIndex * 2.1
      : area * (42 + featureIndex * 6 + colIndex * 11)) * zoningFactor
  const nochange: Record<string, number> = {}
  const planned: Record<string, number> = {}

  MOCK_FEATURE_YEARS.forEach((year, yearIndex) => {
    const nochangeGrowth =
      yearIndex * (perHectare ? 1.35 : area * 5.5) * zoningFactor
    const plannedDelta =
      (yearIndex + 1) *
      scenarioFactor *
      (perHectare ? 0.95 : area * 4.25)

    nochange[year] = round(base + nochangeGrowth)
    planned[year] = round(base + nochangeGrowth + plannedDelta)
  })

  return { nochange, planned }
}

const createCalcFeatureProperties = ({
  area,
  featureIndex,
  forestryScenario,
  id,
  zoningCode,
}: {
  area: number
  featureIndex: number
  forestryScenario: ForestryScenarioId
  id: string
  zoningCode: string
}): CalcFeatureProperties => {
  const properties: Partial<CalcFeatureProperties> = {
    id,
    area,
    zoning_code: zoningCode,
  }

  featureCols.forEach((featureCol, colIndex) => {
    properties[featureCol] = createCarbonData({
      area,
      colIndex,
      featureIndex,
      forestryScenario,
      perHectare: featureCol.endsWith('_ha'),
      zoningCode,
    })
  })

  return properties as CalcFeatureProperties
}

const createCalcFeature = ({
  feature,
  forestryScenario,
  index,
}: {
  feature: PlanData<Polygon>['features'][number]
  forestryScenario: ForestryScenarioId
  index: number
}): CalcFeature => {
  const id = String(feature.properties.id ?? feature.id ?? `mock-area-${index}`)

  return {
    id,
    type: 'Feature',
    geometry: feature.geometry as MockPolygon,
    properties: createCalcFeatureProperties({
      area: feature.properties.area_ha ?? 1,
      featureIndex: index,
      forestryScenario,
      id,
      zoningCode: feature.properties.zoning_code ?? 'AK',
    }),
  }
}

const createTotalFeature = (areaFeatures: CalcFeature[]): CalcFeature => {
  const properties: Partial<CalcFeatureProperties> = {
    id: 'mock-total',
    area: round(
      areaFeatures.reduce((sum, feature) => sum + feature.properties.area, 0)
    ),
    zoning_code: 'TOTAL',
  }

  featureCols.forEach((featureCol) => {
    const nochange: Record<string, number> = {}
    const planned: Record<string, number> = {}

    MOCK_FEATURE_YEARS.forEach((year) => {
      nochange[year] = round(
        areaFeatures.reduce(
          (sum, feature) =>
            sum + Number(feature.properties[featureCol].nochange[year] ?? 0),
          0
        )
      )
      planned[year] = round(
        areaFeatures.reduce(
          (sum, feature) =>
            sum + Number(feature.properties[featureCol].planned[year] ?? 0),
          0
        )
      )
    })

    properties[featureCol] = { nochange, planned }
  })

  return {
    id: 'mock-total',
    type: 'Feature',
    geometry: createPolygon({ offsetX: 0.03, offsetY: 0.006 }),
    properties: properties as CalcFeatureProperties,
  }
}

export const createMockReportData = ({
  forestryScenario = DEFAULT_FORESTRY_SCENARIO,
  planData,
  reportName,
}: {
  forestryScenario?: ForestryScenarioId
  planData: PlanData<Polygon>
  reportName: string
}): ReportData => {
  const areas: CalcFeatureCollection = {
    type: 'FeatureCollection',
    features: planData.features.map((feature, index) =>
      createCalcFeature({ feature, forestryScenario, index })
    ),
  }
  const totals: CalcFeatureCollection = {
    type: 'FeatureCollection',
    features: [createTotalFeature(areas.features)],
  }
  const agg: { totals: FeatureCalcs } = {
    totals: getAggregatedCalcs(totals.features[0], [...MOCK_FEATURE_YEARS]),
  }

  return {
    areas,
    totals,
    metadata: {
      timestamp: MOCK_REPORT_CALCULATED_AT,
      forestry_scenario: forestryScenario,
      reportName,
      featureYears: [...MOCK_FEATURE_YEARS],
    },
    agg,
  }
}
