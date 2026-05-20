import { every } from 'lodash-es'
import { ExpressionSpecification, LayerSpecification } from 'maplibre-gl'
import { GeoJsonProperties } from 'geojson'
import { uniqBy } from 'lodash-es'

import {
  buildBinnedColorExpr,
  roundToSignificantDigitsExpr,
} from '#/common/utils/map'
import { assert, pp } from '#/common/utils/general'

import {
  baseAttrs,
  harvestedWoodAttrs,
  nC_to_CO2,
  TRADITIONAL_FORESTRY_METHOD,
  DEFAULT_FORESTRY_METHOD,
  carbonStockAttrPrefixes,
} from './constants'
import { ForestryMethod, LayerLevel } from './types'
import { ColorStop } from '#/common/types/map'

export const stepsToLinear = (min: number, max: number, steps: string[]) => {
  const step = (max - min) / (steps.length - 1)
  const res: any[] = []
  let cur = min
  for (const s of steps) {
    res.push(cur)
    res.push(s)
    cur += step
  }
  return res
}

// export const fiForestsAreaCO2FillColor: (
//   expr: ExpressionSpecification
// ) => ExpressionSpecification = (expr) => [
//   'interpolate',
//   ['linear'],
//   expr,
//   ...stepsToLinear(-5, 0, colorboxStepsNeg).concat([
//     0.01,
//     'hsla(159, 100%, 50%, 1)',
//     15,
//     'hsla(159, 100%, 25%, 1)',
//   ]),
// ]

export const perHa = (
  expr: ExpressionSpecification
): ExpressionSpecification => ['/', expr, fiForestsAreaDivisorExpr]

export const DIVERGING_CO2_STOPS: ColorStop[] = [
  { color: '#b2182b', value: -15 }, // deep red
  { color: '#ffd24a', value: 0 }, // yellow
  { color: '#1a9850', value: 15 }, // deep green
]

export const fiForestsAreaCO2FillColorBinned = (
  expr: ExpressionSpecification,
  numberOfBins = 9,
  stops: ColorStop[] = DIVERGING_CO2_STOPS
): ExpressionSpecification => buildBinnedColorExpr(expr, stops, numberOfBins)

// (Optional) Keep the old name for backwards-compat, point it to the new one:
export const fiForestsAreaCO2FillColor = (
  expr: ExpressionSpecification
): ExpressionSpecification =>
  fiForestsAreaCO2FillColorBinned(expr, 9, DIVERGING_CO2_STOPS)

export const fiForestsSumMethodAttrs = (
  forestryMethod: ForestryMethod | ExpressionSpecification,
  attrPrefix: string,
  attrSuffix = '_area_mult_sum'
) => {
  const expr: ExpressionSpecification = [
    'let',
    'p',
    ['concat', 'f', forestryMethod, '_'],
    [
      '*',
      1 / 40,
      [
        '+',
        ['get', ['concat', ['var', 'p'], `${attrPrefix}1${attrSuffix}`]],
        ['get', ['concat', ['var', 'p'], `${attrPrefix}2${attrSuffix}`]],
        ['get', ['concat', ['var', 'p'], `${attrPrefix}3${attrSuffix}`]],
        ['get', ['concat', ['var', 'p'], `${attrPrefix}4${attrSuffix}`]],
      ],
    ],
  ]
  return expr
}

export const fiForestsBestMethodCumulativeSumCbt = fiForestsSumMethodAttrs(
  DEFAULT_FORESTRY_METHOD,
  'cbt'
)

const fiForestsAreaDivisorExpr: ExpressionSpecification = [
  'max',
  0.0001,
  [
    'coalesce',
    ['to-number', ['get', 'f_area']],
    ['to-number', ['get', 'area']],
    0,
  ],
]

export const fiForestsCumulativeCO2eValueExpr: ExpressionSpecification = [
  '/',
  fiForestsBestMethodCumulativeSumCbt,
  fiForestsAreaDivisorExpr,
]

