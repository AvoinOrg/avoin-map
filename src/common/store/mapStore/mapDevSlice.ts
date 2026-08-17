// The map store is a zustand store that manages the map state.
// A lot of the logic is split between this file and the Map component.
// There are a also various helper hooks in src/common/hooks/map.

// TODO: Refactor the _map object to somewhere else. It does need to be in the store.

import { enableMapSet } from 'immer'

import { useMapInstanceStore } from './mapInstanceStore'
import { MapStateCreator, MapStoreHelpers } from './mapStore'
// import { commonDevtools } from './shared-devtools'

export type MapDevVars = {}

export type MapDevActions = {
  // Bounds of the source of a layer, e.g. the features in a geojson object
  _toggleSnapshotBox: () => void
  _toggleCoordinatePrint: () => void
  _takeSnapshot: (options: {
    center: [number, number]
    zoom: number
    bearing?: number
    pitch?: number
    filename?: string
  }) => Promise<string | null>
}

export type MapDevSlice = MapDevVars & MapDevActions

export const createMapDevSlice: (
  helpers: MapStoreHelpers
) => MapStateCreator<MapDevSlice> = (helpers) => (set, get) => {
  let snapshotBox: HTMLDivElement | null = null
  let coordPrintOverlay: HTMLDivElement | null = null
  let onMoveHandler: (() => void) | null = null

  const vars: MapDevVars = {}

  const actions: MapDevActions = {
    _toggleSnapshotBox: () => {
      const _map = useMapInstanceStore.getState()._map
      if (!_map) {
        console.error('Map instance not available.')
        return
      }
      const mapContainer = _map.getContainer()

      if (!snapshotBox) {
        const boxSize = 256
        snapshotBox = document.createElement('div')
        snapshotBox.style.position = 'absolute'
        snapshotBox.style.top = '50%'
        snapshotBox.style.left = '50%'
        snapshotBox.style.width = `${boxSize}px`
        snapshotBox.style.height = `${boxSize}px`
        snapshotBox.style.transform = 'translate(-50%, -50%)'
        snapshotBox.style.border = '2px dashed red'
        snapshotBox.style.boxSizing = 'border-box'
        snapshotBox.style.zIndex = '1000' // Ensure it's on top
        snapshotBox.style.pointerEvents = 'none' // Make it non-interactive
        mapContainer.appendChild(snapshotBox)
      } else {
        if (snapshotBox && mapContainer.contains(snapshotBox)) {
          mapContainer.removeChild(snapshotBox)
          snapshotBox = null
        }
      }
    },

    _toggleCoordinatePrint: () => {
      const _map = useMapInstanceStore.getState()._map
      if (!_map) {
        console.error('Map instance not available.')
        return
      }
      const mapContainer = _map.getContainer()

      if (coordPrintOverlay) {
        // If the overlay exists, turn it off
        if (onMoveHandler) {
          _map.off('move', onMoveHandler)
        }
        mapContainer.removeChild(coordPrintOverlay)
        coordPrintOverlay = null
        onMoveHandler = null
      } else {
        // If the overlay doesn't exist, create and turn it on
        coordPrintOverlay = document.createElement('div')
        coordPrintOverlay.style.position = 'absolute'
        coordPrintOverlay.style.bottom = '5rem'
        coordPrintOverlay.style.right = '10px'
        coordPrintOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
        coordPrintOverlay.style.color = 'white'
        coordPrintOverlay.style.padding = '5px 10px'
        coordPrintOverlay.style.borderRadius = '4px'
        coordPrintOverlay.style.fontFamily = 'monospace'
        coordPrintOverlay.style.fontSize = '12px'
        coordPrintOverlay.style.zIndex = '1000'
        coordPrintOverlay.style.pointerEvents = 'none'
        mapContainer.appendChild(coordPrintOverlay)

        onMoveHandler = () => {
          const center = _map.getCenter()
          const zoom = _map.getZoom()
          coordPrintOverlay!.innerHTML = `Lng: ${center.lng.toFixed(
            4
          )}, Lat: ${center.lat.toFixed(4)}, Zoom: ${zoom.toFixed(2)}`
        }

        _map.on('move', onMoveHandler)
        onMoveHandler() // Call once to set the initial value
      }
    },

    // snaps a 256x256 pixel snapshot of the map at the given center and zoom level
    _takeSnapshot: async (options: {
      center: [number, number]
      zoom: number
      bearing?: number
      pitch?: number
      filename?: string
    }): Promise<string | null> => {
      const _map = useMapInstanceStore.getState()._map
      const _toggleSnapshotBox = actions._toggleSnapshotBox

      if (!_map) {
        console.error('Map instance not available for snapshot.')
        return null
      }

      const boxSize = 256

      return new Promise((resolve) => {
        // Store original view to restore it later
        const originalView = {
          center: _map.getCenter(),
          zoom: _map.getZoom(),
          bearing: _map.getBearing(),
          pitch: _map.getPitch(),
        }

        // This 'idle' event ensures all tiles and assets are loaded before taking the picture
        _map.once('idle', () => {
          const wasSnapshotBoxVisible = !!snapshotBox

          if (snapshotBox) {
            _toggleSnapshotBox()
          }

          // Always capture as PNG to preserve the alpha channel
          const fullCanvas = _map.getCanvas()
          const fullDataURL = fullCanvas.toDataURL('image/png')

          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = boxSize
          tempCanvas.height = boxSize
          const ctx = tempCanvas.getContext('2d')

          if (!ctx) {
            _map.jumpTo(originalView)
            return resolve(null)
          }

          const img = new Image()
          img.onload = () => {
            // Calculate the top-left corner of the 256x256 box from the center
            const sx = fullCanvas.width / 2 - boxSize / 2
            const sy = fullCanvas.height / 2 - boxSize / 2

            // Draw the cropped 256x256 image onto the temporary canvas
            ctx.drawImage(img, sx, sy, boxSize, boxSize, 0, 0, boxSize, boxSize)

            const isJpg =
              options.filename?.endsWith('.jpg') ||
              options.filename?.endsWith('.jpeg')

            let finalDataURL: string

            if (isJpg) {
              // For JPG, we need to manually fill the background as it doesn't support transparency.
              const finalCanvas = document.createElement('canvas')
              finalCanvas.width = boxSize
              finalCanvas.height = boxSize
              const finalCtx = finalCanvas.getContext('2d')

              if (finalCtx) {
                // Fill the background with white
                finalCtx.fillStyle = 'white'
                finalCtx.fillRect(0, 0, boxSize, boxSize)
                // Draw the captured image on top of the white background
                finalCtx.drawImage(tempCanvas, 0, 0)
                finalDataURL = finalCanvas.toDataURL('image/jpeg')
              } else {
                // Fallback in case context is not available
                finalDataURL = tempCanvas.toDataURL('image/jpeg')
              }
            } else {
              // For PNG, we can use the data directly as it supports transparency
              finalDataURL = tempCanvas.toDataURL('image/png')
            }

            if (options.filename) {
              const link = document.createElement('a')
              link.href = finalDataURL
              link.download = options.filename
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }

            // Restore the original map view
            _map.jumpTo(originalView)

            if (wasSnapshotBoxVisible) {
              _toggleSnapshotBox()
            }

            resolve(finalDataURL)
          }
          img.onerror = () => {
            _map.jumpTo(originalView)
            resolve(null)
          }
          img.src = fullDataURL
        })

        // Set the map to the desired view for the snapshot
        _map.jumpTo({
          center: options.center,
          zoom: options.zoom,
          bearing: options.bearing ?? 0,
          pitch: options.pitch ?? 0,
        })
      })
    },
  }

  return { ...vars, ...actions }
}
