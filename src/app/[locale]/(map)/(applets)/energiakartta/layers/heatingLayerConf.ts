import type { FilterSpecification } from 'maplibre-gl'

import { ExtendedStyleSpecification, LayerConf } from '#/common/types/map'
import { ENERGYMAP_GEOSERVER_URL } from './geoServer'

export const ENERGYMAP_HEATING_LAYER_GROUP_ID = 'energymap_heating'
export const ENERGYMAP_HEATING_FILL_LAYER_ID = `${ENERGYMAP_HEATING_LAYER_GROUP_ID}-fill`
export const ENERGYMAP_HEATING_OUTLINE_LAYER_ID = `${ENERGYMAP_HEATING_LAYER_GROUP_ID}-outline`
export const ENERGYMAP_HEATING_LAYER_IDS = [
  ENERGYMAP_HEATING_FILL_LAYER_ID,
  ENERGYMAP_HEATING_OUTLINE_LAYER_ID,
] as const
const ENERGYMAP_BUILDING_POLYGONS_WORKSPACE = 'sandbox_energiakartta'
const ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER = 'energymap_building_polygons'
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

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: ENERGYMAP_HEATING_LAYER_GROUP_ID,
    sources: {
      [ENERGYMAP_HEATING_LAYER_GROUP_ID]: {
        type: 'vector',
        scheme: 'tms',
        tiles: [
          `${ENERGYMAP_GEOSERVER_URL}/gwc/service/tms/1.0.0/${ENERGYMAP_BUILDING_POLYGONS_WORKSPACE}:${ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER}@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
        ],
        minzoom: 5,
        maxzoom: 14,
        bounds: [19, 59, 32, 71],
      },
    },
    layers: [
      {
        id: ENERGYMAP_HEATING_FILL_LAYER_ID,
        source: ENERGYMAP_HEATING_LAYER_GROUP_ID,
        'source-layer': ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
        type: 'fill',
        paint: {
          'fill-color': [
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
          ],
          'fill-opacity': 0.6,
        },
      },
      {
        id: ENERGYMAP_HEATING_OUTLINE_LAYER_ID,
        source: ENERGYMAP_HEATING_LAYER_GROUP_ID,
        'source-layer': ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
        type: 'line',
        minzoom: 11,
        paint: {
          'line-color': '#111111',
          'line-opacity': 0.2,
          'line-width': 0.75,
        },
      },
    ],
  }
}

const layerConf: LayerConf = {
  id: ENERGYMAP_HEATING_LAYER_GROUP_ID,
  style: getStyle,
}

export default layerConf
