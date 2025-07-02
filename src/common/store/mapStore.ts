// The map store is a zustand store that manages the map state.
// A lot of the logic is split between this file and the Map component.
// There are a also various helper hooks in src/common/hooks/map.
'use client'

// TODO: Refactor the _map object to somewhere else. It does need to be in the store.

import { map, cloneDeep, uniq, isEqual, pickBy, uniqBy } from 'lodash-es'
import turfBbox from '@turf/bbox'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet, produce } from 'immer'
import { Feature, FeatureCollection } from 'geojson'
import { create } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'

// import olms from 'ol-mapbox-style'
// import { Map as OlMap } from 'ol'
import {
  MapLayerMouseEvent,
  Map,
  LngLatBounds,
  MapGeoJSONFeature,
  LayerSpecification,
  FilterSpecification,
  GeoJSONSource,
  SourceSpecification,
} from 'maplibre-gl'
import mapboxgl from 'maplibre-gl'
import MaplibreDraw from 'maplibre-gl-draw'
import { useUIStore } from '#/common/store'
import drawStyles from '#/common/utils/drawStyles'

import {
  LayerGroupId,
  LayerOptions,
  LayerGroupOptions,
  ExtendedLayerSpecification,
  OverlayMessage,
  MapLibraryMode,
  QueuePriority,
  PopupData,
  QueueFunction,
  FunctionQueue,
  LayerGroupAddOptions,
  SerializableLayerGroupAddOptions,
  LayerGroupAddOptionsWithConf,
  QueueOptions,
  MapContext,
  LayerConf,
  MapDrawOptions,
  DrawMode,
  FitBoundsOptions,
  LayerGroups,
  LayerEventHandlers,
  ImageOptions,
  LayerEventHandlerOptions,
  LayerOptionsObj,
  ExtendedMapGeoJSONFeature,
  SourceOptions,
  ExtendedSourceSpecification,
  PopupOpts,
  SelectionSource,
  isStandardSourceOptions,
} from '#/common/types/map'
import { layerConfs } from '#/components/Map/Layers'

import {
  getLayerName,
  resolveMbStyle,
  getVisibleLayerGroups,
  updateFeatureInDrawSource,
  addFeatureToDrawSource,
  deleteFeatureFromDrawSource,
  getMaplibreDrawMode,
  getLayerGroupIdForLayer,
  isLayerGroupSelectable,
  fetchFeaturesByIds,
  getSelectableLayers,
  getMatchingDrawFeatures,
  getAllLayerOptionsObj,
  isMatchingSource,
  findSourceOptsById,
  encodeUrlWithParams,
  getJoinedSelectionSourcesForSource,
  getSelectableLayersForSource,
  getSourceJson,
} from '#/common/utils/map'
import { geoserverJsonQuery } from '../queries/geoserverJsonQuery'
// import { commonDevtools } from './shared-devtools'

const DEFAULT_MAP_LIBRARY_MODE: MapLibraryMode = 'maplibre'

let imageRenderCanvas: HTMLCanvasElement | null = null
let imageRenderCtx: CanvasRenderingContext2D | null = null
const imageRenderSize = 24 // Default size
enableMapSet()

export type Vars = {
  // Whether to use mapbox, openlayers, or both.
  // Currently only "maplibre" is ever used as the mode.
  mapLibraryMode: MapLibraryMode
  // Whether the map is ready to be interacted with.
  isLoaded: boolean
  // An overlay message over the map
  overlayMessage: OverlayMessage | null
  // Options for popup windows, when clicking a feature on the map
  activePopupData: PopupData[]
  // Whether user has activated drawing mode
  mapContext: MapContext
  selectedFeatures: MapGeoJSONFeature[]
  _joinedSelectionSourceMap: SelectionSource[][]
  // The below are internal variables.
  // --------------------------------------
  // isMapReady is after the internal map object is ready to be interacted with,
  // but before the map functions are ready to be used by external components.
  _isMapReady: boolean
  _drawOptions: MapDrawOptions
  _images: Record<string, ImageOptions>
  // A queue where functions are added before the map is loaded.
  // Executed after mapIsReady.
  _functionQueue: FunctionQueue
  // A variable to prevent bugs when executing function queue.
  _isFunctionQueueExecuting: boolean
  // mapbox map object
  _map: Map | null
  // openlayers map object
  // _olMap: OlMap | null
  // A single UI layer has often multiple layers which are grouped together.
  _layerGroups: LayerGroups
  // For quickly access a layer group by its id.
  _layerInstances: Record<string, LayerSpecification>
  _layerGroupIdsBeingProcessed: Set<string>
  _globalEventHandlers: {
    selectableLeave?: (e: MapLayerMouseEvent) => void
    selectableEnter?: (e: MapLayerMouseEvent) => void
  }
  // For storing sourceIds whose cache should be refreshed. For example because auth headers
  // have changed and the source data needs to be re-fetched.
  _staleSourceIds: string[]
  // For persisting user customised or uploaded layer configurations.
  _dataSyncSubscriptions: Record<string, Record<string, () => void>>
  _persistingLayerGroupAddOptions: Record<
    string,
    SerializableLayerGroupAddOptions
  >
  _isHydrated: boolean
  _hydrationData: {
    layerGroups: Record<string, LayerGroupOptions>
    persistingLayerGroupAddOptions: Record<
      string,
      SerializableLayerGroupAddOptions
    >
  }
}

