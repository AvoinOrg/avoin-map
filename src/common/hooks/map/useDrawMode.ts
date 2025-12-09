import { useMapStore } from '#/common/store/mapStore'
import { getActiveDrawInstance } from '#/common/store/mapStore/mapDrawSlice'
import { getDrawMode } from '#/common/utils/map'

export const useDrawMode = () => {
  const options = useMapStore((state) => state._drawOptions)

  if (options.isEnabled === false) {
    return null
  }

  const draw = getActiveDrawInstance()
  if (!draw) return null

  if (options.currentMode) return options.currentMode

  const MaplibreDrawMode = draw.getMode() as any

  return getDrawMode(MaplibreDrawMode)
}
