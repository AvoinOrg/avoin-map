'use client'

import { useEffect } from 'react'

import { useMapStore } from '#/common/store'

import {
  createUiBaselineDrawingLayerGroupOptions,
  UI_BASELINE_DRAWING_DATASET_ID,
} from '../common/drawingLayer'

let drawingLifecyclePromise = Promise.resolve()

const enqueueDrawingLifecycle = (operation: () => Promise<void>) => {
  drawingLifecyclePromise = drawingLifecyclePromise
    .then(operation, operation)
    .catch((error) => {
      console.error(
        'Failed to run ui-baseline drawing lifecycle operation',
        error
      )
    })
}

const clearUiBaselineDrawingStateIfTargeted = async () => {
  const { _drawOptions, _removeDraw } = useMapStore.getState()

  if (_drawOptions.layerGroupId === UI_BASELINE_DRAWING_DATASET_ID) {
    await _removeDraw({ skipQueue: true })
  }
}

const cleanupUiBaselineDrawingLayer = async () => {
  const { _layerGroups, removeSerializableLayerGroup } = useMapStore.getState()

  if (_layerGroups[UI_BASELINE_DRAWING_DATASET_ID] != null) {
    await removeSerializableLayerGroup(UI_BASELINE_DRAWING_DATASET_ID)
    await clearUiBaselineDrawingStateIfTargeted()
    return
  }

  await clearUiBaselineDrawingStateIfTargeted()
}

const DrawingContent = () => {
  useEffect(() => {
    let disposed = false

    const runDrawingSetup = async () => {
      const { addSerializableLayerGroup, setDrawMode } = useMapStore.getState()

      await cleanupUiBaselineDrawingLayer()

      if (disposed) {
        return
      }

      await addSerializableLayerGroup(
        UI_BASELINE_DRAWING_DATASET_ID,
        createUiBaselineDrawingLayerGroupOptions()
      )

      if (disposed) {
        await cleanupUiBaselineDrawingLayer()
        return
      }

      await setDrawMode('polygon')

      if (disposed) {
        await cleanupUiBaselineDrawingLayer()
      }
    }

    enqueueDrawingLifecycle(runDrawingSetup)

    return () => {
      disposed = true
      enqueueDrawingLifecycle(cleanupUiBaselineDrawingLayer)
    }
  }, [])

  return null
}

export default DrawingContent
