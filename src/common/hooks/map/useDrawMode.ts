import { useMapStore } from '#/common/store/mapStore'
import { getDrawMode } from '#/common/utils/map'

export const useDrawMode = () => {
  const options = useMapStore((state) => state._drawOptions)

  if (options.draw == null || options.isEnabled === false) {
    return null
  }

  if (options.currentMode) {
    return options.currentMode
  }

  const MaplibreDrawMode = options.draw.getMode() as any

  return getDrawMode(MaplibreDrawMode)
}
