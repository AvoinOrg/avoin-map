import {
  ExtendedStyleSpecification,
  LayerConf,
} from '#/common/types/map'

const SERVER_URL = process.env.NEXT_PUBLIC_GEOSERVER_URL

export const ENERGYMAP_HEATING_LAYER_GROUP_ID = 'energymap_heating'
const ENERGYMAP_BUILDING_POLYGONS_WORKSPACE = 'sandbox_energiakartta'
const ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER =
  'energymap_building_polygons'
export const HEATING_ENERGY_SOURCE_PROPERTY = 'heating_energy_source'

export const HEATING_ENERGY_SOURCE_COLORS = {
  geothermal: '#BD68FF',
  districtHeating: '#DD0E8E',
  electricity: '#812FA7',
  solar: '#E979C3',
  other: '#FDD4FF',
} as const

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: ENERGYMAP_HEATING_LAYER_GROUP_ID,
    sources: {
      [ENERGYMAP_HEATING_LAYER_GROUP_ID]: {
        type: 'vector',
        scheme: 'tms',
        tiles: [
          `${SERVER_URL}/gwc/service/tms/1.0.0/${ENERGYMAP_BUILDING_POLYGONS_WORKSPACE}:${ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER}@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
        ],
        minzoom: 5,
        maxzoom: 14,
        bounds: [19, 59, 32, 71],
      },
    },
    layers: [
      {
        id: `${ENERGYMAP_HEATING_LAYER_GROUP_ID}-fill`,
        source: ENERGYMAP_HEATING_LAYER_GROUP_ID,
        'source-layer': ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
        type: 'fill',
        paint: {
          'fill-color': [
            'match',
            ['get', HEATING_ENERGY_SOURCE_PROPERTY],
            '09',
            HEATING_ENERGY_SOURCE_COLORS.geothermal,
            '01',
            HEATING_ENERGY_SOURCE_COLORS.districtHeating,
            '04',
            HEATING_ENERGY_SOURCE_COLORS.electricity,
            '10',
            HEATING_ENERGY_SOURCE_COLORS.solar,
            HEATING_ENERGY_SOURCE_COLORS.other,
          ],
          'fill-opacity': 0.6,
        },
      },
      {
        id: `${ENERGYMAP_HEATING_LAYER_GROUP_ID}-outline`,
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
