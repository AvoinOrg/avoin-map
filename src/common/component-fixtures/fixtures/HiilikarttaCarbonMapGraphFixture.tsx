import React from 'react'
import type { StyleSpecification } from 'maplibre-gl'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import CarbonMapGraph from 'applets/carbon/components/CarbonMapGraph'
import CarbonMapGraphTable from 'applets/carbon/components/CarbonMapGraph/CarbonMapGraphTable'
import type {
  CalcFeature,
  CalcFeatureCollection,
  CalcFeatureProperties,
  CarbonData,
  FeatureCalcs,
  GraphCalcType,
  MapGraphCalcFeature,
  MapGraphData,
  MapGraphDataSelectOption,
  PlanConfWithReportData,
  ReportData,
} from 'applets/carbon/common/types'
import { ZONING_CODE_COL } from 'applets/carbon/common/types'
import {
  getCarbonChangeColor,
  getCarbonValueForProperties,
} from 'applets/carbon/common/utils'

const FEATURE_YEARS = ['2024', '2050', '2070'] as const

const fixtureMapStyle = {
  version: 8,
  sources: {},
  layers: [],
} satisfies StyleSpecification

type FeatureYear = (typeof FEATURE_YEARS)[number]

const yearValues = (
  base: number,
  diffByYear: Partial<Record<FeatureYear, number>>
) =>
  FEATURE_YEARS.reduce(
    (values, year) => ({
      ...values,
      [year]: base + (diffByYear[year] ?? 0),
    }),
    {} as Record<FeatureYear, number>
  )

const carbonData = ({
  base,
  plannedDiff,
  nochangeDiff,
}: {
  base: number
  plannedDiff: number
  nochangeDiff: number
}): CarbonData => ({
  nochange: yearValues(base, {
    [FEATURE_YEARS[1]]: nochangeDiff,
    [FEATURE_YEARS[2]]: nochangeDiff * 1.3,
  }),
  planned: yearValues(base, {
    [FEATURE_YEARS[1]]: plannedDiff,
    [FEATURE_YEARS[2]]: plannedDiff * 1.45,
  }),
})

const squareCoordinates = (
  x: number,
  y: number,
  size: number
): [number, number][][] => [
  [
    [x, y],
    [x + size, y],
    [x + size, y + size],
    [x, y + size],
    [x, y],
  ],
]

const createCalcFeature = ({
  id,
  zoningCode,
  x,
  y,
  area,
  totalPlannedDiff,
  totalNochangeDiff,
}: {
  id: string
  zoningCode: string
  x: number
  y: number
  area: number
  totalPlannedDiff: number
  totalNochangeDiff: number
}): CalcFeature => {
  const areaHa = area / 10000
  const bioPlannedDiff = totalPlannedDiff * 0.6
  const groundPlannedDiff = totalPlannedDiff - bioPlannedDiff
  const bioNochangeDiff = totalNochangeDiff * 0.6
  const groundNochangeDiff = totalNochangeDiff - bioNochangeDiff

  const properties: CalcFeatureProperties = {
    id,
    area,
    [ZONING_CODE_COL]: zoningCode,
    bio_carbon_total: carbonData({
      base: 1200,
      plannedDiff: bioPlannedDiff,
      nochangeDiff: bioNochangeDiff,
    }),
    ground_carbon_total: carbonData({
      base: 950,
      plannedDiff: groundPlannedDiff,
      nochangeDiff: groundNochangeDiff,
    }),
    bio_carbon_ha: carbonData({
      base: 1200 / areaHa,
      plannedDiff: bioPlannedDiff / areaHa,
      nochangeDiff: bioNochangeDiff / areaHa,
    }),
    ground_carbon_ha: carbonData({
      base: 950 / areaHa,
      plannedDiff: groundPlannedDiff / areaHa,
      nochangeDiff: groundNochangeDiff / areaHa,
    }),
  }

  return {
    id,
    type: 'Feature',
    properties,
    geometry: {
      type: 'Polygon',
      coordinates: squareCoordinates(x, y, 0.012),
    },
  }
}

