import { FetchStatus } from '#/common/types/general'
import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'
import { FeatureCollection } from 'geojson'
import { area as turfArea } from '@turf/turf'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { useSession } from 'next-auth/react'
import { FolayerConfState, FolayerAreaCollection } from '../types'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

export const adminFolayerAreaQuery = (
  folayerId: string
): UseQueryOptions<FolayerAreaCollection | null> => {
  const { data: session } = useSession()
  const updateFolayerAreaCollection =
    useAppletStore.getState().updateFolayerAreaCollection
  const addFolayerAreaCollection =
    useAppletStore.getState().addFolayerAreaCollection

  return {
    queryKey: ['adminFolayerAreas', folayerId],
    queryFn: async () => {
      const existingCollection =
        useAppletStore.getState().folayerAreaCollections[folayerId]

      if (existingCollection) {
        if (existingCollection.state !== FolayerConfState.Idle) {
          return null
        }
        updateFolayerAreaCollection(folayerId, {
          state: FolayerConfState.Fetching,
        })
      } else {
        // Add new collection
        addFolayerAreaCollection(folayerId, {
          id: folayerId,
          features: [],
          state: FolayerConfState.Fetching,
        })
      }

      // Get folayer data from API
      const response = await axios.get(`${API_URL}/layer/${folayerId}/areas`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (response.status === 200) {
        // Extract area collection data
        const areaCollection: FolayerAreaCollection = {
          id: folayerId, // Using the same ID as the folayer
          features: response.data.features || [], // Assuming features are in the response
          state: FolayerConfState.Idle,
        }

        // Handle the area collection separately
        const existingCollection =
          useAppletStore.getState().folayerAreaCollections[folayerId]

        if (existingCollection) {
          updateFolayerAreaCollection(folayerId, areaCollection)
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
