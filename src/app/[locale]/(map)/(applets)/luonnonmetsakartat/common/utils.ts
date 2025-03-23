import { ExtendedMbStyle, SerializableLayerConf } from '#/common/types/map'

const SERVER_URL = process.env.NEXT_PUBLIC_GEOSERVER_URL
const GS_WORKSPACE =
  process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE

export const getLayerGroupId = (layerId: string) => {
  return `${layerId}_luonnonmetsakartat`
}

export const createAdminLayerConf = (
  json: any,
  layerId: string,
  apiKey: string,
  featureColorCol: string
) => {
  const sourceId = getLayerGroupId(layerId)

  const style: ExtendedMbStyle = {
    version: 8,
    sources: {
      [sourceId]: {
        type: 'vector',
        scheme: 'tms',
        tiles: [
          `${SERVER_URL}/gwc/service/tms/1.0.0/${GS_WORKSPACE}:forest_areas_${layerId}@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
        ],
        // minzoom: options.minzoom,
        // maxzoom: options.maxzoom,
        bounds: [19, 59, 32, 71], // Finland
        // attribution:
        //   '<a href="https://www.metsaan.fi">© Finnish Forest Centre</a>',
        promoteId: 'id',
      },
    },
    layers: [
      {
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': 'black',
          'line-opacity': 1,
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            3,
            1.5,
          ],
          //   'line-dasharray': [
          //     'case',
          //     ['boolean', ['feature-state', 'selected'], false],
          //     [
          //       'case',
          //       isZoningCodeValidExpression(),
          //       ['literal', [1, 0]],
          //       ['literal', [1, 1]],
          //     ],
          //     [
          //       'case',
          //       isZoningCodeValidExpression(),
          //       ['literal', [1, 0]],
          //       ['literal', [3, 3]],
          //     ],
          //   ],
        },
      },
      {
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId, // reference the data source
        layout: {},
        paint: {
          'fill-color': 'blue', // TODO: get proper color from layer data
          'fill-opacity': 0.7,
          //   'fill-opacity': [
          //     'case',
          //     ['boolean', ['feature-state', 'selected'], false], // Check if the feature is selected
          //     [
          //       'case',
          //       isZoningCodeValidExpression(),
          //       0.9, // Opacity for selected and valid zoning class
          //       0.9, // Opacity for selected but not valid zoning class
          //     ],
          //     ['case', isZoningCodeValidExpression(), 0.6, 0.5],
          //   ],
        },
        selectable: true,
        multiSelectable: true,
      },
      {
        id: `${sourceId}-symbol`,
        source: sourceId,
        type: 'symbol',
        // layout: {
        //   'symbol-placement': 'point',
        //   'text-size': 20,
        //   'text-font': ['Open Sans Regular'],
        //   'text-field': [
        //     'case',
        //     isZoningCodeValidExpression(),
        //     ['get', featureColorCol],
        //     '!',
        //   ],
        // },
        paint: {
          'text-color': 'black',
          'text-halo-blur': 1,
          'text-halo-color': 'rgb(242,243,240)',
          'text-halo-width': 2,
        },
        minzoom: 12,
      },
    ],
  }

  const layerConf: SerializableLayerConf = {
    id: sourceId,
    style: style,
    useMb: true,
  }

  return layerConf
}
