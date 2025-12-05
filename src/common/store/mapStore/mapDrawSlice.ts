'use client'

import { cloneDeep } from 'lodash-es'
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
  TerraDrawLineStringMode,
} from 'terra-draw'
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter'
import type { Feature, FeatureCollection } from 'geojson'
import type { MapGeoJSONFeature } from 'maplibre-gl'
import { useMapInstanceStore } from './mapInstanceStore'
import {
  getMaplibreDrawMode,
  getLayerGroupIdForSource,
  getSelectableLayers,
  isLayerGroupSelectable,
  fetchFeaturesByIds,
  getMatchingDrawFeatures,
  addFeatureToDrawSource,
  updateFeatureInDrawSource,
  deleteFeatureFromDrawSource,
  getDrawMode,
  corridorPolygonFromLine,
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

// Custom TerraDraw mode for corridors. Leverages LineString drawing but reports a unique mode name.
class TerraDrawCorridorMode extends TerraDrawLineStringMode {
  mode = 'corridor'
  constructor() {
    super({ modeName: 'corridor' } as any)
  }
}

const removeTerraDrawArtifacts = (map: maplibregl.Map | null) => {
  if (!map) return
  const style = map.getStyle()
  const terraLayerIds = (style.layers || [])
    .map((l) => l.id)
    .filter((id) => id.startsWith('td-'))
  terraLayerIds.forEach((id) => {
    if (map.getLayer(id)) {
      try {
        map.removeLayer(id)
      } catch {}
    }
  })
  const terraSourceIds = Object.keys(style.sources || {}).filter((id) =>
    id.startsWith('td-')
  )
  terraSourceIds.forEach((id) => {
    if (map.getSource(id)) {
      try {
        map.removeSource(id)
      } catch {}
    }
  })
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

      try {
        _drawOptions.draw.removeFeatures(featureIds as any)
      } catch (err) {
        console.error('Failed to remove features', err)
      }

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

        _drawOptions.draw?.setMode(mode as any)
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
          if (mode === 'select' && selectedFeatures.length > 0) {
            _updateDrawSelectedFeatures()
          } else {
            _drawOptions.draw.setMode(mode as any)
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

        // Clean up any previous TerraDraw layers/sources that might linger after errors
        removeTerraDrawArtifacts(_map)

        // Stop a previous instance if somehow still present
        if (_drawOptions.draw) {
          try {
            _drawOptions.draw.stop()
            _drawOptions.draw.clear()
          } catch {}
          await set((state) => {
            state._drawOptions.draw = null
          })
        }

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
        if (!layerGroup || !layerGroup.layers) {
          console.error(`No layerGroup found with id: ${layerGroupId}`)
          return
        }
        const layerIds = Object.keys(layerGroup.layers || {})
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

        const adapter = new TerraDrawMapLibreGLAdapter({
          map: _map,
          prefixId: 'td',
        })

        const selectMode = new TerraDrawSelectMode({
          modeName: 'select',
        } as any)
        const polygonMode = new TerraDrawPolygonMode({
          modeName: 'polygon',
        } as any)
        const corridorMode = new TerraDrawCorridorMode()

        const draw = new TerraDraw({
          adapter,
          modes: [selectMode, polygonMode, corridorMode],
        })

        draw.start()

        // const onModeChange = (e: any) => {
        //   console.log('changing mode', e.mode)
        //   const mode = e.mode
        //   const show = mode === 'draw_corridor'
        //   setCorridorPreviewVisible(_map!, show)
        //   if (!show) clearCorridorPreview(_map!)
        // }

        // _map?.on('draw.modechange', onModeChange)

        if (drawMode && drawMode !== 'select') {
          draw.setMode(drawMode as any)
        }
        const initialMode = getDrawMode(draw.getMode() as any)
        set((state) => {
          state._drawOptions.currentMode = initialMode
        })

        // Update selectable hover handlers to exclude drawn layers
        _updateSelectableHoverHandlers(layerIds)

        const idField = _drawOptions.idField || 'id'

        if ('data' in source) {
          const data = source.data as FeatureCollection
          const features = data.features
          try {
            const terraFeatures = features.map((feature) => {
              const userProperties: Record<string, any> = {
                mode: 'polygon',
              }

              if (_drawOptions.idField != null) {
                const id = (feature.properties as any)[_drawOptions.idField]
                userProperties[_drawOptions.idField] = id
              } else if (feature.id != null) {
                userProperties['id'] = feature.id
              }

              return {
                ...feature,
                id: feature.id,
                properties: userProperties,
              }
            })

            draw.addFeatures(terraFeatures as any)
          } catch (e) {
            console.error(e)
            return
          }

          const handleFinish = async (featureId: any, context: any) => {
            const feature = draw.getSnapshotFeature(featureId) as Feature | null
            if (!feature) return
            const mode = context?.mode || feature.properties?.mode
            if (!_drawOptions.idField) {
              feature.properties = {
                ...(feature.properties || {}),
                id: feature.id,
              }
            } else {
              feature.properties = {
                ...(feature.properties || {}),
                [_drawOptions.idField]:
                  (feature.properties as any)?.[_drawOptions.idField] ??
                  feature.id,
              }
            }
            if (_drawOptions.featureAddMutator != null) {
              Object.assign(
                feature,
                _drawOptions.featureAddMutator(feature as Feature)
              )
            }

            if (mode === 'corridor') {
              try {
                const half =
                  get()._drawOptions.corridorHalfWidthMeters ??
                  _drawOptions.corridorHalfWidthMeters ??
                  3
                const poly = (await corridorPolygonFromLine(
                  feature as any,
                  half
                )) as any
                poly.id = feature.id
                poly.properties = {
                  ...(feature.properties || {}),
                  mode: 'polygon',
                }
                draw.removeFeatures([featureId])
                draw.addFeatures([poly])
                addFeatureToDrawSource(poly, layerGroupId, _map)
                return
              } catch (err) {
                console.error('Failed to create corridor polygon', err)
              }
            }

            addFeatureToDrawSource(feature, layerGroupId, _map)
          }

          const handleChange = (ids: any[], type: string) => {
            if (type === 'update') {
              ids.forEach((id) => {
                const feature = draw.getSnapshotFeature(id) as Feature | null
                if (!feature) return
                const props = feature.properties as Record<string, any> | null
                // Skip TerraDraw guidance/provisional features that should not sync to the source
                if (
                  !props ||
                  props.currentlyDrawing ||
                  props.closingPoint ||
                  props.coordinatePoint
                ) {
                  return
                }
                const fid = props[idField]
                if (fid == null) return
                let f: Feature = { ...feature, id: fid }
                if (_drawOptions.featureUpdateMutator != null) {
                  f = _drawOptions.featureUpdateMutator(f)
                }
                updateFeatureInDrawSource(f, idField, layerGroupId, _map)
              })
            } else if (type === 'delete') {
              ids.forEach((id) => {
                const deletionFeature: Feature = {
                  type: 'Feature',
                  geometry: null as any,
                  properties: {
                    [idField]: id,
                  },
                  id,
                }
                deleteFeatureFromDrawSource(
                  deletionFeature,
                  idField,
                  layerGroupId,
                  _map
                )
              })
            }
          }

          const handleSelect = (id: any) => {
            const feature = draw.getSnapshotFeature(id) as Feature | null
            if (!feature) return
            const fid = (feature.properties as any)?.[idField] ?? feature.id
            if (fid == null) return
            const featureIds = [fid]
            const features = fetchFeaturesByIds({
              ids: featureIds,
              source: { source: layerGroupId },
              idField,
              map: _map,
            })
            setSelectedFeatures(features)
          }

          const handleDeselect = () => {
            setSelectedFeatures([])
          }

          draw.on('finish', handleFinish)
          draw.on('change', handleChange as any)
          draw.on('select', handleSelect)
          draw.on('deselect', handleDeselect)

          await set((state) => {
            state._drawOptions.draw = draw
            state._drawOptions.originalStyles = originalStyles
            state._drawOptions.handleDrawCreate = handleFinish
            state._drawOptions.handleDrawUpdate = handleChange as any
            state._drawOptions.handleDrawDelete = handleChange as any
            state._drawOptions.handleSelectionChange = handleSelect as any
          })

          _disableLayerGroupEventHandlers(layerGroupId)

          if (selectedFeatures?.length > 0) {
            if (draw.getMode() === 'select') {
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

      if (_drawOptions.draw) {
        _drawOptions.draw.setMode('select')
        matchingFeatureIds.forEach((id) => {
          try {
            _drawOptions.draw?.selectFeature(id as any)
          } catch {}
        })
      }

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
            drawInstance.off('finish', _drawOptions.handleDrawCreate)
          }
          if (_drawOptions.handleDrawUpdate != null) {
            drawInstance.off('change', _drawOptions.handleDrawUpdate as any)
          }
          if (_drawOptions.handleDrawDelete != null) {
            drawInstance.off('change', _drawOptions.handleDrawDelete as any)
          }
          if (_drawOptions.handleSelectionChange != null) {
            drawInstance.off('select', _drawOptions.handleSelectionChange)
            drawInstance.off('deselect', _drawOptions.handleSelectionChange)
          }

          // clear selected features, if any
          setSelectedFeatures([])

          drawInstance.stop()
          try {
            drawInstance.clear()
          } catch {}
          removeTerraDrawArtifacts(_map)

          // re-enable selectable hover handlers, if some were disabled
          _updateSelectableHoverHandlers()

          await set((state) => {
            state._drawOptions.draw = null
            state._drawOptions.originalStyles = undefined
            state._drawOptions.handleDrawCreate = undefined
            state._drawOptions.handleDrawUpdate = undefined
            state._drawOptions.handleDrawDelete = undefined
            state._drawOptions.handleSelectionChange = undefined
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
