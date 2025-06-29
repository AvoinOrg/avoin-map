import { useMapStore } from '#/common/store/mapStore'

export const useIsLayerGroupVisible = (layerGroupId: string) => {
  const isVisible = useMapStore((state) => {
    const layerGroup = state._layerGroups[layerGroupId]
    return layerGroup ? !layerGroup.isHidden : false
  })
  return isVisible
}
