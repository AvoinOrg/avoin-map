import { LayerOrderLevel } from '#/common/types/map'

import {
  createEmptyUiBaselineDrawingFeatureCollection,
  createUiBaselineDrawingLayerGroupOptions,
  UI_BASELINE_DRAWING_DATASET_ID,
} from './drawingLayer'

describe('ui-baseline drawing layer helper', () => {
  it('uses the fixed drawing dataset id for the layer group and source', () => {
    const options = createUiBaselineDrawingLayerGroupOptions()
    const layerConf = options.layerConf

    expect(UI_BASELINE_DRAWING_DATASET_ID).toBe(
      'ui-baseline-drawing-dataset'
    )
    expect(layerConf?.id).toBe(UI_BASELINE_DRAWING_DATASET_ID)
    expect(layerConf?.style.sources).toHaveProperty(
      UI_BASELINE_DRAWING_DATASET_ID
    )
  })

  it('creates fresh empty FeatureCollections for every route entry', () => {
    const first = createEmptyUiBaselineDrawingFeatureCollection()
    const second = createEmptyUiBaselineDrawingFeatureCollection()
    const firstOptions = createUiBaselineDrawingLayerGroupOptions()
    const secondOptions = createUiBaselineDrawingLayerGroupOptions()
    const firstSource = firstOptions.layerConf?.style.sources[
      UI_BASELINE_DRAWING_DATASET_ID
    ] as any
    const secondSource = secondOptions.layerConf?.style.sources[
      UI_BASELINE_DRAWING_DATASET_ID
    ] as any

    expect(first).toEqual({ type: 'FeatureCollection', features: [] })
    expect(second).toEqual({ type: 'FeatureCollection', features: [] })
    expect(first).not.toBe(second)
    expect(firstSource.data).toEqual({
      type: 'FeatureCollection',
      features: [],
    })
    expect(secondSource.data).toEqual({
      type: 'FeatureCollection',
      features: [],
    })
    expect(firstSource.data).not.toBe(secondSource.data)
  })

  it('configures a GeoJSON source with promoted ids', () => {
    const options = createUiBaselineDrawingLayerGroupOptions()
    const source = options.layerConf?.style.sources[
      UI_BASELINE_DRAWING_DATASET_ID
    ] as any

    expect(source.type).toBe('geojson')
    expect(source.promoteId).toBe('id')
  })

  it('references the fixed source from its map layers', () => {
    const options = createUiBaselineDrawingLayerGroupOptions()
    const layers = options.layerConf?.style.layers ?? []

    expect(layers.map((layer) => layer.id)).toEqual([
      'uiBaselineDrawingDataset-fill',
      'uiBaselineDrawingDataset-outline',
    ])
    expect(
      layers.every((layer) => layer.source === UI_BASELINE_DRAWING_DATASET_ID)
    ).toBe(true)
    expect(layers.some((layer) => layer.selectable === true)).toBe(true)
  })

  it('enables shared drawing controls without persistence', () => {
    const options = createUiBaselineDrawingLayerGroupOptions()

    expect(options.persist).toBe(false)
    expect(options.layerOrderOptions?.layerOrderLevel).toBe(
      LayerOrderLevel.OVERLAY
    )
    expect(options.drawOptions).toMatchObject({
      polygonEnabled: true,
      editEnabled: true,
      corridorEnabled: true,
      deleteOptions: {
        enabled: true,
        deleteOutsideDrawMode: true,
      },
    })
  })
})
