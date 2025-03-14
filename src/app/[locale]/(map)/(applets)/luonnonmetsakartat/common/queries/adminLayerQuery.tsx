import { FetchStatus } from '#/common/types/general'
import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'
import { FeatureCollection } from 'geojson'
import { area as turfArea } from '@turf/turf'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { useSession } from 'next-auth/react'
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
          isVisible: !response.data.is_hidden, // Note the inversion of is_hidden to isVisible
          state: LayerConfState.Idle,
          createdTs: response.data.created_ts * 1000, // Convert to milliseconds
          updatedTs: response.data.updated_ts * 1000, // Convert to milliseconds
        }

        // Check if this layer already exists in the store
        const adminLayerConfs = useAppletStore.getState().adminLayerConfs
        const existingLayer = adminLayerConfs.find(
          (conf) => conf.id === layerId
        )

        if (existingLayer) {
          // Update existing layer
          updateAdminLayerConf(layerConf)
        } else {
          // Add new layer
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

// For getting all layers (if needed)
export const adminLayersQuery = (): UseQueryOptions<AdminLayerConf[]> => {
  const { data: session } = useSession()
  const addAdminLayerConf = useAppletStore.getState().addAdminLayerConf
  const updateAdminLayerConf = useAppletStore.getState().updateAdminLayerConf

  return {
    queryKey: ['adminLayers'],
    queryFn: async () => {
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
            isVisible: !layer.is_hidden,
            state: LayerConfState.Idle,
            createdTs: layer.created_ts * 1000,
            updatedTs: layer.updated_ts * 1000,
          })
        )

        for (const layerConf of layerConfs) {
          const existingLayer = useAppletStore
            .getState()
            .adminLayerConfs.find((conf) => conf.id === layerConf.id)

          if (existingLayer) {
            updateAdminLayerConf(layerConf)
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
