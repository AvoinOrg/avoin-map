import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'

import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { AdminLayerConf, LayerConfState } from '../types'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

// For getting all layers (if needed)
export const adminLayersQuery = (): UseQueryOptions<AdminLayerConf[]> => {
  const { data: session } = useSession()
  const addAdminLayerConf = useAppletStore.getState().addAdminLayerConf
  const updateAdminLayerConf = useAppletStore.getState().updateAdminLayerConf

  return {
    queryKey: ['adminLayers'],
    queryFn: async () => {
      const existingLayers = useAppletStore.getState().adminLayerConfs

      for (const layerId in existingLayers) {
        const layer = existingLayers[layerId]
        updateAdminLayerConf(layer.id, { state: LayerConfState.Fetching })
      }

      const response = await axios.get(`${API_URL}/layers`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (response.status === 200) {
        const layerConfs: AdminLayerConf[] = response.data.map(
          (layer: any) => ({
            id: layer.id,
            name: layer.name,
            description: layer.description || '',
            colorCode: response.data.color_code || '',
            isVisible: !layer.is_hidden,
            state: LayerConfState.Idle,
            createdTs: layer.created_ts * 1000,
            updatedTs: layer.updated_ts * 1000,
            unsyncedChanges: false,
          })
        )

        for (const layerConf of layerConfs) {
          const existingLayer =
            useAppletStore.getState().adminLayerConfs[layerConf.id]

          if (existingLayer) {
            updateAdminLayerConf(layerConf.id, layerConf)
          } else {
            addAdminLayerConf(layerConf)
          }
        }

        return layerConfs
      }

      return []
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  }
}
