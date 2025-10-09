// The map store is a zustand store that manages the map state.
// A lot of the logic is split between this file and the Map component.
// There are a also various helper hooks in src/common/hooks/map.
'use client'

// TODO: Refactor the _map object to somewhere else. It does need to be in the store.

import { map, cloneDeep, uniq, isEqual, pickBy, uniqBy } from 'lodash-es'
import turfBbox from '@turf/bbox'
import { enableMapSet, produce } from 'immer'
import { Feature, FeatureCollection } from 'geojson'
import { create } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'
import { StateCreator } from 'zustand'
import stableStringify from 'fast-json-stable-stringify'

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
import { useMapInstanceStore } from './mapInstanceStore'

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
  SearchableDataOpts,
  DataSearchOpts,
  LayerOrderLevel,
  ListedLayerGroup,
} from '#/common/types/map'
// import { layerConfs } from '#/components/Map/layers'

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
  getSourceJson,
  findFirstMatchingLayer,
  findLastMatchingLayer,
  addLayerAfter,
  addLayerByOrderLevel,
  getLayersForSource,
} from '#/common/utils/map'
import { geoserverJsonQuery } from '#/common/queries/geoserverJsonQuery'
import { MapStateCreator, MapStoreHelpers } from './mapStore'
// import { commonDevtools } from './shared-devtools'

const DEFAULT_MAP_LIBRARY_MODE: MapLibraryMode = 'maplibre'
const IS_DEV = process.env.NODE_ENV === 'development'

let imageRenderCanvas: HTMLCanvasElement | null = null
let imageRenderCtx: CanvasRenderingContext2D | null = null
const imageRenderSize = 24 // Default size
enableMapSet()

