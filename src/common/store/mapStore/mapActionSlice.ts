'use client'

import mapboxgl from 'maplibre-gl'
import type { FilterSpecification, LngLatBounds } from 'maplibre-gl'
import { useMapInstanceStore } from './mapInstanceStore'
import { useUIStore } from '#/common/store'
import { waitForMapDims } from '../uiStore'
import {
  paddingFromVisibleViewport,
  expandBoundsMercY,
  handleAutoRelocate,
  clampOpacity,
} from '#/common/utils/map'
import type { MapStoreHelpers, MapStateCreator } from './mapStore'
import {
  OverlayMessage,
  FitBoundsOptions,
  AutoRelocateOptions,
  QueueOptions,
} from '#/common/types/map'

export type MapActionVars = {
  overlayMessage: OverlayMessage | null
  isAutoRelocateDisabled: boolean
  layerGroupOpacities: Record<string, number>
}

export type MapActionActions = {
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
  setFilter: (
    layer: string,
    filter: FilterSpecification,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  setLayerGroupOpacity: (
    layerGroupId: string,
    opacity: number,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  setOverlayMessage: (
    condition: boolean,
    message: OverlayMessage,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  fitBounds: (
    params: {
      bbox: number[] | LngLatBounds
      options?: FitBoundsOptions
      autoRelocateOptions?: AutoRelocateOptions
    },
    _queueOptions?: QueueOptions
  ) => Promise<void>
  getAndFitBounds: (
    layerGroupId: string,
    options?: FitBoundsOptions,
    _queueOptions?: QueueOptions
  ) => Promise<void>
  flyTo: (
    params: {
      options: mapboxgl.FlyToOptions
      autoRelocateOptions?: AutoRelocateOptions
    },
    _queueOptions?: QueueOptions
  ) => Promise<void>
  easeTo: (
    params: {
      options: mapboxgl.EaseToOptions
      autoRelocateOptions?: AutoRelocateOptions
    },
    _queueOptions?: QueueOptions
  ) => Promise<void>
  getGeocoder: () => void
  mapRelocate: () => void
  mapResetNorth: () => void
  mapZoomIn: () => void
  mapZoomOut: () => void
  setIsAutoRelocateDisabled: (isDisabled: boolean) => void
}

export type MapActionSlice = MapActionVars & MapActionActions

export const createMapActionSlice: (
  helpers: MapStoreHelpers
) => MapStateCreator<MapActionSlice> = (helpers) => (set, get) => {
  const vars: MapActionVars = {
    overlayMessage: null,
    isAutoRelocateDisabled: false,
    layerGroupOpacities: {},
  }

  const actions: MapActionActions = {
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

    setLayerGroupOpacity: helpers.queueableFnInit(
      async (layerGroupId: string, opacity: number): Promise<void> => {
        const clampedOpacity = clampOpacity(opacity)
        const { _layerGroups, layerGroupOpacities } = get()
        const _map = useMapInstanceStore.getState()._map

        if (layerGroupOpacities[layerGroupId] !== clampedOpacity) {
          set((state) => {
            state.layerGroupOpacities[layerGroupId] = clampedOpacity
          })
        }

        const layerGroup = _layerGroups[layerGroupId]
        if (!layerGroup || !_map) {
          return
        }

        for (const layer of Object.values(layerGroup.layers)) {
          if (layer.layerType !== 'raster') {
            continue
          }
          _map.setPaintProperty(layer.id, 'raster-opacity', clampedOpacity)
        }
      },
      { key: 'setLayerGroupOpacity' }
    ),

    setOverlayMessage: async (condition: boolean, message: OverlayMessage) => {
      set((state) => {
        state.overlayMessage = condition ? message : null
      })
    },

    fitBounds: helpers.queueableFnInit(
      async (params: {
        bbox: number[] | LngLatBounds
        options?: FitBoundsOptions
        autoRelocateOptions?: AutoRelocateOptions
      }): Promise<void> => {
        const { bbox, options, autoRelocateOptions } = params

        // Handle auto-relocate logic
        const shouldProceed = handleAutoRelocate(autoRelocateOptions)

        if (!shouldProceed) {
          return
        }

        const { duration = 2000, lonExtra = 0, latExtra = 0 } = options ?? {}
        const _map = useMapInstanceStore.getState()._map
        if (!_map) return // or await a similar waitFor(_map) if you want

        // Safely unwrap bbox
        let lonMax: number, lonMin: number, latMax: number, latMin: number
        if (bbox instanceof mapboxgl.LngLatBounds) {
          const sw = bbox.getSouthWest()
          const ne = bbox.getNorthEast()
          lonMax = ne.lng
          lonMin = sw.lng
          latMax = ne.lat
          latMin = sw.lat
        } else {
          ;[lonMax, lonMin, latMax, latMin] = bbox
        }

        const fitBoundsOptions: mapboxgl.FitBoundsOptions = { duration }

        // Only wait for mapDims if you want the offset that depends on it:
        let mapDims = useUIStore.getState().mapDims
        if (!mapDims || !mapDims.visible) {
          try {
            mapDims = await waitForMapDims(5000)
          } catch {
            // If it never comes, just proceed without offset.
          }
        }

        if (_map && mapDims?.visible) {
          const container = _map.getContainer() as HTMLElement

          fitBoundsOptions.padding = paddingFromVisibleViewport(
            container,
            mapDims.visible
          )
        }

        const expandedBounds = expandBoundsMercY(
          lonMin,
          lonMax,
          latMin,
          latMax,
          lonExtra,
          latExtra
        )

        _map.fitBounds(expandedBounds, fitBoundsOptions)
      },
      { key: 'fitBounds' }
    ),

    flyTo: helpers.queueableFnInit(
      async (params: {
        options: mapboxgl.FlyToOptions
        autoRelocateOptions?: AutoRelocateOptions
      }): Promise<void> => {
        const { options, autoRelocateOptions } = params

        // Handle auto-relocate logic
        const shouldProceed = handleAutoRelocate(autoRelocateOptions)

        if (!shouldProceed) {
          return
        }

        const _map = useMapInstanceStore.getState()._map

        const flyToOptions: mapboxgl.FlyToOptions = { ...options }

        let mapDims = useUIStore.getState().mapDims
        if (!mapDims || !mapDims.visible) {
          try {
            mapDims = await waitForMapDims(5000)
          } catch {
            // If it never comes, just proceed without offset.
          }
        }

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
      async (params: {
        options: mapboxgl.EaseToOptions
        autoRelocateOptions?: AutoRelocateOptions
      }): Promise<void> => {
        const { options, autoRelocateOptions } = params

        // Handle auto-relocate logic
        const shouldProceed = handleAutoRelocate(autoRelocateOptions)

        if (!shouldProceed) {
          return
        }

        const _map = useMapInstanceStore.getState()._map

        const easeToOptions: mapboxgl.EaseToOptions = { ...options }

        let mapDims = useUIStore.getState().mapDims
        if (!mapDims || !mapDims.visible) {
          try {
            mapDims = await waitForMapDims(5000)
          } catch {
            // If it never comes, just proceed without offset.
          }
        }

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
            {
              bbox: bounds,
              options: {
                duration: duration,
                latExtra: lonExtra,
                lonExtra: latExtra,
              },
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

    setIsAutoRelocateDisabled: (isDisabled: boolean) => {
      set((state) => {
        state.isAutoRelocateDisabled = isDisabled
      })
    },
  }

  return { ...vars, ...actions }
}
