'use client'

import { cloneDeep } from 'lodash-es'
import MaplibreDraw from 'maplibre-gl-draw'
import type { Feature, FeatureCollection } from 'geojson'
import type { MapGeoJSONFeature } from 'maplibre-gl'
import { useMapInstanceStore } from './mapInstanceStore'
import drawStyles from '#/common/utils/drawStyles'
import {
  getMaplibreDrawMode,
  ensureCorridorPreviewLayers,
  CORRIDOR_PREVIEW_SOURCE_ID,
  CORRIDOR_PREVIEW_LAYER_ID,
  corridorPolygonFromLine,
  getLayerGroupIdForSource,
  getSelectableLayers,
  isLayerGroupSelectable,
  fetchFeaturesByIds,
  getMatchingDrawFeatures,
  addFeatureToDrawSource,
  updateFeatureInDrawSource,
  deleteFeatureFromDrawSource,
  setCorridorPreviewVisible,
  clearCorridorPreview,
  getDrawMode,
} from '#/common/utils/map'
import type { MapStoreHelpers, MapStateCreator } from './mapStore'
import type {
  MapDrawOptions,
  DrawMode,
  QueueOptions,
  ExtendedMaplibreDrawMode,
} from '#/common/types/map'
import { QueuePriority } from '#/common/types/map'

export type MapDrawVars = {
  _drawOptions: MapDrawOptions
}

