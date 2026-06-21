import React, { useCallback, useMemo, useState } from 'react'
import { Group } from '@visx/group'
import { scaleLinear } from '@visx/scale'
import { AxisLeft, AxisBottom } from '@visx/axis'
import { Line, LinePath } from '@visx/shape'
import { extent } from 'd3-array'
import { LinearGradient } from '@visx/gradient'
import { GridRows, GridColumns } from '@visx/grid'
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { GlyphCircle } from '@visx/glyph'
import { useTranslate } from '@tolgee/react'
import { scaleOrdinal } from 'd3-scale'
import { LegendOrdinal } from '@visx/legend'

import {
  Box,
  useTheme,
  type AppSystemStyleObject,
  type AppTheme,
} from '#/common/style/theme'
import { ButtonBase } from '#/components/common/Button'
import { getTextWidth } from '#/common/utils/styling'
import { pp } from '#/common/utils/general'

import type { CalcFeatureCollection, UnitType } from '../../common/types'

type DataItem = {
  valHa: number
  valTotal: number
  year: number
  lineIndex: number
}

type LegendLabelItem = {
  text: React.ReactNode
}

interface Props {
  data: CalcFeatureCollection[]
  featureYears: string[]
  planNames: string[]
  width: number
  height: number
  unitType?: UnitType
}

const legendButtonSx = {
  cursor: 'pointer',
  mr: '2rem',
  mt: '1rem',
  display: 'flex',
  alignItems: 'flex-start',
  width: '100%',
  minWidth: '500px',
  textAlign: 'left',
} satisfies AppSystemStyleObject

const chartSeriesColors = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
]

const VisxAxisBottom = AxisBottom as unknown as React.ElementType
const VisxAxisLeft = AxisLeft as unknown as React.ElementType
const VisxGlyphCircle = GlyphCircle as unknown as React.ElementType
const VisxGridColumns = GridColumns as unknown as React.ElementType
const VisxGridRows = GridRows as unknown as React.ElementType
const VisxGroup = Group as unknown as React.ElementType
const VisxLegendOrdinal = LegendOrdinal as unknown as React.ElementType
const VisxLine = Line as unknown as React.ElementType
const VisxLinearGradient = LinearGradient as unknown as React.ElementType
const VisxLinePath = LinePath as unknown as React.ElementType
const VisxTooltipWithBounds =
  TooltipWithBounds as unknown as React.ElementType

const getChartTextWidth = (text: string, font: string) => {
  if (typeof document === 'undefined') {
    return text.length * 8
  }

  return getTextWidth(text, font)
}

