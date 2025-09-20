import { fillOpacity, roundToSignificantDigitsExpr } from '#/common/utils/map'
import { LayerConf, ExtendedStyleSpecification } from '#/common/types/map'

import Popup from './Popup'

const SERVER_URL = process.env.NEXT_PUBLIC_GEOSERVER_URL

const layerGroupId = 'helsinki_buildings'

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  const sources = {
    [layerGroupId]: {
      type: 'vector',
      scheme: 'tms',
      tiles: [
        `${SERVER_URL}/gwc/service/tms/1.0.0/misc:${layerGroupId}@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
      ],
      minzoom: 5,
      maxzoom: 14,
      bounds: [19, 59, 32, 71], // Finland
      attribution: '<a href="https://www.hel.fi">© City of Helsinki</a>',
      promoteId: 'id',
    },
  }

  const layers = [
    {
      id: `${layerGroupId}-fill`,
      source: layerGroupId,
      'source-layer': layerGroupId,
      type: 'fill',
      paint: {
        'fill-color': [
          'match',
          // ['get', 'c_poltaine'], '1', '#f0afaa', '2', '#f3bcb8', '3', '#f0afaa', '4', '#ffffff', '9', '#68c296',
          ['get', 'c_kayttark'],
          '032',
          'cyan',
          '039',
          'cyan',
          'gray', // fallback value
        ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.9, // Higher opacity when selected
          0.7, // Default opacity
        ],
      },
      selectable: true,
      // paint: {
      //  'fill-color': fiForestsAreaCO2FillColor(fiForestsCumulativeCO2eValueExpr),
      //  'fill-opacity': layerGroupId === 'parcel' ? 1 : fillOpacity,
      // },
      // ...(options.layerMinzoom != null && { minzoom: options.layerMinzoom }),
      // ...(options.layerMaxzoom != null && { maxzoom: options.layerMaxzoom }),
    },
    {
      id: `${layerGroupId}-outline`,
      source: layerGroupId,
      'source-layer': layerGroupId,
      type: 'line',
      minzoom: 11,
      paint: {
        'line-color': 'black', // Keep outline black for contrast
        'line-opacity': 0.75,
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          2, // Thicker outline when selected
          1, // Default outline width
        ],
      },
      // ...(options.layerMinzoom != null && { minzoom: options.layerMinzoom }),
      // ...(options.layerMaxzoom != null && { maxzoom: options.layerMaxzoom }),
    },
    {
      id: `${layerGroupId}-symbol`,
      source: layerGroupId,
      'source-layer': layerGroupId,
      type: 'symbol',
      minzoom: 16,
      paint: {},
      layout: {
        'symbol-placement': 'point',
        'text-font': ['Open Sans Regular'],
        'text-size': 20,
        'text-field': [
          'case',
          ['has', 'i_raktilav'],
          [
            'let',
            'co2',
            ['/', ['*', 15, ['to-number', ['get', 'i_raktilav'], 0]], 1000],
            [
              'concat',
              roundToSignificantDigitsExpr(2, ['var', 'co2']), // kg -> tons
              ' t CO2e/y',
            ],
          ],
          '',
        ],
      },
      selectable: 'true',
      // ...(options.layerMinzoom != null && { minzoom: options.layerMinzoom }),
      // ...(options.layerMaxzoom != null && { maxzoom: options.layerMaxzoom }),
    },
  ]

  return {
    version: 8,
    name: layerGroupId,
    sources: sources,
    layers: layers,
  }
}

const layerConf: LayerConf = {
  id: layerGroupId,
  style: getStyle,
  popupOpts: {
    source: layerGroupId,
    component: Popup,
    type: 'modal',
  },
}

export default layerConf
