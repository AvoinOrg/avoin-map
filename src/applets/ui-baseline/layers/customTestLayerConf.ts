import type { LayerConf } from '#/common/types/map'

import { useLayerFixtureStore } from '../state/layerFixtureStore'

export const UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID =
  'ui-baseline-custom-test-layer'
export const UI_BASELINE_CUSTOM_TEST_SOURCE_ID =
  'ui-baseline-custom-test-source'

const customTestLayerConf: LayerConf = {
  id: UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID,
  style: {
    version: 8,
    name: UI_BASELINE_CUSTOM_TEST_LAYER_GROUP_ID,
    sources: {
      [UI_BASELINE_CUSTOM_TEST_SOURCE_ID]: {
        type: 'store',
        extendedOpts: {
          storeData: {
            sync: {
              store: useLayerFixtureStore,
              selector: (state) => state.data,
            },
          },
        },
      },
    },
    layers: [
      {
        id: 'uiBaselineCustomTestZones-fill',
        type: 'fill',
        source: UI_BASELINE_CUSTOM_TEST_SOURCE_ID,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color': '#8E7CC3',
          'fill-opacity': 0.35,
          'fill-outline-color': '#4F3C78',
        },
      },
      {
        id: 'uiBaselineCustomTestRoutes-line',
        type: 'line',
        source: UI_BASELINE_CUSTOM_TEST_SOURCE_ID,
        filter: ['==', ['geometry-type'], 'LineString'],
        paint: {
          'line-color': '#D0602D',
          'line-width': 4,
          'line-dasharray': [2, 1.5],
        },
      },
      {
        id: 'uiBaselineCustomTestPoints-circle',
        type: 'circle',
        source: UI_BASELINE_CUSTOM_TEST_SOURCE_ID,
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-radius': 7,
          'circle-color': '#2C8E74',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
        },
      },
      {
        id: 'uiBaselineCustomTestLabels-symbol',
        type: 'symbol',
        source: UI_BASELINE_CUSTOM_TEST_SOURCE_ID,
        filter: ['!=', ['get', 'displayLabel'], ''],
        layout: {
          'text-field': ['get', 'displayLabel'],
          'text-size': 11,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#111111',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1.5,
        },
      },
    ],
  },
}

export default customTestLayerConf
