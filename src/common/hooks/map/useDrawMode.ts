import { useMapStore } from '#/common/store/mapStore'
import { getDrawMode } from '#/common/utils/map'
import MaplibreDraw from 'maplibre-gl-draw'

export const useDrawMode = () => {
  const options = useMapStore((state) => state._drawOptions)

  if (options.draw == null || options.isEnabled === false) {
    return null
  }

  const MaplibreDrawMode = options.draw.getMode() as MaplibreDraw.DrawMode

  return getDrawMode(MaplibreDrawMode)
}
