import { fillOpacity } from '#/common/utils/map'
import {
  LayerGroupId,
  LayerConf,
  ExtendedStyleSpecification,
} from '#/common/types/map'
import Popup from './Popup'

const id: LayerGroupId = 'fi_buildings'

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: id,
    sources: {
      [id]: {
        type: 'vector',
        tiles: [
          'https://server.avoin.org/data/map/fi-buildings/{z}/{x}/{y}.pbf.gz',
        ],
        minzoom: 6,
        maxzoom: 13,
        bounds: [19, 59, 32, 71], // Finland
      },
    },
    layers: [
      {
        id: id + '-fill',
        source: id,
        'source-layer': 'default',
        type: 'fill',
        paint: {
          'fill-color': 'cyan',
          'fill-opacity': fillOpacity,
        },
      },
      {
        id: id + '-outline',
        source: id,
        'source-layer': 'default',
        type: 'line',
        paint: {
          'line-opacity': 0.75,
        },
      },
    ],
  }
}

const layerConf: LayerConf = {
  id: id,
  style: getStyle,
  popupOpts: { source: id, component: Popup, type: 'modal' },
}

export default layerConf
