import axios from 'axios'
import { ExpressionSpecification } from 'maplibre-gl'

import {
  LayerGroupId,
  LayerConf,
  ExtendedStyleSpecification,
} from '#/common/types/map'
import { fillOpacity } from '#/common/utils/map'

const id: LayerGroupId = 'metsaan_ete_important'

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  const { data } = await axios.get('/files/ete_codes.json')

  // @ts-ignore
  const eteAllLabels = [
    'match',
    ['get', 'featurecode'],
    ...data,
    'UNKNOWN habitat type',
  ] as ExpressionSpecification

  const style: ExtendedStyleSpecification = {
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
          'text-field': eteAllLabels,
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

  return style
}

const layerConf: LayerConf = { id: id, style: getStyle }

export default layerConf
