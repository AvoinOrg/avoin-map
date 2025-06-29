import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  LayerGroupStatus,
  useLayerGroup,
} from '#/common/hooks/map/useLayerGroup'

import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { adminFolayerQuery } from '../queries/adminFolayerQuery'
import { adminFolayerAreaQuery } from '../queries/adminFolayerAreaQuery'
import { getFolayerGroupId, createAdminFolayerConf } from '../utils'
import { AdminFolayerConf } from 'applets/luonnonmetsakartat/common/types'

export const useAdminFolayer = (
  folayerId: string,
  options: { preload?: boolean } = {}
): [LayerGroupStatus, (shouldBeEnabled: boolean) => void] => {
  const { preload = false } = options
  const adminFolayerConf = useAppletStore(
    (state) => state.adminFolayerConfs[folayerId]
  )
  const folayerAreaCollection = useAppletStore(
    (state) => state.folayerAreaCollections[folayerId]
  )

  const { refetch: folayerRefetch } = useQuery({
    ...adminFolayerQuery(folayerId),
    enabled: false,
  })

  const { refetch: areasRefetch } = useQuery({
    ...adminFolayerAreaQuery(folayerId),
    enabled: false,
  })

  const initActions = useCallback(async () => {
    const promises = []
    if (!adminFolayerConf) {
      promises.push(folayerRefetch())
    }
    if (!folayerAreaCollection) {
      promises.push(areasRefetch())
    }
    await Promise.all(promises)
  }, [adminFolayerConf, folayerAreaCollection, folayerRefetch, areasRefetch])

  const getLayerConf = useCallback(async () => {
    let conf: AdminFolayerConf | null | undefined = adminFolayerConf
    if (!conf) {
      const { data } = await folayerRefetch()
      conf = data
    }
    if (!conf) {
      throw new Error(`Could not load folayer config for ${folayerId}`)
    }
    return createAdminFolayerConf(conf.id, conf.colorCode)
  }, [folayerId, adminFolayerConf, folayerRefetch])

  const layerGroupId = getFolayerGroupId(folayerId)

  return useLayerGroup(layerGroupId, getLayerConf, {
    preload,
    initActions,
  })
}
