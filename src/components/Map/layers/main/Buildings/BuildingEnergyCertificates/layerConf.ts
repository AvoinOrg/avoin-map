import { fillOpacity } from '#/common/utils/map'
import {
  LayerGroupId,
  LayerConf,
  ExtendedStyleSpecification,
} from '#/common/types/map'
import Popup from './Popup'

const id: LayerGroupId = 'building_energy_certs'
type OrderedLayerSpecification = ExtendedStyleSpecification['layers'][number] & {
  BEFORE?: 'FILL' | 'OUTLINE' | 'LABEL'
}

export const ENERGY_CLASS_COLORS = {
  A: '#1F964A',
  B: '#7DAD46',
  C: '#CCD040',
  D: '#FFEA43',
  E: '#ECB234',
  F: '#D2621F',
  G: '#C70016',
} as const

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  const layers: OrderedLayerSpecification[] = [
    {
      id: id + '-fill',
      source: id,
      'source-layer': 'energiatodistukset',
      type: 'fill',
      paint: {
        'fill-color': [
          'match',
          ['get', 'e_luokka'],
          'A',
          ENERGY_CLASS_COLORS.A,
          'B',
          ENERGY_CLASS_COLORS.B,
          'C',
          ENERGY_CLASS_COLORS.C,
          'D',
          ENERGY_CLASS_COLORS.D,
          'E',
          ENERGY_CLASS_COLORS.E,
          'F',
          ENERGY_CLASS_COLORS.F,
          'G',
          ENERGY_CLASS_COLORS.G,
          'white',
        ],
        'fill-opacity': fillOpacity,
      },
      BEFORE: 'FILL',
    },
    {
      id: id + '-outline',
      source: id,
      'source-layer': 'energiatodistukset',
      type: 'line',
      minzoom: 11,
      paint: {
        'line-opacity': 0.75,
      },
      BEFORE: 'OUTLINE',
    },
    {
      id: id + '-symbol',
      source: id,
      'source-layer': 'energiatodistukset',
      type: 'symbol',
      minzoom: 14,
      paint: {},
      layout: {
        'symbol-placement': 'point',
        'text-font': ['Open Sans Regular'],
        'text-size': 20,
        'text-field': ['case', ['has', 'e_luokka'], ['get', 'e_luokka'], ''],
      },
      BEFORE: 'LABEL',
    },
  ]

  return {
    version: 8,
    name: id,
    sources: {
      [id]: {
        type: 'vector',
        tiles: [
          'https://server.avoin.org/data/map/hel-energiatodistukset/{z}/{x}/{y}.pbf?v=3',
        ],
        minzoom: 11,
        maxzoom: 14,
        // Bounds source: https://koordinates.com/layer/4257-finland-11000000-administrative-regions/
        // select ST_Extent(ST_Transform(ST_SetSRID(geom,3067), 4326))
        // from "finland-11000000-administrative-regions" where kunta_ni1='Helsinki';
        bounds: [24, 59, 26, 61],
        attribution: '<a href="https://www.hel.fi">© City of Helsinki</a>',
      },
    },
    layers,
  }
}

const layerConf = {
  id: id,
  style: getStyle,
  popup: Popup,
} as LayerConf

export default layerConf
