import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import CarbonChangeLegend from 'applets/carbon/components/CarbonChangeLegend'
import CarbonOverviewGraph from 'applets/carbon/components/CarbonOverviewGraph'
import GeomGraphic from 'applets/carbon/components/CarbonOverviewGraph/GeomGraphic'
import ReadMoreModal from 'applets/carbon/components/ReadMoreModal'
import type {
  CalcFeature,
  CalcFeatureCollection,
  CalcFeatureProperties,
  CarbonData,
  FeatureCalcs,
  PlanConfWithReportData,
  ReportData,
} from 'applets/carbon/common/types'

const FEATURE_YEARS = ['2024', '2050', '2070'] as const

type FeatureYear = (typeof FEATURE_YEARS)[number]

const createYearValues = (
  base: number,
  diffByYear: Partial<Record<FeatureYear, number>> = {}
) =>
  FEATURE_YEARS.reduce(
    (values, year) => ({
      ...values,
      [year]: base + (diffByYear[year] ?? 0),
    }),
    {} as Record<FeatureYear, number>
  )

const createCarbonData = ({
  base,
  diff,
  noData = false,
}: {
  base: number
  diff: number
  noData?: boolean
}): CarbonData => ({
  nochange: createYearValues(base),
  planned: noData
    ? {
        [FEATURE_YEARS[0]]: base,
        [FEATURE_YEARS[1]]: -1,
        [FEATURE_YEARS[2]]: -1,
      }
    : createYearValues(base, {
        [FEATURE_YEARS[1]]: diff,
        [FEATURE_YEARS[2]]: diff * 1.35,
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
  x,
  y,
  totalDiff,
  area = 4,
  noData = false,
}: {
  id: string
  x: number
  y: number
  totalDiff: number
  area?: number
  noData?: boolean
}): CalcFeature => {
  const bioTotalDiff = totalDiff * 0.55
  const groundTotalDiff = totalDiff - bioTotalDiff
  const bioHaDiff = bioTotalDiff / area
  const groundHaDiff = groundTotalDiff / area

  const properties: CalcFeatureProperties = {
    id,
    area,
    zoning_code: 'AK',
    bio_carbon_total: createCarbonData({
      base: 1200,
      diff: bioTotalDiff,
      noData,
    }),
    ground_carbon_total: createCarbonData({
      base: 900,
      diff: groundTotalDiff,
      noData,
    }),
    bio_carbon_ha: createCarbonData({
      base: 280,
      diff: bioHaDiff,
      noData,
    }),
    ground_carbon_ha: createCarbonData({
      base: 210,
      diff: groundHaDiff,
      noData,
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

const createFeatureCollection = (
  features: CalcFeature[]
): CalcFeatureCollection => ({
  type: 'FeatureCollection',
  features,
})

const createFeatureCalcs = ({
  totalDiff,
  totalArea,
}: {
  totalDiff: number
  totalArea: number
}): FeatureCalcs => {
  const bioTotal = totalDiff * 0.55
  const groundTotal = totalDiff - bioTotal
  const bioHa = bioTotal / totalArea
  const groundHa = groundTotal / totalArea

  return {
    bio_carbon_total_diff: {
      [FEATURE_YEARS[0]]: 0,
      [FEATURE_YEARS[1]]: bioTotal,
      [FEATURE_YEARS[2]]: bioTotal * 1.35,
    },
    ground_carbon_total_diff: {
      [FEATURE_YEARS[0]]: 0,
      [FEATURE_YEARS[1]]: groundTotal,
      [FEATURE_YEARS[2]]: groundTotal * 1.35,
    },
    bio_carbon_ha_diff: {
      [FEATURE_YEARS[0]]: 0,
      [FEATURE_YEARS[1]]: bioHa,
      [FEATURE_YEARS[2]]: bioHa * 1.35,
    },
    ground_carbon_ha_diff: {
      [FEATURE_YEARS[0]]: 0,
      [FEATURE_YEARS[1]]: groundHa,
      [FEATURE_YEARS[2]]: groundHa * 1.35,
    },
  }
}

const createReportData = ({
  features,
  totalDiff,
  totalArea,
  timestamp,
}: {
  features: CalcFeature[]
  totalDiff: number
  totalArea: number
  timestamp: number
}): ReportData => ({
  areas: createFeatureCollection(features),
  totals: createFeatureCollection([
    createCalcFeature({
      id: 'fixture-total-area',
      x: 24.92,
      y: 60.16,
      totalDiff,
      area: totalArea,
    }),
  ]),
  metadata: {
    timestamp,
    forestry_scenario: 1,
    reportName: 'fixture-report',
    featureYears: [...FEATURE_YEARS],
  },
  agg: {
    totals: createFeatureCalcs({ totalDiff, totalArea }),
  },
})

const negativeFeatures = createFeatureCollection([
  createCalcFeature({
    id: 'negative-area',
    x: 24.92,
    y: 60.16,
    totalDiff: -720,
  }),
])

const mixedFeatures = createFeatureCollection([
  createCalcFeature({
    id: 'mixed-shrink',
    x: 24.92,
    y: 60.16,
    totalDiff: -680,
  }),
  createCalcFeature({
    id: 'mixed-no-change',
    x: 24.935,
    y: 60.16,
    totalDiff: 0,
  }),
  createCalcFeature({
    id: 'mixed-grow',
    x: 24.92,
    y: 60.175,
    totalDiff: 420,
  }),
  createCalcFeature({
    id: 'mixed-no-data',
    x: 24.935,
    y: 60.175,
    totalDiff: 0,
    noData: true,
  }),
])

const overviewSinglePlan: PlanConfWithReportData = {
  serverId: 'fixture-overview-single',
  name: 'Keskustan viherkorttelin asemakaava',
  reportData: createReportData({
    features: mixedFeatures.features,
    totalDiff: -860,
    totalArea: 12,
    timestamp: 1704067200000,
  }),
}

const overviewMultiplePlans: PlanConfWithReportData[] = [
  overviewSinglePlan,
  {
    serverId: 'fixture-overview-comparison',
    name: 'Pitkan rannan osayleiskaavan ilmastovaikutusten vertailusuunnitelma',
    reportData: createReportData({
      features: [
        createCalcFeature({
          id: 'comparison-grow-a',
          x: 24.92,
          y: 60.16,
          totalDiff: 260,
          area: 5,
        }),
        createCalcFeature({
          id: 'comparison-grow-b',
          x: 24.935,
          y: 60.175,
          totalDiff: 310,
          area: 6,
        }),
      ],
      totalDiff: 570,
      totalArea: 11,
      timestamp: 1704153600000,
    }),
  },
]

const createForcedMediaQueryList = (
  query: string,
  matches: boolean
): MediaQueryList => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const mediaQueryList = {
    matches,
    media: query,
    onchange: null,
    addEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void
    ) => {
      listeners.add(listener)
    },
    removeEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void
    ) => {
      listeners.delete(listener)
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    dispatchEvent: (event: Event) => {
      listeners.forEach((listener) => {
        listener(event as MediaQueryListEvent)
      })

      return true
    },
  }

  return mediaQueryList as MediaQueryList
}

const subscribeToLegendViewportReady = (onStoreChange: () => void) => {
  const animationFrame = window.requestAnimationFrame(onStoreChange)

  return () => window.cancelAnimationFrame(animationFrame)
}

const getLegendViewportReadySnapshot = () => true
const getServerLegendViewportReadySnapshot = () => false

const ForcedLegendViewport = ({
  isNarrow,
  children,
}: {
  isNarrow: boolean
  children: React.ReactNode
}) => {
  const ready = React.useSyncExternalStore(
    subscribeToLegendViewportReady,
    getLegendViewportReadySnapshot,
    getServerLegendViewportReadySnapshot
  )

  React.useLayoutEffect(() => {
    const originalMatchMedia = window.matchMedia.bind(window)

    window.matchMedia = (query: string) => {
      if (query.includes('max-width')) {
        return createForcedMediaQueryList(query, isNarrow)
      }

      if (query.includes('min-width')) {
        return createForcedMediaQueryList(query, !isNarrow)
      }

      return originalMatchMedia(query)
    }

    return () => {
      window.matchMedia = originalMatchMedia
    }
  }, [isNarrow])

  return (
    <Box
      data-testid={ready ? 'legend-media-ready' : 'legend-media-loading'}
      sx={{ width: '100%' }}
    >
      {ready ? children : null}
    </Box>
  )
}

const ReadMoreModalOpenState = () => {
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      rootRef.current?.querySelector('button')?.click()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <Box ref={rootRef}>
      <ReadMoreModal />
    </Box>
  )
}

export const hiilikarttaReportOverviewFixture: ComponentFixture = {
  id: 'hiilikartta-report-overview',
  label: 'Hiilikartta report overview',
  description:
    'Report overview, geometry preview, carbon-change legend, and read-more modal states.',
  sourceGlobs: [
    'src/applets/carbon/components/CarbonChangeLegend.tsx',
    'src/applets/carbon/components/CarbonOverviewGraph/CarbonOverviewGraph.tsx',
    'src/applets/carbon/components/CarbonOverviewGraph/GeomGraphic.tsx',
    'src/applets/carbon/components/CarbonOverviewGraph/index.tsx',
    'src/applets/carbon/components/ReadMoreModal.tsx',
    'src/common/component-fixtures/fixtures/HiilikarttaReportOverviewFixture.tsx',
  ],
  states: [
    {
      id: 'legend-wide',
      label: 'Legend wide',
      description:
        'Horizontal carbon-change legend with wide viewport media forced on.',
      waitFor: '[data-testid="legend-media-ready"]',
      canvasSx: {
        width: 820,
        minHeight: 120,
      },
      render: () => (
        <ForcedLegendViewport isNarrow={false}>
          <CarbonChangeLegend />
        </ForcedLegendViewport>
      ),
    },
    {
      id: 'legend-narrow',
      label: 'Legend narrow',
      description:
        'Vertical carbon-change legend with narrow viewport media forced on.',
      waitFor: '[data-testid="legend-media-ready"]',
      canvasSx: {
        width: 340,
        minHeight: 360,
        alignItems: 'flex-start',
      },
      render: () => (
        <ForcedLegendViewport isNarrow>
          <CarbonChangeLegend />
        </ForcedLegendViewport>
      ),
    },
    {
      id: 'geom-negative',
      label: 'Geometry negative',
      description: 'Standalone geometry preview rendered with shrink colors.',
      render: () => (
        <GeomGraphic
          calcFeatures={negativeFeatures}
          year={FEATURE_YEARS[1]}
          width={220}
          height={220}
        />
      ),
    },
    {
      id: 'geom-mixed',
      label: 'Geometry mixed',
      description:
        'Standalone geometry preview with shrink, no-change, grow, and no-data colors.',
      render: () => (
        <GeomGraphic
          calcFeatures={mixedFeatures}
          year={FEATURE_YEARS[1]}
          width={260}
          height={240}
        />
      ),
    },
    {
      id: 'overview-single-plan',
      label: 'Overview single plan',
      description: 'Overview graph with one deterministic report plan.',
      canvasSx: {
        width: 820,
        alignItems: 'stretch',
      },
      render: () => (
        <CarbonOverviewGraph
          planConfs={[overviewSinglePlan]}
          featureYears={[...FEATURE_YEARS]}
        />
      ),
    },
    {
      id: 'overview-multiple-plans',
      label: 'Overview multiple plans',
      description:
        'Overview graph with two deterministic report plans and a long plan name.',
      canvasSx: {
        width: 920,
        alignItems: 'stretch',
      },
      render: () => (
        <CarbonOverviewGraph
          planConfs={overviewMultiplePlans}
          featureYears={[...FEATURE_YEARS]}
        />
      ),
    },
    {
      id: 'read-more-closed',
      label: 'Read more closed',
      description: 'Closed read-more modal trigger.',
      render: () => <ReadMoreModal />,
    },
    {
      id: 'read-more-open',
      label: 'Read more open',
      description: 'Read-more modal opened by deterministic fixture interaction.',
      waitFor: 'role=dialog',
      render: () => <ReadMoreModalOpenState />,
    },
  ],
}
