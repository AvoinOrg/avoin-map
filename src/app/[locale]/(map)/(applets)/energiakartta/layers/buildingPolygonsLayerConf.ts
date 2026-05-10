import { ExtendedStyleSpecification, LayerConf } from '#/common/types/map'
import { ENERGYMAP_GEOSERVER_URL } from './geoServer'

const ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID = 'energymap_building_polygons'
const ENERGYMAP_BUILDING_POLYGONS_WORKSPACE = 'sandbox_energiakartta'
const ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER = 'energymap_building_polygons'

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID,
    sources: {
      [ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID]: {
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
        id: `${ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID}-fill`,
        source: ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID,
        'source-layer': ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
        type: 'fill',
        paint: {
          'fill-color': '#7DAD46',
          'fill-opacity': 0.45,
        },
      },
      {
        id: `${ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID}-outline`,
        source: ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID,
        'source-layer': ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
        type: 'line',
        minzoom: 11,
        paint: {
          'line-color': '#111111',
          'line-opacity': 0.65,
          'line-width': 1,
        },
      },
    ],
  }
}

const layerConf: LayerConf = {
  id: ENERGYMAP_BUILDING_POLYGONS_LAYER_GROUP_ID,
  style: getStyle,
}

export default layerConf
