'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import CarbonLineChart from 'applets/carbon/components/CarbonLineChart/CarbonLineChart'
import CarbonLineChartInner from 'applets/carbon/components/CarbonLineChart/CarbonLineChartInner'
import type {
  CalcFeature,
  CalcFeatureCollection,
  CalcFeatureProperties,
  CarbonData,
} from 'applets/carbon/common/types'

const FEATURE_YEARS = ['2024', '2050', '2070', '2090'] as const
const CHART_HEIGHT = 500
const MIN_CHART_WIDTH = 700

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
  plannedDiff,
  nochangeDiff,
}: {
  base: number
  plannedDiff: number
  nochangeDiff: number
}): CarbonData => ({
  planned: createYearValues(base, {
    [FEATURE_YEARS[1]]: plannedDiff,
    [FEATURE_YEARS[2]]: plannedDiff * 1.35,
    [FEATURE_YEARS[3]]: plannedDiff * 1.6,
  }),
  nochange: createYearValues(base, {
    [FEATURE_YEARS[1]]: nochangeDiff,
    [FEATURE_YEARS[2]]: nochangeDiff * 1.2,
    [FEATURE_YEARS[3]]: nochangeDiff * 1.35,
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
  area,
  baseTotal,
  plannedDiff,
  nochangeDiff,
  zoningCode = 'AK',
}: {
  id: string
  x: number
  y: number
  area: number
  baseTotal: number
  plannedDiff: number
  nochangeDiff: number
  zoningCode?: string
}): CalcFeature => {
  const areaHa = area / 10000
  const bioBaseTotal = baseTotal * 0.55
  const groundBaseTotal = baseTotal - bioBaseTotal
  const bioPlannedDiff = plannedDiff * 0.55
  const groundPlannedDiff = plannedDiff - bioPlannedDiff
  const bioNochangeDiff = nochangeDiff * 0.55
  const groundNochangeDiff = nochangeDiff - bioNochangeDiff

  const properties: CalcFeatureProperties = {
    id,
    area,
    zoning_code: zoningCode,
    bio_carbon_total: createCarbonData({
      base: bioBaseTotal,
      plannedDiff: bioPlannedDiff,
      nochangeDiff: bioNochangeDiff,
    }),
    ground_carbon_total: createCarbonData({
      base: groundBaseTotal,
      plannedDiff: groundPlannedDiff,
      nochangeDiff: groundNochangeDiff,
    }),
    bio_carbon_ha: createCarbonData({
      base: bioBaseTotal / areaHa,
      plannedDiff: bioPlannedDiff / areaHa,
      nochangeDiff: bioNochangeDiff / areaHa,
    }),
    ground_carbon_ha: createCarbonData({
      base: groundBaseTotal / areaHa,
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

const createFeatureCollection = (
  features: CalcFeature[]
): CalcFeatureCollection => ({
  type: 'FeatureCollection',
  features,
})

const primaryPlan = createFeatureCollection([
  createCalcFeature({
    id: 'central-green-block',
    x: 24.92,
    y: 60.16,
    area: 18000,
    baseTotal: 2400,
    plannedDiff: -420,
    nochangeDiff: -80,
  }),
  createCalcFeature({
    id: 'park-edge',
    x: 24.935,
    y: 60.16,
    area: 26000,
    baseTotal: 3100,
    plannedDiff: 260,
    nochangeDiff: 45,
    zoningCode: 'V',
  }),
])

const comparisonPlan = createFeatureCollection([
  createCalcFeature({
    id: 'harbor-comparison-a',
    x: 24.955,
    y: 60.16,
    area: 22000,
    baseTotal: 2850,
    plannedDiff: 320,
    nochangeDiff: 60,
  }),
  createCalcFeature({
    id: 'harbor-comparison-b',
    x: 24.97,
    y: 60.175,
    area: 30000,
    baseTotal: 3500,
    plannedDiff: 540,
    nochangeDiff: 90,
    zoningCode: 'C',
  }),
])

const minimalPlan = createFeatureCollection([])

const chartData = [primaryPlan, comparisonPlan]
const chartPlanNames = [
  'Keskustan viherkorttelin asemakaava',
  'Pitkan rannan osayleiskaavan ilmastovaikutusten vertailusuunnitelma',
]

const useDelayedReady = () => {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let secondFrame = 0
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setReady(true))
    })

    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [])

  return ready
}

const ReadyFrame = ({
  children,
  readyTestId,
  sx,
}: {
  children: React.ReactNode
  readyTestId: string
  sx?: React.ComponentProps<typeof Box>['sx']
}) => {
  const ready = useDelayedReady()

  return (
    <Box
      data-testid={ready ? readyTestId : `${readyTestId}-loading`}
      sx={sx}
    >
      {children}
    </Box>
  )
}

const OuterChartTotalSelectedState = () => {
  const rootRef = React.useRef<HTMLElement | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let firstFrame = 0
    let secondFrame = 0
    const timeoutId = window.setTimeout(() => {
      const buttons = rootRef.current?.querySelectorAll('button[aria-pressed]')
      buttons?.[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => setReady(true))
      })
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [])

  return (
    <Box
      ref={rootRef}
      data-testid={ready ? 'line-chart-total-ready' : 'line-chart-total-loading'}
      sx={{ width: '100%' }}
    >
      <CarbonLineChart
        data={chartData}
        featureYears={[...FEATURE_YEARS]}
        planNames={chartPlanNames}
      />
    </Box>
  )
}

const LegendHiddenState = () => {
  const rootRef = React.useRef<HTMLElement | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let firstFrame = 0
    let secondFrame = 0
    const timeoutId = window.setTimeout(() => {
      const firstLegendButton = rootRef.current?.querySelector(
        'button[aria-label^="Toggle chart series"]'
      )
      firstLegendButton?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      )

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => setReady(true))
      })
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [])

  return (
    <Box
      ref={rootRef}
      data-testid={
        ready
          ? 'line-chart-legend-hidden-ready'
          : 'line-chart-legend-hidden-loading'
      }
    >
      <CarbonLineChartInner
        data={chartData}
        featureYears={[...FEATURE_YEARS]}
        planNames={chartPlanNames}
        unitType="ha"
        width={900}
        height={CHART_HEIGHT}
      />
    </Box>
  )
}

