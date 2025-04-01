import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { AdminLayerConf, LayerConfState } from '../types'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

export const adminLayerQuery = (
  layerId: string
): UseQueryOptions<AdminLayerConf | null> => {
  const { data: session } = useSession()
  const updateAdminLayerConf = useAppletStore.getState().updateAdminLayerConf
  const addAdminLayerConf = useAppletStore.getState().addAdminLayerConf

  return {
    queryKey: ['adminLayer', layerId],
    queryFn: async () => {
      const existingLayerConf =
        useAppletStore.getState().adminLayerConfs[layerId]

      if (existingLayerConf) {
        if (existingLayerConf.state !== LayerConfState.Idle) {
          return null
        }
        updateAdminLayerConf(layerId, { state: LayerConfState.Fetching })
      }
      // Get layer data from API
      const response = await axios.get(`${API_URL}/layer/${layerId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (response.status === 200) {
        // Map API response to AdminLayerConf
        const layerConf: AdminLayerConf = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description || '',
          colorCode: response.data.color_code || '',
          isVisible: !response.data.is_hidden, // Note the inversion of is_hidden to isVisible
          state: LayerConfState.Idle,
          createdTs: response.data.created_ts * 1000, // Convert to milliseconds
          updatedTs: response.data.updated_ts * 1000, // Convert to milliseconds
          unsyncedChanges: false,
        }

        const existingLayer =
          useAppletStore.getState().adminLayerConfs[layerConf.id]

        if (existingLayer) {
          // Update existing layer
          updateAdminLayerConf(layerConf.id, layerConf)
        } else {
          addAdminLayerConf(layerConf)
        }

        return layerConf
      }

      return null
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  }
}