const CarbonLineChartInner = ({
  data,
  featureYears,
  planNames,
  width,
  height,
  unitType = 'ha',
}: Props) => {
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    showTooltip,
    hideTooltip,
  } = useTooltip<DataItem[]>()

  const { t } = useTranslate('hiilikartta')
  const units = {
    ha: t('report.carbon_line_chart.tooltip_unit_ha'),
    total: t('report.carbon_line_chart.tooltip_unit_total'),
  }
  const theme = useTheme<AppTheme>()
  const textStyle = {
    fontSize: theme.typography.body2.fontSize,
    fontFamily: theme.typography.body2.fontFamily,
    fontWeight: theme.typography.body2.fontWeight,
    letterSpacing: theme.typography.body2.letterSpacing,
  }

  const localData = useMemo(() => {
    const seriesDatas = []
    for (const [planIndex, item] of data.entries()) {
      const plannedLineIndex = planIndex * 2
      const nochangeLineIndex = plannedLineIndex + 1
      let dataItems: DataItem[] = []
      item.features.forEach((feature) => {
        for (const year of featureYears) {
          if (feature.properties.bio_carbon_ha.planned[year] != null) {
            const valHa =
              feature.properties.bio_carbon_ha.planned[year] +
              feature.properties.ground_carbon_ha.planned[year]

            const valTotal =
              feature.properties.bio_carbon_total.planned[year] +
              feature.properties.ground_carbon_total.planned[year]

            if (valHa != null && valTotal != null) {
              dataItems.push({
                valHa,
                valTotal,
                year: Number(year),
                lineIndex: plannedLineIndex,
              })
            }
          }
        }
      })

      seriesDatas.push(dataItems)

      dataItems = []

      item.features.forEach((feature) => {
        for (const year of featureYears) {
          if (feature.properties.bio_carbon_ha.nochange[year] != null) {
            const valHa =
              feature.properties.bio_carbon_ha.nochange[year] +
              feature.properties.ground_carbon_ha.nochange[year]

            const valTotal =
              feature.properties.bio_carbon_total.nochange[year] +
              feature.properties.ground_carbon_total.nochange[year]

            if (valHa != null && valTotal != null) {
              dataItems.push({
                valHa,
                valTotal,
                year: Number(year),
                lineIndex: nochangeLineIndex,
              })
            }
          }
        }
      })

      seriesDatas.push(dataItems)
    }

    return seriesDatas
  }, [data, featureYears])

  const localPlanNames = useMemo(() => {
    const currentSituationAppendix = t(
      'report.general.current_situation_appendix'
    )
    const localPlanNames = []

    for (const item of planNames) {
      localPlanNames.push(item)
      localPlanNames.push(item + ' ' + currentSituationAppendix)
    }

    return localPlanNames
  }, [planNames, t])

  const [hiddenLineIndexes, setHiddenLineIndexes] = useState<Set<number>>(
    () => new Set()
  )
  const lineVisibility = useMemo(
    () => localPlanNames.map((_, index) => !hiddenLineIndexes.has(index)),
    [hiddenLineIndexes, localPlanNames]
  )

  const toggleLineVisibility = useCallback((index: number) => {
    setHiddenLineIndexes((currentHiddenIndexes) => {
      const nextHiddenIndexes = new Set(currentHiddenIndexes)

      if (nextHiddenIndexes.has(index)) {
        nextHiddenIndexes.delete(index)
      } else {
        nextHiddenIndexes.add(index)
      }

      return nextHiddenIndexes
    })
  }, [])

  const colorScale = useMemo(() => {
    return scaleOrdinal(chartSeriesColors).domain(
      localPlanNames.map((_, index) => index.toString())
    )
  }, [localPlanNames])
  const getColorForIndex = (index: number): string => {
    return colorScale('' + index) as string
  }

  const margin = { top: 40, right: 40, bottom: 40, left: 80 }
  const yAxisUnitOffset = 10

  const getValue = useCallback((d: DataItem) => {
    if (unitType === 'ha') {
      return d.valHa
    }
    return d.valTotal
  }, [unitType])
  const getYear = (d: DataItem) => d.year

  const getDataForYear = useCallback((year: number) => {
    const yearData = []
    for (const item of localData) {
      const data = item.find((d) => d.year === year)
      if (data) {
        yearData.push(data)
      }
    }

    return yearData
  }, [localData])
  // const formatDate = (year: string) => localData.toString()

  const allDataItems = useMemo(() => localData.flat(), [localData])
  const yMax =
    allDataItems.length > 0
      ? Math.max(...allDataItems.map((d) => getValue(d)))
      : 0

  const numericFeatureYears = useMemo(
    () => featureYears.map(Number).filter(Number.isFinite),
    [featureYears]
  )
  const xDomain = useMemo((): [number, number] => {
    const dataExtent = extent(allDataItems, (d) => +getYear(d))
    const fallbackExtent = extent(numericFeatureYears)
    const lower = dataExtent[0] ?? fallbackExtent[0] ?? 0
    const upper = dataExtent[1] ?? fallbackExtent[1] ?? lower + 1

    if (lower === upper) {
      return [lower - 1, upper + 1]
    }

    return [lower, upper]
  }, [allDataItems, numericFeatureYears])

  const yAxisFormatter = useMemo(() => {
    // TODO: adjust the locale dynamically
    const formatter = new Intl.NumberFormat('en-FI', {
      maximumFractionDigits: 0,
    })
    return (value: unknown) => formatter.format(Number(value))
  }, [])

  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    backgroundColor: 'white',
    color: 'black',
  }

  const yAxisFont = `${textStyle.fontSize} ${textStyle.fontFamily}`

  const yAxisUnitText =
    unitType === 'ha'
      ? t('report.carbon_line_chart.y_unit_ha')
      : t('report.carbon_line_chart.y_unit_total')

  let longestLabelWidth = allDataItems.reduce((maxWidth, d) => {
    const labelWidth = getChartTextWidth(yAxisFormatter(getValue(d)), yAxisFont)
    return Math.max(maxWidth, labelWidth)
  }, 0)

  longestLabelWidth = Math.max(
    getChartTextWidth(yAxisUnitText, yAxisFont),
    longestLabelWidth
  )

  // Make room for both y-axis values and the unit label on the bottom left.
  const leftMarginPadding = 40
  margin.left = Math.max(
    40,
    Math.ceil(longestLabelWidth + leftMarginPadding + yAxisUnitOffset)
  )

  const innerWidth = Math.max(0, width - margin.left - margin.right)
  const innerHeight = Math.max(0, height - margin.top - margin.bottom)

  const xScale = scaleLinear({
    range: [0, innerWidth],
    domain: xDomain,
    nice: true,
  })

  const yScale = scaleLinear({
    range: [innerHeight, 0],
    domain: [-5, Math.max(0, yMax)],
    nice: true,
  })

  const handleTooltip = useCallback(
    (
      event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
    ) => {
      if (numericFeatureYears.length === 0) {
        hideTooltip()
        return
      }

      const { x } = localPoint(event) || { x: 0 }
      const x0 = xScale.invert(x - margin.left)

      // Find the closest year to the mouse position
      const closestYear = numericFeatureYears.reduce((prev, curr) =>
        Math.abs(curr - x0) < Math.abs(prev - x0) ? curr : prev
      )

      const tooltipData = getDataForYear(closestYear).filter(
        (d) => lineVisibility[d.lineIndex]
      )
      if (tooltipData.length > 0) {
        const tooltipLeftPosition = xScale(Number(closestYear)) + margin.left
        showTooltip({
          tooltipData,
          tooltipLeft: tooltipLeftPosition,
          tooltipTop: yScale(getValue(tooltipData[0])),
        })
      } else {
        hideTooltip()
      }
    },
    [
      showTooltip,
      hideTooltip,
      xScale,
      yScale,
      numericFeatureYears,
      getDataForYear,
      getValue,
      lineVisibility,
      margin.left,
    ]
  )

  const sortedTooltipData = useMemo(() => {
    if (tooltipData != null) {
      return [...tooltipData].sort((a, b) => getValue(b) - getValue(a))
    }
  }, [tooltipData, getValue])

  const chartLegend = (
    <Box sx={{ mt: 1, ml: 2 }}>
      <VisxLegendOrdinal
        scale={colorScale}
        labelFormat={(label: string) => localPlanNames[parseInt(label, 10)]}
        direction="row"
        itemMargin="8px 8px 8px 0"
        legendLabelProps={{ color: 'black' }}
        style={{
          paddingLeft: 0,
          color: 'black',
          display: 'flex',
          flexWrap: 'wrap', // Allows wrapping
        }}
      >
        {(labels: LegendLabelItem[]) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            {labels.map((label, i) => {
              const color = getColorForIndex(i)
              return (
                <ButtonBase
                  key={`legend-${i}`}
                  type="button"
                  onClick={() => toggleLineVisibility(i)}
                  aria-label={`Toggle chart series ${String(label.text)}`}
                  aria-pressed={lineVisibility[i]}
                  sx={legendButtonSx}
                >
                  <svg width={15} height={15}>
                    <rect
                      fill={lineVisibility[i] ? color : '#FFF'}
                      width={15}
                      height={15}
                      stroke={color}
                      strokeWidth={3}
                    />
                  </svg>
                  <Box component="span" sx={{ ml: '5px', ...textStyle }}>
                    {label.text}
                  </Box>
                </ButtonBase>
              )
            })}
          </Box>
        )}
      </VisxLegendOrdinal>
    </Box>
  )

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fillOpacity={0}
          rx={14}
        />
        <VisxGroup left={margin.left} top={margin.top}>
          <VisxGridRows
            scale={yScale}
            width={innerWidth}
            height={innerHeight - margin.top}
            stroke="black"
            strokeOpacity={0.2}
          />
          <VisxGridColumns
            scale={xScale}
            width={innerWidth}
            height={innerHeight}
            stroke="black"
            strokeOpacity={0.2}
          />
          <VisxLinearGradient
            id="area-gradient"
            from={'#43b284'}
            to={'#43b284'}
            toOpacity={0.1}
          />
          <VisxAxisLeft
            scale={yScale}
            stroke={'black'}
            tickStroke={'black'}
            tickFormat={yAxisFormatter}
            tickLabelProps={(value: unknown) => ({
              fill: Number(value) < 0 ? 'transparent' : 'black', // Hide labels below 0
              textAnchor: 'end',
              dx: '-0.3rem',
              ...textStyle,
            })}
          />
          <text
            x={-yAxisUnitOffset}
            y={height - margin.bottom - 18} // Adjust for vertical positioning
            style={{ textAnchor: 'end', ...textStyle }}
          >
            {yAxisUnitText}
          </text>
          <VisxAxisBottom
            scale={xScale}
            stroke={'black'}
            top={innerHeight}
            tickFormat={(value: unknown) => `${value}`}
            tickStroke={'black'}
            tickLabelProps={(_value: unknown, index: number) => ({
              fill: index === 0 ? 'transparent' : 'black', // Hide first item
              textAnchor: 'middle',
              dy: '0.4rem',
              ...textStyle,
            })}
          />
          {localData.map(
            (sData, i) =>
              lineVisibility[i] && (
                <VisxLinePath
                  key={i}
                  stroke={getColorForIndex(i)}
                  strokeWidth={3}
                  data={sData}
                  x={(d: DataItem) => xScale(+getYear(d)) ?? 0}
                  y={(d: DataItem) => yScale(getValue(d)) ?? 0}
                />
              )
          )}
          {tooltipData && (
            <g>
              <VisxLine
                from={{ x: tooltipLeft - margin.left, y: 0 }}
                to={{ x: tooltipLeft - margin.left, y: innerHeight }}
                stroke={'gray'}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="4,2"
                opacity={0.5}
              />
            </g>
          )}
          {tooltipData &&
            tooltipData.map(
              (d) =>
                lineVisibility[d.lineIndex] && (
                  <g key={d.lineIndex}>
                    <VisxLine
                      from={{ x: tooltipLeft - margin.left, y: 0 }}
                      to={{ x: tooltipLeft - margin.left, y: innerHeight }}
                      stroke={'gray'}
                      strokeWidth={2}
                      pointerEvents="none"
                      strokeDasharray="4,2"
                      opacity={0.5}
                    />
                    <VisxGlyphCircle
                      left={tooltipLeft - margin.left}
                      top={yScale(getValue(d)) + 2}
                      size={110}
                      fill={getColorForIndex(d.lineIndex)}
                      stroke={'white'}
                      strokeWidth={2}
                    />
                  </g>
                )
            )}
          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            onTouchStart={handleTooltip}
            fill={'transparent'}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
        </VisxGroup>
      </svg>
      {/* render a tooltip */}
      {sortedTooltipData && sortedTooltipData.length > 0 && (
        <VisxTooltipWithBounds
          key={`carbon-line-chart-tooltip-${sortedTooltipData[0].year}-${unitType}`}
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <Box
            component="p"
            data-testid="carbon-line-chart-tooltip"
            sx={{ m: 0, mb: 1.5, ml: '18px', typography: 'body2' }}
          >
            {t('report.carbon_line_chart.tooltip_year')}
            <b>{` ${sortedTooltipData[0].year}`}</b>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sortedTooltipData.map((d) => (
              <Box
                key={d.lineIndex}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Box>
                  <Box
                    component="span"
                    sx={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: getColorForIndex(d.lineIndex),
                      display: 'inline-flex',
                      mr: 1,
                    }}
                  />
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      typography: 'body2',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '250px',
                    }}
                  >
                    {`${localPlanNames[d.lineIndex]}:`}
                  </Box>
                </Box>
                <Box
                  component="span"
                  sx={{ ml: 1, display: 'inline', typography: 'body2' }}
                >
                  <b>{`${pp(getValue(d), 2)} `}</b>
                  {`${units[unitType]}`}
                </Box>
              </Box>
            ))}
          </Box>
        </VisxTooltipWithBounds>
      )}
      {chartLegend}
    </div>
  )
}

export default CarbonLineChartInner
