import type { ExpressionSpecification, FilterSpecification } from 'maplibre-gl'

import type { ExtendedLayerSpecification } from '#/common/types/map'
import {
  ENERGYMAP_BUILDING_POLYGONS_LAYER_MAX_ZOOM,
  ENERGYMAP_BUILDING_POLYGONS_LAYER_MIN_ZOOM,
} from './buildingSource'

export const ENERGYMAP_HEATING_LAYER_GROUP_ID = 'energymap_heating'
export const ENERGYMAP_HEATING_FILL_LAYER_ID = `${ENERGYMAP_HEATING_LAYER_GROUP_ID}-fill`
export const ENERGYMAP_HEATING_OUTLINE_LAYER_ID = `${ENERGYMAP_HEATING_LAYER_GROUP_ID}-outline`
export const ENERGYMAP_HEATING_LAYER_IDS = [
  ENERGYMAP_HEATING_FILL_LAYER_ID,
  ENERGYMAP_HEATING_OUTLINE_LAYER_ID,
] as const
export const ENERGYMAP_HEATING_FILL_OPACITY = 0.6
export const ENERGYMAP_HEATING_OUTLINE_OPACITY = 0.2
export const HEATING_ENERGY_SOURCE_PROPERTY = 'heating_energy_source'

export const HEATING_ENERGY_SOURCE_COLORS = {
  geothermal: '#BD68FF',
  districtHeating: '#DD0E8E',
  electricity: '#812FA7',
  solar: '#E979C3',
  other: '#FDD4FF',
} as const

export const HEATING_ENERGY_SOURCE_CODES = {
  geothermal: '09',
  districtHeating: '01',
  electricity: '04',
  solar: '10',
} as const

export const HEATING_ENERGY_SOURCE_EXPLICIT_CODES = [
  HEATING_ENERGY_SOURCE_CODES.geothermal,
  HEATING_ENERGY_SOURCE_CODES.districtHeating,
  HEATING_ENERGY_SOURCE_CODES.electricity,
  HEATING_ENERGY_SOURCE_CODES.solar,
] as const

type ExplicitHeatingEnergySourceFilterKey =
  keyof typeof HEATING_ENERGY_SOURCE_CODES

export type HeatingEnergySourceFilterKey =
  | ExplicitHeatingEnergySourceFilterKey
  | 'other'

const NO_MATCH_HEATING_ENERGY_SOURCE =
  '__avoin_no_matching_heating_energy_source__'

const isExplicitHeatingEnergySourceFilterKey = (
  key: HeatingEnergySourceFilterKey
): key is ExplicitHeatingEnergySourceFilterKey => key !== 'other'

export const getHeatingEnergySourceFilter = (
  activeKeys: HeatingEnergySourceFilterKey[]
): FilterSpecification => {
  const activeExplicitCodes = activeKeys
    .filter(isExplicitHeatingEnergySourceFilterKey)
    .map((key) => HEATING_ENERGY_SOURCE_CODES[key])

  const clauses: unknown[][] = []

  if (activeExplicitCodes.length > 0) {
    clauses.push([
      'in',
      ['get', HEATING_ENERGY_SOURCE_PROPERTY],
      ['literal', activeExplicitCodes],
    ])
  }

  if (activeKeys.includes('other')) {
    clauses.push([
      '!',
      [
        'in',
        ['get', HEATING_ENERGY_SOURCE_PROPERTY],
        ['literal', HEATING_ENERGY_SOURCE_EXPLICIT_CODES],
      ],
    ])
  }

  if (clauses.length === 0) {
    return [
      '==',
      ['get', HEATING_ENERGY_SOURCE_PROPERTY],
      NO_MATCH_HEATING_ENERGY_SOURCE,
    ] as FilterSpecification
  }

  if (clauses.length === 1) {
    return clauses[0] as FilterSpecification
  }

  return ['any', ...clauses] as FilterSpecification
}

export const ENERGYMAP_HEATING_FILL_COLOR_EXPRESSION = [
  'match',
  ['get', HEATING_ENERGY_SOURCE_PROPERTY],
  HEATING_ENERGY_SOURCE_CODES.geothermal,
  HEATING_ENERGY_SOURCE_COLORS.geothermal,
  HEATING_ENERGY_SOURCE_CODES.districtHeating,
  HEATING_ENERGY_SOURCE_COLORS.districtHeating,
  HEATING_ENERGY_SOURCE_CODES.electricity,
  HEATING_ENERGY_SOURCE_COLORS.electricity,
  HEATING_ENERGY_SOURCE_CODES.solar,
  HEATING_ENERGY_SOURCE_COLORS.solar,
  HEATING_ENERGY_SOURCE_COLORS.other,
] as ExpressionSpecification

export const createEnergymapHeatingLayers = ({
  sourceId,
  sourceLayer,
}: {
  sourceId: string
  sourceLayer: string
}): ExtendedLayerSpecification[] => [
  {
    id: ENERGYMAP_HEATING_FILL_LAYER_ID,
    source: sourceId,
    'source-layer': sourceLayer,
    type: 'fill',
    minzoom: ENERGYMAP_BUILDING_POLYGONS_LAYER_MIN_ZOOM,
    maxzoom: ENERGYMAP_BUILDING_POLYGONS_LAYER_MAX_ZOOM,
    layout: {
      visibility: 'none',
    },
    paint: {
      'fill-color': ENERGYMAP_HEATING_FILL_COLOR_EXPRESSION,
      'fill-opacity': 0,
    },
  },
  {
    id: ENERGYMAP_HEATING_OUTLINE_LAYER_ID,
    source: sourceId,
    'source-layer': sourceLayer,
    type: 'line',
    minzoom: ENERGYMAP_BUILDING_POLYGONS_LAYER_MIN_ZOOM,
    maxzoom: ENERGYMAP_BUILDING_POLYGONS_LAYER_MAX_ZOOM,
    layout: {
      visibility: 'none',
    },
    paint: {
      'line-color': '#111111',
      'line-opacity': 0,
      'line-width': 0.75,
    },
  },
]