export type MapDrawActions = {
  deleteDrawFeatures: (features: Feature[]) => void
  setCorridorHalfWidthMeters: (value: number) => void
  toggleDrawMode: (
    drawMode: DrawMode,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  setDrawMode: (
    drawMode: DrawMode,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  _enableDraw: (
    drawMode?: ExtendedMaplibreDrawMode,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  _updateDrawSelectedFeatures: (updateSelectedFeatures?: boolean) => void
  disableDraw: (_queueOptions?: QueueOptions) => Promise<void>
  _removeDraw: (_queueOptions?: QueueOptions) => Promise<void>
}

export type MapDrawSlice = MapDrawVars & MapDrawActions

export const createMapDrawSlice: (
  helpers: MapStoreHelpers
) => MapStateCreator<MapDrawSlice> = (helpers) => (set, get) => {
  const vars: MapDrawVars = {
    _drawOptions: {
      layerGroupId: null,
      draw: null,
      isEnabled: false,
      featureAddMutator: undefined,
      idField: undefined,
      corridorEnabled: true,
      corridorHalfWidthMeters: 3,
      currentMode: null,
    },
  }

  const actions: MapDrawActions = {
    deleteDrawFeatures: (features: Feature[]) => {
      const { _drawOptions } = get()
      const _map = useMapInstanceStore.getState()._map

      if (_drawOptions.draw == null) {
        console.error('Cannot delete features: No draw object found.')
        return
      }

      const featureIds = features.map((feature) => String(feature.id))

      _drawOptions.draw.delete(featureIds)

      _map?.fire('draw.delete', { features })
    },

    setCorridorHalfWidthMeters: (value: number) => {
      const nextValue = Number.isFinite(value) ? Math.max(0, value) : 0
      set((state) => {
        state._drawOptions.corridorHalfWidthMeters = nextValue
      })
    },

    toggleDrawMode: helpers.queueableFnInit(
      async (drawMode: DrawMode) => {
        const { _drawOptions, _enableDraw, disableDraw } = get()

        let mode = getMaplibreDrawMode(drawMode)

        if (_drawOptions.draw == null) {
          await _enableDraw(mode, { skipQueue: true })
        } else {
          if (_drawOptions.draw.getMode() === mode) {
            disableDraw({ skipQueue: true })
            return
          }
        }

        // Shitty typing in MaplibreDraw
        _drawOptions.draw?.changeMode(mode as any)
        set((state) => {
          state._drawOptions.currentMode = drawMode
        })
      },
      {
        key: 'toggleDrawMode',
        priority: QueuePriority.LOW,
      }
    ),

    setDrawMode: helpers.queueableFnInit(
      async (drawMode: DrawMode) => {
        const {
          _drawOptions,
          _enableDraw,
          _updateDrawSelectedFeatures,
          selectedFeatures,
        } = get()

        let mode = getMaplibreDrawMode(drawMode)

        if (_drawOptions.draw == null) {
          await _enableDraw(mode, { skipQueue: true })
        } else {
          if (mode === 'simple_select' && selectedFeatures.length > 0) {
            _updateDrawSelectedFeatures()
          } else {
            // Shitty typing in MaplibreDraw
            _drawOptions.draw.changeMode(mode as any)
          }
        }
        set((state) => {
          state._drawOptions.currentMode = drawMode
        })
      },
      {
        key: 'setDrawMode',
        priority: QueuePriority.LOW,
      }
    ),

    _enableDraw: helpers.queueableFnInit(
      async (drawMode?: ExtendedMaplibreDrawMode) => {
        const {
          _drawOptions,
          selectedFeatures,
          _layerGroups,
          _disableLayerGroupEventHandlers,
          setSelectedFeatures,
          _updateDrawSelectedFeatures,
          _updateSelectableHoverHandlers,
        } = get()
        const _map = useMapInstanceStore.getState()._map

        if (_drawOptions.layerGroupId == null) {
          console.error('No layerGroupId set for drawing.')
          return
        }

        const layerGroupId = _drawOptions.layerGroupId

        const source = cloneDeep(_map?.getStyle().sources[layerGroupId])

        if (!source) {
          console.error(`No source found with id: ${layerGroupId}`)
          return
        }

        const layerGroup = _layerGroups[layerGroupId]
        const layerIds = Object.keys(layerGroup.layers)
        const originalStyles: Record<string, any> = {}

        // dim underlying layers
        _map?.getStyle().layers.forEach((layer) => {
          if (layerIds.includes(layer.id)) {
            let opacityProperty: string | undefined = undefined

            switch (layer.type) {
              case 'fill':
                opacityProperty = 'fill-opacity'
                break
              case 'line':
                opacityProperty = 'line-opacity'
                break
              case 'symbol':
                if (layer.layout) {
                  if ('text-field' in layer.layout) {
                    opacityProperty = 'text-opacity'
                  } else if ('icon-image' in layer.layout) {
                    opacityProperty = 'icon-opacity'
                  }
                }
                break
            }

            if (opacityProperty != null) {
              let originalOpacity = _map.getPaintProperty(
                layer.id,
                opacityProperty
              )
              if (
                typeof originalOpacity === 'number' &&
                originalOpacity > 0.3
              ) {
                _map.setPaintProperty(layer.id, opacityProperty, 0.3)
              }

              if (!originalStyles[layer.id]) {
                originalStyles[layer.id] = {}
              }
              originalStyles[layer.id][opacityProperty] = originalOpacity
            }
          }
        })

        // Extend draw with custom corridor mode
        const BaseLine: any = (MaplibreDraw as any).modes.draw_line_string
        const DrawCorridorMode: any = {
          ...BaseLine,
          onSetup(this: any, opts: any) {
            const state = BaseLine.onSetup.call(this, opts)
            ensureCorridorPreviewLayers(this.map)
            setCorridorPreviewVisible(this.map, true)
            state._raf = 0
            state._exiting = false
            return state
          },
          onMouseMove(this: any, state: any, e: any) {
            BaseLine.onMouseMove.call(this, state, e)
            this._renderCorridorPreview(state)
          },
          onClick(this: any, state: any, e: any) {
            BaseLine.onClick.call(this, state, e)
            this._renderCorridorPreview(state)
          },
          onStop(this: any, state: any) {
            clearCorridorPreview(this.map)
            setCorridorPreviewVisible(this.map, false)
            state._exiting = true
            BaseLine.onStop.call(this, state)
          },
          _renderCorridorPreview(this: any, state: any) {
            if (!state?.line) return
            if (state._exiting) return

            const coords =
              state.line.coordinates ??
              (typeof state.line.getCoordinates === 'function'
                ? state.line.getCoordinates()
                : null)
            if (!coords || coords.length < 2) return
            const line = {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            }
            const half = (get()._drawOptions.corridorHalfWidthMeters ??
              3) as number
            cancelAnimationFrame(state._raf)
            state._raf = requestAnimationFrame(async () => {
              const poly = await corridorPolygonFromLine(line as any, half)
              const src: any = this.map.getSource(CORRIDOR_PREVIEW_SOURCE_ID)
              if (src) src.setData(poly)
            })
          },
        }

        const draw = new MaplibreDraw({
          displayControlsDefault: false,
          defaultMode: 'simple_select',
          userProperties: true,
          styles: drawStyles,
          keybindings: true,
          modes: {
            ...(MaplibreDraw as any).modes,
            draw_corridor: DrawCorridorMode,
          },
        })

        _map?.addControl(draw, 'bottom-right')

        // const onModeChange = (e: any) => {
        //   console.log('changing mode', e.mode)
        //   const mode = e.mode
        //   const show = mode === 'draw_corridor'
        //   setCorridorPreviewVisible(_map!, show)
        //   if (!show) clearCorridorPreview(_map!)
        // }

        // _map?.on('draw.modechange', onModeChange)

        if (drawMode && drawMode !== 'simple_select') {
          draw.changeMode(drawMode as any)
        }
        const initialMode = getDrawMode(
          draw.getMode() as ExtendedMaplibreDrawMode
        )
        set((state) => {
          state._drawOptions.currentMode = initialMode
        })

        const handleModeChange = (e: any) => {
          const mode = getDrawMode(e.mode as ExtendedMaplibreDrawMode)
          set((state) => {
            state._drawOptions.currentMode = mode
          })
        }
        // Update selectable hover handlers to exclude drawn layers
        _updateSelectableHoverHandlers(layerIds)

        const idField = _drawOptions.idField || 'id'

        if ('data' in source) {
          const data = source.data as FeatureCollection
          const features = data.features
          try {
            // As mapbox draw creates a clone of the original features, we need to ensure
            // that the id field is properly cloned as well. It is used to identify updated and deleted
            // features across the two datasets.
            // If idField is not set (feature.properties[idField]), the feature.id is used instead.
            const modifiedFeatures = features.map((feature) => {
              const userProperties: Record<string, any> = {}

              if (_drawOptions.idField != null) {
                const id = (feature.properties as any)[_drawOptions.idField]
                userProperties[_drawOptions.idField] = id

                if (id !== undefined) {
                } else {
                  throw new Error(
                    `No "${_drawOptions.idField}" found in draw feature's properties.`
                  )
                }
              } else {
                userProperties['id'] = feature.id
              }

              return {
                ...feature,
                properties: userProperties,
              }
            })

            const modifiedSourceData = {
              ...data,
              features: modifiedFeatures,
            }
            //@ts-ignore
            await draw.add(modifiedSourceData)
          } catch (e) {
            console.error(e)
            return
          }

          const handleDrawCreate = (e: any) => {
            const mode = draw.getMode()
            e.features.forEach(async (feature: Feature) => {
              if (_drawOptions.featureAddMutator != null) {
                const mutatedFeature = _drawOptions.featureAddMutator(feature)

                const id = (mutatedFeature.properties as any)[idField]

                if (id !== undefined) {
                  draw.setFeatureProperty(String(feature.id), idField, id)
                } else {
                  console.error(
                    `Mutated draw feature has no idField: "${idField}"`
                  )
                  return
                }
              }
              let f: Feature = feature
              if (mode === 'draw_corridor') {
                try {
                  const half =
                    get()._drawOptions.corridorHalfWidthMeters ??
                    _drawOptions.corridorHalfWidthMeters ??
                    3
                  const poly = (await corridorPolygonFromLine(
                    feature as any,
                    half
                  )) as any
                  // Replace the temp line feature in draw with the polygon
                  try {
                    draw.delete(String(feature.id))
                  } catch {}
                  const props = feature.properties || {}
                  poly.properties = { ...props }
                  draw.add(poly)
                  f = poly
                } catch (err) {
                  console.error('Failed to create corridor polygon', err)
                }
              }
              addFeatureToDrawSource(f, layerGroupId, _map)
            })
          }

          const handleDrawUpdate = (e: any) => {
            e.features.forEach((feature: Feature) => {
              if (_drawOptions.featureUpdateMutator != null) {
                feature = _drawOptions.featureUpdateMutator(feature)
              }
              updateFeatureInDrawSource(feature, idField, layerGroupId, _map)
            })
          }

          const handleDrawDelete = (e: any) => {
            e.features.forEach((feature: Feature) => {
              deleteFeatureFromDrawSource(feature, idField, layerGroupId, _map)
            })
          }

          let handleSelectionChange: ((e: any) => void) | undefined = undefined

          if (isLayerGroupSelectable(layerGroupId, _layerGroups)) {
            const allowedLayers = getSelectableLayers(
              layerGroupId,
              _layerGroups
            )
            handleSelectionChange = (e: any) => {
              const featureIds = e.features.map((feature: any) => {
                return feature.properties[idField]
              })

              const features = fetchFeaturesByIds({
                ids: featureIds,
                source: { source: layerGroupId },
                idField: idField,
                map: _map,
              })

              if (features) {
                // features.filter
                setSelectedFeatures(features)
              }
            }
          _map?.on('draw.selectionchange', handleSelectionChange)
        }

        _map?.on('draw.modechange', handleModeChange)
        _map?.on('draw.create', handleDrawCreate)
        _map?.on('draw.update', handleDrawUpdate)
        _map?.on('draw.delete', handleDrawDelete)

          await set((state) => {
            state._drawOptions.draw = draw
            state._drawOptions.originalStyles = originalStyles
            state._drawOptions.handleDrawCreate = handleDrawCreate
            state._drawOptions.handleDrawUpdate = handleDrawUpdate
            state._drawOptions.handleDrawDelete = handleDrawDelete
            state._drawOptions.handleSelectionChange = handleSelectionChange
            state._drawOptions.handleModeChange = handleModeChange
          })

          _disableLayerGroupEventHandlers(layerGroupId)

          if (selectedFeatures?.length > 0) {
            if (draw.getMode() === 'simple_select') {
              _updateDrawSelectedFeatures(true)
            }
          }
        }
      },
      { key: 'enableDraw', priority: QueuePriority.LOW }
    ),

    _updateDrawSelectedFeatures: (updateSelectedFeatures?: boolean) => {
      const {
        _drawOptions,
        selectedFeatures,
        _layerGroups,
        setSelectedFeatures,
      } = get()
      const _map = useMapInstanceStore.getState()._map

      let newSelectedFeatures: MapGeoJSONFeature[] = []
      newSelectedFeatures = selectedFeatures.filter((feature) => {
        const sourceId = feature.source as string | undefined
        if (!sourceId) {
          return false
        }
        return (
          getLayerGroupIdForSource(sourceId, _layerGroups) ===
          _drawOptions.layerGroupId
        )
      })

      const matchingFeatures = getMatchingDrawFeatures(
        _drawOptions.draw,
        newSelectedFeatures,
        _drawOptions.idField
      )

      const matchingFeatureIds = matchingFeatures.map(
        (feature: Feature) => feature.id as string
      )

      _drawOptions.draw?.changeMode('simple_select', {
        featureIds: matchingFeatureIds,
      })

      _map?.fire('draw.selectionchange', {
        features: matchingFeatures,
      })

      if (updateSelectedFeatures) {
        setSelectedFeatures(newSelectedFeatures)
      }
    },

    disableDraw: helpers.queueableFnInit(
      async () => {
        const _map = useMapInstanceStore.getState()._map
        const { _drawOptions, _updateSelectableHoverHandlers } = get()

        const drawInstance = _drawOptions.draw

        if (drawInstance != null) {
          if (_drawOptions.layerGroupId != null) {
            // geoJSON.features.forEach((feature) => {
            //   const properties = feature.properties || {}
            //   const modifiedProperties: Record<string, any> = {}

            //   for (const key in properties) {
            //     // The original properties of the source features are prefixed with "user_"
            //     // Remove other properties, and remove the prefix that was added by draw.
            //     if (key.startsWith('user_')) {
            //       const modifiedKey = key.replace('user_', '')
            //       modifiedProperties[modifiedKey] = properties[key]
            //     }
            //   }

            //   feature.properties = modifiedProperties
            // })

            // // Set the modified GeoJSON to the original source
            // const originalSource = _map?.getSource(
            //   _drawOptions.layerGroupId
            // ) as mapboxgl.GeoJSONSource
            // originalSource.setData(geoJSON)

            if (_drawOptions.originalStyles != null) {
              for (const [layerId, style] of Object.entries(
                _drawOptions.originalStyles
              )) {
                for (const [property, value] of Object.entries(style)) {
                  _map?.setPaintProperty(layerId, property, value)
                }
              }
            }
          }

          if (_drawOptions.handleDrawCreate != null) {
            _map?.off('draw.create', _drawOptions.handleDrawCreate)
          }
          if (_drawOptions.handleDrawUpdate != null) {
            _map?.off('draw.update', _drawOptions.handleDrawUpdate)
          }
          if (_drawOptions.handleDrawDelete != null) {
            _map?.off('draw.delete', _drawOptions.handleDrawDelete)
          }
          if (_drawOptions.handleSelectionChange != null) {
            _map?.off(
              'draw.selectionchange',
              _drawOptions.handleSelectionChange
            )
          }
          if (_drawOptions.handleModeChange != null) {
            _map?.off('draw.modechange', _drawOptions.handleModeChange)
          }

          // clear selected features, if any
          if (drawInstance.getMode() === 'simple_select') {
            await drawInstance.changeMode('simple_select', {
              featureIds: [],
            })
          }

          // Clean up corridor preview artifacts
          if (_map?.getLayer(CORRIDOR_PREVIEW_LAYER_ID)) {
            _map.removeLayer(CORRIDOR_PREVIEW_LAYER_ID)
          }
          if (_map?.getSource(CORRIDOR_PREVIEW_SOURCE_ID)) {
            _map.removeSource(CORRIDOR_PREVIEW_SOURCE_ID)
          }

          _map?.removeControl(drawInstance)

          // re-enable selectable hover handlers, if some were disabled
          _updateSelectableHoverHandlers()

          await set((state) => {
            state._drawOptions.draw = null
            state._drawOptions.originalStyles = undefined
            state._drawOptions.handleDrawCreate = undefined
            state._drawOptions.handleDrawUpdate = undefined
            state._drawOptions.handleDrawDelete = undefined
            state._drawOptions.handleSelectionChange = undefined
            state._drawOptions.handleModeChange = undefined
            state._drawOptions.currentMode = null
          })
        }
      },
      {
        key: 'disableDraw',
        priority: QueuePriority.LOW,
      }
    ),

    _removeDraw: helpers.queueableFnInit(
      async () => {
        const { disableDraw } = get()

        await disableDraw({ skipQueue: true })
        await set((state) => {
          state._drawOptions.layerGroupId = null
          state._drawOptions.isEnabled = false
        })
      },
      {
        key: 'removeDraw',
        priority: QueuePriority.LOW,
      }
    ),
  }

  return { ...vars, ...actions }
}