const featureCollection = (
  features: CalcFeature[]
): CalcFeatureCollection => ({
  type: 'FeatureCollection',
  features,
})

const emptyFeatureCalcs = (): FeatureCalcs => ({
  bio_carbon_total_diff: yearValues(0, {}),
  ground_carbon_total_diff: yearValues(0, {}),
  bio_carbon_ha_diff: yearValues(0, {}),
  ground_carbon_ha_diff: yearValues(0, {}),
})

const reportData = ({
  features,
  timestamp,
}: {
  features: CalcFeature[]
  timestamp: number
}): ReportData => ({
  areas: featureCollection(features),
  totals: featureCollection([
    createCalcFeature({
      id: 'fixture-total',
      zoningCode: 'AK',
      x: 24.95,
      y: 60.18,
      area: 44000,
      totalPlannedDiff: -680,
      totalNochangeDiff: -120,
    }),
  ]),
  metadata: {
    timestamp,
    forestry_scenario: 1,
    reportName: 'fixture-carbon-map-graph',
    featureYears: [...FEATURE_YEARS],
  },
  agg: {
    totals: emptyFeatureCalcs(),
  },
})

const primaryFeatures = [
  createCalcFeature({
    id: 'central-ak',
    zoningCode: 'AK',
    x: 24.92,
    y: 60.16,
    area: 16000,
    totalPlannedDiff: -420,
    totalNochangeDiff: -80,
  }),
  createCalcFeature({
    id: 'park-v',
    zoningCode: 'V',
    x: 24.935,
    y: 60.16,
    area: 18000,
    totalPlannedDiff: 260,
    totalNochangeDiff: 45,
  }),
  createCalcFeature({
    id: 'center-c',
    zoningCode: 'C',
    x: 24.92,
    y: 60.175,
    area: 10000,
    totalPlannedDiff: -120,
    totalNochangeDiff: -25,
  }),
]

const comparisonFeatures = [
  createCalcFeature({
    id: 'comparison-ak',
    zoningCode: 'AK',
    x: 24.955,
    y: 60.16,
    area: 12000,
    totalPlannedDiff: 180,
    totalNochangeDiff: 30,
  }),
  createCalcFeature({
    id: 'comparison-v',
    zoningCode: 'V',
    x: 24.97,
    y: 60.175,
    area: 21000,
    totalPlannedDiff: 540,
    totalNochangeDiff: 75,
  }),
]

const planConfs: PlanConfWithReportData[] = [
  {
    serverId: 'fixture-carbon-map-primary',
    name: 'Keskustan viherkorttelin asemakaava',
    reportData: reportData({
      features: primaryFeatures,
      timestamp: 1704067200000,
    }),
  },
  {
    serverId: 'fixture-carbon-map-comparison',
    name: 'Pitkan rannan osayleiskaavan ilmastovaikutusten vertailusuunnitelma',
    reportData: reportData({
      features: comparisonFeatures,
      timestamp: 1704153600000,
    }),
  },
]

const enrichFeature = ({
  feature,
  year,
  calcType,
  areaType,
}: {
  feature: CalcFeature
  year: string
  calcType: GraphCalcType
  areaType: string
}): MapGraphCalcFeature => {
  const valueHa =
    getCarbonValueForProperties(feature.properties, year, calcType, true) || 0
  const valueTotal =
    getCarbonValueForProperties(feature.properties, year, calcType, false) || 0
  const valueHaNochange =
    getCarbonValueForProperties(
      feature.properties,
      year,
      calcType,
      true,
      false
    ) || 0
  const valueTotalNochange =
    getCarbonValueForProperties(
      feature.properties,
      year,
      calcType,
      false,
      false
    ) || 0
  const zoningCode = feature.properties[ZONING_CODE_COL]

  return {
    ...feature,
    properties: {
      ...feature.properties,
      color: getCarbonChangeColor(valueHa),
      valueTotal,
      valueHa,
      colorNochange: getCarbonChangeColor(valueHaNochange),
      valueTotalNochange,
      valueHaNochange,
      isHidden: areaType !== 'all' && !zoningCode.startsWith(areaType),
    },
  }
}