export const fiForestsTextfieldExpression: (
  co2eValueExpr: ExpressionSpecification
) => ExpressionSpecification = (co2eValueExpr) => [
  'case',
  ['has', 'f1_cbt1_area_mult_sum'],
  [
    'concat',
    roundToSignificantDigitsExpr(3, ['get', 'area']) as ExpressionSpecification,
    ' ha\n',
    roundToSignificantDigitsExpr(2, co2eValueExpr) as ExpressionSpecification,
    ' t CO2e/y/ha',
  ],
  '',
]

export const fiForestsBestMethodVsOther = (
  forestryMethod: ForestryMethod | ExpressionSpecification,
  attrPrefix: string,
  attrSuffix = '_area_mult_sum'
): ExpressionSpecification => [
  '-',
  fiForestsSumMethodAttrs(forestryMethod, attrPrefix, attrSuffix),
  fiForestsSumMethodAttrs(TRADITIONAL_FORESTRY_METHOD, attrPrefix, attrSuffix),
]

export const getChartDatasets = (prefix: string, attrValues: any) => {
  switch (prefix) {
    case 'cbt':
      return [
        {
          label: 'Soil',
          backgroundColor: '#364858',
          data: attrValues.soilCB,
        },
        {
          label: 'Trees',
          backgroundColor: '#51c0c0',
          data: attrValues.treeCB,
        },
        {
          label: 'Products',
          backgroundColor: '#fa6388',
          data: attrValues.productsCB,
        },
      ]
    case 'bio':
      return [
        {
          label: 'Soil',
          backgroundColor: '#364858',
          data: attrValues.maa,
        },
        {
          label: 'Trees',
          backgroundColor: '#51c0c0',
          data: attrValues.bio,
        },
      ]
    case 'harvested-wood':
      return [
        {
          label: 'Sawlog',
          backgroundColor: '#51c0c0',
          data: attrValues.tuk,
        },
        {
          label: 'Pulpwood',
          backgroundColor: '#364858',
          data: attrValues.kui,
        },
      ]
    default:
      assert(false, `Invalid prefix: ${prefix}`)
  }
}

export const getUnitPerArea = (
  prefix: string,
  cumulative: boolean,
  perHectareFlag: boolean
) => {
  const baseUnit = getUnit(prefix, cumulative)
  const unit = perHectareFlag ? `${baseUnit}/ha` : baseUnit
  return unit
}

export const getUnit = (prefix: string, cumulative: boolean) => {
  if (prefix === 'harvested-wood') {
    return 'm³'
  } else if (carbonStockAttrPrefixes.indexOf(prefix) !== -1) {
    return 'tons C'
  } else if (cumulative) {
    return 'tons CO₂eq'
  } else {
    return 'tons CO₂eq/y'
  }
}

export const getDatasetAttributes = (
  forestryMethod: ForestryMethod,
  cumulativeFlag: boolean,
  totals: any
) => {
  const attrGroups = baseAttrs.split('\n').concat(harvestedWoodAttrs)

  const dsAttrValues: any = {
    cbf: [],
    cbt: [],
    bio: [],
    maa: [],
    tuk: [],
    kui: [],
    productsCB: [],
    soilCB: [],
    treeCB: [],
  }

  for (const attrGroup of attrGroups) {
    const prefix =
      attrGroup.indexOf('_tuk') !== -1 || attrGroup.indexOf('_kui') !== -1
        ? attrGroup.trim().split(/[_ ]/)[1]
        : attrGroup.trim().slice(0, 3)
    const attrs = attrGroup
      .trim()
      .split(/ /)
      .map((attr) => `f${forestryMethod}_${attr}_area_mult_sum`)

    if (prefix === 'npv') continue // Cannot accumulate NPV values

    const attrV: number[] = []
    for (const attr of attrs) {
      const isCarbonStock = carbonStockAttrPrefixes.indexOf(prefix) !== -1
      const cumulative = cumulativeFlag && !isCarbonStock

      const prev = cumulative && attrV.length > 0 ? attrV[attrV.length - 1] : 0
      attrV.push(prev + totals[attr])
    }
    dsAttrValues[prefix] = attrV
  }

  // Soil carbon content is the absolute amount of carbon in the soil, so it's not cumulative or per decade.
  // Here, we make it one of those:
  if (cumulativeFlag) {
    dsAttrValues.soilCB = dsAttrValues.maa
      .slice(1)
      .map((v: any, _i: number) => v - dsAttrValues.maa[0])
  } else {
    dsAttrValues.soilCB = dsAttrValues.maa
      .slice(1)
      .map((v: any, i: number) => v - dsAttrValues.maa[i])
  }
  // tons carbon -> tons CO₂e approx TODO: verify
  dsAttrValues.soilCB = dsAttrValues.soilCB.map((x: any) => x * nC_to_CO2)

  dsAttrValues.productsCB = dsAttrValues.cbt.map(
    (cbtValue: any, i: number) => cbtValue - dsAttrValues.cbf[i]
  )
  dsAttrValues.treeCB = dsAttrValues.cbf.map(
    (cbfValue: any, i: number) => cbfValue - dsAttrValues.soilCB[i]
  )

  return dsAttrValues
}

