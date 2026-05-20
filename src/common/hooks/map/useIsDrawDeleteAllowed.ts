import { useMapStore } from '#/common/store/mapStore'

export const useIsDrawDeleteAllowed = () => {
  const options = useMapStore((state) => state._drawOptions)

  if (!options.isEnabled) {
    return false
  }

  if (!options.deleteOptions || !options.deleteOptions.enabled) {
    return false
  }

  if (options.currentMode == null && !options.deleteOptions.deleteOutsideDrawMode) {
    return false
  }

  return true
}
