import { useMapStore } from '#/common/store/mapStore'
import { DrawMode } from '#/common/types/map'

export const useAllowedDrawModes = () => {
  const options = useMapStore((state) => state._drawOptions)

  const drawModes: DrawMode[] = []

  if (options.polygonEnabled) {
    drawModes.push('polygon')
  }

  if (options.editEnabled) {
    drawModes.push('edit')
  }

  if (options.corridorEnabled) {
    drawModes.push('corridor')
  }

  return drawModes
}