export type Actions = {
  // Bounds of the source of a layer, e.g. the features in a geojson object
  getSourceBounds: (
    sourceId: string,
    _queueOptions?: QueueOptions
  ) => Promise<LngLatBounds | null>
  getSourceJsonAsyncQueue: (
    id: string,
    _queueOptions?: QueueOptions
  ) => Promise<FeatureCollection | null>
  addLayerGroup: (
    layerGroupId: LayerGroupId | string,
    options?: LayerGroupAddOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  enableLayerGroup: (
    layerGroupId: LayerGroupId | string,
    options?: LayerGroupAddOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  disableLayerGroup: (layerGroupId: LayerGroupId | string) => Promise<void>
  removeLayerGroup: (layerGroupId: LayerGroupId | string) => Promise<void>
  toggleLayerGroup: (
    layerGroupId: LayerGroupId | string,
    options?: LayerGroupAddOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  // LayerSpecificationGroup allows adding layerGroups with custom ids,
  // e.g., uploaded custom layers with generated ids.
  addSerializableLayerGroup: (
    layerGroupIdString: string,
    options?: SerializableLayerGroupAddOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  toggleSerializableLayerGroup: (
    layerGroupIdString: string,
    options?: SerializableLayerGroupAddOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  enableSerializableLayerGroup: (
    layerGroupIdString: string,
    options?: SerializableLayerGroupAddOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  disableSerializableLayerGroup: (layerGroupIdString: string) => Promise<void>
  removeSerializableLayerGroup: (layerGroupIdString: string) => Promise<void>
  setLayoutProperty: (
    layer: string,
    name: string,
    value: any,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  setPaintProperty: (
    layer: string,
    name: string,
    value: any,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  // Only show specific features in a layer
  setFilter: (
    layer: string,
    filter: FilterSpecification,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  setOverlayMessage: (
    condition: boolean,
    message: OverlayMessage,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  fitBounds: (
    bbox: number[] | LngLatBounds,
    options?: FitBoundsOptions,
    _queueOptions?: QueueOptions
  ) => Promise<any>
  getAndFitBounds: (
    layerGroupId: string,
    options?: FitBoundsOptions,
    _queueOptions?: QueueOptions
  ) => Promise<any>
  setSelectedFeatures: (
    features: MapGeoJSONFeature[],
    updateDrawSelect?: boolean
  ) => void
  setSelectedFeaturesByClick: (features: MapGeoJSONFeature[]) => void
  removeSelectedFeatures: (params: {
    features: MapGeoJSONFeature[]
    updateDrawSelect?: boolean
    ignorePopups?: boolean
  }) => void
  removeSelectedFeaturesByIds: (params: {
    featureIds: (string | number | undefined)[]
    idField: string
    source: SelectionSource
    updateDrawSelect?: boolean
    ignorePopups?: boolean
    ignoreAdditionalFeatures?: boolean
  }) => void
  addSelectedFeaturesByIds: (params: {
    featureIds: (string | number | undefined)[]
    idField: string
    source: SelectionSource
    updateDrawSelect?: boolean
    ignorePopups?: boolean
    ignoreAdditionalFeatures?: boolean
    removeOtherFeatures?: boolean
  }) => void
  setMapLibraryMode: (mode: MapLibraryMode) => void
  getGeocoder: () => void
  mapRelocate: () => void
  mapResetNorth: () => void
  mapToggleTerrain: () => void
  mapZoomIn: () => void
  mapZoomOut: () => void
  toggleDrawMode: (
    drawMode: DrawMode,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  setDrawMode: (
    drawMode: DrawMode,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  disableDraw: (_queueOptions?: QueueOptions) => Promise<void>
  deleteDrawFeatures: (features: Feature[]) => void
  setMapContext: (mapContext: MapContext) => void
  updateSourceData: (layerGroupId: string, data: FeatureCollection) => void
  addImage: (
    id: string,
    layerGroupId: string,
    svgString: string,
    colorCode?: string,
    size?: number
  ) => Promise<void>
  // The below are internal variables
  // ----------------------------------
  _setIsHydrated: { (isHydrated: boolean): void }
  _setIsLoaded: { (isLoaded: boolean): void }
  _setIsMapReady: { (isMapReady: boolean): void }
  _setGroupVisibility: (
    layerGroupId: LayerGroupId | string,
    isVisible: boolean
  ) => void
  // _addStyleToOl: (
  //   id: LayerGroupId | string,
  //   options: LayerGroupAddOptionsWithConf
  // ) => Promise<void>
  _addStyle: (
    id: LayerGroupId | string,
    options: LayerGroupAddOptionsWithConf
  ) => Promise<void>
  _runLayerGroupActivationActions: (
    layerGroupIdString: string,
    opts?: LayerGroupAddOptions | SerializableLayerGroupAddOptions
  ) => Promise<void>
  _getAdditionalSelectedFeatures: (
    features: MapGeoJSONFeature[]
  ) => MapGeoJSONFeature[]
  _setPopupDataForFeatures: (features: MapGeoJSONFeature[]) => void
  _addToFunctionQueue: (queueFunction: QueueFunction) => Promise<any>
  _setFunctionQueue: (functionQueue: FunctionQueue) => void
  _executeFunctionQueue: (callback?: () => void) => Promise<void>
  _setIsFunctionQueueExecuting: (isExecuting: boolean) => void
  _setActivePopupData: (activePopupData: PopupData) => void
  _setMap: (map: Map) => void
  // Adds a layer after the specified layer id.
  _addLayerAfter: (layer: LayerSpecification, afterId: string) => void
  _findFirstMatchingLayer: (id: LayerGroupId | string) => string | null
  _findLastMatchingLayer: (id: LayerGroupId | string) => string | null
  _runHydrationActions: () => void
  _addPersistingLayerGroupAddOptions: (
    layerGroupId: string,
    serializableLayerGroupAddOptions: SerializableLayerGroupAddOptions
  ) => void
  _removePersistingLayerGroupAddOptions: (layerGroupId: string) => void
  _updateSelectableHoverHandlers: () => void
  _enableDraw: (
    drawMode?: MaplibreDraw.DrawMode,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  _removeDraw: (_queueOptions?: QueueOptions) => Promise<void>
  _updateDrawSelectedFeatures: (updateSelectedFeatures?: boolean) => void
  // _enableLayerEventHandlers: (layerOptions: LayerOptions) => void
  // _disableLayerEventHandlers: (layerOptions: LayerOptions) => void
  _enableLayerGroupEventHandlers: (layerGroupId: string) => void
  _disableLayerGroupEventHandlers: (layerGroupId: string) => void
  _addStaleSourceId: (id: string) => void
  _refreshStaleSources: () => Promise<void>
}

export type State = Vars & Actions

export const useMapStore = create<State>()(
  // Include your additional states and setters...

  // Add your additional actions...
  // devtools(
  persist(
    immer((set, get) => {
      const vars: Vars = {
        mapLibraryMode: DEFAULT_MAP_LIBRARY_MODE, // Assume an initial value
        isLoaded: false,
        overlayMessage: null,
        activePopupData: [],
        mapContext: null,
        selectedFeatures: [],
        _joinedSelectionSourceMap: [],
        _images: {},
        _isMapReady: false,
        _drawOptions: {
          layerGroupId: null,
          draw: null,
          isEnabled: false,
          featureAddMutator: undefined,
          idField: undefined,
        },
        _layerGroupIdsBeingProcessed: new Set(),
        _globalEventHandlers: {},
        _functionQueue: [],
        _isFunctionQueueExecuting: false,
        _map: null,
        // _olMap: null,
        _layerGroups: {},
        _layerInstances: {},
        _staleSourceIds: [],
        _dataSyncSubscriptions: {},
        _isHydrated: false,
        _persistingLayerGroupAddOptions: {},
        _hydrationData: {
          layerGroups: {},
          persistingLayerGroupAddOptions: {},
        },
      }

      // A boilerplate for functions that are queued until the map object is ready
      const queueableFnInit = <
        A1 extends any[],
        A2 extends [queueOptions?: QueueOptions]
      >(
        fn: (...args: A1) => Promise<any>,
        queueOptions?: QueueOptions
      ) => {
        const queueableFn = async (
          fnWithArgs: { fn: (...args: A1) => Promise<any>; args: A1 },
          queueOptions: QueueOptions
        ) => {
          const { isLoaded, _addToFunctionQueue } = get()

          if (!isLoaded && !queueOptions.skipQueue) {
            return _addToFunctionQueue({
              fn: fnWithArgs.fn,
              args: fnWithArgs.args,
              priority: queueOptions.priority,
            })
          }

          return fnWithArgs.fn(...fnWithArgs.args)
        }

        return new Proxy(fn, {
          apply(_target, _thisArg, args) {
            const fnArgs = args.slice(0, fn.length) as A1

            // initialize queue options with values from the function initialization.
            // If they don't exist, use the default values.
            const qOpts: QueueOptions = {
              skipQueue:
                queueOptions?.skipQueue != null
                  ? queueOptions?.skipQueue
                  : false,
              priority:
                queueOptions?.priority != null
                  ? queueOptions?.priority
                  : QueuePriority.LOW,
            }

            // Overwrite queue options with values from the function call.
            if (fn.length < args.length) {
              const qArgs = args[fn.length] as QueueOptions
              qOpts.skipQueue =
                qArgs?.skipQueue != null ? qArgs?.skipQueue : qOpts.skipQueue
              qOpts.priority =
                qArgs?.priority != null ? qArgs?.priority : qOpts.priority
            }
            return queueableFn({ fn: fn, args: fnArgs }, qOpts)
          },
        }) as unknown as (...args: [...A1, ...A2]) => Promise<any>
      }

      const actions: Actions = {
        getSourceBounds: queueableFnInit(
          async (sourceId: string): Promise<LngLatBounds | null> => {
            // Query source features for the specified source
            try {
              const { _map, getSourceJsonAsyncQueue } = get()

              if (!_map) {
                return null
              }

              let featureColl: FeatureCollection | null = null

              const sourceFeatures = await getSourceJsonAsyncQueue(sourceId, {
                skipQueue: true,
              })

              if (sourceFeatures) {
                featureColl = sourceFeatures
              } else {
                const features = _map.querySourceFeatures(sourceId)

                if (features.length > 0 && features[0].geometry) {
                  featureColl = {
                    type: 'FeatureCollection',
                    features: features,
                  }
                } else {
                  const source = _map.getSource(sourceId)
                  // TODO: check the method of finding the set extent of a source in style. This method is probably deprecated.
                  //@ts-ignore
                  if (source && source.tileBounds && source.tileBounds.bounds) {
                    //@ts-ignore
                    return source.tileBounds.bounds
                  }
                }
              }

              if (!featureColl) {
                return null
              }

              const bbox = turfBbox(featureColl)

              if (bbox.includes(Infinity) || bbox.includes(-Infinity)) {
                return null
              }
              // Convert Turf.js bbox to Mapbox LngLatBounds
              const bounds = new mapboxgl.LngLatBounds(
                [bbox[0], bbox[1]], // [west, south] or [minX, minY]
                [bbox[2], bbox[3]] // [east, north] or [maxX, maxY]
              )

              return bounds
            } catch (e) {
              console.error("Couldn't get source bounds")
              console.error(e)
              return null
            }
          },
          { priority: QueuePriority.LOW }
        ),

        getSourceJsonAsyncQueue: queueableFnInit(
          async (id: string): Promise<FeatureCollection | null> => {
            const { _map } = get()
            return getSourceJson(id, _map)
          },
          { priority: QueuePriority.LOW }
        ),

        setMapLibraryMode: (mode: MapLibraryMode) => {
          set((state) => {
            state.mapLibraryMode = mode
          })
        },

        setSelectedFeatures: (
          features: MapGeoJSONFeature[],
          updateDrawSelect?: boolean
        ) => {
          const {
            _map,
            selectedFeatures,
            _drawOptions,
            _updateDrawSelectedFeatures,
            _layerGroups,
          } = get()

          if (isEqual(features, selectedFeatures)) {
            return
          }

          const keptFeatures = []

          for (const feature of features) {
            // Check if the feature is already selected
            const selectedFeature = selectedFeatures.find((f) => {
              if (feature.sourceLayer) {
                return (
                  f.id === feature.id &&
                  f.source === feature.source &&
                  f.sourceLayer === feature.sourceLayer
                )
              }
              return f.id === feature.id && f.source === feature.source
            })

            // if feature is already selected
            if (selectedFeature != null) {
              keptFeatures.push(selectedFeature)
              // if feature is not yet in selected features
            } else {
              _map?.setFeatureState(
                {
                  source: feature.source,
                  id: feature.id,
                  ...(feature.sourceLayer
                    ? { sourceLayer: String(feature.sourceLayer) }
                    : {}),
                },
                { selected: true }
              )
            }
          }

          for (const selectedFeature of selectedFeatures) {
            if (!keptFeatures.includes(selectedFeature)) {
              _map?.setFeatureState(
                {
                  source: selectedFeature.source,
                  id: selectedFeature.id,
                  ...(selectedFeature.sourceLayer
                    ? { sourceLayer: String(selectedFeature.sourceLayer) }
                    : {}),
                },
                { selected: false }
              )
            }
          }

          set((draft) => {
            // @ts-ignore
            draft.selectedFeatures = features
          })

          if (updateDrawSelect) {
            if (_drawOptions.isEnabled && _drawOptions.draw != null) {
              _updateDrawSelectedFeatures()
            }
          }
        },

        setSelectedFeaturesByClick: (features: MapGeoJSONFeature[]) => {
          const {
            selectedFeatures,
            setSelectedFeatures,
            _drawOptions,
            _layerGroups,
            _getAdditionalSelectedFeatures,
            _setPopupDataForFeatures,
          } = get()

          if (features.length === 0) {
            return
          }

          const filterSelectedFeatures = (
            layerOptionsObj: LayerOptionsObj,
            activeLayerIds: string[],
            selectedFeatures: MapGeoJSONFeature[],
            newlySelectedFeatures: MapGeoJSONFeature[],
            layerGroups: LayerGroups
          ) => {
            const selectableLayers = Object.keys(
              pickBy(layerOptionsObj, (value: LayerOptions, _key: string) => {
                return value.selectable
              })
            )

            // remove features from unselectable layers
            let filteredFeatures = newlySelectedFeatures.filter(
              (f) =>
                selectableLayers.includes(f.layer.id) &&
                activeLayerIds.includes(f.layer.id)
            )

            // since feature selection works by source basis, filter
            // out duplicate features from different layers but same source
            filteredFeatures = uniqBy(
              filteredFeatures,
              (feature: MapGeoJSONFeature) => {
                if (feature.sourceLayer) {
                  return `sl-${feature.id}-${feature.sourceLayer}`
                } else {
                  return `s-${feature.id}-${feature.source}`
                }
              }
            )

            // filter out features that are not in the active draw group, if there is one
            if (
              _drawOptions != null &&
              _drawOptions.isEnabled &&
              _drawOptions.draw != null &&
              _drawOptions.layerGroupId != null
            ) {
              const drawLayerGroupId = _drawOptions.layerGroupId
              filteredFeatures = filteredFeatures.filter(
                (f) =>
                  getLayerGroupIdForLayer(f.layer.id, layerGroups) !==
                  drawLayerGroupId
              )
            }

            // remove reatures without an id and log an error
            filteredFeatures = filteredFeatures.filter((f) => {
              if (f.id == null) {
                console.error(
                  'Feature without id on layer "',
                  f.layer.id,
                  '". Check that the source style has either "generateId" or "promoteId" set.'
                )
                return false
              }
              return true
            })

            if (filteredFeatures.length === 0) {
              return null
            }

            // only keep the topmost feature
            const filteredFeature = filteredFeatures[0]

            let selectedFeaturesCopy = [...selectedFeatures]
            const additionalFeatures = _getAdditionalSelectedFeatures([
              filteredFeature,
            ])

            // go through filtered features and compare them to previously selected features
            const layerId = filteredFeature.layer.id

            // if the feature is already selected, unselect
            // also remove features from additional selection sources
            let foundExisting = false
            selectedFeaturesCopy = selectedFeaturesCopy.filter((f) => {
              for (const additionalFeature of additionalFeatures) {
                if (
                  f.id === additionalFeature.id &&
                  f.source === additionalFeature.source
                ) {
                  if (
                    additionalFeature.sourceLayer &&
                    f.sourceLayer &&
                    additionalFeature.sourceLayer === f.sourceLayer
                  ) {
                    foundExisting = true
                    return false
                  }
                }
              }
              if (f.id === filteredFeature.id) {
                foundExisting = true
                return false
              }
            })

            // i.e. a feature was clicked that was not already selected
            if (!foundExisting) {
              // remove all other selections
              if (selectedFeaturesCopy.length > 0) {
                if (!layerOptionsObj[layerId].multiSelectable) {
                  selectedFeaturesCopy = []
                } else {
                  selectedFeaturesCopy = selectedFeaturesCopy.filter((f) => {
                    if (f.source === filteredFeature.source) {
                      if (!f.sourceLayer && !filteredFeature.sourceLayer) {
                        return true
                      }
                      if (f.sourceLayer === filteredFeature.sourceLayer) {
                        return true
                      }
                      return false
                    }
                  })
                }
              }

              selectedFeaturesCopy = [
                ...selectedFeaturesCopy,
                filteredFeature,
                ...additionalFeatures,
              ]
            }

            return selectedFeaturesCopy
          }

          const layerOptionsObj = getAllLayerOptionsObj(_layerGroups)
          const visibleLayerGroups = getVisibleLayerGroups(_layerGroups)

          let activeLayerIds: string[] = []
          for (const layerGroupId of Object.keys(visibleLayerGroups)) {
            const layerGroup = visibleLayerGroups[layerGroupId]
            activeLayerIds = [
              ...activeLayerIds,
              ...Object.keys(layerGroup.layers),
            ]
          }

          const filteredSelectedFeatures = filterSelectedFeatures(
            layerOptionsObj,
            activeLayerIds,
            selectedFeatures,
            features,
            _layerGroups
          )

          if (filteredSelectedFeatures == null) {
            return
          }

          setSelectedFeatures(filteredSelectedFeatures)
          _setPopupDataForFeatures(filteredSelectedFeatures)
        },

        // if the layerConf specifies other sources that have the same features (with the same ids), these
        // are queried here and returned
        _getAdditionalSelectedFeatures: (features: MapGeoJSONFeature[]) => {
          const { _layerGroups, _map, _joinedSelectionSourceMap } = get()

          // const LayerOptionsObj = getAllLayerOptionsObj(_layerGroups)

          const additionalFeatures: MapGeoJSONFeature[] = []

          // in progress: create helper util to fetch joined sources map

          for (const feature of features) {
            const sourceOptions = findSourceOptsById(
              feature.source,
              _layerGroups
            )

            const additionalSelectionSources =
              getJoinedSelectionSourcesForSource({
                joinedSelectionSourceMap: _joinedSelectionSourceMap,
                source: feature.source,
                sourceLayer: feature.sourceLayer,
              })

            if (additionalSelectionSources != null) {
              for (const additionalSource of additionalSelectionSources) {
                const features = fetchFeaturesByIds({
                  ids: [feature.id],
                  source: additionalSource,
                  map: _map,
                })

                additionalFeatures.push(...features)
              }
            }
          }

          return additionalFeatures
        },

        _setPopupDataForFeatures: (features: ExtendedMapGeoJSONFeature[]) => {
          if (features == null || features.length === 0) {
            set((draft) => {
              draft.activePopupData = []
            })

            return
          }

          const { _layerGroups, activePopupData } = get()

          const layerOptionsObj = getAllLayerOptionsObj(_layerGroups)

          const popupDatas: PopupData[] = []

          // filter features that have popup options
          // add the popup option to feature here for efficiency
          const featurePopupOpts: {
            feature: MapGeoJSONFeature
            popupOpts: PopupOpts
          }[] = features.reduce<
            {
              feature: MapGeoJSONFeature
              popupOpts: PopupOpts
            }[]
          >((acc, feature) => {
            if (feature.isPlaceholder) {
              return acc // Skip placeholder features
            }

            let popupOpts: PopupOpts | null = null

            if (feature.layer == null) {
              const source = findSourceOptsById(feature.source, _layerGroups)
              if (
                source &&
                source.popupOpts != null &&
                isMatchingSource(source.popupOpts, feature)
              ) {
                popupOpts = source.popupOpts
              }
            } else {
              const layerOptions = layerOptionsObj[feature.layer.id]
              if (layerOptions && layerOptions.popupOpts != null) {
                popupOpts = layerOptions.popupOpts
              }
            }

            if (popupOpts) {
              acc.push({ feature, popupOpts })
            }

            return acc
          }, [])

          for (const featurePopupOpt of featurePopupOpts) {
            const popupData: PopupData = {
              features: featurePopupOpts.map((fp) => fp.feature),
              ...featurePopupOpt.popupOpts,
            }

            popupDatas.push(popupData)

            if (!popupData.multiPoppable) {
              // TODO: figure out logic for multiple popups, if needed
              break
            }
          }

          // if there is new and old popup data, check if they are the same
          if (activePopupData.length > 0 && popupDatas.length > 0) {
            const newPopupData = popupDatas[0]
            const oldPopupData = activePopupData[0]

            if (
              isMatchingSource(newPopupData, oldPopupData) &&
              newPopupData.component === oldPopupData.component &&
              isEqual(newPopupData.componentProps, oldPopupData.componentProps)
            ) {
              if (isEqual(newPopupData.features, oldPopupData.features)) {
                return
              }
              // if the features are different or in different order, update the popup data
              set((draft) => {
                draft.activePopupData[0].features = newPopupData.features
              })

              return
            }
          }

          set((draft) => {
            draft.activePopupData = popupDatas
          })
        },

        removeSelectedFeatures: (params: {
          features: MapGeoJSONFeature[]
          ignoreAdditionalFeatures?: boolean
          updateDrawSelect?: boolean
          ignorePopups?: boolean
        }) => {
          const {
            features,
            ignoreAdditionalFeatures,
            updateDrawSelect,
            ignorePopups,
          } = params
          const {
            selectedFeatures,
            setSelectedFeatures,
            _setPopupDataForFeatures,
            _getAdditionalSelectedFeatures,
          } = get()

          let featuresToRemove = features

          if (!ignoreAdditionalFeatures) {
            // get additional features for the selected features
            const additionalFeatures = _getAdditionalSelectedFeatures(features)
            featuresToRemove = [...features, ...additionalFeatures]
          }

          const newSelectedFeatures = selectedFeatures.filter((sf) => {
            const isPresentInParamsFeatures = featuresToRemove.some((pf) => {
              return pf.id === sf.id && isMatchingSource(sf, pf)
            })

            return !isPresentInParamsFeatures
          })

          setSelectedFeatures(newSelectedFeatures, updateDrawSelect)

          if (!ignorePopups) {
            _setPopupDataForFeatures(newSelectedFeatures)
          }
        },

        removeSelectedFeaturesByIds: (params: {
          featureIds: (string | number | undefined)[]
          idField: string
          source: SelectionSource
          updateDrawSelect?: boolean
          ignorePopups?: boolean
        }) => {
          const {
            featureIds,
            idField,
            source,
            updateDrawSelect,
            ignorePopups,
          } = params
          const {
            selectedFeatures,
            setSelectedFeatures,
            _setPopupDataForFeatures,
          } = get()

          const newSelectedFeatures = selectedFeatures.filter((feature) => {
            if (!isMatchingSource(feature, source)) {
              return true
            }

            const featureId = feature.properties?.[idField]
            if (featureId != null) {
              return !featureIds.includes(featureId.toString())
            }

            return true
          })

          setSelectedFeatures(newSelectedFeatures, updateDrawSelect)

          if (!ignorePopups) {
            _setPopupDataForFeatures(newSelectedFeatures)
          }
        },

        addSelectedFeaturesByIds: (params: {
          featureIds: (string | number | undefined)[]
          idField: string
          source: SelectionSource
          updateDrawSelect?: boolean
          ignorePopups?: boolean
          ignoreAdditionalFeatures?: boolean
          removeOtherFeatures?: boolean | 'useLayerOption'
        }) => {
          const {
            featureIds,
            idField,
            source,
            updateDrawSelect = false,
            ignorePopups = false,
            ignoreAdditionalFeatures = false,
            removeOtherFeatures = 'useLayerOption',
          } = params

          const {
            setSelectedFeatures,
            _map,
            _setPopupDataForFeatures,
            _getAdditionalSelectedFeatures,
            selectedFeatures,
            _joinedSelectionSourceMap,
          } = get()

          const newFeatures = fetchFeaturesByIds({
            ids: featureIds,
            source: source,
            idField: idField,
            map: _map,
          })

          let oldFeatures: MapGeoJSONFeature[] = []

          if (removeOtherFeatures === false) {
            oldFeatures.push(...selectedFeatures)
          } else if (removeOtherFeatures === 'useLayerOption') {
            const sourceOptions = findSourceOptsById(
              source.source,
              get()._layerGroups
            )

            if (sourceOptions?.extendedOpts?.multiSelectable) {
              const joinedSelectionSources = getJoinedSelectionSourcesForSource(
                {
                  joinedSelectionSourceMap: _joinedSelectionSourceMap,
                  source: source.source,
                  sourceLayer: source.sourceLayer,
                }
              )
              const matchingFeatures = selectedFeatures.filter((f) => {
                ;[...joinedSelectionSources, source].some((js) => {
                  isMatchingSource(f, js)
                })
              })
              oldFeatures.push(...matchingFeatures)
            }
          }

          if (!ignoreAdditionalFeatures) {
            const additionalFeatures =
              _getAdditionalSelectedFeatures(newFeatures)
            newFeatures.push(...additionalFeatures)
          }

          setSelectedFeatures(
            uniq([...oldFeatures, ...newFeatures]),
            updateDrawSelect
          )

          if (!ignorePopups) {
            _setPopupDataForFeatures(newFeatures)
          }
        },
        // TODO: The logic of this function is getting too complex. Now we have
        // LayerConfs fetched from the common storage and LayerConfs supplied by the calling
        // component. Solution:
        // make "options" mandatory, and always supply a layerConf from the calling function.
        addLayerGroup: queueableFnInit(
          async (
            layerGroupId: LayerGroupId | string,
            options?: LayerGroupAddOptions | SerializableLayerGroupAddOptions
          ) => {
            const {
              _addStyle,
              _persistingLayerGroupAddOptions,
              _addPersistingLayerGroupAddOptions,
              mapContext,
              _runLayerGroupActivationActions,
              _layerGroupIdsBeingProcessed,
            } = get()

            if (_layerGroupIdsBeingProcessed.has(layerGroupId)) {
              console.warn(
                `Layer group "${layerGroupId}" is already being processed. Skipping addLayerGroup call.`
              )
              return
            }

            set((state) => {
              state._layerGroupIdsBeingProcessed.add(layerGroupId)
            })

            try {
              // Initialize layer if it doesn't exist
              let opts = cloneDeep(options) || {
                persist: false,
                layerConf: undefined,
              }

              if (opts.mapContext == null) {
                opts.mapContext = mapContext
              }

              if (opts.mapContext !== mapContext) {
                opts.isHidden = true
              }

              if (opts.persist) {
                _addPersistingLayerGroupAddOptions(layerGroupId, opts)
              }

              if (!opts.layerConf) {
                if (_persistingLayerGroupAddOptions[layerGroupId] != null) {
                  opts = cloneDeep(
                    _persistingLayerGroupAddOptions[layerGroupId]
                  )
                } else {
                  opts.layerConf = layerConfs.find((el: LayerConf) => {
                    return el.id === layerGroupId
                  })
                }
              }

              if (opts.layerConf) {
                if (opts.layerConf.useMb == null || opts.layerConf.useMb) {
                  await _addStyle(
                    layerGroupId,
                    opts as LayerGroupAddOptionsWithConf
                  )
                }
                // else {
                //   await _addStyleToOl(
                //     layerGroupId,
                //     opts as LayerGroupAddOptionsWithConf
                //   )
                // }

                // Add event listener for source data changes

                await _runLayerGroupActivationActions(layerGroupId, opts)
              } else {
                console.error('No layer config found for id: ' + layerGroupId)
              }
            } finally {
              set((state) => {
                state._layerGroupIdsBeingProcessed.delete(layerGroupId)
              })
            }
          },
          { priority: QueuePriority.MEDIUM_HIGH }
        ),

        enableLayerGroup: async (
          layerGroupId: LayerGroupId | string,
          options?: LayerGroupAddOptions
        ) => {
          const {
            _layerGroups,
            _setGroupVisibility,
            addLayerGroup,
            _runLayerGroupActivationActions,
          } = get()

          if (_layerGroups[layerGroupId]) {
            _setGroupVisibility(layerGroupId, true)
            _runLayerGroupActivationActions(layerGroupId, options)
          } else {
            addLayerGroup(layerGroupId, options)
          }
        },

        disableLayerGroup: async (layerGroupId: LayerGroupId | string) => {
          const {
            _setGroupVisibility,
            _layerGroups,
            _drawOptions,
            _removeDraw,
            setSelectedFeatures,
            selectedFeatures,
          } = get()

          if (!Object.keys(_layerGroups).includes(layerGroupId)) {
            throw new Error(
              "Unable to disable layer group that isn't enabled: " +
                layerGroupId
            )
          }

          _setGroupVisibility(layerGroupId, false)
          const layerGroup = _layerGroups[layerGroupId]
          const sources = uniq(map(layerGroup.layers, 'source'))

          setSelectedFeatures(
            selectedFeatures.filter((f) => !sources.includes(f.source))
          )

          if (_drawOptions.layerGroupId === layerGroupId) {
            _removeDraw({ skipQueue: true })
          }
        },

        removeLayerGroup: async (layerGroupId: LayerGroupId | string) => {
          const {
            _layerGroups,
            _map,
            _drawOptions,
            _removeDraw,
            _images,
            _updateSelectableHoverHandlers,
            _dataSyncSubscriptions,
          } = get() // Assuming you have a map reference in your store.

          if (!Object.keys(_layerGroups).includes(layerGroupId)) {
            console.warn(
              'Unable to remove layer group that does not have layer group options: ' +
                layerGroupId
            )
            return
          }

          const layerGroupOptions = _layerGroups[layerGroupId]

          // Remove each layer from the map.
          for (const layerId of Object.keys(layerGroupOptions.layers)) {
            if (_map?.getLayer(layerId)) {
              _map?.removeLayer(layerId)
            }

            // Optional: If there's a source associated with this layer and no other layer is using it.
            // Here I'm assuming layerId and sourceId are the same. Adjust if different.
            if (_map?.getSource(layerId)) {
              _map?.removeSource(layerId)
            }
          }

          if (layerGroupOptions.handleDataUpdate) {
            _map?.off('data', layerGroupOptions.handleDataUpdate)
          }

          if (_dataSyncSubscriptions[layerGroupId]) {
            Object.values(_dataSyncSubscriptions[layerGroupId]).forEach(
              (unsubscribe) => unsubscribe()
            )
          }

          Object.keys(_images).forEach((imageId) => {
            const image = _images[imageId]
            if (image.layerGroupId === layerGroupId) {
              _map?.removeImage(imageId)
            }
          })

          set((state) => {
            for (const imageId in state._images) {
              if (state._images[imageId].layerGroupId === layerGroupId) {
                delete state._images[imageId]
              }
            }

            const sourceIdsToRemove = Object.keys(layerGroupOptions.sources)
            if (sourceIdsToRemove.length > 0) {
              state._joinedSelectionSourceMap =
                state._joinedSelectionSourceMap.filter((joinedArray) => {
                  const hasMatchingSource = joinedArray.some(
                    (selectionSource) =>
                      sourceIdsToRemove.includes(selectionSource.source)
                  )
                  return !hasMatchingSource // Keep the array if it does NOT have a matching source
                })
            }

            delete state._layerGroups[layerGroupId]

            delete state._dataSyncSubscriptions[layerGroupId]
          })

          if (_drawOptions.layerGroupId === layerGroupId) {
            await _removeDraw({ skipQueue: true })
          }

          _updateSelectableHoverHandlers()
        },

        toggleLayerGroup: async (
          layerGroupId: LayerGroupId | string,
          options?: LayerGroupAddOptions
        ) => {
          const { disableLayerGroup, enableLayerGroup, _layerGroups } = get()

          if (Object.keys(_layerGroups).includes(layerGroupId)) {
            await disableLayerGroup(layerGroupId)
          } else {
            await enableLayerGroup(layerGroupId, options)
          }
        },

        // these are used used for layers with dynamic ids
        addSerializableLayerGroup: async (
          layerGroupIdString: string,
          options?: SerializableLayerGroupAddOptions
        ) => {
          const { addLayerGroup } = get()

          try {
            await addLayerGroup(
              layerGroupIdString as LayerGroupId,
              options as LayerGroupAddOptions
            )
          } catch (e) {
            'Unable to add layer with id: ' + layerGroupIdString
            console.error(e)
          }
        },

        toggleSerializableLayerGroup: async (
          layerGroupIdString: string,
          options?: SerializableLayerGroupAddOptions
        ) => {
          const { toggleLayerGroup } = get()

          try {
            await toggleLayerGroup(
              layerGroupIdString as LayerGroupId,
              options as LayerGroupAddOptions
            )
          } catch (e) {
            'Unable to toggle layer with id: ' + layerGroupIdString
            console.error(e)
          }
        },

        enableSerializableLayerGroup: async (
          layerGroupIdString: string,
          options?: SerializableLayerGroupAddOptions
        ) => {
          const { enableLayerGroup } = get()

          try {
            enableLayerGroup(
              layerGroupIdString as LayerGroupId,
              options as LayerGroupAddOptions
            )
          } catch (e) {
            'Unable to enable layer with id: ' + layerGroupIdString
            console.error(e)
          }
        },

        disableSerializableLayerGroup: async (layerGroupIdString: string) => {
          const { disableLayerGroup } = get()

          await disableLayerGroup(layerGroupIdString as LayerGroupId)
        },

        removeSerializableLayerGroup: async (layerGroupIdString: string) => {
          const { removeLayerGroup } = get() // Assuming you have a map reference in your store.

          await removeLayerGroup(layerGroupIdString as LayerGroupId)
        },

        addImage: queueableFnInit(
          async (
            id: string,
            layerGroupId: string,
            svgString: string,
            colorCode?: string,
            size: number = imageRenderSize
          ) => {
            const { _map } = get()
            if (!_map) {
              console.error('Map not initialized')
              return
            }

            if (!imageRenderCanvas && typeof document !== 'undefined') {
              imageRenderCanvas = document.createElement('canvas')
              imageRenderCtx = imageRenderCanvas.getContext('2d')
            }

            if (!imageRenderCanvas || !imageRenderCtx) {
              console.error(
                'Canvas context could not be initialized (not in browser?)'
              )
              return
            }

            // Ensure canvas has the correct size for this specific image
            if (
              imageRenderCanvas.width !== size ||
              imageRenderCanvas.height !== size
            ) {
              imageRenderCanvas.width = size
              imageRenderCanvas.height = size
            }

            const ctx = imageRenderCtx

            if (_map.hasImage(id)) {
              _map.removeImage(id)
            }

            // Adjust canvas size if necessary for this specific image
            if (
              imageRenderCanvas.width !== size ||
              imageRenderCanvas.height !== size
            ) {
              imageRenderCanvas.width = size
              imageRenderCanvas.height = size
            }

            const img = new Image()
            img.onload = () => {
              ctx.clearRect(0, 0, size, size)
              ctx.drawImage(img, 0, 0, size, size)
              const imageData = ctx.getImageData(0, 0, size, size)

              if (!_map.hasImage(id)) {
                _map.addImage(id, imageData)

                set((state) => {
                  const imageOptions: ImageOptions = {
                    id,
                    layerGroupId,
                    size,
                    ...(colorCode && { colorCode }),
                  }
                  state._images[id] = imageOptions
                })
              }
            }
            img.onerror = (err) => {
              /* ... error handling ... */
            }
            img.src =
              'data:image/svg+xml;charset=utf-8,' +
              encodeURIComponent(svgString)
          },
          { priority: QueuePriority.HIGH }
        ),

        setLayoutProperty: queueableFnInit(
          async (layer: string, name: string, value: any): Promise<any> => {
            const { _map } = get()

            _map?.setLayoutProperty(layer, name, value)
          }
        ),

        setPaintProperty: queueableFnInit(
          async (layer: string, name: string, value: any): Promise<any> => {
            const { _map } = get()

            _map?.setPaintProperty(layer, name, value)
          }
        ),

        setFilter: queueableFnInit(
          async (layer: string, filter: FilterSpecification): Promise<any> => {
            const { _map } = get()

            _map?.setFilter(layer, filter)
          }
        ),

        setOverlayMessage: async (
          condition: boolean,
          message: OverlayMessage
        ) => {
          set((state) => {
            state.overlayMessage = condition ? message : null
          })
        },

        fitBounds: queueableFnInit(
          (
            bbox: number[] | LngLatBounds,
            {
              duration = 2000,
              lonExtra = 1,
              latExtra = 1,
            }: FitBoundsOptions = {}
          ): Promise<void> => {
            const { _map } = get()

            let [lonMax, lonMin, latMax, latMin] = [0, 0, 0, 0]

            if (bbox instanceof LngLatBounds) {
              const southWest = bbox.getSouthWest()
              const northEast = bbox.getNorthEast()

              lonMax = northEast.lng
              lonMin = southWest.lng
              latMax = northEast.lat
              latMin = southWest.lat
            } else {
              lonMax = bbox[0]
              lonMin = bbox[1]
              latMax = bbox[2]
              latMin = bbox[3]
            }

            const flyOptions = { duration: duration }
            const lonDiff = lonMax - lonMin
            const latDiff = latMax - latMin
            _map?.fitBounds(
              [
                [lonMin - lonExtra * lonDiff, latMin - latExtra * latDiff],
                [lonMax + lonExtra * lonDiff, latMax + latExtra * latDiff],
              ],
              flyOptions
            )

            return Promise.resolve()
          }
        ),

        getAndFitBounds: queueableFnInit(
          async (
            layerGroupId,
            {
              duration = 2000,
              lonExtra = 1,
              latExtra = 1,
            }: FitBoundsOptions = {}
          ): Promise<void> => {
            const { fitBounds, getSourceBounds } = get()
            const { _layerGroups } = get()

            const layerGroupOpts = _layerGroups[layerGroupId]

            let boundsSource

            for (const [sourceId, sourceDetails] of Object.entries(
              layerGroupOpts.sources
            )) {
              if (sourceDetails.type === 'geojson') {
                boundsSource = sourceId
                break
              }
            }

            if (!boundsSource) {
              const errorMsg =
                'Zooming to bounds: no GeoJSON source found in layer group: ' +
                layerGroupId

              console.error(errorMsg)
              return Promise.reject(new Error(errorMsg))
            }

            const bounds = await getSourceBounds(boundsSource, {
              skipQueue: true,
            })
            if (bounds) {
              fitBounds(
                bounds,
                {
                  duration: duration,
                  latExtra: lonExtra,
                  lonExtra: latExtra,
                },
                { skipQueue: true }
              )
            }

            return Promise.resolve()
          }
        ),

        getGeocoder: () => {
          // set((state) => {
          // })
        },
        mapRelocate: () => {
          // set((state) => {
          // })
        },
        mapResetNorth: () => {
          const { _map } = get()
          _map?.resetNorth()
        },

        mapToggleTerrain: () => {
          const { toggleLayerGroup } = get()
          toggleLayerGroup('terramonitor', {
            mapContext: 'any',
            isAddedBefore: false,
            neighboringLayerGroupId: 'osm',
          })
        },

        mapZoomIn: () => {
          const { _map } = get()
          _map?.zoomIn()
        },

        mapZoomOut: () => {
          const { _map } = get()
          _map?.zoomOut()
        },

        deleteDrawFeatures: (features: Feature[]) => {
          const { _map, _drawOptions } = get()

          if (_drawOptions.draw == null) {
            console.error('Cannot delete features: No draw object found.')
            return
          }

          const featureIds = features.map((feature) => String(feature.id))

          _drawOptions.draw.delete(featureIds)

          _map?.fire('draw.delete', { features })
        },

        toggleDrawMode: queueableFnInit(
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
          },
          {
            priority: QueuePriority.LOW,
          }
        ),

        setDrawMode: queueableFnInit(
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
          },
          {
            priority: QueuePriority.LOW,
          }
        ),

        setMapContext: (mapContext: MapContext) => {
          const { _layerGroups, enableLayerGroup, disableLayerGroup } = get()

          set((state) => {
            state.mapContext = mapContext
          })
        },

        updateSourceData: (layerGroupId: string, data: FeatureCollection) => {
          const { _map } = get() // Get the Mapbox map instance from the state

          const source = _map?.getSource(layerGroupId) as GeoJSONSource

          if (!source) {
            console.error('No source found with id ' + layerGroupId)
            return
          }

          if (source.type !== 'geojson') {
            console.error(
              'Cannot update data in a non-geojson source: ' + layerGroupId
            )
            return
          }

          source.setData(data)
        },

        _updateSelectableHoverHandlers: () => {
          const { _map, _layerGroups, _globalEventHandlers } = get()
          const layerOptionsObj = getAllLayerOptionsObj(_layerGroups)

          if (_globalEventHandlers.selectableEnter != null) {
            _map?.off('mouseenter', _globalEventHandlers.selectableEnter)
          }
          if (_globalEventHandlers.selectableLeave != null) {
            _map?.off('mouseleave', _globalEventHandlers.selectableLeave)
          }

          const hoverableLayers: string[] = []
          for (const layerOptions of Object.values(layerOptionsObj)) {
            if (layerOptions.hoverPointer) {
              hoverableLayers.push(layerOptions.id)
            }
          }

          if (hoverableLayers.length > 0) {
            _map?.on('mouseenter', hoverableLayers, (e) => {
              _map.getCanvas().style.cursor = 'pointer'
            })

            _map?.on('mouseleave', hoverableLayers, () => {
              _map.getCanvas().style.cursor = ''
            })
          }
        },

        _enableDraw: queueableFnInit(
          async (drawMode?: MaplibreDraw.DrawMode) => {
            const {
              _map,
              _drawOptions,
              selectedFeatures,
              _layerGroups,
              _disableLayerGroupEventHandlers,
              setSelectedFeatures,
              _updateDrawSelectedFeatures,
            } = get()

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

            const originalStyles: Record<string, any> = {}

            _map?.getStyle().layers.forEach((layer) => {
              if (layer.id.startsWith(`${layerGroupId}-`)) {
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

            const draw = new MaplibreDraw({
              displayControlsDefault: false,
              defaultMode: drawMode || 'simple_select',
              userProperties: true,
              styles: drawStyles,
              keybindings: true,
            })

            _map?.addControl(draw, 'bottom-right')

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
                e.features.forEach((feature: Feature) => {
                  if (_drawOptions.featureAddMutator != null) {
                    const mutatedFeature =
                      _drawOptions.featureAddMutator(feature)

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
                  addFeatureToDrawSource(feature, layerGroupId, _map)
                })
              }

              const handleDrawUpdate = (e: any) => {
                e.features.forEach((feature: Feature) => {
                  if (_drawOptions.featureUpdateMutator != null) {
                    feature = _drawOptions.featureUpdateMutator(feature)
                  }
                  updateFeatureInDrawSource(
                    feature,
                    idField,
                    layerGroupId,
                    _map
                  )
                })
              }

              const handleDrawDelete = (e: any) => {
                e.features.forEach((feature: Feature) => {
                  deleteFeatureFromDrawSource(
                    feature,
                    idField,
                    layerGroupId,
                    _map
                  )
                })
              }

              let handleSelectionChange: ((e: any) => void) | undefined =
                undefined

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
                    features.filter
                    setSelectedFeatures(features)
                  }
                }
                _map?.on('draw.selectionchange', handleSelectionChange)
              }

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
              })

              _disableLayerGroupEventHandlers(layerGroupId)

              if (selectedFeatures?.length > 0) {
                if (draw.getMode() === 'simple_select') {
                  _updateDrawSelectedFeatures(true)
                }
              }
            }
          },
          { priority: QueuePriority.LOW }
        ),

        _updateDrawSelectedFeatures: (updateSelectedFeatures?: boolean) => {
          const {
            _drawOptions,
            selectedFeatures,
            _layerGroups,
            setSelectedFeatures,
            _map,
          } = get()

          let newSelectedFeatures: MapGeoJSONFeature[] = []
          newSelectedFeatures = selectedFeatures.filter((feature) => {
            return (
              getLayerGroupIdForLayer(feature.layer.id, _layerGroups) ===
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

        disableDraw: queueableFnInit(
          async () => {
            const { _map, _drawOptions } = get()

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

              // clear selected features, if any
              if (drawInstance.getMode() === 'simple_select') {
                await drawInstance.changeMode('simple_select', {
                  featureIds: [],
                })
              }

              _map?.removeControl(drawInstance)

              await set((state) => {
                state._drawOptions.draw = null
                state._drawOptions.originalStyles = undefined
                state._drawOptions.handleDrawCreate = undefined
                state._drawOptions.handleDrawUpdate = undefined
                state._drawOptions.handleDrawDelete = undefined
                state._drawOptions.handleSelectionChange = undefined
              })
            }
          },
          {
            priority: QueuePriority.LOW,
          }
        ),

        _removeDraw: queueableFnInit(
          async () => {
            const { disableDraw } = get()

            await disableDraw({ skipQueue: true })
            await set((state) => {
              state._drawOptions.layerGroupId = null
              state._drawOptions.isEnabled = false
            })
          },
          {
            priority: QueuePriority.LOW,
          }
        ),

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

        _setGroupVisibility: (
          layerGroupId: LayerGroupId | string,
          isVisible: boolean
        ) => {
          const { _layerGroups, _map } = get()
          const layerGroup = _layerGroups[layerGroupId]

          for (const layerId in layerGroup.layers) {
            if (layerGroup.layers[layerId].useMb) {
              _map?.setLayoutProperty(
                layerId,
                'visibility',
                isVisible ? 'visible' : 'none'
              )
            } else {
              // TODO: For OpenLayer usage. Fix later if needed
              // layerGroup.layers[layerId].setVisible(isVisible)
            }
          }

          set((state) => {
            state._layerGroups[layerGroupId].isHidden = !isVisible
          })
        },

        _setActivePopupData: (activePopupData: PopupData) => {
          set(
            produce((state) => {
              state.activePopupData = activePopupData
            })
          )
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

        _addStaleSourceId: (id: string) => {
          const { _staleSourceIds } = get()
          if (!_staleSourceIds.includes(id)) {
            set((state) => {
              state._staleSourceIds.push(id)
            })
          }
        },

        _refreshStaleSources: async () => {
          const { _map, _staleSourceIds, _layerGroups } = get()

          const newStaleSourceIds: string[] = []

          _staleSourceIds.forEach(async (sourceId) => {
            const sourceOpts = findSourceOptsById(sourceId, _layerGroups)

            if (!sourceOpts) {
              console.warn(
                `No source options found for stale source id: ${sourceId}`
              )
              return
            }

            if (sourceOpts.type !== 'store') {
              if ('url' in sourceOpts && sourceOpts.url) {
                if (sourceOpts.type === 'geojson') {
                  if (sourceOpts.extendedOpts?.ensureLocalData) {
                    const fetchedData = await geoserverJsonQuery(
                      sourceOpts.url,
                      sourceOpts.extendedOpts.useAccessToken
                    )
                    if (fetchedData) {
                      const source = _map?.getSource(sourceOpts.id)
                      ;(source as GeoJSONSource).setData(fetchedData)
                    } else {
                      newStaleSourceIds.push(sourceId)
                    }
                  } else {
                    const source = _map?.getSource(
                      sourceOpts.id
                    ) as GeoJSONSource
                    source.setData(sourceOpts.url)
                  }
                }
                _map?.refreshTiles(sourceId)
              }
              if (sourceOpts.tiles && sourceOpts.tiles.length > 0) {
                _map?.refreshTiles(sourceId)
              }
            }
          })

          set((state) => {
            state._staleSourceIds = uniq(newStaleSourceIds)
          })
        },

        _addStyle: async (
          id: LayerGroupId | string,
          options: LayerGroupAddOptionsWithConf
        ) => {
          const {
            _map,
            _addLayerAfter,
            _findFirstMatchingLayer,
            _findLastMatchingLayer,
            _enableLayerGroupEventHandlers,
            _updateSelectableHoverHandlers,
          } = get()
          // const setIsMapPopupOpen = useUIStore.getState().setIsMapPopupOpen

          const style = await resolveMbStyle(options.layerConf.style)

          let layerInsertId: string | null = null

          try {
            const layerGroup: LayerGroupOptions = {
              id: id,
              mapContext: options.mapContext,
              isHidden: options.isHidden ? true : false,
              persist: options.persist ? true : false,
              layers: {},
              sources: {},
              eventHandlers: [],
            }

            for (const sourceKey in style.sources) {
              const { extendedOpts, ...sourceSpec } = style.sources[
                sourceKey
              ] as ExtendedSourceSpecification

              const sourceOptions: SourceOptions = {
                id: sourceKey,
                type: sourceSpec.type,
                popupOpts: null,
                layerIds: [],
                ...(extendedOpts && { extendedOpts }),
              } as SourceOptions

              if (isStandardSourceOptions(sourceOptions)) {
                // store the original urls in the sourceOptions
                if (
                  'data' in sourceSpec &&
                  typeof sourceSpec.data === 'string'
                ) {
                  sourceOptions.url = sourceSpec.data

                  // if it useAccessToken is set, then the source url needs to be encoded in a such way that
                  // the transformRequest knows to add the access token and can get sourceId to clear cache if needed
                  if (
                    sourceOptions.extendedOpts &&
                    sourceOptions.extendedOpts.useAccessToken
                  ) {
                    sourceSpec.data = encodeUrlWithParams(sourceSpec.data, {
                      sourceId: sourceKey,
                      useAccessToken: true,
                    })
                  }
                } else if (
                  'url' in sourceSpec &&
                  typeof sourceSpec.url === 'string'
                ) {
                  sourceOptions.url = sourceSpec.url

                  if (
                    sourceOptions.extendedOpts &&
                    sourceOptions.extendedOpts.useAccessToken
                  ) {
                    sourceSpec.url = encodeUrlWithParams(sourceSpec.url, {
                      sourceId: sourceKey,
                      useAccessToken: true,
                    })
                  }
                } else if (
                  'tiles' in sourceSpec &&
                  Array.isArray(sourceSpec.tiles)
                ) {
                  sourceOptions.tiles = sourceSpec.tiles

                  if (
                    sourceOptions.extendedOpts &&
                    sourceOptions.extendedOpts.useAccessToken
                  ) {
                    sourceSpec.tiles = sourceSpec.tiles.map((tileUrl) => {
                      return encodeUrlWithParams(tileUrl, {
                        sourceId: sourceKey,
                        useAccessToken: true,
                      })
                    })
                  }
                }
              }

              if (sourceOptions.type === 'store') {
                const storeDataOpts = sourceOptions.extendedOpts?.storeData
                if (!storeDataOpts?.sync) {
                  console.error(
                    `Source "${sourceKey}" is type 'store' but is missing storeData.sync configuration.`
                  )
                  continue // Skip this source
                }

                const { store, selector } = storeDataOpts.sync
                const initialData = selector(store.getState())

                const parsedSourceSpec: SourceSpecification = {
                  ...sourceSpec,
                  type: 'geojson',
                  data: initialData || {
                    type: 'FeatureCollection',
                    features: [],
                  },
                }

                _map?.addSource(sourceKey, parsedSourceSpec)

                const unsubscribe = (store as any).subscribe(
                  selector,
                  (newData: FeatureCollection) => {
                    const map = get()._map
                    const source = map?.getSource(sourceKey) as GeoJSONSource
                    // Update the map source when the store data changes
                    if (source && newData) {
                      source.setData(newData)
                    }
                  }
                )

                // Save the unsubscribe function for later cleanup
                set((state) => {
                  if (!state._dataSyncSubscriptions[id]) {
                    state._dataSyncSubscriptions[id] = {}
                  }
                  state._dataSyncSubscriptions[id][sourceKey] = unsubscribe
                })
              } else {
                _map?.addSource(sourceKey, sourceSpec as SourceSpecification)
              }

              if ('popupOpts' in options.layerConf) {
                if (options.layerConf.popupOpts) {
                  const popupOpts = options.layerConf.popupOpts

                  if (sourceKey === popupOpts.source) {
                    sourceOptions.popupOpts = popupOpts
                  }
                }
              }

              layerGroup.sources[sourceKey] = sourceOptions

              if (sourceOptions.extendedOpts) {
                // for geojson sources, optionally fetch the data to ensure it is available locally
                // maplibre typically stores only the url string in the source spec
                // and fetches the data when needed, but that makes querying the data impossible
                if (
                  sourceOptions.type === 'geojson' &&
                  sourceOptions.extendedOpts.ensureLocalData &&
                  typeof sourceOptions.url === 'string' // Data is a URL
                ) {
                  const fetchedData = await geoserverJsonQuery(
                    sourceOptions.url,
                    sourceOptions.extendedOpts.useAccessToken
                  )
                  if (fetchedData) {
                    const source = _map?.getSource(sourceKey)
                    ;(source as GeoJSONSource).setData(fetchedData)
                  }
                }
              }
            }

            for (const layer of style.layers) {
              const matchingSource = layerGroup.sources[layer.source]

              const layerOptions: LayerOptions = {
                id: layer.id,
                source: layer.source,
                ...(layer.sourceLayer && { sourceLayer: layer.sourceLayer }),
                name: getLayerName(layer.id),
                layerType: layer.type,
                selectable:
                  layer.selectable ??
                  matchingSource.extendedOpts?.selectable ??
                  false,
                multiSelectable:
                  matchingSource.extendedOpts?.multiSelectable ?? false,
                hoverPointer:
                  layer.hoverPointer ??
                  layer.selectable ??
                  matchingSource.extendedOpts?.selectable ??
                  false,
                popupOpts: null,
                useMb: true,
              }

              layerGroup.layers[layer.id] = layerOptions
              layerGroup.sources[layer.source].layerIds.push(layer.id)

              if (
                'popupOpts' in options.layerConf &&
                options.layerConf.popupOpts
              ) {
                if (layer.selectable || layer.multiSelectable) {
                  const popupOpts = options.layerConf.popupOpts

                  if (isMatchingSource(layer, popupOpts)) {
                    layerOptions.popupOpts = popupOpts
                  }
                }
              }

              set((state) => {
                state._layerInstances[layer.id] = layer
              })

              // if layerInsertId is null, this is the first layer to be added
              if (layerInsertId == null) {
                // if the layer is added before, add the first layer before the neighboring layer
                // The consecutive layers are added after the first layer
                // In Mapbox, the last layer is rendered on top.
                if (options.isAddedBefore) {
                  if (options.neighboringLayerGroupId != null) {
                    const beforeLayer = _findFirstMatchingLayer(
                      options.neighboringLayerGroupId
                    )
                    _map?.addLayer(layer, beforeLayer || undefined)
                  } else {
                    const mapLayers = _map?.getStyle().layers
                    if (mapLayers && mapLayers.length > 0) {
                      // add layer before the first layer, if there is one
                      _map?.addLayer(layer, mapLayers[0].id)
                    } else {
                      // or if not, just add it normally
                      _map?.addLayer(layer)
                    }
                  }
                }
                // If the layer is added after, add the first layer after the neighboring layer
                else {
                  if (options.neighboringLayerGroupId != null) {
                    layerInsertId = _findLastMatchingLayer(
                      options.neighboringLayerGroupId
                    )
                  }
                  if (layerInsertId != null) {
                    _addLayerAfter(layer, layerInsertId)
                  } else {
                    _map?.addLayer(layer)
                  }
                }
              }
              // the consecutive layers are added after the first layer
              else {
                _addLayerAfter(layer, layerInsertId)
                layerInsertId = layer.id
              }

              layerInsertId = layer.id

              if (!options.isHidden) {
                _map?.setLayoutProperty(layer.id, 'visibility', 'visible')
              } else {
                _map?.setLayoutProperty(layer.id, 'visibility', 'none')
              }
            }

            if (options.layerConf.eventHandlers && _map) {
              for (const eventHandlerOptions of options.layerConf
                .eventHandlers) {
                const eventHandler = eventHandlerOptions.handlerCreator(_map)

                layerGroup.eventHandlers.push({
                  layers: eventHandlerOptions.layers,
                  eventType: eventHandlerOptions.eventType,
                  handler: eventHandler,
                })
              }
            }

            await set((state) => {
              state._layerGroups[id] = layerGroup

              if (options.layerConf.joinedSelectionSources) {
                options.layerConf.joinedSelectionSources.forEach(
                  (newJoinedArray: SelectionSource[]) => {
                    const alreadyExists = state._joinedSelectionSourceMap.some(
                      (existingJoinedArray) =>
                        isEqual(existingJoinedArray, newJoinedArray)
                    )
                    if (!alreadyExists) {
                      state._joinedSelectionSourceMap.push(newJoinedArray)
                    }
                  }
                )
              }
            })

            _enableLayerGroupEventHandlers(id)
            _updateSelectableHoverHandlers()
          } catch (e: any) {
            if (!e.message.includes('There is already a source')) {
              console.error(e)
            }
          }
        },

        _runLayerGroupActivationActions: async (
          layerGroupIdString: string,
          opts?: LayerGroupAddOptions | SerializableLayerGroupAddOptions
        ) => {
          if (opts != null) {
            const { getAndFitBounds, _drawOptions, _removeDraw, _map } = get()
            if (opts?.zoomToExtent) {
              getAndFitBounds(layerGroupIdString, undefined, {
                skipQueue: true,
              })
            }

            if (
              opts?.drawOptions != null &&
              (opts.drawOptions.polygonEnabled || opts.drawOptions.editEnabled)
            ) {
              if (_drawOptions != null) {
                await _removeDraw({ skipQueue: true })
              }
              set((state) => {
                state._drawOptions = {
                  draw: null,
                  polygonEnabled: false,
                  editEnabled: false,
                  deleteEnabled: false,
                  ...opts.drawOptions,
                  layerGroupId: layerGroupIdString,
                  isEnabled: true,
                }
              })
            }

            if ('dataUpdateMutator' in opts) {
              const handleDataUpdate = (e: any) => {
                if (
                  e.dataType === 'source' &&
                  e.sourceId === layerGroupIdString &&
                  e.isSourceLoaded
                ) {
                  // Source data for the layerGroupId has changed/loaded
                  if ('data' in e.source) {
                    if (e.source.data != null) {
                      if (opts.dataUpdateMutator != null) {
                        opts.dataUpdateMutator(e.source.data) // Update Zustand store with new data
                      }
                    }
                  }
                }
              }

              set((state) => {
                state._layerGroups[layerGroupIdString].handleDataUpdate =
                  handleDataUpdate
              })

              _map?.on('data', handleDataUpdate)
            }
          }
        },
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
          const { _isFunctionQueueExecuting, _setIsFunctionQueueExecuting } =
            get()

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
            priorityArr = priorityArr
              .reverse()
              .splice(0, priorityArr.length / 2)

            for (let i in priorityArr) {
              functionsToCall = functionsToCall.concat(
                functionQueue.filter((f) => f.priority === priorityArr[i])
              )

              if (functionsToCall.length > 0) {
                store._setFunctionQueue(
                  store._functionQueue.filter(
                    (f) => !functionsToCall.includes(f)
                  )
                )
                break
              }
            }

            const callFuncs = async () => {
              await Promise.all(
                functionsToCall.map(async (call) => {
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
                    call.promise.reject(new Error('Function execution failed'))
                    return null
                  }
                })
              )
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

        _setMap: (map: Map) => {
          set((state) => {
            // @ts-ignore
            state._map = map
          })
        },

        // Finds the first layer that starts with the given id. Mapbox renders
        // layers in order, last layer in array being on top.
        _findFirstMatchingLayer: (id: string) => {
          const { _map } = get()

          if (_map) {
            const layers = _map.getStyle().layers

            if (layers) {
              let firstMatch = layers.find((l) => l.id.startsWith(id))
              return firstMatch ? firstMatch.id : null
            }
          }

          return null
        },

        // Finds the last layer that starts with the given id
        _findLastMatchingLayer: (id: string) => {
          const { _map } = get()

          if (_map) {
            const layers = _map.getStyle().layers

            if (layers) {
              let lastMatch: string | null = null
              layers.forEach((layer) => {
                if (layer.id.startsWith(id)) {
                  lastMatch = layer.id
                }
              })

              return lastMatch
            }
          }

          return null
        },

        // The default mapbox addLayer function can only specify a
        // layer to be added before another layer.
        _addLayerAfter: (layer: LayerSpecification, afterId: string) => {
          const { _map } = get()

          const layers = _map?.getStyle().layers

          if (layers) {
            const index = layers.findIndex((l) => l.id === afterId)

            if (index !== -1 && index < layers.length - 1) {
              // Get the ID of the layer after the 'after' layer
              const beforeId = layers[index + 1].id

              // Add the new layer before that layer, effectively adding it after the 'after' layer
              _map?.addLayer(layer, beforeId)
            } else {
              // If the 'after' layer wasn't found or it's the last layer, just add the new layer
              _map?.addLayer(layer)
            }
          }
        },

        // _enableLayerEventHandlers: (layerOptions: LayerOptions) => {
        //   if (
        //     layerOptions.eventHandlers != null &&
        //     Object.keys(layerOptions.eventHandlers).length > 0
        //   ) {
        //     const { _map } = get()

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
        //     const { _map } = get()

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

        _enableLayerGroupEventHandlers: (layerGroupId: string) => {
          const { _layerGroups, _map } = get()

          for (const eventHandlerOptions of _layerGroups[layerGroupId]
            .eventHandlers) {
            if (
              eventHandlerOptions.layers == null ||
              eventHandlerOptions.layers.length === 0
            ) {
              _map?.on(
                eventHandlerOptions.eventType,
                eventHandlerOptions.handler
              )
            } else {
              _map?.on(
                eventHandlerOptions.eventType,
                eventHandlerOptions.layers,
                eventHandlerOptions.handler
              )
            }
          }
        },

        _disableLayerGroupEventHandlers: (layerGroupId: string) => {
          const { _layerGroups, _map } = get()

          for (const eventHandlerOptions of _layerGroups[layerGroupId]
            .eventHandlers) {
            _map?.off(
              eventHandlerOptions.eventType,
              eventHandlerOptions.layers,
              eventHandlerOptions.handler
            )
          }
        },

        _addPersistingLayerGroupAddOptions: (
          id: string,
          serializableLayerGroupAddOptions: SerializableLayerGroupAddOptions
        ) => {
          // TODO: Find a better fix for this, instead of casting to any
          // For some reason immer doesn't like the Mapbox Source object type
          set((state) => {
            state._persistingLayerGroupAddOptions[id] =
              serializableLayerGroupAddOptions as any
          })
        },

        _removePersistingLayerGroupAddOptions: (id: string) => {
          set((state) => {
            delete state._persistingLayerGroupAddOptions[id]
          })
        },

        _runHydrationActions: async () => {
          const {
            _setIsHydrated,
            _hydrationData,
            enableSerializableLayerGroup,
          } = get()

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
    }),
    {
      name: 'mapStorage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
      partialize: (state: State) => {
        return {
          // TODO: fix hydration. Currently rehydrates layerGroups that do not have data
          _hydrationData: {
            layerGroups: {},
            // layerGroups: state._layerGroups,
            persistingLayerGroupAddOptions:
              state._persistingLayerGroupAddOptions,
          },
        }
      },
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (error) {
            console.error('map store: an error happened during hydration', error)
          }
          state?._runHydrationActions()
        }
      },
    }
    // ),
    // {
    //   ...commonDevtools,
    //   store: 'mapStore',
    //   features: {
    //     pause: true,
    //     lock: true,
    //     persist: false,
    //     export: false,
    //     import: false,
    //   },
    //   maxAge: 50,
    //   serialize: {
    //     options: true,
    //     infinity: true,
    //     date: true,
    //     map: true,
    //     set: true,

    //   // This replacer prevents large or non-serializable objects from being
    //   // sent to Redux DevTools, which improves performance.
    //     replacer: (key: string, value: any) => {
    //       // The map instance is a large, complex object with circular references.
    //       // if (key === '_map' && value) {
    //       //   return '[MapInstance]';
    //       // }
    //       // if (value instanceof Set) {
    //       //   return Array.from(value);
    //       // }
    //       // // The draw instance is also a complex object.
    //       // if (key === 'draw' && value) {
    //       //   return '[DrawInstance]';
    //       // }
    //       // if (['_layerInstances', '_hydrationData'].includes(key) && value) {
    //       //     const keys = Object.keys(value);
    //       //     return `[Object with keys: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? ', ...' : ''}] (${keys.length} total)`;
    //       // }
    //       // // Functions and Promises are not serializable.
    //       // if (typeof value === 'function') {
    //       //   return '[Function]';
    //       // }
    //       // if (value instanceof Promise) {
    //       //   return '[Promise]';
    //       // }
    //       // return value;
    //       if (key === '') {
    //         // This is the root state object
    //         // Be warned: including the full _layerGroups object can still be slow.
    //         // const sanitizedFeatures = value.selectedFeatures.map(
    //         //   (feature: MapGeoJSONFeature) => ({
    //         //     id: feature.id,
    //         //     source: feature.source,
    //         //     sourceLayer: feature.sourceLayer,
    //         //     layerId: feature.layer?.id,
    //         //     properties: feature.properties,
    //         //   })
    //         // )
    //         // return {
    //         //   _layerGroups: value._layerGroups,
    //         //   selectedFeatures: sanitizedFeatures,
    //         // }
    //         return {}
    //       }
    //       return value
    //       },
    //   },
    // }
  )
)

// implement at some point
// const setFilter = () => {}
// const AddMapEventHandler = () => {}
// const isSourceReady = () => {}
// const removeMapEventHandler = () => {}
// const enablePersonalDataset = () => {}
// const disablePersonalDataset = () => {}

// used in ForestArvometsa.tsx. Not all of these are needed
// const genericPopupHandler = () => {}
// const querySourceFeatures = () => {}

// use REDUX for these?
// const enableGroup = () => {}
// const disableGroup = () => {}
// const eetGroupState = () => {}
// const toggleGroup = () => {}
// const enableOnlyOneGroup = () => {}
// const isGroupEnable = () => {}
