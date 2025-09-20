import { ExpressionSpecification } from 'maplibre-gl'

import {
  LayerGroupId,
  LayerConf,
  ExtendedStyleSpecification,
} from '#/common/types/map'
import { fillOpacity } from '#/common/utils/map'

const id: LayerGroupId = 'metsaan_ete_basic'

const eteBasicLabels: ExpressionSpecification = [
  'match',
  ['get', 'featurecode'],
  70,
  'Gamekeeping area',
  95,
  'Potential METSO Habitat',
  98,
  'METSO Habitat',
  10120,
  'Gamekeeping area',
  15150,
  'METSO II',
  '',
]

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: id,
    sources: {
      [id]: {
        type: 'vector',
        tiles: [
          'https://server.avoin.org/data/map/metsaan-ete/{z}/{x}/{y}.pbf',
        ],
        maxzoom: 12,
        bounds: [19, 59, 32, 71], // Finland
        attribution:
          '<a href="https://www.metsaan.fi">© Finnish Forest Centre</a>',
      },
    },
    layers: [
      {
        id: id + `-fill`,
        source: id,
        'source-layer': 'metsaan-ete',
        type: 'fill',
        paint: {
          'fill-color': 'cyan',
          'fill-opacity': fillOpacity,
        },
      },
      {
        id: id + `-outline`,
        source: id,
        'source-layer': 'metsaan-ete',
        type: 'line',
        minzoom: 12,
        paint: {
          'line-opacity': 1,
        },
      },
      {
        id: id + '-symbol',
        source: id,
        'source-layer': 'metsaan-ete',
        type: 'symbol',
        layout: {
          'text-font': ['Open Sans Regular'],
          'text-field': eteBasicLabels,
        },
        paint: {
          'text-color': '#999',
          'text-halo-blur': 1,
          'text-halo-color': 'rgb(242,243,240)',
          'text-halo-width': 2,
        },
      },
    ],
  }
}

const layerConf: LayerConf = { id: id, style: getStyle }

export default layerConf
