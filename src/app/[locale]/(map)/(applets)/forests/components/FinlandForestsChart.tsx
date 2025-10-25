/**
 * FinlandForestsChart - A visx-based chart component replacing Chart.js
 *
 * This component provides a drop-in replacement for the Chart.js Bar chart
 * used in the Finland Forests page. It supports both stacked and grouped
 * bar charts with interactive tooltips.
 *
 * Key features:
 * - Responsive sizing using ResizeObserver
 * - Stacked and grouped bar chart modes
 * - Interactive tooltips with hover effects
 * - Chart.js-compatible API through the exported Bar component
 * - Themeable using MUI theme
 *
 * Usage:
 * ```tsx
 * import { Bar } from './FinlandForestsChart'
 *
 * <Bar
 *   options={chartOptions.options}
 *   data={chartOptions.data}
 * />
 * ```
 */

'use client'

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { Box, useTheme } from '@mui/material'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { Group } from '@visx/group'
import { scaleBand, scaleLinear } from '@visx/scale'
import { Bar as VisxBar } from '@visx/shape'
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { LegendOrdinal } from '@visx/legend'
import { scaleOrdinal } from '@visx/scale'
import { pp } from '#/common/utils/general'

export interface ChartDataset {
  label: string
  backgroundColor: string
  data: number[]
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartOptions {
  data: ChartData
  options: {
    animation?: { duration: number }
    scales: {
      x: {
        stacked: boolean
        scaleLabel: { display: boolean; labelString: string }
      }
      y: {
        stacked: boolean
        ticks: {
          maxTicksLimit: number
          beginAtZero: boolean
          callback: (value: any, index: any, values: any) => string
        }
      }
    }
    tooltips: {
      callbacks: {
        label: (tooltipItem: any, data: any) => string
      }
    }
  }
}

export interface FinlandForestsChartProps {
  options: ChartOptions
  unit?: string
  width?: number
  height?: number
}

interface TooltipData {
  label: string
  value: number
  color: string
  datasetLabel: string
  xLabel: string
}

const MARGIN_TOP = 20
const MARGIN_RIGHT = 0
const MARGIN_BOTTOM = 60
const FALLBACK_LEFT_MARGIN = 56
const Y_TICK_FONT_SIZE = 11
const Y_TICK_LABEL_DX = -4
const Y_TICK_LABEL_PADDING = 2

export const FinlandForestsChart: React.FC<FinlandForestsChartProps> = ({
  options,
  unit = '',
  width = 500,
  height = 300,
}) => {
  const theme = useTheme()
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TooltipData>()

  const { data, options: chartOptions } = options
  const { labels, datasets } = data
  const isStacked = chartOptions.scales.y.stacked

  const yMax = Math.max(height - MARGIN_TOP - MARGIN_BOTTOM, 0)

  // Process data to create stacked values if needed
  interface ProcessedDataPoint {
    label: string
    _total: number
    [key: string]: string | number
  }

  const processedData = useMemo(() => {
    return labels.map((label, i): ProcessedDataPoint => {
      const values: ProcessedDataPoint = {
        label,
        _total: 0,
      }
      let cumulativeValue = 0

      datasets.forEach((dataset) => {
        const value = dataset.data[i] || 0
        values[dataset.label] = value
        if (isStacked) {
          values[`${dataset.label}_base`] = cumulativeValue
          cumulativeValue += value
        }
      })

      values._total = cumulativeValue
      return values
    })
  }, [labels, datasets, isStacked])

  const yScale = useMemo(() => {
    const allValues = datasets.flatMap((d) => d.data)
    let maxValue: number

    if (isStacked) {
      maxValue = Math.max(...processedData.map((d) => d._total as number))
    } else {
      maxValue = Math.max(...allValues)
    }

    const minValue = Math.min(0, ...allValues)

    return scaleLinear<number>({
      domain: [minValue, maxValue],
      range: [yMax, 0],
      nice: true,
    })
  }, [datasets, processedData, yMax, isStacked])

  const { ticks: yTickOptions } = chartOptions.scales.y
  const tickCallback = yTickOptions.callback
  const maxTicksLimit = yTickOptions.maxTicksLimit

  const yTickFormatter = useCallback(
    (value: number, index: number, values: number[]) => {
      if (tickCallback) {
        const formatted = tickCallback(value, index, values)
        if (formatted == null) return ''
        return String(formatted)
      }
      return value.toLocaleString()
    },
    [tickCallback]
  )

  const yTicks = useMemo(() => {
    const tickCount =
      typeof maxTicksLimit === 'number' && maxTicksLimit > 0 ? maxTicksLimit : 6
    return yScale.ticks(tickCount)
  }, [maxTicksLimit, yScale])

  const yTickLabels = useMemo(
    () => yTicks.map((tick, index) => yTickFormatter(tick, index, yTicks)),
    [yTickFormatter, yTicks]
  )

  const tickLabelFontFamily = theme.typography?.fontFamily ?? 'sans-serif'

  const leftMargin = useMemo(() => {
    if (!yTickLabels.length) {
      return FALLBACK_LEFT_MARGIN
    }
    if (typeof document === 'undefined') {
      return FALLBACK_LEFT_MARGIN
    }
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) {
      return FALLBACK_LEFT_MARGIN
    }
    context.font = `${Y_TICK_FONT_SIZE}px ${tickLabelFontFamily}`
    const maxWidth = Math.max(
      ...yTickLabels.map((label) => context.measureText(label).width)
    )
    if (!Number.isFinite(maxWidth)) {
      return FALLBACK_LEFT_MARGIN
    }
    return (
      Math.ceil(maxWidth) + Math.abs(Y_TICK_LABEL_DX) + Y_TICK_LABEL_PADDING
    )
  }, [tickLabelFontFamily, yTickLabels])