export type MapCoreVars = {
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
  searchableDatas: Record<string, SearchableDataOpts>
  _joinedSelectionSourceMap: SelectionSource[][]
  listedLayerGroups: ListedLayerGroup[]
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
  // openlayers map object
  // _olMap: OlMap | null
  // A single UI layer has often multiple layers which are grouped together.
  _layerGroups: LayerGroups
  // For quickly access a layer group by its id.
  _layerInstances: Record<string, LayerSpecification>
  _layerGroupIdsBeingProcessed: Set<string>
  _globalEventHandlers: {
    selectableLeave?: (e: MapLayerMouseEvent) => void
    selectableMove?: (e: MapLayerMouseEvent) => void
    selectableEnter?: (e: MapLayerMouseEvent) => void
    selectableLayers: string[]
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

export type MapCoreActions = {
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
    options: LayerGroupAddOptions | SerializableLayerGroupAddOptions,
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
    options: LayerGroupAddOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  // LayerSpecificationGroup allows adding layerGroups with custom ids,
  // e.g., uploaded custom layers with generated ids.
  addSerializableLayerGroup: (
    layerGroupIdString: string,
    options: SerializableLayerGroupAddOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  toggleSerializableLayerGroup: (
    layerGroupIdString: string,
    options: SerializableLayerGroupAddOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  enableSerializableLayerGroup: (
    layerGroupIdString: string,
    options: SerializableLayerGroupAddOptions,
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
  flyTo: (
    options: mapboxgl.FlyToOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  easeTo: (
    options: mapboxgl.EaseToOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  setSelectedFeatures: (
    features: MapGeoJSONFeature[],
    updateDrawSelect?: boolean
  ) => void
  setListedLayerGroups: (
    listedLayerGroups: ListedLayerGroup[],
    resetVisibility?: boolean,
    _queueOptions?: QueueOptions
  ) => Promise<void>
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
  // mapToggleTerrain: () => void
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
  _setLayerFilters: (feature?: MapGeoJSONFeature) => void
  _addToFunctionQueue: (queueFunction: QueueFunction) => Promise<any>
  _setFunctionQueue: (functionQueue: FunctionQueue) => void
  _executeFunctionQueue: (callback?: () => void) => Promise<void>
  _setIsFunctionQueueExecuting: (isExecuting: boolean) => void
  _setActivePopupData: (activePopupData: PopupData) => void
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

export type MapCoreSlice = MapCoreVars & MapCoreActions

export const createMapCoreSlice: (
  helpers: MapStoreHelpers
) => MapStateCreator<MapCoreSlice> = (helpers) => (set, get) => {
  const vars: MapCoreVars = {
    mapLibraryMode: DEFAULT_MAP_LIBRARY_MODE, // Assume an initial value
    isLoaded: false,
    overlayMessage: null,
    activePopupData: [],
    mapContext: null,
    selectedFeatures: [],
    searchableDatas: {},
    listedLayerGroups: [],
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
    _globalEventHandlers: { selectableLayers: [] },
    _functionQueue: [],
    _isFunctionQueueExecuting: false,
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

  const actions: MapCoreActions = {
    getSourceBounds: helpers.queueableFnInit(
      async (sourceId: string): Promise<LngLatBounds | null> => {
        // Query source features for the specified source
        try {
          const { getSourceJsonAsyncQueue } = get()
          const _map = useMapInstanceStore.getState()._map

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
            const features = _map?.querySourceFeatures(sourceId)

            if (features.length > 0 && features[0].geometry) {
              featureColl = {
                type: 'FeatureCollection',
                features: features,
              }
            } else {
              const source = _map?.getSource(sourceId)
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
      { key: 'getSourceBounds', priority: QueuePriority.LOW }
    ),

    getSourceJsonAsyncQueue: helpers.queueableFnInit(
      async (id: string): Promise<FeatureCollection | null> => {
        const _map = useMapInstanceStore.getState()._map
        return getSourceJson(id, _map)
      },
      { key: 'getSourceJsonAsyncQueue', priority: QueuePriority.LOW }
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
        selectedFeatures,
        _drawOptions,
        _updateDrawSelectedFeatures,
        _layerGroups,
      } = get()
      const _map = useMapInstanceStore.getState()._map

      if (isEqual(features, selectedFeatures)) {
        return
      }

      const keptFeatures = []

      const featureIdsBySource: {
        ids: Set<string | number | undefined>
        source: string
        sourceLayer?: string
      }[] = []

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

        // group feature ids by source and sourceLayer, to set layer filters later
        if (
          featureIdsBySource.find((f) => isMatchingSource(f, feature)) == null
        ) {
          featureIdsBySource.push({
            source: feature.source,
            sourceLayer: feature.sourceLayer,
            ids: new Set(),
          })
        }

        featureIdsBySource
          .find((f) => isMatchingSource(f, feature))
          ?.ids.add(feature.id)
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

          // add empty sets for sources that are no longer selected, to update filters later
          if (
            featureIdsBySource.find((f) =>
              isMatchingSource(f, selectedFeature)
            ) == null
          ) {
            featureIdsBySource.push({
              source: selectedFeature.source,
              sourceLayer: selectedFeature.sourceLayer,
              ids: new Set(),
            })
          }
        }
      }

      set({
        selectedFeatures: features,
      })
      if (IS_DEV) {
        console.log('DEV DEBUG: Set selected features', features)
      }

      // update the map filters, because some layer styling cannot use feature state
      for (const item of featureIdsBySource) {
        const layers = getLayersForSource(
          { source: item.source, sourceLayer: item.sourceLayer },
          _layerGroups
        )
        for (const layer of layers) {
          if (['selected', 'hover-or-selected'].includes(layer.activeOn)) {
            _map?.setFilter(layer.id, [
              'in',
              ['get', 'id'],
              ['literal', Array.from(item.ids)],
            ])
          }
        }
      }

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
        activeLayerIds = [...activeLayerIds, ...Object.keys(layerGroup.layers)]
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
      const { _layerGroups, _joinedSelectionSourceMap } = get()
      const _map = useMapInstanceStore.getState()._map

      const additionalFeatures: MapGeoJSONFeature[] = []

      // in progress: create helper util to fetch joined sources map

      for (const feature of features) {
        const sourceOptions = findSourceOptsById(feature.source, _layerGroups)

        const additionalSelectionSources = getJoinedSelectionSourcesForSource({
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
            // @ts-expect-error -- TS2589: deep instantiation in Draft<MapCoreSlice>
            draft.activePopupData[0].features = newPopupData.features
          })

          return
        }
      }

      set({
        activePopupData: popupDatas,
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
      const { featureIds, idField, source, updateDrawSelect, ignorePopups } =
        params
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
        _setPopupDataForFeatures,
        _getAdditionalSelectedFeatures,
        selectedFeatures,
        _joinedSelectionSourceMap,
      } = get()
      const _map = useMapInstanceStore.getState()._map

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
          const joinedSelectionSources = getJoinedSelectionSourcesForSource({
            joinedSelectionSourceMap: _joinedSelectionSourceMap,
            source: source.source,
            sourceLayer: source.sourceLayer,
          })
          const matchingFeatures = selectedFeatures.filter((f) => {
            ;[...joinedSelectionSources, source].some((js) => {
              isMatchingSource(f, js)
            })
          })
          oldFeatures.push(...matchingFeatures)
        }
      }

      if (!ignoreAdditionalFeatures) {
        const additionalFeatures = _getAdditionalSelectedFeatures(newFeatures)
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

    setListedLayerGroups: helpers.queueableFnInit(
      async (
        listedLayerGroups: ListedLayerGroup[],
        resetVisibility?: boolean
      ) => {
        const {
          listedLayerGroups: oldListedLayerGroups,
          _layerGroups,
          removeLayerGroup,
          addLayerGroup,
          enableLayerGroup,
        } = get()

        const oldVisibleIds = []

        for (const oldLg of oldListedLayerGroups) {
          if (_layerGroups[oldLg.id] == null) {
            continue
          }
          if (!listedLayerGroups.some((lg) => lg.id === oldLg.id)) {
            await removeLayerGroup(oldLg.id)
          } else {
            // if there are previously visible background layers, keep them visible
            if (!resetVisibility && !_layerGroups[oldLg.id].isHidden) {
              oldVisibleIds.push(oldLg.id)
            }
          }
        }

        for (const lg of listedLayerGroups) {
          const oldLg = oldListedLayerGroups.find((old) => old.id === lg.id)
          if (oldLg == null || _layerGroups[oldLg.id] == null) {
            // if there are old visible ids, then overwrite visibility of the addOptions
            if (oldVisibleIds.length > 0) {
              await addLayerGroup(
                lg.id,
                { ...lg.addOptions, isHidden: true },
                { skipQueue: true }
              )
            } else {
              await addLayerGroup(lg.id, lg.addOptions, { skipQueue: true })
            }
          } else {
            if (oldVisibleIds.length === 0) {
              if (_layerGroups[oldLg.id].isHidden && !lg.addOptions.isHidden) {
                // if there are no enabled background layers and the old layer group was
                // hidden, but the new one is not, then enable it
                await enableLayerGroup(oldLg.id, lg.addOptions)
              }
            }
          }
        }

        set({ listedLayerGroups: listedLayerGroups })
      },
      { key: 'setListedLayerGroups', priority: QueuePriority.MEDIUM_HIGH }
    ),
    // TODO: The logic of this function is getting too complex. Now we have
    // LayerConfs fetched from the common storage and LayerConfs supplied by the calling
    // component. Solution:
    // make "options" mandatory, and always supply a layerConf from the calling function.
    addLayerGroup: helpers.queueableFnInit(
      async (
        layerGroupId: string,
        options: LayerGroupAddOptions | SerializableLayerGroupAddOptions
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
              opts = cloneDeep(_persistingLayerGroupAddOptions[layerGroupId])
            }
            // else {
            //   opts.layerConf = layerConfs.find((el: LayerConf) => {
            //     return el.id === layerGroupId
            //   })
            // }
          }

          if (opts.layerConf) {
            // if (opts.layerConf.useMb == null || opts.layerConf.useMb) {
            await _addStyle(layerGroupId, opts as LayerGroupAddOptionsWithConf)
            // }
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
      { key: 'addLayerGroup', priority: QueuePriority.MEDIUM_HIGH }
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
        if (!options) {
          throw new Error(
            'Unable to enable layer group without layer group options: ' +
              layerGroupId
          )
        }
        addLayerGroup(layerGroupId, options)
      }

      if (options?.layerOrderOptions?.disableOthersInGroup) {
        // Disable all other layer groups with the same order level
        const { disableLayerGroup } = get()
        const orderLevel = options.layerOrderOptions.layerOrderLevel

        for (const otherLayerGroupId in _layerGroups) {
          if (otherLayerGroupId !== layerGroupId) {
            const otherLayerGroup = _layerGroups[otherLayerGroupId]
            if (
              otherLayerGroup.orderLevel === orderLevel &&
              !otherLayerGroup.isHidden
            ) {
              disableLayerGroup(otherLayerGroupId)
            }
          }
        }
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
        searchableDatas,
      } = get()

      if (!Object.keys(_layerGroups).includes(layerGroupId)) {
        throw new Error(
          "Unable to disable layer group that isn't enabled: " + layerGroupId
        )
      }

      _setGroupVisibility(layerGroupId, false)
      const layerGroup = _layerGroups[layerGroupId]
      const sources = uniq(map(layerGroup.layers, 'source'))

      setSelectedFeatures(
        selectedFeatures.filter((f) => !sources.includes(f.source))
      )

      if (searchableDatas[layerGroupId]) {
        set((state) => {
          state.searchableDatas[layerGroupId].enabled = false
        })
      }

      if (_drawOptions.layerGroupId === layerGroupId) {
        _removeDraw({ skipQueue: true })
      }
    },

    removeLayerGroup: async (layerGroupId: LayerGroupId | string) => {
      const {
        _layerGroups,
        _drawOptions,
        _removeDraw,
        _images,
        _updateSelectableHoverHandlers,
        _dataSyncSubscriptions,
        searchableDatas,
      } = get()
      const _map = useMapInstanceStore.getState()._map

      if (!Object.keys(_layerGroups).includes(layerGroupId)) {
        console.warn(
          'Unable to remove layer group that does not have layer group options: ' +
            layerGroupId
        )
        return
      }

      const layerGroupOptions = _layerGroups[layerGroupId]

      // Remove all layers of this group
      for (const layerId of Object.keys(layerGroupOptions.layers)) {
        if (_map?.getLayer(layerId)) {
          _map.removeLayer(layerId)
        }
      }

      // Remove all unique sources used by this group
      // Prefer the group's own source registry; fallback to sources referenced by layer options.
      const sourceIdsInGroup = new Set<string>(
        Object.keys(layerGroupOptions.sources)
      )
      for (const layerId of Object.keys(layerGroupOptions.layers)) {
        const src = layerGroupOptions.layers[layerId]?.source
        if (src) sourceIdsInGroup.add(src)
      }

      for (const sourceId of sourceIdsInGroup) {
        if (_map?.getSource(sourceId)) {
          try {
            _map.removeSource(sourceId)
          } catch (e) {
            console.warn(`Failed to remove source "${sourceId}"`, e)
          }
        }
      }

      // 3) Wait for a style tick so MapLibre finalizes removals before next add
      await new Promise<void>((resolve) => {
        const map = useMapInstanceStore.getState()._map
        if (!map) return resolve()
        let done = false
        const finish = () => {
          if (done) return
          done = true
          resolve()
        }
        try {
          map.once('styledata', finish)
        } catch {
          // ignore
        }
        if (
          typeof window !== 'undefined' &&
          'requestAnimationFrame' in window
        ) {
          requestAnimationFrame(finish)
        } else {
          setTimeout(finish, 0)
        }
      })

      // Detach data handler (if any)
      if (layerGroupOptions.handleDataUpdate) {
        _map?.off('data', layerGroupOptions.handleDataUpdate)
      }

      // Clean searchableDatas entry
      if (searchableDatas[layerGroupId]) {
        set((state) => {
          delete state.searchableDatas[layerGroupId]
        })
      }

      // Unsubscribe store syncs
      if (_dataSyncSubscriptions[layerGroupId]) {
        Object.values(_dataSyncSubscriptions[layerGroupId]).forEach(
          (unsubscribe) => unsubscribe()
        )
      }

      // Remove any images tied to this group
      Object.keys(_images).forEach((imageId) => {
        const image = _images[imageId]
        if (image.layerGroupId === layerGroupId) {
          _map?.removeImage(imageId)
        }
      })

      // Clear state for this group (images, layerInstances, joined selection sources, etc.)
      set((state) => {
        // purge images metadata
        for (const imageId in state._images) {
          if (state._images[imageId].layerGroupId === layerGroupId) {
            delete state._images[imageId]
          }
        }
        // remove any joined selection entries that reference these sources
        const sourceIdsToRemove = Object.keys(layerGroupOptions.sources)
        if (sourceIdsToRemove.length > 0) {
          state._joinedSelectionSourceMap =
            state._joinedSelectionSourceMap.filter((joinedArray) => {
              const hasMatchingSource = joinedArray.some((selectionSource) =>
                sourceIdsToRemove.includes(selectionSource.source)
              )
              return !hasMatchingSource // Keep the array if it does NOT have a matching source
            })
        }

        // finally drop the group and subscriptions
        delete state._layerGroups[layerGroupId]
        delete state._dataSyncSubscriptions[layerGroupId]
      })

      // 9) Remove draw if it was tied to this group
      if (_drawOptions.layerGroupId === layerGroupId) {
        await _removeDraw({ skipQueue: true })
      }

      _updateSelectableHoverHandlers()
    },

    toggleLayerGroup: async (
      layerGroupId: LayerGroupId | string,
      options: LayerGroupAddOptions
    ) => {
      const { disableLayerGroup, enableLayerGroup, _layerGroups } = get()

      if (_layerGroups[layerGroupId] && !_layerGroups[layerGroupId].isHidden) {
        await disableLayerGroup(layerGroupId)
      } else {
        await enableLayerGroup(layerGroupId, options)
      }
    },

    // these are used used for layers with dynamic ids
    addSerializableLayerGroup: async (
      layerGroupIdString: string,
      options: SerializableLayerGroupAddOptions
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

    addImage: helpers.queueableFnInit(
      async (
        id: string,
        layerGroupId: string,
        svgString: string,
        colorCode?: string,
        size: number = imageRenderSize
      ) => {
        const _map = useMapInstanceStore.getState()._map
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
          'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)
      },
      { key: 'addImage', priority: QueuePriority.HIGH }
    ),

    setLayoutProperty: helpers.queueableFnInit(
      async (layer: string, name: string, value: any): Promise<any> => {
        const _map = useMapInstanceStore.getState()._map

        _map?.setLayoutProperty(layer, name, value)
      },
      { key: 'setLayoutProperty' }
    ),

    setPaintProperty: helpers.queueableFnInit(
      async (layer: string, name: string, value: any): Promise<any> => {
        const _map = useMapInstanceStore.getState()._map

        _map?.setPaintProperty(layer, name, value)
      },
      { key: 'setPaintProperty' }
    ),

    setFilter: helpers.queueableFnInit(
      async (layer: string, filter: FilterSpecification): Promise<any> => {
        const _map = useMapInstanceStore.getState()._map

        _map?.setFilter(layer, filter)
      },
      { key: 'setFilter' }
    ),

    setOverlayMessage: async (condition: boolean, message: OverlayMessage) => {
      set((state) => {
        state.overlayMessage = condition ? message : null
      })
    },

    fitBounds: helpers.queueableFnInit(
      (
        bbox: number[] | LngLatBounds,
        { duration = 2000, lonExtra = 1, latExtra = 1 }: FitBoundsOptions = {}
      ): Promise<void> => {
        const _map = useMapInstanceStore.getState()._map
        const mapDims = useUIStore.getState().mapDims

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

        const flyOptions: mapboxgl.FitBoundsOptions = { duration: duration }

        if (_map && mapDims.visible) {
          const container = _map.getContainer() as HTMLElement
          const mapCenterX = container.clientWidth / 2
          const mapCenterY = container.clientHeight / 2

          const { centerX: visibleCenterX, centerY: visibleCenterY } =
            mapDims.visible

          flyOptions.offset = [
            visibleCenterX - mapCenterX,
            visibleCenterY - mapCenterY,
          ]
        }

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
      },
      {
        key: 'fitBounds',
      }
    ),

    flyTo: helpers.queueableFnInit(
      (options: mapboxgl.FlyToOptions): Promise<void> => {
        const _map = useMapInstanceStore.getState()._map
        const mapDims = useUIStore.getState().mapDims

        const flyToOptions: mapboxgl.FlyToOptions = { ...options }

        if (_map && mapDims.visible) {
          const container = _map.getContainer() as HTMLElement
          const mapCenterX = container.clientWidth / 2
          const mapCenterY = container.clientHeight / 2

          const { centerX: visibleCenterX, centerY: visibleCenterY } =
            mapDims.visible

          flyToOptions.offset = [
            visibleCenterX - mapCenterX,
            visibleCenterY - mapCenterY,
          ]
        }

        _map?.flyTo(flyToOptions)
        return Promise.resolve()
      },
      { key: 'flyTo' }
    ),

    easeTo: helpers.queueableFnInit(
      (options: mapboxgl.EaseToOptions): Promise<void> => {
        const _map = useMapInstanceStore.getState()._map
        const mapDims = useUIStore.getState().mapDims

        const easeToOptions: mapboxgl.EaseToOptions = { ...options }

        if (_map && mapDims.visible) {
          const container = _map.getContainer() as HTMLElement
          const mapCenterX = container.clientWidth / 2
          const mapCenterY = container.clientHeight / 2

          const { centerX: visibleCenterX, centerY: visibleCenterY } =
            mapDims.visible

          easeToOptions.offset = [
            visibleCenterX - mapCenterX,
            visibleCenterY - mapCenterY,
          ]
        }

        _map?.easeTo(easeToOptions)
        return Promise.resolve()
      },
      { key: 'easeTo' }
    ),

    getAndFitBounds: helpers.queueableFnInit(
      async (
        layerGroupId,
        { duration = 2000, lonExtra = 1, latExtra = 1 }: FitBoundsOptions = {}
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
      },
      {
        key: 'getAndFitBounds',
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
      const _map = useMapInstanceStore.getState()._map
      _map?.resetNorth()
    },

    // mapToggleTerrain: () => {
    //   const { toggleLayerGroup } = get()
    //   toggleLayerGroup('terramonitor', {
    //     mapContext: 'any',
    //     isAddedUnderNeighbor: false,
    //     neighboringLayerGroupId: 'osm',
    //   })
    // },

    mapZoomIn: () => {
      const _map = useMapInstanceStore.getState()._map
      _map?.zoomIn()
    },

    mapZoomOut: () => {
      const _map = useMapInstanceStore.getState()._map
      _map?.zoomOut()
    },

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
      },
      {
        key: 'setDrawMode',
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
      const _map = useMapInstanceStore.getState()._map // Get the Mapbox map instance from the state

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
        if (layerOptions.hoverPointer) {
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

    _enableDraw: helpers.queueableFnInit(
      async (drawMode?: MaplibreDraw.DrawMode) => {
        const {
          _drawOptions,
          selectedFeatures,
          _layerGroups,
          _disableLayerGroupEventHandlers,
          setSelectedFeatures,
          _updateDrawSelectedFeatures,
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
              addFeatureToDrawSource(feature, layerGroupId, _map)
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

    disableDraw: helpers.queueableFnInit(
      async () => {
        const _map = useMapInstanceStore.getState()._map
        const { _drawOptions } = get()

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
      const { _layerGroups } = get()
      const _map = useMapInstanceStore.getState()._map

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
        if (state.searchableDatas[layerGroupId]) {
          state.searchableDatas[layerGroupId].enabled = isVisible
        }
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
      const { _staleSourceIds, _layerGroups } = get()
      const _map = useMapInstanceStore.getState()._map

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
                const source = _map?.getSource(sourceOpts.id) as GeoJSONSource
                source.setData(sourceOpts.url)
              }
            }
            _map?.refreshTiles(sourceId)
          }
          if (
            'tiles' in sourceOpts &&
            sourceOpts.tiles &&
            sourceOpts.tiles.length > 0
          ) {
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
        _enableLayerGroupEventHandlers,
        _updateSelectableHoverHandlers,
        _layerGroups,
      } = get()

      if (_layerGroups[id]) {
        console.warn(
          `Layer group with id "${id}" already exists. Skipping adding it again. In react strict mode this warning is expected. Otherwise, something is probably funky.`
        )
        return
      }
      // const setIsMapPopupOpen = useUIStore.getState().setIsMapPopupOpen
      const _map = useMapInstanceStore.getState()._map

      const style = await resolveMbStyle(options.layerConf.style)

      let layerInsertId: string | null = null

      let dataHasBeenAdded = false // for checking if rollback is needed

      try {
        let orderLevel: LayerOrderLevel = LayerOrderLevel.LAYER
        if (
          options?.layerOrderOptions &&
          'layerOrderLevel' in options.layerOrderOptions
        ) {
          orderLevel = options.layerOrderOptions.layerOrderLevel
        }

        let layerGroup: LayerGroupOptions = {
          isProcessing: true,
          id: id,
          mapContext: options.mapContext,
          isHidden: options.isHidden ? true : false,
          persist: options.persist ? true : false,
          orderLevel: orderLevel,
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
            if ('data' in sourceSpec && typeof sourceSpec.data === 'string') {
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

          // used for searchableData when the source type is geojson or store
          let data: FeatureCollection | undefined = undefined

          // for geojson sources
          if (
            sourceOptions.type === 'geojson' &&
            'data' in sourceSpec &&
            sourceSpec.data
          ) {
            if (typeof sourceSpec.data !== 'string') {
              data = sourceSpec.data as FeatureCollection
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

            data = initialData || {
              type: 'FeatureCollection',
              features: [],
            }

            const parsedSourceSpec: SourceSpecification = {
              ...sourceSpec,
              type: 'geojson',
              data: data,
            }

            _map?.addSource(sourceKey, parsedSourceSpec)
            dataHasBeenAdded = true

            const unsubscribe = (store as any).subscribe(
              selector,
              (newData: FeatureCollection) => {
                const _map = useMapInstanceStore.getState()._map
                const source = _map?.getSource(sourceKey) as GeoJSONSource
                // Update the map source when the store data changes
                if (source && newData) {
                  source.setData(newData)
                }

                if (sourceOptions.extendedOpts?.dataSearchOpts) {
                  set((state) => {
                    state.searchableDatas[id].data = newData
                  })
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
            let dataSearchOpts: DataSearchOpts | undefined

            if (
              'dataSearchOpts' in sourceOptions.extendedOpts &&
              sourceOptions.extendedOpts.dataSearchOpts
            ) {
              dataSearchOpts = sourceOptions.extendedOpts.dataSearchOpts
            }
            if (
              sourceOptions.type === 'geojson' &&
              (sourceOptions.extendedOpts.ensureLocalData || dataSearchOpts) &&
              typeof sourceOptions.url === 'string' // Data is a URL
            ) {
              data = await geoserverJsonQuery(
                sourceOptions.url,
                sourceOptions.extendedOpts.useAccessToken
              )
              if (data) {
                const source = _map?.getSource(sourceKey)
                ;(source as GeoJSONSource).setData(data)
              }
            }
            if (
              'dataSearchOpts' in sourceOptions.extendedOpts &&
              sourceOptions.extendedOpts?.dataSearchOpts
            ) {
              const dataSearchOpts = sourceOptions.extendedOpts.dataSearchOpts

              set((state) => {
                state.searchableDatas[id] = {
                  layerGroupId: id,
                  data: data as FeatureCollection, // if the source type is store or geojson, the data should be available
                  name: dataSearchOpts.name,
                  fields: dataSearchOpts.fields,
                  enabled: options.isHidden ? false : true,
                  ...(dataSearchOpts.appendDatasetName && {
                    appendDataSetName: dataSearchOpts.appendDatasetName,
                  }),
                  ...(dataSearchOpts.displayPattern && {
                    displayPattern: dataSearchOpts.displayPattern,
                  }),
                  ...(dataSearchOpts.getCoordinates && {
                    getCoordinates: dataSearchOpts.getCoordinates,
                  }),
                }
              })
            }
          }
        }

        for (const layer of style.layers) {
          let matchingSource = null

          if (layer.source) {
            matchingSource = layerGroup.sources[layer.source]
          }

          const layerOptions: LayerOptions = {
            id: layer.id,
            ...(layer.source && {
              source: layer.source,
            }),
            ...(layer['source-layer'] && {
              sourceLayer: layer['source-layer'],
            }),
            name: getLayerName(layer.id),
            layerType: layer.type,
            activeOn: layer.activeOn || 'always',
            selectable:
              layer.selectable ??
              (matchingSource && matchingSource.extendedOpts?.selectable) ??
              false,
            multiSelectable:
              (matchingSource &&
                matchingSource.extendedOpts?.multiSelectable) ??
              false,
            hoverPointer:
              layer.hoverPointer ??
              layer.selectable ??
              (matchingSource && matchingSource.extendedOpts?.selectable) ??
              false,
            popupOpts: null,
            useMb: true,
          }

          if (layerOptions.activeOn != 'always' && layer.type != 'background') {
            layer.filter = ['in', ['id'], '']
          }

          layerGroup.layers[layer.id] = layerOptions

          if (layer.source) {
            layerGroup.sources[layer.source].layerIds.push(layer.id)
          }

          if (
            'popupOpts' in options.layerConf &&
            options.layerConf.popupOpts &&
            layer.type != 'background'
          ) {
            if (layer.selectable || layer.multiSelectable) {
              const popupOpts = options.layerConf.popupOpts

              if (isMatchingSource(layer, popupOpts)) {
                layerOptions.popupOpts = popupOpts
              }
            }
          }

          if (layer.generatedFillPatternOptions) {
            applyCanvasFillPattern(
              _map,
              layer,
              layer.generatedFillPatternOptions
            )
          }

          set((state) => {
            state._layerInstances[layer.id] = layer
          })

          // if the layer is added before, add the first layer before the neighboring layer
          // The consecutive layers are added after the first layer
          // In MapLibre, the last layer is rendered on top.
          if (layerInsertId == null || _map?.getLayer(layerInsertId) == null) {
            let layerAdded = false

            if (options.layerOrderOptions) {
              if (options.layerOrderOptions.neighboringLayerGroupId) {
                const neighborLayerOrderLevel =
                  _layerGroups[
                    options.layerOrderOptions.neighboringLayerGroupId
                  ]?.orderLevel

                if (neighborLayerOrderLevel) {
                  let neighborLayerId: string | null
                  if (options.layerOrderOptions.isAddedUnder) {
                    neighborLayerId = findFirstMatchingLayer(
                      options.layerOrderOptions.neighboringLayerGroupId,
                      _map
                    )
                    if (neighborLayerId != null) {
                      _map?.addLayer(layer, neighborLayerId)

                      layerAdded = true
                    }
                  } else {
                    neighborLayerId = findLastMatchingLayer(
                      options.layerOrderOptions.neighboringLayerGroupId,
                      _map
                    )

                    if (neighborLayerId != null) {
                      addLayerAfter(layer, neighborLayerId, _map)

                      layerAdded = true
                    }
                  }

                  if (neighborLayerId == null) {
                    console.warn(
                      `No neighboring layer found for layer group ${id}. Adding layers based on order level.`
                    )
                  }
                }
              }
            }
            if (!layerAdded) {
              addLayerByOrderLevel({
                layer,
                orderLevel,
                map: _map,
                isAddedUnder: options.layerOrderOptions?.isAddedUnder,
              })
            }
          } else if (layerInsertId != null) {
            // if the layer is not first to be added in the group, simply add it after the last added layer
            addLayerAfter(layer, layerInsertId, _map)
          }

          layerInsertId = layer.id

          // if layerInsertId is null, this is the first layer to be added
          // if (layerInsertId == null) {
          //   if (
          //     options.layerOrderOptions &&
          //     'neighboringLayerGroupId' in options.layerOrderOptions &&
          //     options.layerOrderOptions.neighboringLayerGroupId
          //   ) {
          //     if (
          //       'neighboringLayerGroupId' in options.layerOrderOptions &&
          //       options.layerOrderOptions.neighboringLayerGroupId != null
          //     ) {
          //       const beforeLayer = findFirstMatchingLayer(
          //         options.layerOrderOptions.neighboringLayerGroupId,
          //         _map
          //       )
          //       _map?.addLayer(layer, beforeLayer || undefined)
          //     } else {
          //       const mapLayers = _map?.getStyle().layers
          //       if (mapLayers && mapLayers.length > 0) {
          //         // add layer before the first layer, if there is one
          //         _map?.addLayer(layer, mapLayers[0].id)
          //       } else {
          //         // or if not, just add it normally
          //         _map?.addLayer(layer)
          //       }
          //     }
          //   }
          //   // If the layer is added after (over), add the first layer after the neighboring layer
          //   else {
          //     if (
          //       options.layerOrderOptions &&
          //       'neighboringLayerGroupId' in options.layerOrderOptions &&
          //       options.layerOrderOptions.neighboringLayerGroupId != null
          //     ) {
          //       layerInsertId = findLastMatchingLayer(
          //         options.layerOrderOptions.neighboringLayerGroupId,
          //         _map
          //       )
          //     }

          //     if (layerInsertId != null) {
          //       addLayerAfter(layer, layerInsertId, _map)
          //     } else {
          //       // No neighboring layer found, so add the first layer to the map
          //       if (
          //         options.layerOrderOptions &&
          //         'isBackground' in options.layerOrderOptions &&
          //         options.layerOrderOptions.isBackground
          //       ) {
          //         // if the layer is a background layer, find the first
          //         // layer, if there are any. The background layer goes underneath it.
          //         const firstLayer = findFirstMatchingLayer('', _map)
          //         _map?.addLayer(layer, firstLayer ? firstLayer : undefined)
          //       } else {
          //         _map?.addLayer(layer)
          //       }
          //     }
          //     // }
          //   }
          // }
          // // the consecutive layers are added after the first layer
          // else {
          //   addLayerAfter(layer, layerInsertId, _map)
          //   layerInsertId = layer.id
          // }

          // layerInsertId = layer.id
          //   }

          // add the group to state after the first layer is added, in case other layers are dependant on the group configs
          await set((state) => {
            state._layerGroups[id] = layerGroup
          })

          // create a deep copy of the object, preserving immutability. Zustand has frozen the previous object.
          layerGroup = cloneDeep(layerGroup)

          if (!options.isHidden) {
            _map?.setLayoutProperty(layer.id, 'visibility', 'visible')
          } else {
            _map?.setLayoutProperty(layer.id, 'visibility', 'none')
          }
        }

        if (options.layerConf.eventHandlers && _map) {
          for (const eventHandlerOptions of options.layerConf.eventHandlers) {
            const eventHandler = eventHandlerOptions.handlerCreator(_map)

            layerGroup.eventHandlers.push({
              layers: eventHandlerOptions.layers,
              eventType: eventHandlerOptions.eventType,
              handler: eventHandler,
            })
          }
        }

        layerGroup.isProcessing = false

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
          console.error('Error adding the layer group: ', id)
          console.error(e)
          if (dataHasBeenAdded && get()._layerGroups[id]) {
            console.log('Rolling back the layer group: ', id)
            get().removeLayerGroup(id)
          }
        } else {
          console.error(
            'Layer group already exists, or there is a conflicting source id. Aborting adding the layer group: ',
            id
          )
        }
      }
    },

    _runLayerGroupActivationActions: async (
      layerGroupIdString: string,
      opts?: LayerGroupAddOptions | SerializableLayerGroupAddOptions
    ) => {
      if (opts != null) {
        const { getAndFitBounds, _drawOptions, _removeDraw } = get()
        const _map = useMapInstanceStore.getState()._map

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

    _enableLayerGroupEventHandlers: (layerGroupId: string) => {
      const { _layerGroups } = get()
      const _map = useMapInstanceStore.getState()._map

      for (const eventHandlerOptions of _layerGroups[layerGroupId]
        .eventHandlers) {
        if (
          eventHandlerOptions.layers == null ||
          eventHandlerOptions.layers.length === 0
        ) {
          _map?.on(eventHandlerOptions.eventType, eventHandlerOptions.handler)
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
      const { _layerGroups } = get()
      const _map = useMapInstanceStore.getState()._map

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
