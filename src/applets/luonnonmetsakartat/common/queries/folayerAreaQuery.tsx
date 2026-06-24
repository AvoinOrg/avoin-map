import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'

import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { FolayerConfState, FolayerAreaConf } from '../types'
import { getFolayerCentroidSourceLayer } from '../utils'

const SERVER_URL = process.env.NEXT_PUBLIC_GEOSERVER_URL
const GS_WORKSPACE =
  process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE

export const folayerAreaQuery = (
  folayerId: string
): UseQueryOptions<FolayerAreaConf | null> => {
  const updateFolayerAreaConf = useAppletStore.getState().updateFolayerAreaConf
  const addFolayerAreaConf = useAppletStore.getState().addFolayerAreaConf
  const centroidSourceLayer = getFolayerCentroidSourceLayer(folayerId)
  return {
    queryKey: ['folayerAreas', folayerId],
    queryFn: async () => {
      const existingCollection =
        useAppletStore.getState().folayerAreaConfs[folayerId]

      if (existingCollection) {
        if (existingCollection.state !== FolayerConfState.Idle) {
          return null
        }
        updateFolayerAreaConf(folayerId, {
          state: FolayerConfState.Fetching,
        })
      } else {
        // Add new collection
        addFolayerAreaConf(folayerId, {
          id: folayerId,
          data: { type: 'FeatureCollection', features: [] },
          state: FolayerConfState.Fetching,
        })
      }

      const url = `${SERVER_URL}/${GS_WORKSPACE}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${GS_WORKSPACE}:${centroidSourceLayer}&outputFormat=application/json&srsName=EPSG:4326`
      const response = await axios.get(url)

      if (response.status === 200) {
        const features = (response.data.features ||
          []) as FolayerAreaConf['data']['features']

        for (const feature of features) {
          feature.id = feature.properties.id || feature.id
          const properties = feature.properties as unknown as Record<
            string,
            unknown
          >
          const pics = properties.pictures
          if (typeof pics === 'string') {
            try {
              const parsed: unknown = JSON.parse(pics)
              if (Array.isArray(parsed)) {
                properties.pictures = parsed
              }
            } catch {
              // leave as-is if not valid JSON
            }
          }
        }
        // Extract area collection data
        const areaObj: FolayerAreaConf = {
          id: folayerId, // Using the same ID as the folayer
          data: {
            type: 'FeatureCollection',
            features,
          }, // Assuming features are in the response
          state: FolayerConfState.Idle,
        }

        // Handle the area collection separately
        const existingCollection =
          useAppletStore.getState().folayerAreaConfs[folayerId]

        if (existingCollection) {
          updateFolayerAreaConf(folayerId, areaObj)
        }

        return areaObj
      }

      return null
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  }
}