const createMapGraphDatas = ({
  year,
  calcType,
  areaType,
}: {
  year: string
  calcType: GraphCalcType
  areaType: string
}): MapGraphData[] =>
  planConfs.map((planConf) => ({
    id: planConf.serverId,
    name: planConf.name,
    data: {
      ...planConf.reportData.areas,
      features: planConf.reportData.areas.features.map((feature) =>
        enrichFeature({ feature, year, calcType, areaType })
      ),
    },
  }))

const GraphFixtureState = ({
  initialYear,
  initialCalcType,
  initialAreaType,
  initialActiveDataOption,
}: {
  initialYear?: string
  initialCalcType?: GraphCalcType
  initialAreaType?: string
  initialActiveDataOption?: MapGraphDataSelectOption
}) => (
  <Box sx={{ width: '100%' }}>
    <CarbonMapGraph
      planConfs={planConfs}
      featureYears={[...FEATURE_YEARS]}
      initialYear={initialYear}
      initialCalcType={initialCalcType}
      initialAreaType={initialAreaType}
      initialActiveDataOption={initialActiveDataOption}
      mapStyle={fixtureMapStyle}
    />
  </Box>
)

export const hiilikarttaCarbonMapGraphFixture: ComponentFixture = {
  id: 'hiilikartta-carbon-map-graph',
  label: 'Hiilikartta carbon map graph',
  description:
    'Report carbon map graph controls, MapLibre overlay, legend integration, and summary table states.',
  sourceGlobs: [
    'src/applets/carbon/components/CarbonMapGraph/CarbonMapGraph.tsx',
    'src/applets/carbon/components/CarbonMapGraph/CarbonMapGraphMap.tsx',
    'src/applets/carbon/components/CarbonMapGraph/CarbonMapGraphTable.tsx',
    'src/applets/carbon/components/CarbonMapGraph/index.tsx',
    'src/common/component-fixtures/fixtures/HiilikarttaCarbonMapGraphFixture.tsx',
  ],
  states: [
    {
      id: 'default-graph',
      label: 'Default graph',
      description:
        'Full map graph with default total calculation, first comparison year, all zoning types, two plans, legend, and table.',
      waitFor: '[data-map-graph-rendered="true"]',
      canvasSx: {
        width: 920,
        minHeight: 980,
        alignItems: 'stretch',
        overflow: 'visible',
      },
      render: () => <GraphFixtureState />,
    },
    {
      id: 'alternate-current-filtered',
      label: 'Alternate current filtered',
      description:
        'Full map graph initialized to the alternate year, ground-carbon calculation, V zoning filter, and current-situation plan option.',
      waitFor: '[data-map-graph-rendered="true"]',
      canvasSx: {
        width: 920,
        minHeight: 980,
        alignItems: 'stretch',
        overflow: 'visible',
      },
      render: () => (
        <GraphFixtureState
          initialYear={FEATURE_YEARS[2]}
          initialCalcType="ground"
          initialAreaType="V"
          initialActiveDataOption={{
            id: planConfs[1].serverId,
            isCurrent: true,
          }}
        />
      ),
    },
    {
      id: 'table-hidden-rows',
      label: 'Table hidden rows',
      description:
        'Summary table using bio-carbon values for the alternate year with non-V zoning rows hidden from totals.',
      canvasSx: {
        width: 780,
        alignItems: 'stretch',
      },
      render: () => (
        <Box sx={{ width: '100%' }}>
          <CarbonMapGraphTable
            datas={createMapGraphDatas({
              year: FEATURE_YEARS[2],
              calcType: 'bio',
              areaType: 'V',
            })}
            activeYear={FEATURE_YEARS[2]}
          />
        </Box>
      ),
    },
  ],
}
