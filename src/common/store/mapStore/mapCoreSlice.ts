'use client'

import { cloneDeep } from 'lodash-es'
import stableStringify from 'fast-json-stable-stringify'
import { enableMapSet } from 'immer'
import type { MapLayerMouseEvent, MapGeoJSONFeature } from 'maplibre-gl'
import { useMapInstanceStore } from './mapInstanceStore'
import type { MapStoreHelpers, MapStateCreator } from './mapStore'
import {
  MapLibraryMode,
  QueueFunction,
  FunctionQueue,
  QueuePriority,
  LayerGroupOptions,
  SerializableLayerGroupAddOptions,
  MapContext,
} from '#/common/types/map'
import {
  getAllLayerOptionsObj,
  getLayerGroupIdForLayer,
  isMatchingSource,
} from '#/common/utils/map'
import { getVisibleLayerGroups } from '#/common/utils/map'

const DEFAULT_MAP_LIBRARY_MODE: MapLibraryMode = 'maplibre'

enableMapSet()

export type MapCoreVars = {
  mapLibraryMode: MapLibraryMode
  mapContext: MapContext | null
  isLoaded: boolean
  _isMapReady: boolean
  _functionQueue: FunctionQueue
  _isFunctionQueueExecuting: boolean
  _globalEventHandlers: {
    selectableLeave?: (e: MapLayerMouseEvent) => void
    selectableMove?: (e: MapLayerMouseEvent) => void
    selectableEnter?: (e: MapLayerMouseEvent) => void
    selectableLayers: string[]
  }
  _isHydrated: boolean
  _hydrationData: {
    layerGroups: Record<string, LayerGroupOptions>
    persistingLayerGroupAddOptions: Record<
      string,
      SerializableLayerGroupAddOptions
    >
  }
}

export type MapCoreActions = {
  setMapLibraryMode: (mode: MapLibraryMode) => void
  setMapContext: (mapContext: MapContext) => void
  _updateSelectableHoverHandlers: (excludeLayerIds?: string[]) => void
  _setLayerFilters: (feature?: MapGeoJSONFeature) => void
  _setIsHydrated: (isHydrated: boolean) => void
  _setIsLoaded: (isLoaded: boolean) => void
  _setIsMapReady: (isMapReady: boolean) => void
  _addToFunctionQueue: (queueFunction: QueueFunction) => Promise<any>
  _setFunctionQueue: (functionQueue: FunctionQueue) => void
  _executeFunctionQueue: (callback?: () => void) => Promise<void>
  _setIsFunctionQueueExecuting: (isExecuting: boolean) => void
  _runHydrationActions: () => void
}

export type MapCoreSlice = MapCoreVars & MapCoreActions