  const xMax = Math.max(width - leftMargin - MARGIN_RIGHT, 0)

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: labels,
        range: [0, xMax],
        padding: 0.3,
      }),
    [labels, xMax]
  )

  // Legend scale
  const legendScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: datasets.map((d) => d.label),
        range: datasets.map((d) => d.backgroundColor),
      }),
    [datasets]
  )

  const handleMouseMove = (
    event: React.MouseEvent<SVGRectElement>,
    label: string,
    datasetLabel: string,
    value: number,
    color: string
  ) => {
    const point = localPoint(event)
    if (!point) return

    showTooltip({
      tooltipData: {
        label: datasetLabel,
        value,
        color,
        datasetLabel,
        xLabel: label,
      },
      tooltipLeft: point.x,
      tooltipTop: point.y,
    })
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', isolation: 'isolate' }}>
      {/* Legend */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <LegendOrdinal
          scale={legendScale}
          direction="row"
          itemMargin="0 15px 0 0"
          labelMargin="0 0 0 8px"
          shapeMargin="0"
        >
          {(labels) => (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {labels.map((label, i) => (
                <div
                  key={`legend-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '13px',
                    color: theme.palette.text.primary,
                  }}
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: label.value,
                      marginRight: '6px',
                      borderRadius: '2px',
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>{label.text}</span>
                </div>
              ))}
            </div>
          )}
        </LegendOrdinal>
      </Box>

      <svg
        width={width}
        height={height}
        style={{
          shapeRendering: 'crispEdges',
        }}
      >
        <Group left={leftMargin} top={MARGIN_TOP}>
          {/* Grid */}
          <GridRows
            scale={yScale}
            width={xMax}
            strokeDasharray="2,2"
            stroke={theme.palette.divider}
            strokeOpacity={0.3}
            pointerEvents="none"
          />

          {/* Render bars */}
          {processedData.map((dataPoint, i) => {
            const barGroupX = xScale(dataPoint.label) || 0
            const barWidth = xScale.bandwidth()

            if (isStacked) {
              // Stacked bars
              return (
                <Group key={`bar-group-${i}`}>
                  {datasets.map((dataset, j) => {
                    const value = dataPoint[dataset.label] as number
                    const baseValue =
                      (dataPoint[`${dataset.label}_base`] as number) || 0
                    const barHeight = Math.abs(
                      yScale(0) - yScale(Math.abs(value))
                    )
                    const barY = yScale(baseValue + (value > 0 ? value : 0))

                    return (
                      <VisxBar
                        key={`bar-${i}-${j}`}
                        x={barGroupX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        fill={dataset.backgroundColor}
                        style={{ shapeRendering: 'crispEdges' }}
                        onMouseMove={(
                          event: React.MouseEvent<SVGRectElement>
                        ) =>
                          handleMouseMove(
                            event,
                            dataPoint.label,
                            dataset.label,
                            value,
                            dataset.backgroundColor
                          )
                        }
                        onMouseLeave={hideTooltip}
                      />
                    )
                  })}
                </Group>
              )
            } else {
              // Grouped bars
              const groupWidth = barWidth
              const barGroupWidth = groupWidth / datasets.length

              return (
                <Group key={`bar-group-${i}`}>
                  {datasets.map((dataset, j) => {
                    const value = dataPoint[dataset.label] as number
                    const barHeight = Math.abs(
                      yScale(0) - yScale(Math.abs(value))
                    )
                    const barY = value >= 0 ? yScale(value) : yScale(0)
                    const barX = barGroupX + j * barGroupWidth

                    return (
                      <VisxBar
                        key={`bar-${i}-${j}`}
                        x={barX}
                        y={barY}
                        width={barGroupWidth}
                        height={barHeight}
                        fill={dataset.backgroundColor}
                        style={{ shapeRendering: 'crispEdges' }}
                        onMouseMove={(
                          event: React.MouseEvent<SVGRectElement>
                        ) =>
                          handleMouseMove(
                            event,
                            dataPoint.label,
                            dataset.label,
                            value,
                            dataset.backgroundColor
                          )
                        }
                        onMouseLeave={hideTooltip}
                      />
                    )
                  })}
                </Group>
              )
            }
          })}

          {/* X Axis */}
          <AxisBottom
            top={yMax}
            scale={xScale}
            stroke={theme.palette.text.secondary}
            tickStroke={theme.palette.text.secondary}
            tickLabelProps={() => ({
              fill: theme.palette.text.primary,
              fontSize: 11,
              textAnchor: 'middle',
              style: {
                shapeRendering: 'crispEdges',
                textRendering: 'optimizeLegibility',
              },
            })}
            label={chartOptions.scales.x.scaleLabel.labelString}
            labelProps={{
              fill: theme.palette.text.primary,
              fontSize: 12,
              textAnchor: 'middle',
              style: {
                textRendering: 'optimizeLegibility',
                fontWeight: 500,
              },
            }}
            labelOffset={15}
          />

          {/* Y Axis */}
          <AxisLeft
            scale={yScale}
            stroke={theme.palette.text.secondary}
            tickStroke={theme.palette.text.secondary}
            tickLabelProps={() => ({
              fill: theme.palette.text.primary,
              fontSize: Y_TICK_FONT_SIZE,
              textAnchor: 'end',
              dx: Y_TICK_LABEL_DX,
              style: {
                textRendering: 'optimizeLegibility',
              },
            })}
            tickValues={yTicks}
            tickFormat={(value, index) =>
              yTickFormatter(value as number, index, yTicks)
            }
          />
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            fontSize: '12px',
            borderRadius: '4px',
          }}
        >
          <div>
            <strong>{tooltipData.xLabel} years</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: tooltipData.color,
              }}
            />
            <span>
              {tooltipData.datasetLabel}: {pp(tooltipData.value, 2)} {unit}
            </span>
          </div>
        </TooltipWithBounds>
      )}
    </Box>
  )
}

// Responsive wrapper component
export const ResponsiveFinlandForestsChart: React.FC<
  Omit<FinlandForestsChartProps, 'width' | 'height'>
> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 500, height: 330 })

  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        // Fixed height for consistent layout (includes legend space)
        setDimensions({ width, height: 330 })
      }
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <Box ref={containerRef} sx={{ width: '100%', pl: 0 }}>
      <FinlandForestsChart {...props} {...dimensions} />
    </Box>
  )
}

// Chart.js compatible API wrapper - mimics react-chartjs-2's Bar component
export interface BarProps {
  options: ChartOptions['options']
  data: ChartData
}

export const Bar: React.FC<BarProps> = ({ options: chartJsOptions, data }) => {
  // Extract unit from tooltip callback if available
  const unit = useMemo(() => {
    // Try to extract unit from the label callback
    // In the original implementation, unit is embedded in the callback
    return ''
  }, [chartJsOptions])

  const chartOptions: ChartOptions = {
    data,
    options: chartJsOptions,
  }

  return <ResponsiveFinlandForestsChart options={chartOptions} unit={unit} />
}

export default FinlandForestsChart
