import {
  ExtendedMbStyle,
  LayerConf,
  SerializableLayerConf,
} from '#/common/types/map'

const SERVER_URL = process.env.NEXT_PUBLIC_GEOSERVER_URL
const GS_WORKSPACE =
  process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE

export const getLayerIdWithoutHyphens = (layerId: string) => {
  return layerId.replace(/-/g, '')
}

export const getLayerGroupId = (layerId: string) => {
  const layerIdWithoutHyphens = getLayerIdWithoutHyphens(layerId)
  return `${layerIdWithoutHyphens}_luonnonmetsakartat`
}

export const getSourceLayerId = (layerId: string) => {
  return `forest_areas_${getLayerIdWithoutHyphens(layerId)}`
}

export const getCentroidSourceLayerId = (layerId: string) => {
  return `forest_areas_${getLayerIdWithoutHyphens(layerId)}_centroid`
}

export const getCentroidLayerGroupId = (layerId: string) => {
  const layerIdWithoutHyphens = getLayerIdWithoutHyphens(layerId)
  return `${layerIdWithoutHyphens}_luonnonmetsakartat_centroid`
}

export const createAdminLayerConf = (
  apiKey: string,
  // json: any,
  layerId: string,
  featureColorCol: string
) => {
  const sourceId = getLayerGroupId(layerId)
  const sourceLayer = getSourceLayerId(layerId)

  const centroidSourceId = getCentroidLayerGroupId(layerId)
  const centroidSourceLayer = getCentroidSourceLayerId(layerId)

  const style: ExtendedMbStyle = {
    version: 8,
    sources: {
      [sourceId]: {
        type: 'vector',
        scheme: 'tms',
        tiles: [
          `${SERVER_URL}/gwc/service/tms/1.0.0/${GS_WORKSPACE}:${sourceLayer}@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
        ],
        bounds: [19, 59, 32, 71], // Finland
        promoteId: 'id',
      },
      [centroidSourceId]: {
        type: 'vector',
        scheme: 'tms',
        tiles: [
          `${SERVER_URL}/gwc/service/tms/1.0.0/${GS_WORKSPACE}:${centroidSourceLayer}@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
        ],
        bounds: [19, 59, 32, 71], // Finland
        promoteId: 'id',
      },
    },
    layers: [
      // Outline layer - shown at medium to high zoom levels
      {
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        'source-layer': sourceLayer,
        paint: {
          'line-color': 'black',
          'line-opacity': 1,
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            3,
            1.5,
          ],
        },
        minzoom: 6, // Only show outlines at medium to high zoom levels
      },

      // Fill layer - shown at medium to high zoom levels
      {
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId,
        'source-layer': sourceLayer,
        layout: {},
        paint: {
          'fill-color': '#4cbf00',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.9,
            0.5,
          ],
        },
        selectable: true,
        minzoom: 6, // Only show fills at medium to high zoom levels
      },

      // Text labels - shown only at high zoom levels
      {
        id: `${sourceId}-symbol`,
        source: sourceId,
        'source-layer': sourceLayer,
        type: 'symbol',
        layout: {
          'symbol-placement': 'point',
          'text-field': ['get', 'name'], // Use the 'name' property
          'text-size': 14,
          'text-font': ['Open Sans Regular'],
          'text-anchor': 'center',
          'text-justify': 'center',
          'text-allow-overlap': false,
          'text-max-width': 10, // Wrap text after about 10 characters
          'text-offset': [0, 0.2], // Small offset to center text better
        },
        paint: {
          'text-color': 'black',
          'text-halo-blur': 1,
          'text-halo-color': 'rgb(242,243,240)',
          'text-halo-width': 2,
        },
        minzoom: 11, // Only show text at high zoom levels
      },
      {
        id: `${centroidSourceId}-pin`,
        type: 'symbol',
        source: centroidSourceId,
        'source-layer': centroidSourceLayer,
        layout: {
          'symbol-placement': 'point', // This places a symbol at the centroid of each polygon
          'icon-image': 'pin',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 9, 0.8],
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom',
          'icon-offset': [0, -5],
          'icon-ignore-placement': true,
          // This is the key change - only show one icon per feature
          'icon-pitch-alignment': 'viewport',
          // Add a visibility filter based on geometry type
          visibility: 'visible',
        },
        paint: {
          'icon-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#66ff00',
            '#4cbf00',
          ],
          'icon-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            1.0,
            0.8,
          ],
          'icon-halo-color': 'black',
          'icon-halo-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            1.5,
            0.5,
          ],
        },
        // Add a filter to only show the pin for the first part of each MultiPolygon
        // filter: ['==', ['geometry-type'], 'Point'],
        maxzoom: 12,
        selectable: true,
      },
    ],
  }

  const layerConf: LayerConf = {
    id: sourceId,
    style: style,
    useMb: true,
  }

  return layerConf
}
