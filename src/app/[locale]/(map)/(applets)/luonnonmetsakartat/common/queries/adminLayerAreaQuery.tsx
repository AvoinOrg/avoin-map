import { FetchStatus } from '#/common/types/general'
import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'
import { FeatureCollection } from 'geojson'
import { area as turfArea } from '@turf/turf'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { useSession } from 'next-auth/react'
import { LayerConfState, LayerAreaCollection } from '../types'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

export const adminLayerAreaQuery = (
  layerId: string
): UseQueryOptions<LayerAreaCollection | null> => {
  const { data: session } = useSession()
  const updateLayerAreaCollection =
    useAppletStore.getState().updateLayerAreaCollection
  const addLayerAreaCollection =
    useAppletStore.getState().addLayerAreaCollection

  return {
    queryKey: ['adminLayerAreas', layerId],
    queryFn: async () => {
      const existingCollection =
        useAppletStore.getState().layerAreaCollections[layerId]

      if (existingCollection) {
        if (existingCollection.state !== LayerConfState.Idle) {
          return null
        }
        updateLayerAreaCollection(layerId, { state: LayerConfState.Fetching })
      } else {
        // Add new collection
        addLayerAreaCollection(layerId, {
          id: layerId,
          features: [],
          state: LayerConfState.Fetching,
        })
      }

      // Get layer data from API
      const response = await axios.get(`${API_URL}/layer/${layerId}/areas`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (response.status === 200) {
        // Extract area collection data
        const areaCollection: LayerAreaCollection = {
          id: layerId, // Using the same ID as the layer
          features: response.data || [], // Assuming features are in the response
          state: LayerConfState.Idle,
        }

        // Handle the area collection separately
        const existingCollection =
          useAppletStore.getState().layerAreaCollections[layerId]

        if (existingCollection) {
          updateLayerAreaCollection(layerId, areaCollection)
        }

        return areaCollection
      }

      return null
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  }
}

// Helper function to calculate total area
const calculateTotalArea = (features: any[]): number => {
  if (!features || !Array.isArray(features) || features.length === 0) {
    return 0
  }

  // Create a FeatureCollection for turf.js
  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: features,
  }

  // Calculate total area using turf.js
  return turfArea(featureCollection)
}