export const getTotals = (
  forestryMethod: ForestryMethod,
  perHectareFlag: boolean,
  allFeatureProps: GeoJsonProperties[]
) => {
  const totals: any = { area: 0, f_area: 0 }
  const totalBaseAttrs = (harvestedWoodAttrs.join(' ') + ' ' + baseAttrs).split(
    /\s+/
  )
  for (const dsNum of [forestryMethod, TRADITIONAL_FORESTRY_METHOD]) {
    for (const attr of totalBaseAttrs) {
      totals[`f${dsNum}_${attr}_area_mult_sum`] = 0
    }
  }

  const areaProportionalAttrs = Object.keys(totals).filter(
    (x) => !['area', 'f_area'].includes(x)
  )

  // const reMatchAttr = /m-?\d_(.*)/

  const seenIds: any = {}

  // In principle, multiple features' data can be aggregated here.
  // In practice, we just use one at the moment.

  for (const p of allFeatureProps) {
    if (!p) {
      continue
    }
    // Degenerate cases:
    if (p.f1_cbt1_area_mult_sum == null) {
      continue
    }
    if (!p.area) {
      continue
    } // hypothetical

    // Duplicates are possible, so we must only aggregate only once per ID:
    const id = p.id
    if (id in seenIds) {
      continue
    }
    seenIds[id] = true

    totals.area += p.area
    if (p.f_area != null) {
      totals.f_area += p.f_area
    } else {
      totals.f_area += p.area
    }

    // TODO: check if this is still needed
    // if (ForestryMethod === BEST_METHOD_FOR_EACH) {
    //   for (const a of areaProportionalAttrs) {
    //     const attr = `m${p.best_method}_${reMatchAttr.exec(a)[1]}`
    //     if (!(attr in p) && !(attr in omittedConstantAttrs)) {
    //       console.error('Invalid attr:', attr, 'orig:', a, 'props:', p)
    //     }
    //     totals[a] += p[attr] * p.area
    //   }
    //   continue
    // }

    for (const a of areaProportionalAttrs) {
      if (a in p) {
        totals[a] += p[a]
      }
    }
  }

  if (perHectareFlag) {
    for (const a in totals) {
      if (!['area', 'f_area'].includes(a)) {
        totals[a] /= totals.area
      }
    }
  }

  return totals
}

