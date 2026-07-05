import type { FeatureCollection } from 'geojson'

import {
  LayerOrderLevel,
  type ExtendedStyleSpecification,
  type SerializableLayerGroupAddOptions,
} from '#/common/types/map'

export const UI_BASELINE_DRAWING_DATASET_ID = 'ui-baseline-drawing-dataset'

export const createEmptyUiBaselineDrawingFeatureCollection =
  (): FeatureCollection => ({
    type: 'FeatureCollection',
    features: [],
  })

export const createUiBaselineDrawingLayerGroupOptions =
  (): SerializableLayerGroupAddOptions => {
    const layerGroupId = UI_BASELINE_DRAWING_DATASET_ID
    const fillLayerId = 'uiBaselineDrawingDataset-fill'
    const outlineLayerId = 'uiBaselineDrawingDataset-outline'

    const style: ExtendedStyleSpecification = {
      version: 8,
      sources: {
        [layerGroupId]: {
          type: 'geojson',
          data: createEmptyUiBaselineDrawingFeatureCollection(),
          promoteId: 'id',
        },
      },
      layers: [
        {
          id: fillLayerId,
          type: 'fill',
          source: layerGroupId,
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#1f6feb',
              '#2f80ed',
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.46,
              0.28,
            ],
          },
          selectable: true,
          multiSelectable: true,
          hoverPointer: true,
        },
        {
          id: outlineLayerId,
          type: 'line',
          source: layerGroupId,
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#0f3d8f',
              '#165dbe',
            ],
            'line-opacity': 0.95,
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              3,
              1.75,
            ],
          },
        },
      ],
    }

    return {
      persist: false,
      layerConf: {
        id: layerGroupId,
        style,
      },
      layerOrderOptions: {
        layerOrderLevel: LayerOrderLevel.OVERLAY,
      },
      drawOptions: {
        polygonEnabled: true,
        editEnabled: true,
        corridorEnabled: true,
        deleteOptions: {
          enabled: true,
          deleteOutsideDrawMode: true,
        },
      },
    }
  }
