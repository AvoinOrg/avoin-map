// This is the main Map component. Most of the logic, however, is in the mapStore.
// There is some leftover code from the OpenLayers implementation, but it is not used at the moment.
// There is code for the hybrid implementation, where maplibre map is rendered on top of
// OpenLayers. There is no need for this at the moment, but it is kept for future reference,
// in case a need arises.
'use client'

// import 'ol/ol.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import 'maplibre-gl-draw/dist/mapbox-gl-draw.css'

import React, { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
// import { Map as OlMap, View, MapBrowserEvent } from 'ol'
// import * as proj from 'ol/proj'
// import { Layer, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
// import Overlay from 'ol/Overlay'
// import OSM from 'ol/source/OSM'
// import VectorSource from 'ol/source/Vector'
// import { Attribution, ScaleLine, defaults as defaultControls } from 'ol/control'
import {
  Map,
  MapLayerMouseEvent,
  StyleSpecification,
  MapGeoJSONFeature,
  AttributionControl,
} from 'maplibre-gl'
// import GeoJSON from 'ol/format/GeoJSON'
import { useUIStore } from '../../common/store'
import { useMapStore } from '../../common/store'

import { MapLibraryMode, PopupOpts } from '#/common/types/map'
import { OverlayMessages } from './OverlayMessages'
import { MapButtons } from './MapButtons'

interface Props {
  children?: React.ReactNode
}

const DEFAULT_CENTER = [15, 62] as [number, number]
const DEFAULT_ZOOM = 5

export const MapHandler = ({ children }: Props) => {
  // const setIsMapPopupOpen = useUIStore((state) => state.setIsMapPopupOpen)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)

  const mapDivRef = useRef<HTMLDivElement>()
  // const mapRef = useRef<OlMap | null>(null)
  const mapLibraryRef = useRef<MapLibraryMode | null>(null)

  const _map = useMapStore((state) => state._map)
  const _setMap = useMapStore((state) => state._setMap)
  const mapLibraryMode = useMapStore((state) => state.mapLibraryMode)
  const isLoaded = useMapStore((state) => state.isLoaded)
  const _setIsLoaded = useMapStore((state) => state._setIsLoaded)
  const _isMapReady = useMapStore((state) => state._isMapReady)
  const _isHydrated = useMapStore((state) => state._isHydrated)
  const _setIsMapReady = useMapStore((state) => state._setIsMapReady)
  const _functionQueue = useMapStore((state) => state._functionQueue)
  const _executeFunctionQueue = useMapStore(
    (state) => state._executeFunctionQueue
  )
  const mapContext = useMapStore((state) => state.mapContext)

  const overlayMessage = useMapStore((state) => state.overlayMessage)
  const setSelectedFeaturesByClick = useMapStore(
    (state) => state.setSelectedFeaturesByClick
  )
  const _isFunctionQueueExecuting = useMapStore(
    (state) => state._isFunctionQueueExecuting
  )

  // const visibleLayerGroups = useVisibleLayerGroups()
  // const visibleLayerGroupIds = useVisibleLayerGroupIds()

  // const [isOlMapReady, setIsOlMapReady] = useState(false)
  const [isMbMapReady, setIsMbMapReady] = useState(false)
  // const [draw, setDraw] = useState<MaplibreDraw>()
  // const [isDrawEnabled, setIsDrawEnabled] = useState(false)

  const popupRef = useRef<HTMLDivElement>(null)
  // const [popups, setPopups] = useState<any>({})
  // const [popupOnClose, setPopupOnClose] = useState<any>(null)
  // const [popupKey, setPopupKey] = useState<any>(null)
  // const [popupOpts, setPopupOpts] = useState<PopupOpts | null>(null)

  // The following functions are used to initialize the map,
  // depending on the map's mode (Openlayers, Mapbox GL, or hybrid of both)
  const initMap = (
    viewSettings: { center: [number, number]; zoom?: number },
    isHybrid = true
  ) => {
    let newMap: Map

    if (isHybrid) {
      const emptyStyle: StyleSpecification = {
        version: 8,
        name: 'empty',
        metadata: {
          'maplibre:autocomposite': true,
          'maplibre:type': 'template',
        },
        // glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': 'rgba(0,0,0,0)',
            },
          },
        ],
      }

      newMap = new Map({
        attributionControl: false,
        boxZoom: false,
        center: viewSettings.center,
        container: 'map',
        doubleClickZoom: false,
        dragPan: false,
        dragRotate: false,
        interactive: true,
        keyboard: false,
        pitchWithRotate: false,
        scrollZoom: false,
        touchZoomRotate: false,
        style: emptyStyle,
      })
    } else {
      const style: StyleSpecification = {
        version: 8,
        // glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution:
              '© <a target="_top" rel="noopener" href="https://openstreetmap.org/">OpenStreetMap</a>, under the <a target="_top" rel="noopener" href="https://operations.osmfoundation.org/policies/tiles/">tile usage policy</a>.',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      }

      newMap = new Map({
        //@ts-ignore
        container: 'map', // container id
        style: style,
        center: viewSettings.center, // starting position [lng, lat]
        zoom: viewSettings.zoom, // starting zoom
        attributionControl: false,
        // transformRequest: (url) => {
        //   return {
        //     url: url,
        //     headers: { "Accept-Encoding": "gzip" },
        //   };
        // },
      })

      newMap.addControl(
        new AttributionControl({
          compact: true,
        })
      )
    }

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

    const mbSelectionFunction = (e: MapLayerMouseEvent) => {
      // Set `bbox` as 5px reactangle area around clicked point.
      // Find features intersecting the bounding box.
      // @ts-ignore
      const point = newMap.project(e.lngLat)

      const features = newMap.queryRenderedFeatures(point)
      // hasProcessedFeatureSelection.current = false
      setSelectedFeaturesByClick(features)
    }

    newMap.on('click', mbSelectionFunction)

    newMap.on('load', () => {
      // const createPinElement = (feature, options = {}) => {
      // Default pin styling
      //   const defaultStyle = {
      //     size: 24,
      //     fill: '#4285f4',
      //     fillOpacity: 0.8,
      //     strokeColor: 'black',
      //     strokeOpacity: 1,
      //     strokeWidth: 1.5,
      //     selected: false,
      //   }

      //   // Merge defaults with provided options
      //   const style = { ...defaultStyle, ...options }

      //   // Check if feature is selected
      //   const isSelected =
      //     feature && feature.state && feature.state.selected === true

      //   // Adjust styling based on selection state
      //   if (isSelected || style.selected) {
      //     style.fill = '#ff6b6b' // Selected pin color
      //     style.fillOpacity = 0.9
      //     style.strokeWidth = 2
      //   }

      //   // Create the pin element
      //   const pinElement = document.createElement('div')
      //   pinElement.innerHTML = `
      //     <svg xmlns="http://www.w3.org/2000/svg"
      //       width="${style.size}"
      //       height="${style.size}"
      //       viewBox="0 0 24 24"
      //       fill="${style.fill}"
      //       fill-opacity="${style.fillOpacity}"
      //       stroke="${style.strokeColor}"
      //       stroke-opacity="${style.strokeOpacity}"
      //       stroke-width="${style.strokeWidth}"
      //       stroke-linecap="round"
      //       stroke-linejoin="round"
      //       class="mapbox-pin-icon">
      //       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      //       <circle cx="12" cy="10" r="3"></circle>
      //     </svg>`

      //   return pinElement
      // }

      // // Add the pin generator to the map for use in other components
      // newMap.createPinElement = createPinElement

      // // Generate a basic pin for initial loading
      // const basicPin = createPinElement(null, { size: 24 })

      // // Create a canvas element to render the SVG
      // const canvas = document.createElement('canvas')
      // const size = 24
      // canvas.width = size
      // canvas.height = size
      // const ctx = canvas.getContext('2d')

      // // Convert SVG to an image that can be used by Mapbox
      // const img = new Image()
      // img.onload = () => {
      //   ctx.drawImage(img, 0, 0, size, size)
      //   // Add the rendered image to the map
      //   if (!newMap.hasImage('pin')) {
      //     newMap.addImage('pin', ctx.getImageData(0, 0, size, size))
      //   }
      // }
      // img.src = 'data:image/svg+xml,' + encodeURIComponent(basicPin.innerHTML)

      // Create a canvas element to render the SVG
      // const canvas = document.createElement('canvas')
      // const size = 24 // Match SVG width/height
      // canvas.width = size
      // canvas.height = size
      // const ctx = canvas.getContext('2d')

      // // Convert the white SVG to an image
      // const img = new Image()
      // img.onload = () => {
      //   if (!ctx) return // Type guard for context
      //   ctx.clearRect(0, 0, size, size) // Ensure canvas is clear
      //   ctx.drawImage(img, 0, 0, size, size)
      //   const imageData = ctx.getImageData(0, 0, size, size)

      //   if (!newMap.hasImage('pin')) {
      //     newMap.addImage('pin', imageData)
      //   }
      //   // Now the 'pin' image can be colored using 'icon-color' in your style layers
      // }
      // img.onerror = (err) => {
      //   console.error('Error loading SVG for pin icon:', err)
      // }
      // // Use the white SVG string for the image source
      // img.src =
      //   'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(pinSvgString)

      setIsMbMapReady(true)
    })

    return newMap
  }

  // const getHybridMbLayer = (newMap: Map) => {
  //   const mbLayer = new Layer({
  //     render: function (frameState) {
  //       const canvas: any = newMap.getCanvas()
  //       const viewState = frameState.viewState

  //       const visible = mbLayer.getVisible()
  //       canvas.style.display = visible ? 'block' : 'none'
  //       canvas.style.position = 'absolute'

  //       const opacity = mbLayer.getOpacity()
  //       canvas.style.opacity = opacity

  //       // adjust view parameters in mapbox
  //       const rotation = viewState.rotation
  //       newMap.jumpTo({
  //         center: proj.toLonLat(viewState.center) as [number, number],
  //         zoom: viewState.zoom - 1,
  //         bearing: (-rotation * 180) / Math.PI,
  //       })

  //       // cancel the scheduled update & trigger synchronous redraw
  //       // see https://github.com/mapbox/mapbox-gl-js/issues/7893#issue-408992184
  //       // NOTE: THIS MIGHT BREAK IF UPDATING THE MAPBOX VERSION
  //       //@ts-ignore
  //       if (newMap._frame) {
  //         //@ts-ignore
  //         newMap._frame.cancel()
  //         //@ts-ignore
  //         newMap._frame = null
  //       } //@ts-ignore
  //       newMap._render()

  //       return canvas
  //     },
  //   })

  //   return mbLayer
  // }

  // const initHybridMap = (viewSettings: {
  //   center: [number, number]
  //   zoom?: number
  // }) => {
  //   const newMap = initMap(viewSettings, true)
  //   const mbLayer = getHybridMbLayer(newMap)

  //   const attribution = new Attribution({
  //     collapsible: false,
  //   })

  //   const options = {
  //     renderer: 'webgl',
  //     target: 'map',
  //     view: new View({
  //       zoom: viewSettings.zoom,
  //       center: proj.fromLonLat(viewSettings.center),
  //     }),
  //     layers: [
  //       new TileLayer({
  //         source: new OSM(),
  //       }),
  //       new VectorLayer({
  //         source: new VectorSource({
  //           attributions:
  //             '© Powered by <a href="https://www.netlify.com/" target="_blank">Netlify</a>',
  //         }),
  //       }),
  //       mbLayer,
  //     ],
  //     controls: defaultControls({ attribution: false }).extend([
  //       attribution,
  //       new ScaleLine(),
  //     ]),
  //   }
  //   const newOlMap = new OlMap(options)

  //   newOlMap.once('rendercomplete', () => {
  //     newOlMap.setTarget(mapDivRef.current)

  //     const overlay = new Overlay({
  //       element: popupRef.current as HTMLElement,
  //       autoPan: true,
  //       // autoPanAnimation: {
  //       //   duration: 250,
  //       // },
  //     })

  //     const onclick = () => {
  //       overlay.setPosition(undefined)
  //       return false
  //     }

  //     setPopupOnClose(() => onclick)

  //     newOlMap.addOverlay(overlay)

  //     _setIsMapReady(true)
  //   })

  //   return { newOlMap, newMap }
  // }

  const initMapMode = (
    mode: MapLibraryMode,
    viewSettings: { center: [number, number]; zoom?: number }
  ) => {
    switch (mode) {
      case 'maplibre': {
        let newMap = initMap(viewSettings, false)
        _setMap(newMap)

        mapLibraryRef.current = 'maplibre'

        return () => {
          newMap.remove()
          mapLibraryRef.current = null
        }
      }
      // case 'hybrid': {
      //   let { newOlMap, newMap } = initHybridMap(viewSettings)
      //   mapRef.current = newOlMap
      //   _setMap(newMap)

      //   mapLibraryRef.current = 'hybrid'

      //   return () => {
      //     newOlMap.setTarget(undefined)
      //     newMap.remove()
      //     mapLibraryRef.current = null
      //   }
      // }
    }
  }

  // handles the initialization of map, using the above functions.
  useEffect(() => {
    let center = DEFAULT_CENTER
    let zoom = DEFAULT_ZOOM

    if (!mapLibraryRef.current) {
      return initMapMode(mapLibraryMode, { center, zoom })
    } else if (mapLibraryRef.current !== mapLibraryMode) {
      _setIsMapReady(false)

      if (mapLibraryRef.current === 'maplibre') {
        const mbCenter = _map?.getCenter()
        if (mbCenter != null) {
          center = [mbCenter.lng, mbCenter.lat]
        }

        const mbZoom = _map?.getZoom()
        if (mbZoom != null) {
          zoom = mbZoom
        }
      }
      // else {
      //   const olCenter = mapRef.current?.getView().getCenter()
      //   if (olCenter != null) {
      //     center = proj.toLonLat(olCenter) as [number, number]
      //   }
      //   const olZoom = mapRef.current?.getView().getZoom()
      //   if (olZoom != null) {
      //     zoom = olZoom
      //   }
      // }

      return initMapMode(mapLibraryMode, { center, zoom })
    }
  }, [mapLibraryMode])

  // This effect runs only when OpenLayers is used
  // It refreshes the set of popup functions whenever
  // layerGroups get hidden or shown
  // useEffect(() => {
  //   if (isOlMapReady) {
  //     if (mapLibraryRef.current !== 'maplibre') {
  //       // remove the old callback and create a new one each time state is updated
  //       unByKey(popupKey)

  //       const newPopupFunc = (evt: MapBrowserEvent<any>) => {
  //         let point = mapRef.current?.getCoordinateFromPixel(evt.pixel)

  //         if (point != undefined) {
  //           point = proj.toLonLat(point)
  //           _map?.fire('click', {
  //             lngLat: point as mapboxgl.LngLatLike,
  //           })
  //         }

  //         let featureObjs: any[] = []

  //         mapRef.current?.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
  //           featureObjs.push({ feature, layer })
  //         })

  //         if (featureObjs.length > 0) {
  //           featureObjs = featureObjs.sort((a: any, b: any) => {
  //             const aZ = a.layer.getZIndex()
  //             const bZ = b.layer.getZIndex()

  //             if (aZ > bZ) {
  //               return -1
  //             } else if (bZ > aZ) {
  //               return 1
  //             } else {
  //               return 0
  //             }
  //           })

  //           const featureGroup = featureObjs[0].layer.get('group')
  //           const features = featureObjs.map((f) => {
  //             if (f.layer.get('group') === featureGroup) {
  //               return f.feature
  //             }
  //           })

  //           const Popup = popups[featureGroup]
  //           if (Popup != null) {
  //             const popupOpts: PopupOpts = {
  //               features,
  //               PopupElement: Popup,
  //             }

  //             setPopupOpts(popupOpts)
  //             setIsMapPopupOpen(true)
  //           }

  //           // console.log(features)
  //           // for (const i in activeLayers) {
  //           //   console.log(layers[activeLayers[i]].getSource)
  //           //   if (layers[activeLayers[i]].hasFeature(features[0])) {
  //           //     console.log("asdfasdf")
  //           //   }
  //           // }
  //           // map.forEachLayerAtPixel(evt.pixel, function (layer: any) {})
  //         }
  //       }
  //       const newpopupKey = mapRef.current?.on('singleclick', newPopupFunc)

  //       setPopupKey(newpopupKey)
  //     } else {
  //     }
  //   }
  // }, [visibleLayerGroupIds, mapLibraryMode, isLoaded, popups])

  // This effect filters the selected features to those,
  // that are from selectable layers. Also applies styling
  // to the layers, so that the features are visually selected.
  // useEffect(() => {
  //   if (isLoaded && !hasProcessedFeatureSelection.current) {
  //     hasProcessedFeatureSelection.current = true

  //     if (newlySelectedFeatures.length === 0) {
  //       return
  //     } else {
  //       setNewlySelectedFeatures([])
  //     }

  //     const filterSelectedFeatures = (
  //       layerOptionsObj: LayerOptionsObj,
  //       activeLayerIds: string[],
  //       selectedFeatures: MapGeoJSONFeature[],
  //       newlySelectedFeatures: MapGeoJSONFeature[],
  //       layerGroups: LayerGroups
  //     ) => {
  //       const selectableLayers = Object.keys(
  //         pickBy(layerOptionsObj, (value: LayerOptions, _key: string) => {
  //           return value.selectable
  //         })
  //       )

  //       // remove features from unselectable layers
  //       let filteredFeatures = newlySelectedFeatures.filter(
  //         (f) =>
  //           selectableLayers.includes(f.layer.id) &&
  //           activeLayerIds.includes(f.layer.id)
  //       )

  //       // Remove duplicates. Not sure why there are any.
  //       filteredFeatures = uniqBy(filteredFeatures, 'id')

  //       if (
  //         _drawOptions != null &&
  //         _drawOptions.isEnabled &&
  //         _drawOptions.draw != null &&
  //         _drawOptions.layerGroupId != null
  //       ) {
  //         const drawLayerGroupId = _drawOptions.layerGroupId
  //         filteredFeatures = filteredFeatures.filter(
  //           (f) =>
  //             getLayerGroupIdForLayer(f.layer.id, layerGroups) !==
  //             drawLayerGroupId
  //         )
  //       }

  //       // remove reatures without an id and log an error
  //       filteredFeatures = filteredFeatures.filter((f) => {
  //         if (f.id == null) {
  //           console.error(
  //             'Feature without id on layer "',
  //             f.layer.id,
  //             '". Check that the source style has either "generateId" or "promoteId" set.'
  //           )
  //           return false
  //         }
  //         return true
  //       })

  //       let selectedFeaturesCopy = [...selectedFeatures]

  //       // go through filtered features and compare them to previously selected features
  //       for (const feature of filteredFeatures) {
  //         const layerId = feature.layer.id

  //         // if the feature is already selected, unselect
  //         if (selectedFeaturesCopy.find((f) => f.id === feature.id)) {
  //           selectedFeaturesCopy = selectedFeaturesCopy.filter(
  //             (f) => f.id !== feature.id
  //           )
  //           continue
  //         }

  //         // if the layer is not multi-selectable, unselect all other features from that layer
  //         if (!layerOptionsObj[layerId].multiSelectable) {
  //           selectedFeaturesCopy = selectedFeaturesCopy.filter(
  //             (f) => f.layer.id !== feature.layer.id
  //           )
  //         }

  //         selectedFeaturesCopy.push(feature)
  //       }

  //       return selectedFeaturesCopy
  //     }

  //     const layerOptionsObj = getAllLayerOptionsObj(_layerGroups)

  //     let activeLayerIds: string[] = []
  //     for (const layerGroupId of Object.keys(visibleLayerGroups)) {
  //       const layerGroup = visibleLayerGroups[layerGroupId]
  //       activeLayerIds = [...activeLayerIds, ...Object.keys(layerGroup.layers)]
  //     }

  //     const filteredSelectedFeatures = filterSelectedFeatures(
  //       layerOptionsObj,
  //       activeLayerIds,
  //       selectedFeatures,
  //       newlySelectedFeatures,
  //       _layerGroups
  //     )

  //     // TODO: "selectedFeaturesCopy" is calculated twice for each update, which
  //     // is not great. However, this allows direct manipulation of
  //     // "selectedFeatures" from other components. Make smarter later.
  //     setSelectedFeatures(filteredSelectedFeatures)
  //   }
  // }, [
  //   newlySelectedFeatures,
  //   selectedFeatures,
  //   isLoaded,
  //   visibleLayerGroups,
  //   _layerGroups,
  // ])

  useEffect(() => {
    if (!isLoaded && mapContext != null) {
      switch (mapLibraryMode) {
        case 'maplibre': {
          if (isMbMapReady) {
            _setIsMapReady(true)
          }
        }
        // case 'hybrid': {
        //   if (isMbMapReady && isHandlerReady) {
        //     _setIsMapReady(true)
        //   }
        // }
      }
    }
  }, [isLoaded, isMbMapReady, mapLibraryMode, mapContext])

  useEffect(() => {
    // Run queued functions once map has loaded
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
      _map?.resize()
    }
  }, [isSidebarOpen, isLoaded])

  return (
    <>
      {/* <Box
        ref={mapDivRef}
        id="map"
        className="ol-map"
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
        }}
      ></Box> */}
      <Box
        ref={mapDivRef}
        id="map"
        // className={'ol-map'}
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          overflow: 'hidden',
          // ...(mapLibraryMode === 'hybrid' && {
          //   '.ol-scale-line': { right: '8px', left: 'auto', bottom: '26px' },
          // }),
          // pointerEvents: 'none',
          // '> *': {
          //   pointerEvents: 'auto',
          // },
        }}
      ></Box>
      <OverlayMessages message={overlayMessage}></OverlayMessages>
      <MapButtons></MapButtons>
      {children}
    </>
  )
}
