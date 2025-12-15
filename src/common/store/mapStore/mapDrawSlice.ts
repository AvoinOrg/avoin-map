'use client'

import { cloneDeep } from 'lodash-es'
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
  TerraDrawLineStringMode,
  GeoJSONStoreFeatures,
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
  addFeatureToSource,
  updateFeatureInSource,
  deleteFeaturesFromSource,
  getDrawMode,
  corridorPolygonFromLine,
  CORRIDOR_PREVIEW_SOURCE_ID,
  ensureCorridorPreviewLayers,
  setCorridorPreviewVisible,
  clearCorridorPreview,
  getSourceJson,
} from '#/common/utils/map'
import type { MapStoreHelpers, MapStateCreator } from './mapStore'
import type {
  MapDrawOptions,
  DrawMode,
  QueueOptions,
  ExtendedMaplibreDrawMode,
} from '#/common/types/map'
import { QueuePriority } from '#/common/types/map'
import { generateUUID } from '#/common/utils/general'
import { FeatureId } from 'terra-draw/dist/extend'

let activeDrawInstance: TerraDraw | null = null

export const getActiveDrawInstance = () => activeDrawInstance

export const setActiveDrawInstance = (instance: TerraDraw | null) => {
  activeDrawInstance = instance
}

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
      isEnabled: false,
      featureAddMutator: undefined,
      corridorEnabled: true,
      corridorHalfWidthMeters: 3,
      currentMode: null,
      drawGeneration: 0,
    },
  }

  const actions: MapDrawActions = {
    deleteDrawFeatures: (features: Feature[]) => {
      const _map = useMapInstanceStore.getState()._map
      const { _drawOptions, setSelectedFeatures } = get()
      const layerGroupId = _drawOptions.layerGroupId

      if (layerGroupId) {
        deleteFeaturesFromSource(features, layerGroupId, _map)
      }

      setSelectedFeatures([])

      const draw = getActiveDrawInstance()
      if (draw == null) {
        return
      }

      const featureIds = features.map((feature) => String(feature.id))

      try {
        draw.removeFeatures(featureIds as any)
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

        let draw = getActiveDrawInstance()
        if (draw == null) {
          await _enableDraw(mode, { skipQueue: true })
          draw = getActiveDrawInstance()
        } else {
          if (draw.getMode() === mode) {
            disableDraw({ skipQueue: true })
            return
          }
        }

        if (!draw) {
          return
        }

        draw.setMode(mode as any)
        const mapForPreview = useMapInstanceStore.getState()._map
        if (mapForPreview) {
          if (drawMode === 'corridor') {
            ensureCorridorPreviewLayers(mapForPreview)
            clearCorridorPreview(mapForPreview)
            setCorridorPreviewVisible(mapForPreview, false)
          } else {
            clearCorridorPreview(mapForPreview)
            setCorridorPreviewVisible(mapForPreview, false)
          }
        }
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

        let draw = getActiveDrawInstance()

        if (draw == null) {
          await _enableDraw(mode, { skipQueue: true })
          draw = getActiveDrawInstance()
        } else {
          if (mode === 'select' && selectedFeatures.length > 0) {
            _updateDrawSelectedFeatures()
          } else {
            draw.setMode(mode as any)
          }
        }
        if (!draw) {
          return
        }
        const mapForPreview = useMapInstanceStore.getState()._map
        if (mapForPreview) {
          if (drawMode === 'corridor') {
            ensureCorridorPreviewLayers(mapForPreview)
            clearCorridorPreview(mapForPreview)
            setCorridorPreviewVisible(mapForPreview, false)
          } else {
            clearCorridorPreview(mapForPreview)
            setCorridorPreviewVisible(mapForPreview, false)
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
        const sourceFeatureIds = new Set<string | number>()

        removeTerraDrawArtifacts(_map)

        const existingDraw = getActiveDrawInstance()
        if (existingDraw) {
          existingDraw.stop()
          try {
            existingDraw.clear()
          } catch {}
          setActiveDrawInstance(null)
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
          pointerDistance: 25,
          flags: {
            polygon: {
              feature: {
                draggable: true,
                rotateable: true,
                scaleable: true,
                coordinates: {
                  midpoints: true,
                  draggable: true,
                  deletable: true,
                },
              },
            },
            linestring: {
              feature: {
                draggable: true,
                coordinates: {
                  midpoints: true,
                  draggable: true,
                  deletable: true,
                },
              },
            },
            corridor: {
              feature: {
                draggable: true,
                rotateable: true,
                scaleable: true,
                coordinates: {
                  midpoints: true,
                  draggable: true,
                  deletable: true,
                },
              },
            },
          },
        })
        const polygonMode = new TerraDrawPolygonMode()
        const corridorMode = new TerraDrawCorridorMode()

        const draw = new TerraDraw({
          adapter,
          modes: [selectMode, polygonMode, corridorMode],
        })

        draw.start()

        // Set the requested mode (default to 'select' for edit functionality)
        const modeToSet = drawMode ?? 'select'
        draw.setMode(modeToSet as any)

        const initialMode = getDrawMode(draw.getMode() as any)
        set((state) => {
          state._drawOptions.currentMode = initialMode
        })

        _updateSelectableHoverHandlers(layerIds)

        // const ensureFeatureIdentifier = (
        //   input: Feature,
        //   fallbackId?: string | number
        // ) => {
        //   const nextProperties: Record<string, any> = {
        //     ...(input.properties || {}),
        //   }

        //   if (nextProperties.mode == null) {
        //     nextProperties.mode = 'polygon'
        //   }

        //   let identifier = nextProperties[idField] ?? input.id ?? fallbackId
        //   if (identifier == null) {
        //     identifier = fallbackId ?? String(Date.now())
        //   }

        //   nextProperties[idField] = identifier

        //   return {
        //     feature: {
        //       ...input,
        //       id: identifier,
        //       properties: nextProperties,
        //     },
        //     identifier,
        //   }
        // }

        const doesFeatureExistInSource = async (
          candidateId?: string | number | null
        ) => {
          if (candidateId == null) {
            return false
          }

          const sourceData = await getSourceJson(layerGroupId, _map)
          if (!sourceData?.features?.length) {
            return false
          }

          return sourceData.features.some((sourceFeature) => {
            return sourceFeature.id === candidateId
          })
        }

        let corridorPreviewRequest = 0
        const updateCorridorPreview = async (lineFeature?: Feature | null) => {
          const mapInstance = _map
          if (!mapInstance) return

          if (!lineFeature || lineFeature.geometry?.type !== 'LineString') {
            clearCorridorPreview(mapInstance)
            setCorridorPreviewVisible(mapInstance, false)
            return
          }

          ensureCorridorPreviewLayers(mapInstance)
          const requestId = ++corridorPreviewRequest
          const half =
            get()._drawOptions.corridorHalfWidthMeters ??
            _drawOptions.corridorHalfWidthMeters ??
            3

          try {
            const poly = await corridorPolygonFromLine(lineFeature as any, half)
            if (requestId !== corridorPreviewRequest) {
              return
            }
            const src: any = mapInstance.getSource(CORRIDOR_PREVIEW_SOURCE_ID)
            if (src?.setData) {
              src.setData({
                type: 'FeatureCollection',
                features: [poly as any],
              })
              setCorridorPreviewVisible(mapInstance, true)
            }
          } catch (err) {
            console.error('Failed to render corridor preview', err)
          }
        }

        updateCorridorPreview(null)

        if ('data' in source) {
          const data = source.data as FeatureCollection
          const features = data.features
          try {
            // let sourceNeedsUpdate = false
            const terraFeatures = features.map((feature) => {
              if (!feature.id) {
                console.error(
                  'Feature is missing ID field, cannot add to draw: ',
                  feature
                )
                return
              }

              sourceFeatureIds.add(feature.id)

              feature.properties = feature.properties || {}
              feature.properties.mode = feature.properties.mode || 'polygon'

              return feature
            })

            // if (sourceNeedsUpdate) {
            //   const originalSource = _map?.getSource(layerGroupId) as any
            //   originalSource?.setData({ ...data, features: terraFeatures })
            // }
            draw.addFeatures(terraFeatures as any)
          } catch (e) {
            console.error(e)
            return
          }

          const handleFinish = async (featureId: any, context: any) => {
            let feature = draw.getSnapshotFeature(featureId) as Feature | null

            if (!feature) return
            const mode = context?.mode || feature.properties?.mode
            let drawFeatureRemoved = false

            if (mode === 'corridor') {
              try {
                const half =
                  get()._drawOptions.corridorHalfWidthMeters ??
                  _drawOptions.corridorHalfWidthMeters ??
                  3
                const poly = (await corridorPolygonFromLine(
                  feature as any,
                  half
                )) as GeoJSONStoreFeatures

                poly.id = feature.id
                poly.properties = {
                  mode: 'polygon',
                }
                draw.removeFeatures([feature.id!])
                drawFeatureRemoved = true

                feature = poly
                updateCorridorPreview(null)
              } catch (err) {
                console.error('Failed to create corridor polygon', err)
                return
              }
            }

            const existsInSource = await doesFeatureExistInSource(featureId)
            let newFeatureId = null

            if (!existsInSource) {
              if (_drawOptions.featureAddMutator != null) {
                const mutatedFeature = _drawOptions.featureAddMutator({
                  ...feature,
                })

                if (mutatedFeature.id !== feature.id) {
                  newFeatureId = mutatedFeature.id
                }
                await addFeatureToSource(mutatedFeature, layerGroupId, _map)
              } else {
                newFeatureId = generateUUID()
                await addFeatureToSource(
                  { ...feature, id: newFeatureId },
                  layerGroupId,
                  _map
                )
              }

              if (feature.id) {
                if (newFeatureId != null && feature.id !== newFeatureId) {
                  if (!drawFeatureRemoved) {
                    draw.removeFeatures([feature.id])
                    drawFeatureRemoved = true
                  }
                  feature.id = newFeatureId
                  draw.addFeatures([feature as GeoJSONStoreFeatures])

                  sourceFeatureIds.add(feature.id)
                }
              } else {
                console.error(
                  '[mapDrawSlice.ts] Feature is missing ID after add.'
                )
              }
            } else {
              if (_drawOptions.featureUpdateMutator != null) {
                const mutatedFeature =
                  _drawOptions.featureUpdateMutator(feature)
                updateFeatureInSource(mutatedFeature, layerGroupId, _map)
              } else {
                updateFeatureInSource(feature, layerGroupId, _map)
              }
            }

            // const isUpdateAction = ['update', 'edit', 'modify'].includes(
            //   context?.action
            // )

            // const shouldUpdateExisting = existsInSource

            // if (shouldUpdateExisting) {
            //   if (_drawOptions.featureUpdateMutator != null) {
            //   }

            //   updateFeatureInSource(
            //     feature,
            //     idField,
            //     layerGroupId,
            //     _map
            //   )
            //   if (identifier != null) {
            //     sourceFeatureIds.add(identifier)
            //   }
            // } else {
            //   if (_drawOptions.featureAddMutator != null) {
            //     const mutatedFeature =
            //       _drawOptions.featureAddMutator(normalizedFeature)
            //     ;({ feature: normalizedFeature, identifier } =
            //       ensureFeatureIdentifier(mutatedFeature, featureId))
            //   }

            // }

            // Switch to select/edit mode and select the new/updated feature
            try {
              draw.setMode('select')
              if (feature.id != null) {
                draw.selectFeature(feature.id as any)
              }
            } catch (err) {
              console.warn('Failed to switch to select mode after finish', err)
            }

            const selected = featureId
              ? fetchFeaturesByIds({
                  ids: [featureId],
                  source: { source: layerGroupId },
                  map: _map,
                }) || []
              : []

            if (selected.length > 0) {
              setSelectedFeatures(selected as any)
              _map?.fire('draw.selectionchange', { features: selected })
            }

            set((state) => {
              state._drawOptions.currentMode = 'edit'
            })
          }

          const handleChange = (ids: any[], type: string) => {
            if (type === 'update') {
              let previewUpdated = false
              ids.forEach((id) => {
                const isCorridorMode = draw.getMode() === 'corridor'

                if (isCorridorMode) {
                  const feature = draw.getSnapshotFeature(id) as Feature | null
                  if (!feature) return

                  if (feature.geometry?.type === 'LineString') {
                    updateCorridorPreview(feature)
                    previewUpdated = true
                  }
                }

                // if (
                //   !props ||
                //   props.currentlyDrawing ||
                //   props.closingPoint ||
                //   props.coordinatePoint
                // ) {
                //   return
                // }
                // const fid = props[idField] ?? feature.id
                // if (fid == null) return
                // if (!sourceFeatureIds.has(fid)) {
                //   return
                // }
                // let updated: Feature = { ...feature, id: fid }
                // if (_drawOptions.featureUpdateMutator != null) {
                //   updated = _drawOptions.featureUpdateMutator(updated)
                // }
                // updateFeatureInSource(updated, idField, layerGroupId, _map)
              })
              if (!previewUpdated) {
                updateCorridorPreview(null)
              }
            } else if (type === 'delete') {
              const filteredIds = ids.filter((id) => {
                if (typeof id !== 'string' && typeof id !== 'number') {
                  return false
                }
                if (!sourceFeatureIds.has(id)) {
                  return false
                }
                // Verify the feature is actually gone from TerraDraw
                // If it still exists, this is just a temporary change event
                try {
                  const stillExists = draw.getSnapshotFeature(id as FeatureId)
                  if (stillExists) {
                    return false
                  }
                } catch {
                  // Feature doesn't exist, proceed with delete
                }
                return true
              })

              if (filteredIds.length === 0) {
                return
              }

              const deletedFeatures: Feature[] = []
              ids.forEach((id) => {
                const deletionFeature: Feature = {
                  type: 'Feature',
                  geometry: null as any,
                  properties: {
                    id: id,
                  },
                  id,
                }
                deletedFeatures.push(deletionFeature)
                sourceFeatureIds.delete(id)
              })

              if (deletedFeatures.length > 0) {
                _map?.fire('draw.delete', { features: deletedFeatures })
                deleteFeaturesFromSource(deletedFeatures, layerGroupId, _map)
              }
            }
          }

          const handleSelect = (id: any) => {
            const feature = draw.getSnapshotFeature(id) as Feature | null
            if (!feature) return
            const fid = feature.id
            if (fid == null) return
            const featureIds = [fid]
            const features = fetchFeaturesByIds({
              ids: featureIds,
              source: { source: layerGroupId },
              map: _map,
            })
            const nextFeatures = features ?? []
            setSelectedFeatures(nextFeatures)
            _map?.fire('draw.selectionchange', {
              features: nextFeatures,
            })
          }

          const handleDeselect = () => {
            setSelectedFeatures([])
            _map?.fire('draw.selectionchange', { features: [] })
          }

          draw.on('finish', handleFinish)
          draw.on('change', handleChange as any)
          draw.on('select', handleSelect)
          draw.on('deselect', handleDeselect)

          setActiveDrawInstance(draw)

          await set((state) => {
            state._drawOptions.originalStyles = originalStyles
            state._drawOptions.handleDrawFinish = handleFinish
            state._drawOptions.handleDrawUpdate = handleChange
            state._drawOptions.handleSelectionChange = handleSelect
            state._drawOptions.drawGeneration += 1
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

      const draw = getActiveDrawInstance()

      const matchingFeatures = getMatchingDrawFeatures(
        draw,
        newSelectedFeatures
      )

      const matchingFeatureIds = matchingFeatures.map(
        (feature: Feature) => feature.id as string
      )

      if (draw) {
        draw.setMode('select')
        matchingFeatureIds.forEach((id) => {
          try {
            draw?.selectFeature(id as any)
          } catch {}
        })
      }

      if (updateSelectedFeatures) {
        setSelectedFeatures(newSelectedFeatures)
      }

      _map?.fire('draw.selectionchange', {
        features: matchingFeatures,
      })
    },

    disableDraw: helpers.queueableFnInit(
      async () => {
        const _map = useMapInstanceStore.getState()._map
        const {
          _drawOptions,
          _updateSelectableHoverHandlers,
          setSelectedFeatures,
        } = get()

        const drawInstance = getActiveDrawInstance()

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

          if (_drawOptions.handleDrawFinish != null) {
            drawInstance.off('finish', _drawOptions.handleDrawFinish)
          }
          if (_drawOptions.handleDrawUpdate != null) {
            drawInstance.off('change', _drawOptions.handleDrawUpdate as any)
          }
          if (_drawOptions.handleSelectionChange != null) {
            drawInstance.off('select', _drawOptions.handleSelectionChange)
            drawInstance.off('deselect', _drawOptions.handleSelectionChange)
          }

          setSelectedFeatures([])

          drawInstance.stop()
          try {
            drawInstance.clear()
          } catch {}
          removeTerraDrawArtifacts(_map)
          clearCorridorPreview(_map as any)
          setCorridorPreviewVisible(_map as any, false)

          // re-enable selectable hover handlers, if some were disabled
          _updateSelectableHoverHandlers()

          await set((state) => {
            state._drawOptions.originalStyles = undefined
            state._drawOptions.handleDrawFinish = undefined
            state._drawOptions.handleDrawUpdate = undefined
            state._drawOptions.handleSelectionChange = undefined
            state._drawOptions.currentMode = null
            state._drawOptions.drawGeneration += 1
          })

          setActiveDrawInstance(null)
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
