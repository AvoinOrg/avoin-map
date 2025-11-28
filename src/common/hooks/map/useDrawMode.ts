import { useMapStore } from '#/common/store/mapStore'
import { getDrawMode } from '#/common/utils/map'
import MapboxDraw from '@mapbox/mapbox-gl-draw'

export const useDrawMode = () => {
  const options = useMapStore((state) => state._drawOptions)

  if (options.draw == null || options.isEnabled === false) {
    return null
  }

  if (options.currentMode) {
    return options.currentMode
  }

  const MaplibreDrawMode = options.draw.getMode() as MapboxDraw.DrawMode

  return getDrawMode(MaplibreDrawMode)
}