const TooltipVisibleState = () => {
  const rootRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const triggerTooltip = () => {
      const overlay = rootRef.current?.querySelector(
        'svg g rect[fill="transparent"]'
      )

      if (!overlay) {
        return
      }

      const bounds = overlay.getBoundingClientRect()
      overlay.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: bounds.left + bounds.width * 0.62,
          clientY: bounds.top + bounds.height * 0.45,
        })
      )
    }

    let secondFrame = 0
    const firstFrame = window.requestAnimationFrame(() => {
      triggerTooltip()
      secondFrame = window.requestAnimationFrame(triggerTooltip)
    })

    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [])

  return (
    <Box ref={rootRef}>
      <CarbonLineChartInner
        data={chartData}
        featureYears={[...FEATURE_YEARS]}
        planNames={chartPlanNames}
        unitType="ha"
        width={900}
        height={CHART_HEIGHT}
      />
    </Box>
  )
}

export const hiilikarttaCarbonLineChartFixture: ComponentFixture = {
  id: 'hiilikartta-carbon-line-chart',
  label: 'Hiilikartta carbon line chart',
  description:
    'Report line chart unit toggle, VisX sizing, tooltip, legend, and minimal-data states.',
  sourceGlobs: [
    'src/applets/carbon/components/CarbonLineChart/CarbonLineChart.tsx',
    'src/applets/carbon/components/CarbonLineChart/CarbonLineChartInner.tsx',
    'src/applets/carbon/components/CarbonLineChart/index.ts',
    'src/common/component-fixtures/fixtures/HiilikarttaCarbonLineChartFixture.tsx',
  ],
  states: [
    {
      id: 'outer-hectare-default',
      label: 'Outer hectare default',
      description:
        'Full line chart with ResizeObserver sizing, hectare selected by default, two plans, and legend.',
      waitFor: '[data-testid="line-chart-outer-ready"]',
      canvasSx: {
        width: 940,
        alignItems: 'stretch',
        overflow: 'visible',
      },
      render: () => (
        <ReadyFrame readyTestId="line-chart-outer-ready" sx={{ width: '100%' }}>
          <CarbonLineChart
            data={chartData}
            featureYears={[...FEATURE_YEARS]}
            planNames={chartPlanNames}
          />
        </ReadyFrame>
      ),
    },
    {
      id: 'outer-total-selected',
      label: 'Outer total selected',
      description:
        'Full line chart after selecting the total unit button through fixture interaction.',
      waitFor: '[data-testid="line-chart-total-ready"]',
      canvasSx: {
        width: 940,
        alignItems: 'stretch',
        overflow: 'visible',
      },
      render: () => <OuterChartTotalSelectedState />,
    },
    {
      id: 'inner-total-multiple-plans',
      label: 'Inner total multiple plans',
      description:
        'Direct VisX chart in total mode with multiple plans and a long plan name.',
      canvasSx: {
        width: 940,
        alignItems: 'stretch',
        overflow: 'visible',
      },
      render: () => (
        <CarbonLineChartInner
          data={chartData}
          featureYears={[...FEATURE_YEARS]}
          planNames={chartPlanNames}
          unitType="total"
          width={900}
          height={CHART_HEIGHT}
        />
      ),
    },
    {
      id: 'tooltip-visible',
      label: 'Tooltip visible',
      description:
        'Direct chart with a deterministic mouse move over the overlay to show tooltip content.',
      waitFor: '[data-testid="carbon-line-chart-tooltip"]',
      canvasSx: {
        width: 940,
        alignItems: 'stretch',
        overflow: 'visible',
      },
      render: () => <TooltipVisibleState />,
    },
    {
      id: 'legend-series-hidden',
      label: 'Legend series hidden',
      description:
        'Direct chart after toggling one legend series off through native button behavior.',
      waitFor: '[data-testid="line-chart-legend-hidden-ready"]',
      canvasSx: {
        width: 940,
        alignItems: 'stretch',
        overflow: 'visible',
      },
      render: () => <LegendHiddenState />,
    },
    {
      id: 'narrow-overflow',
      label: 'Narrow overflow',
      description:
        'Outer line chart constrained below the chart minimum width so horizontal overflow remains available.',
      waitFor: '[data-testid="line-chart-narrow-ready"]',
      canvasSx: {
        width: 380,
        alignItems: 'stretch',
      },
      render: () => (
        <ReadyFrame
          readyTestId="line-chart-narrow-ready"
          sx={{ width: 340, overflowX: 'auto' }}
        >
          <CarbonLineChart
            data={chartData}
            featureYears={[...FEATURE_YEARS]}
            planNames={chartPlanNames}
          />
        </ReadyFrame>
      ),
    },
    {
      id: 'minimal-empty',
      label: 'Minimal empty',
      description:
        'Direct chart with a plan name but no plottable features, covering fallback domains.',
      canvasSx: {
        width: 780,
        alignItems: 'stretch',
        overflow: 'visible',
      },
      render: () => (
        <CarbonLineChartInner
          data={[minimalPlan]}
          featureYears={[...FEATURE_YEARS]}
          planNames={['Tyhja vertailusuunnitelma']}
          unitType="ha"
          width={MIN_CHART_WIDTH}
          height={CHART_HEIGHT}
        />
      ),
    },
  ],
}