export const getChartProps = (
  prefix: string,
  cumulativeFlag: boolean,
  perHectareFlag: boolean,
  attrValues: any
) => {
  // carbon stock is not counted cumulatively.
  const isCarbonStock = carbonStockAttrPrefixes.indexOf(prefix) !== -1
  const cumulative = cumulativeFlag && !isCarbonStock

  const unit = getUnitPerArea(prefix, cumulative, perHectareFlag)
  const stacked = false

  const datasets = getChartDatasets(prefix, attrValues)

  // I.e. the decades
  const prefixLabels: any = {
    cbf: ['10', '20', '30', '40', '50'],
    cbt: ['10', '20', '30', '40', '50'],
    bio: ['0', '10', '20', '30', '40', '50'],
    'harvested-wood': ['10', '20', '30', '40', '50'],
  }

  const labelCallback = function (
    tooltipItem: Chart.ChartTooltipItem,
    data: Chart.ChartData
  ) {
    if (
      data &&
      data.datasets &&
      data.datasets &&
      tooltipItem.datasetIndex != null &&
      tooltipItem.yLabel != null
    ) {
      const label = data.datasets[tooltipItem.datasetIndex].label
      const v = pp(+tooltipItem.yLabel, 2)
      return `${label}: ${v} ${unit}`
    }
    console.error(
      'Invalid label for chartProp. toolTipItem:',
      tooltipItem,
      'data:',
      data
    )
    return ''
  }

  const chartUpdateFunction = (chart: Chart) => {
    if (
      datasets &&
      datasets.length > 0 &&
      chart.data &&
      chart.data.datasets &&
      chart.options.tooltips &&
      chart.options.tooltips.callbacks
    ) {
      chart.data.datasets.forEach((ds: Chart.ChartDataSets, i: number) => {
        ds.data = datasets[i].data
      })
      chart.options.tooltips.callbacks.label = labelCallback
      chart.update()
    } else {
      console.error(
        'Error in chartUpdateFunction. datasets:',
        datasets,
        'chart:',
        chart
      )
    }
  }

  const options = {
    animation: { duration: 0 },
    scales: {
      x: {
        stacked,
        scaleLabel: { display: true, labelString: 'years from now' },
      },
      y: {
        stacked,
        ticks: {
          maxTicksLimit: 8,
          beginAtZero: true,
          callback: (value: any, _index: any, _values: any) =>
            value.toLocaleString(),
        },
      },
    },
    tooltips: {
      callbacks: { label: labelCallback },
    },
  }
  const chartOptions = {
    data: { labels: prefixLabels[prefix], datasets },
    options,
  }

  return { chartOptions, chartUpdateFunction }
}

export const getNpvText = (
  _carbonBalanceDifferenceFlag: boolean,
  perHectareFlag: boolean,
  totals: any,
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string,
  forestryMethod: ForestryMethod
) => {
  // The comparison is too confusing IMO. Disabled for now.
  // const npvComparison = (
  //   carbonBalanceDifferenceFlag
  //     ? totals[`m${TRADITIONAL_FORESTRY_METHOD}_npv3`]
  //     : 0
  // )
  const npvComparison = 0
  const npvValue =
    forestryMethod === 1
      ? null
      : totals[`f${forestryMethod}_npv3_area_mult_sum`] - npvComparison
  return npvValue === 0 || npvValue
    ? `${formatNumber(npvValue, { maximumFractionDigits: 0 })} €${
        perHectareFlag ? ' per ha' : ''
      }`
    : '-'
}

export const getChartTitleSingleLayer = (
  selectedFeatureLayer: LayerSpecification,
  featureProps: any[],
  multiple: boolean
) => {
  assert(selectedFeatureLayer, 'selectedFeatureLayer must be set')
  if (selectedFeatureLayer.id === LayerLevel.Parcel + '-fill') {
    const name = featureProps.map((p) => p.standid).join(', ')
    if (multiple) return `Multiple forest parcels selected: standids = ${name}`
    return `Forest parcel (standid: ${name})`
  } else if (selectedFeatureLayer.id === LayerLevel.Estate + '-fill') {
    const name = featureProps.map((p) => p.estate_id_text).join(', ')
    if (multiple) return `Multiple properties selected: ${name}`
    return `Property with forest (${name})`
  } else {
    assert(
      every(featureProps.map((p) => p.namefin)),
      `Expected namefin: ${selectedFeatureLayer}`
    )
    const name = featureProps.map((p) => p.namefin || p.nameswe).join(', ')
    if (multiple) return `Multiple administrative areas selected: ${name}`
    return name
  }
}

export const getChartTitle = (
  selectedFeatureLayers: LayerSpecification[],
  featureProps: any[]
) => {
  if (featureProps.length === 0) return 'No area selected'

  assert(
    selectedFeatureLayers.length > 0,
    'selectedFeatureLayer must be non-empty'
  )
  const uniqueLayers = uniqBy(selectedFeatureLayers, (l) => l.id)
  if (uniqueLayers.length > 1)
    return 'Areas selected across multiple scales: double-counting an area is possible'

  return getChartTitleSingleLayer(
    uniqueLayers[0],
    featureProps,
    selectedFeatureLayers.length > 1
  )
}
