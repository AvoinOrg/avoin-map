import 'maplibre-gl/dist/maplibre-gl.css'

import React, { useEffect, useRef, useState } from 'react'
import {
  AttributionControl,
  Map,
  MapLayerMouseEvent,
  StyleSpecification,
} from 'maplibre-gl'

import { useAuthSession } from '#/common/auth'
import { useMapStore, useUIStore } from '#/common/store'
import { useMapInstanceStore } from '#/common/store/mapStore/mapInstanceStore'
import { Box } from '#/common/style/theme/system'
import { MapActionsWrapper } from './MapActionsWrapper'
import MapBottomControls from './MapBottomControls'
import { MapPopupHandler } from './MapPopupHandler'
import { OverlayMessages } from './OverlayMessages'
import { createMapTransformRequest } from './mapAuthTransformRequest'

const SERVER_URL = process.env.PUBLIC_GEOSERVER_URL

const DEFAULT_CENTER = [15, 62] as [number, number]
const DEFAULT_ZOOM = 5

interface Props {
  children?: React.ReactNode
}

export const MapHandler = ({ children }: Props) => {
  const { data: session } = useAuthSession()
  const accessToken = session?.accessToken
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const sidebarWidth = useUIStore((state) => state.sidebarWidth)
  const windowSize = useUIStore((state) => state.windowSize)

  const mapDivRef = useRef<HTMLDivElement | null>(null)

  const _map = useMapInstanceStore((state) => state._map)
  const _setMap = useMapInstanceStore((state) => state._setMap)
  const isLoaded = useMapStore((state) => state.isLoaded)
  const _setIsLoaded = useMapStore((state) => state._setIsLoaded)
  const _isMapReady = useMapStore((state) => state._isMapReady)
  const _isHydrated = useMapStore((state) => state._isHydrated)
  const _setIsMapReady = useMapStore((state) => state._setIsMapReady)
  const _functionQueue = useMapStore((state) => state._functionQueue)
  const _executeFunctionQueue = useMapStore(
    (state) => state._executeFunctionQueue
  )
  const setMapAttributionHtml = useMapStore(
    (state) => state.setMapAttributionHtml
  )
  const mapContext = useMapStore((state) => state.mapContext)
  const _addStaleSourceId = useMapStore((state) => state._addStaleSourceId)
  const _refreshStaleSources = useMapStore(
    (state) => state._refreshStaleSources
  )

  const overlayMessage = useMapStore((state) => state.overlayMessage)
  const setSelectedFeaturesByClick = useMapStore(
    (state) => state.setSelectedFeaturesByClick
  )
  const _isFunctionQueueExecuting = useMapStore(
    (state) => state._isFunctionQueueExecuting
  )

  const [isMapLibreReady, setIsMapLibreReady] = useState(false)

  const initMap = (viewSettings: {
    center: [number, number]
    zoom?: number
  }) => {
    const style: StyleSpecification = {
      version: 8,
      glyphs: `${SERVER_URL}/www/font/{fontstack}/{range}.pbf`,
      sources: {},
      layers: [],
    }

    const newMap = new Map({
      container: 'map',
      style,
      center: viewSettings.center,
      zoom: viewSettings.zoom,
      attributionControl: false,
      transformRequest: createMapTransformRequest({
        accessToken,
        addStaleSourceId: _addStaleSourceId,
      }),
    })

    newMap.addControl(
      new AttributionControl({
        compact: false,
        customAttribution:
          'Avoin Map hosted on <a href="https://www.netlify.com/" target="_blank">Netlify</a>',
      }),
      'bottom-left'
    )

    if (_map && _map.getStyle()) {
      const sources = _map.getStyle().sources
      for (const key in sources) {
        newMap.addSource(key, sources[key])
      }
      for (const layer of _map.getStyle().layers) {
        newMap.addLayer(layer)
      }
      _map.remove()
    }

    const selectionFunction = (event: MapLayerMouseEvent) => {
      const point = newMap.project(event.lngLat)
      const features = newMap.queryRenderedFeatures(point)
      setSelectedFeaturesByClick(features)
    }

    newMap.on('click', selectionFunction)

    newMap.on('load', () => {
      const syncAttributionHtml = () => {
        const attributionContainer = newMap
          .getContainer()
          .querySelector('.maplibregl-ctrl-attrib') as HTMLElement | null

        if (!attributionContainer) {
          setMapAttributionHtml('')
          return
        }

        attributionContainer.style.display = 'none'
        attributionContainer.setAttribute('aria-hidden', 'true')

        const attributionInner = attributionContainer.querySelector(
          '.maplibregl-ctrl-attrib-inner'
        ) as HTMLElement | null

        if (!attributionInner) {
          setMapAttributionHtml('')
          return
        }

        attributionInner
          .querySelectorAll<HTMLAnchorElement>('a')
          .forEach((a) => {
            a.setAttribute('target', '_blank')
            const rel = (a.getAttribute('rel') ?? '')
              .split(/\s+/)
              .filter(Boolean)
            const needed = ['noopener', 'noreferrer']
            a.setAttribute(
              'rel',
              Array.from(new Set([...rel, ...needed])).join(' ')
            )
          })

        setMapAttributionHtml(attributionInner.innerHTML.trim())
      }

      const scheduleAttributionSync = () => {
        requestAnimationFrame(syncAttributionHtml)
      }

      syncAttributionHtml()
      scheduleAttributionSync()

      newMap.on('styledata', scheduleAttributionSync)
      newMap.on('sourcedata', scheduleAttributionSync)
      newMap.on('idle', scheduleAttributionSync)

      newMap.once('remove', () => {
        newMap.off('styledata', scheduleAttributionSync)
        newMap.off('sourcedata', scheduleAttributionSync)
        newMap.off('idle', scheduleAttributionSync)
        setMapAttributionHtml('')
      })

      newMap.on('error', (event) => {
        if (event.error && event.error.status === 404) {
          return
        }

        if (event.error && typeof event.error.status === 'number') {
          if ('sourceId' in event) {
            _addStaleSourceId(event.sourceId as string)
          }
        }
      })

      setIsMapLibreReady(true)
    })

    return newMap
  }

  useEffect(() => {
    const newMap = initMap({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
    _setMap(newMap)

    return () => {
      newMap.remove()
    }
  }, [])

  useEffect(() => {
    if (_map) {
      _map.setTransformRequest(
        createMapTransformRequest({
          accessToken,
          addStaleSourceId: _addStaleSourceId,
        })
      )

      _refreshStaleSources()
    }
  }, [_map, accessToken, _addStaleSourceId, _refreshStaleSources])

  useEffect(() => {
    if (!isLoaded && isMapLibreReady && mapContext != null) {
      _setIsMapReady(true)
    }
  }, [isLoaded, isMapLibreReady, mapContext, _setIsMapReady])

  useEffect(() => {
    if (_isMapReady && !_isFunctionQueueExecuting && !isLoaded && _isHydrated) {
      _executeFunctionQueue(() => _setIsLoaded(true))
    }
  }, [
    _isMapReady,
    _isHydrated,
    _functionQueue,
    _isFunctionQueueExecuting,
    isLoaded,
  ])

  useEffect(() => {
    if (isLoaded) {
      const frameId = window.requestAnimationFrame(() => {
        _map?.resize()
      })

      return () => {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [
    isSidebarOpen,
    isLoaded,
    sidebarWidth,
    windowSize?.height,
    windowSize?.width,
  ])

  return (
    <>
      <Box
        ref={mapDivRef}
        id="map"
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          overflow: 'hidden',
        }}
      ></Box>
      <OverlayMessages message={overlayMessage}></OverlayMessages>
      <MapActionsWrapper></MapActionsWrapper>
      <MapBottomControls />
      <MapPopupHandler></MapPopupHandler>
      {children}
    </>
  )
}
