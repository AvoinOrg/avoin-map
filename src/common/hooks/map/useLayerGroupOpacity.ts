import { useMapStore } from '#/common/store/mapStore'

export const useLayerGroupOpacity = (layerGroupId: string) => {
  return useMapStore((state) => state.layerGroupOpacities[layerGroupId])
}
