import {
  LayerGroupId,
  LayerConf,
  ExtendedStyleSpecification,
  LayerOrderLevel,
} from '#/common/types/map'

const id: LayerGroupId = 'hansen'

const URL_PREFIX = `https://server.avoin.org/data/map/hansen/`

const sourceIdTreecover = 'hansen_treecover'
const sourceIdGainloss = 'hansen_gainloss'

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: id,
    sources: {
      [sourceIdTreecover]: {
        type: 'raster',
        tiles: [URL_PREFIX + 'treecover/tiles/{z}/{x}/{y}.png'],
        maxzoom: 7,
        attribution:
          '<a href="https://developers.google.com/earth-engine/datasets/catalog/UMD_hansen_global_forest_change_2020_v1_8">Hansen/UMD/Google/USGS/NASAESA</a>',
      },
      [sourceIdGainloss]: {
        type: 'raster',
        tiles: [URL_PREFIX + 'gainloss/tiles/{z}/{x}/{y}.png'],
        maxzoom: 7,
        attribution:
          '<a href="https://developers.google.com/earth-engine/datasets/catalog/UMD_hansen_global_forest_change_2020_v1_8">Hansen/UMD/Google/USGS/NASAESA</a>',
      },
    },
    layers: [
      {
        id: sourceIdTreecover + '-raster',
        source: sourceIdTreecover,
        type: 'raster',
        minzoom: 0,
        paint: {
          'raster-opacity': 1,
        },
      },
      {
        id: sourceIdGainloss + '-raster',
        source: sourceIdGainloss,
        type: 'raster',
        minzoom: 0,
        paint: {
          'raster-opacity': 1,
        },
      },
    ],
  }
}

const layerConf: LayerConf = {
  id: id,
  style: getStyle,
}

export default layerConf
