import { useEffect, useRef } from 'react'
import { useMapStore } from '#/common/store/mapStore'
import { useVisibleLayerGroupIds } from './useVisibleLayerGroupIds'

// This hook toggles off layer groups upon mount, and on upon unmount, except for those specified in `excludedLayerGroupIds`.
// Useful for when a page needs to show specific layers.
export const useExclusiveLayerGroups = (
  excludedLayerGroupIds: string[] = []
) => {
  const disableLayerGroup = useMapStore((state) => state.disableLayerGroup)
  const enableLayerGroup = useMapStore((state) => state.enableLayerGroup)

  const visibleLayerGroupIds = useVisibleLayerGroupIds()
  const previouslyVisibleLayerGroupIds = useRef<string[]>([])

  useEffect(() => {
    const layersToDisable = visibleLayerGroupIds.filter(
      (id) => !excludedLayerGroupIds.includes(id)
    )
    previouslyVisibleLayerGroupIds.current = layersToDisable

    layersToDisable.forEach((id) => {
      disableLayerGroup(id)
    })

    return () => {
      const currentLayerGroups = useMapStore.getState()._layerGroups
      previouslyVisibleLayerGroupIds.current.forEach((id) => {
        if (currentLayerGroups[id]) {
          enableLayerGroup(id, {})
        }
      })
    }
  }, [])
}
