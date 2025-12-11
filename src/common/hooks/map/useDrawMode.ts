import { useMapStore } from '#/common/store/mapStore'

export const useDrawMode = () => {
  const options = useMapStore((state) => state._drawOptions)

  if (options.isEnabled === false) {
    return null
  }

  if (options.currentMode) return options.currentMode

  return null
}
