import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useMapStore } from '#/common/store/mapStore'
import { useDoesLayerGroupExist } from '#/common/hooks/map/useDoesLayerGroupExist'
import { useIsLayerGroupVisible } from '#/common/hooks/map/useIsLayerGroupVisible'
import { LayerConf } from '#/common/types/map'

export type LayerGroupStatus = 'visible' | 'processing' | 'hidden'

// Why all the complexity: The current implemetation allows for turning the layer group on and
// off, even while being preloaded.

export const useLayerGroup = (
  layerGroupId: string,
  layerConf: LayerConf | (() => Promise<LayerConf>),
  options: {
    preload?: boolean
    initActions?: () => Promise<void>
  } = {}
): [LayerGroupStatus, (shouldBeEnabled: boolean) => void] => {
  const { preload = false, initActions } = options
  const addLayerGroup = useMapStore((state) => state.addLayerGroup)
  const enableLayerGroup = useMapStore((state) => state.enableLayerGroup)
  const disableLayerGroup = useMapStore((state) => state.disableLayerGroup)

  const doesLayerGroupExist = useDoesLayerGroupExist(layerGroupId)
  const isLayerGroupVisible = useIsLayerGroupVisible(layerGroupId)

  const isUpdating = useRef(false)
  const initCompleted = useRef(false)
  const enableQueued = useRef(false)
  const layerConfRef = useRef<LayerConf | null>(null)

  const [uiQueued, setUiQueued] = useState(false)

  const resolveLayerConf = useCallback(async () => {
    if (layerConfRef.current) {
      return layerConfRef.current
    }
    let conf: LayerConf

    if (typeof layerConf === 'function') {
      conf = await layerConf()
    } else {
      conf = layerConf
    }
    layerConfRef.current = conf
    return conf
  }, [layerConf])

  const runInitActions = useCallback(async () => {
    if (initActions && !initCompleted.current) {
      await initActions()
      initCompleted.current = true
    }
  }, [initActions])

  const layerGroupStatus: LayerGroupStatus = useMemo(() => {
    if (isLayerGroupVisible) {
      return 'visible'
    }
    if (uiQueued) {
      return 'processing'
    }
    return 'hidden'
  }, [layerGroupId, isLayerGroupVisible, uiQueued])

  // Effect for preloading

  const setEnabled = useCallback(
    async (shouldBeEnabled: boolean) => {
      if (isUpdating.current) {
        enableQueued.current = shouldBeEnabled
        setUiQueued(shouldBeEnabled)
        return
      }
      isUpdating.current = true

      try {
        if (shouldBeEnabled) {
          await runInitActions()

          const group = useMapStore.getState()._layerGroups[layerGroupId]

          if (group) {
            if (group.isHidden) {
              await enableLayerGroup(layerGroupId, {})
            }
          } else {
            const conf = await resolveLayerConf()
            await addLayerGroup(layerGroupId, {
              layerConf: conf,
            })
          }
        } else {
          const group = useMapStore.getState()._layerGroups[layerGroupId]

          if (group && !group.isHidden) {
            await disableLayerGroup(layerGroupId)
          }
        }
      } catch (error) {
        console.error(
          `Failed to set enabled state for layer group ${layerGroupId}`,
          error
        )
      } finally {
        isUpdating.current = false
        setUiQueued(false)
        enableQueued.current = false
      }
    },
    [
      runInitActions,
      resolveLayerConf,
      addLayerGroup,
      enableLayerGroup,
      disableLayerGroup,
      layerGroupId,
    ]
  )

  useEffect(() => {
    if (!preload || doesLayerGroupExist) {
      return
    }

    const preloadLayer = async () => {
      if (isUpdating.current) return
      isUpdating.current = true

      try {
        await runInitActions()
        const conf = await resolveLayerConf()

        // Check again inside async function in case initActions added the layer
        if (!useMapStore.getState()._layerGroups[layerGroupId]) {
          await addLayerGroup(layerGroupId, {
            layerConf: conf,
            isHidden: true,
          })
        }
      } catch (error) {
        console.error(`Failed to preload layer group ${layerGroupId}`, error)
      } finally {
        isUpdating.current = false
        if (enableQueued.current) {
          enableQueued.current = false
          setEnabled(true)
        }
      }
    }

    preloadLayer()
  }, [
    preload,
    doesLayerGroupExist,
    runInitActions,
    resolveLayerConf,
    addLayerGroup,
    layerGroupId,
  ])

  return [layerGroupStatus, setEnabled]
}