export const createMapCoreSlice: (
  helpers: MapStoreHelpers
) => MapStateCreator<MapCoreSlice> = (helpers) => (set, get) => {
  const vars: MapCoreVars = {
    mapLibraryMode: DEFAULT_MAP_LIBRARY_MODE,
    isLoaded: false,
    mapContext: null,
    _isMapReady: false,
    _functionQueue: [],
    _isFunctionQueueExecuting: false,
    _globalEventHandlers: { selectableLayers: [] },
    _isHydrated: false,
    _hydrationData: {
      layerGroups: {},
      persistingLayerGroupAddOptions: {},
    },
  }

  const actions: MapCoreActions = {
    setMapLibraryMode: (mode: MapLibraryMode) => {
      set((state) => {
        state.mapLibraryMode = mode
      })
    },

    setMapContext: (mapContext: MapContext) => {
      set((state) => {
        state.mapContext = mapContext
      })
    },

    _updateSelectableHoverHandlers: (excludeLayerIds: string[] = []) => {
      const { _layerGroups, _globalEventHandlers, _setLayerFilters } = get()
      const _map = useMapInstanceStore.getState()._map
      if (!_map) return

      const layerOptionsObj = getAllLayerOptionsObj(_layerGroups)

      const oldLayers = _globalEventHandlers.selectableLayers ?? []
      if (_globalEventHandlers.selectableEnter)
        _map.off('mouseenter', oldLayers, _globalEventHandlers.selectableEnter)
      if (_globalEventHandlers.selectableMove)
        _map.off('mousemove', oldLayers, _globalEventHandlers.selectableMove)
      if (_globalEventHandlers.selectableLeave)
        _map.off('mouseleave', oldLayers, _globalEventHandlers.selectableLeave)

      const selectableLayers: string[] = []
      for (const layerOptions of Object.values(layerOptionsObj)) {
        if (
          layerOptions.hoverPointer &&
          !excludeLayerIds.includes(layerOptions.id)
        ) {
          selectableLayers.push(layerOptions.id)
        }
      }

      if (selectableLayers.length === 0) {
        set({
          _globalEventHandlers: {
            ..._globalEventHandlers,
            selectableEnter: undefined,
            selectableMove: undefined,
            selectableLeave: undefined,
            selectableLayers: [],
          },
        })
        return
      }

      type HoverRef = {
        source: string
        id: any
        sourceLayer?: string
        layerId: string
      }
      const lastHoverByLayer: Record<string, HoverRef | null> = {}

      const clearHoverForLayer = (layerId: string) => {
        const lastHover = lastHoverByLayer[layerId]
        if (lastHover) {
          try {
            _map.setFeatureState(
              {
                source: lastHover.source,
                id: lastHover.id,
                ...(lastHover.sourceLayer
                  ? { sourceLayer: lastHover.sourceLayer }
                  : {}),
              },
              { hover: false }
            )
          } catch {}
          lastHoverByLayer[layerId] = null
        }
      }

      const clearAllHover = () => {
        for (const lastHover of Object.values(lastHoverByLayer)) {
          if (!lastHover) continue
          clearHoverForLayer(lastHover.layerId)
        }
        selectableLayers.forEach((id) => (lastHoverByLayer[id] = null))
      }

      const applyHoverFromEvent = (e: maplibregl.MapLayerMouseEvent) => {
        const f = e.features?.[0]
        if (!f) return
        const layerId = (f.layer as any)?.id as string | undefined
        if (!layerId) return

        // Figure out a usable feature id
        const fid =
          (f.id as any) ??
          (f.properties && (f.properties.cluster_id ?? f.properties.id))
        if (fid == null) {
          // No id → feature-state won’t work; suggest promoteId/generateId in your source.
          return
        }

        const source = f.source as string
        const sourceLayer = (f as any).sourceLayer as string | undefined
        const prev = lastHoverByLayer[layerId]

        // If we moved to a different feature (or source/layer), clear previous
        if (
          prev &&
          (prev.id !== fid ||
            prev.source !== source ||
            prev.sourceLayer !== sourceLayer)
        ) {
          clearHoverForLayer(layerId)
        }

        // Set current hover
        try {
          _map.setFeatureState(
            { source, id: fid, ...(sourceLayer ? { sourceLayer } : {}) },
            { hover: true }
          )
          lastHoverByLayer[layerId] = { source, id: fid, sourceLayer, layerId }
        } catch {}

        _setLayerFilters(f)
      }

      const onEnter = (e: maplibregl.MapLayerMouseEvent) => {
        _map.getCanvas().style.cursor = 'pointer'
        applyHoverFromEvent(e)
      }

      const onMove = (e: maplibregl.MapLayerMouseEvent) => {
        applyHoverFromEvent(e)
      }

      const onLeave = () => {
        _map.getCanvas().style.cursor = ''
        clearAllHover() // clear all tracked hovers for these layers
        _setLayerFilters()
      }

      _map.on('mouseenter', selectableLayers, onEnter)
      _map.on('mousemove', selectableLayers, onMove)
      _map.on('mouseleave', selectableLayers, onLeave)

      set({
        _globalEventHandlers: {
          ..._globalEventHandlers,
          selectableEnter: onEnter,
          selectableMove: onMove,
          selectableLeave: onLeave,
          selectableLayers: selectableLayers,
        },
      })
    },

    // finds all related layers by source, checks their activeOn status, and then applies a filter on them on if needed
    _setLayerFilters: (feature?: MapGeoJSONFeature) => {
      const _map = useMapInstanceStore.getState()._map

      const { _layerGroups } = get()

      if (feature) {
        const layerGroupId = getLayerGroupIdForLayer(
          feature.layer.id,
          _layerGroups
        )

        if (!layerGroupId) return

        for (const layer of Object.values(_layerGroups[layerGroupId].layers)) {
          if (
            layer.source != null &&
            isMatchingSource(
              feature,
              layer as { source: string; sourceLayer?: string }
            )
          ) {
            if (
              layer &&
              ['hover', 'hover-or-selected'].includes(layer.activeOn)
            ) {
              const idsToFilter = [feature.id]

              if (layer.activeOn === 'hover-or-selected') {
                const selectedFeatures = get().selectedFeatures

                const selectedFromSource = selectedFeatures.filter((sf) =>
                  isMatchingSource(sf, feature)
                )

                if (selectedFromSource != null) {
                  const isSelected = selectedFromSource.some(
                    (sf) =>
                      sf.id === feature.id ||
                      (sf.properties &&
                        feature.properties &&
                        sf.properties.id !== undefined &&
                        sf.properties.id === feature.properties.id)
                  )

                  if (isSelected) return // filters should already apply

                  for (const sf of selectedFromSource) {
                    if (sf.id != null) {
                      idsToFilter.push(sf.id)
                    }
                  }
                }
              }
              _map?.setFilter(layer.id, [
                'in',
                ['id'],
                ['literal', idsToFilter],
              ])
            }
          }
        }
        // No feature given, so there is nothing currently being hovered over. Clear the hover filters, but keep selected features.
      } else {
        const layerOptionsObj = getAllLayerOptionsObj(_layerGroups)

        const hoverableLayers = []
        for (const layerOptions of Object.values(layerOptionsObj)) {
          if (['hover', 'hover-or-selected'].includes(layerOptions.activeOn)) {
            hoverableLayers.push(layerOptions)
          }
        }

        for (const layer of hoverableLayers) {
          const idsToFilter: any[] = []

          if (layer.activeOn === 'hover-or-selected') {
            const selectedFeatures = get().selectedFeatures

            for (const sf of selectedFeatures) {
              if (
                isMatchingSource(
                  sf,
                  layer as { source: string; sourceLayer?: string }
                ) &&
                sf.id != null
              ) {
                idsToFilter.push(sf.id)
              }
            }
          }
          _map?.setFilter(layer.id, ['in', ['id'], ['literal', idsToFilter]])
        }
      }
    },

    _setIsHydrated: (isHydrated: boolean) => {
      set((state) => {
        state._isHydrated = isHydrated
      })
    },

    _setIsLoaded: (isLoaded: boolean) => {
      set((state) => {
        state.isLoaded = isLoaded
      })
    },

    _setIsMapReady: (isMapReady: boolean) => {
      set((state) => {
        state._isMapReady = isMapReady
      })
    },

    // Used by OpenLayers. Broken after removing ActiveLayerGroupIds
    // Refactor if migrating to OpenLayers
    // _addStyleToOl: async (
    //   id: LayerGroupId | string,
    //   options: LayerGroupAddOptionsWithConf
    // ) => {
    //   const style = await resolveMbStyle(options.layerConf.style)

    //   const layers: ExtendedLayerSpecification[] = style.layers
    //   const sourceKeys = Object.keys(style.sources)

    //   const layerGroup: any = {}

    //   // After adding the layers using style, find them and add them to the layerGroup
    //   //@ts-ignore
    //   olms(map, style).then((map) => {
    //     map
    //       .getLayers()
    //       .getArray()
    //       .forEach((layer: any) => {
    //         const sourceKey = layer.get('mapbox-source')
    //         const layerKeys = layer.get('mapbox-layers')

    //         if (
    //           sourceKeys.includes(sourceKey) &&
    //           layerKeys != null &&
    //           layerKeys.length > 0
    //         ) {
    //           const conf: ExtendedLayerSpecification | undefined =
    //             layers.find((l: any) => l.id === layerKeys[0])

    //           if (conf) {
    //             //@ts-ignore
    //             const layerOpt: LayerOptions = {
    //               id: layerKeys[0],
    //               source: sourceKey,
    //               name: getLayerName(layerKeys[0]),
    //               layerType: getLayerType(layerKeys[0]),
    //               selectable: conf.selectable || false,
    //               multiSelectable: conf.multiSelectable || false,
    //               //@ts-ignore
    //               popup: options.layerConf.popup || false,
    //               useMb: false,
    //             }

    //             layer.set('group', id)
    //             layerGroup[layerKeys[0]] = layer

    //             set((state) => {
    //               //@ts-ignore
    //               state._layerOptions[layerKeys[0]] = layerOpt
    //             })
    //           } else {
    //             console.error(
    //               'Could not find layer configuration for layer: ' +
    //                 layerKeys[0]
    //             )
    //           }
    //         }
    //       })

    //     set((state) => {
    //       state._layerGroups[id] = layerGroup
    //     })

    //     if (!options.isHidden) {
    //       set((state) => {
    //         //@ts-ignore
    //         state.activeLayerGroupIds.push(id)
    //       })
    //     } else {
    //       for (const layer in layerGroup) {
    //         layerGroup[layer].setVisible(false)
    //       }
    //     }

    //     // TODO: Figure out olMap popups
    //     // if (layerConf.popup) {
    //     //   set((state) => {
    //     //     state.popups[id] = layerConf.popup
    //     //   })
    //     // }
    //   })
    // },

    // ensures that latest state is used in the callback
    _addToFunctionQueue: (queueFunction: QueueFunction): Promise<any> => {
      // construct a promise that will be manually resolved when the function is called
      let promiseResolve: any, promiseReject: any
      const promise = new Promise((resolve, reject) => {
        promiseResolve = resolve
        promiseReject = reject
      })

      if (queueFunction.priority === undefined) {
        queueFunction.priority = QueuePriority.LOW
      }

      set((state) => {
        state._functionQueue.push({
          fn: queueFunction.fn,
          args: queueFunction.args,
          priority: queueFunction.priority,
          key: queueFunction.key,
          allowDuplicates: queueFunction.allowDuplicates,
          promise: {
            resolve: promiseResolve,
            reject: promiseReject,
          },
        })
      })

      return promise
    },

    _setFunctionQueue: (functionQueue: FunctionQueue) => {
      set((state) => {
        state._functionQueue = functionQueue
      })
    },

    _setIsFunctionQueueExecuting: (isExecuting: boolean) => {
      set((state) => {
        state._isFunctionQueueExecuting = isExecuting
      })
    },

    _executeFunctionQueue: async (callback?: () => void) => {
      const { _isFunctionQueueExecuting, _setIsFunctionQueueExecuting } = get()

      if (!_isFunctionQueueExecuting) {
        _setIsFunctionQueueExecuting(true)
      } else {
        throw new Error('Function queue is already executing.')
      }

      const loopThroughQueuePriorityLevels = async (
        functionQueue: FunctionQueue
      ): Promise<void> => {
        const store = get()
        let functionsToCall: FunctionQueue = []

        let priorityArr = Object.values(QueuePriority)
        priorityArr = priorityArr.reverse().splice(0, priorityArr.length / 2)

        for (let i in priorityArr) {
          functionsToCall = functionsToCall.concat(
            functionQueue.filter((f) => f.priority === priorityArr[i])
          )

          if (functionsToCall.length > 0) {
            store._setFunctionQueue(
              store._functionQueue.filter((f) => !functionsToCall.includes(f))
            )
            break
          }
        }

        const callFuncs = async () => {
          const basicFns: FunctionQueue = []
          const keyGroups: Record<string, FunctionQueue> = {}
          const dupeCheckObj: Record<string, FunctionQueue> = {}

          functionsToCall.forEach((call) => {
            if (!call.key) {
              console.warn(
                'A function in the queue is missing a key, this may cause issues with duplicate function calls.',
                call
              )
              basicFns.push(call)
              return
            }

            const key = `${call.key}-${stableStringify(call.args)}`
            if (call.allowDuplicates) {
              if (!dupeCheckObj[key]) {
                dupeCheckObj[key] = []
              }

              keyGroups[key].push(call)
            } else {
              if (!dupeCheckObj[key]) {
                dupeCheckObj[key] = []
              } else {
                console.debug(
                  `Duplicate function call detected for key: ${key}. Only the last one will be executed.`
                )
              }

              dupeCheckObj[key].push(call)
            }
          })

          for (const key in dupeCheckObj) {
            if (!keyGroups[key]) {
              keyGroups[key] = []
            }
            const lastIndex = dupeCheckObj[key].length - 1
            keyGroups[key].push(dupeCheckObj[key][lastIndex])
          }

          const promises: Promise<any>[] = []

          // Handle functions with unique keys
          for (const key in keyGroups) {
            const group = keyGroups[key]

            if (group.length > 1) {
              promises.push(
                (async () => {
                  for (const call of group) {
                    try {
                      const result = await call.fn(...call.args)
                      if (call.promise != null) {
                        call.promise.resolve(result)
                      }
                    } catch (e) {
                      console.error(
                        "Couldn't run queued map function",
                        call.fn,
                        call.args
                      )
                      console.error(e)
                      if (call.promise) {
                        call.promise.reject(
                          new Error('Function execution failed')
                        )
                      }
                      return null
                    }
                  }
                })()
              )
            } else {
              // If only one function with this unique key, treat as normal
              basicFns.push(group[0])
            }
          }

          // Handle singular functions
          basicFns.forEach((call) => {
            promises.push(
              (async () => {
                try {
                  const result = await call.fn(...call.args)
                  if (call.promise != null) {
                    call.promise.resolve(result)
                  }
                } catch (e) {
                  console.error(
                    "Couldn't run queued map function",
                    call.fn,
                    call.args
                  )
                  console.error(e)
                  if (call.promise) {
                    call.promise.reject(new Error('Function execution failed'))
                  }
                  return null
                }
              })()
            )
          })

          await Promise.all(promises)
        }

        try {
          await callFuncs()
        } catch (e) {
          console.error('Error running the queued functions: ', e)
        }

        return
      }

      while (true) {
        const _functionQueue = get()._functionQueue

        if (_functionQueue.length === 0) {
          break
        }
        await loopThroughQueuePriorityLevels(_functionQueue)
      }

      callback && (await callback())
      _setIsFunctionQueueExecuting(false)

      return
    },

    // _enableLayerEventHandlers: (layerOptions: LayerOptions) => {
    //   if (
    //     layerOptions.eventHandlers != null &&
    //     Object.keys(layerOptions.eventHandlers).length > 0
    //   ) {
    //     const _map = useMapInstanceStore.getState()._map

    //     Object.keys(layerOptions.eventHandlers).forEach(
    //       (eventKeyString) => {
    //         const eventKey = eventKeyString as keyof MapLayerEventType
    //         const handlerFn = layerOptions.eventHandlers[eventKey]
    //         if (handlerFn != null) {
    //           _map?.on(eventKey, layerOptions.id, handlerFn)
    //         }
    //       }
    //     )
    //   }
    // },

    // _disableLayerEventHandlers: (layerOptions: LayerOptions) => {
    //   if (
    //     layerOptions.eventHandlers != null &&
    //     Object.keys(layerOptions.eventHandlers).length > 0
    //   ) {
    //     const _map = useMapInstanceStore.getState()._map

    //     Object.keys(layerOptions.eventHandlers).forEach(
    //       (eventKeyString) => {
    //         const eventKey = eventKeyString as keyof MapLayerEventType
    //         const handlerFn = layerOptions.eventHandlers[eventKey]
    //         if (handlerFn != null) {
    //           _map?.off(eventKey, layerOptions.id, handlerFn)
    //         }
    //       }
    //     )
    //   }
    // },

    _runHydrationActions: async () => {
      const { _setIsHydrated, _hydrationData, enableSerializableLayerGroup } =
        get()

      const activeLayerGroupIds = Object.keys(
        getVisibleLayerGroups(_hydrationData.layerGroups)
      )

      Object.keys(_hydrationData.persistingLayerGroupAddOptions).forEach(
        (key) => {
          try {
            const opts = cloneDeep(
              _hydrationData.persistingLayerGroupAddOptions[key]
            )
            opts.isHidden = true

            if (activeLayerGroupIds.find((id) => id === key)) {
              opts.isHidden = false

              // remove from activeLayerGroupIds so it doesn't get enabled twice
              activeLayerGroupIds.splice(
                activeLayerGroupIds.findIndex((id) => id === key),

                1
              )
            }

            enableSerializableLayerGroup(key, opts, {
              priority: QueuePriority.HIGH,
            })
          } catch (e) {
            console.error(
              'Error enabling custom layer group from storage: ',
              key,
              _hydrationData.persistingLayerGroupAddOptions[key],
              e
            )
          }
        }
      )

      _setIsHydrated(true)

      set((state) => {
        state._hydrationData = {
          layerGroups: {},
          persistingLayerGroupAddOptions: {},
        }
      })
    },
  }

  return { ...vars, ...actions }
}
