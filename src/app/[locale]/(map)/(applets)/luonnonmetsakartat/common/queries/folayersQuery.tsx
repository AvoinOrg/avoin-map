import { FetchStatus } from '#/common/types/general'
import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'
import { FeatureCollection } from 'geojson'
import { area as turfArea } from '@turf/turf'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { useSession } from 'next-auth/react'
import { AdminFolayerConf, FolayerConfState } from '../types'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

// export const folayerQuery = (
//   folayerId: string
// ): UseQueryOptions<FolayerConf | null> => {
//   const { data: session } = useSession()
//   const updateAdminFolayerConf = useAppletStore.getState().updateAdminFolayerConf
//   const addAdminFolayerConf = useAppletStore.getState().addAdminFolayerConf

//   return {
//     queryKey: ['folayer', folayerId],
//     queryFn: async () => {
//       // Get folayer data from API
//       const response = await axios.get(`${API_URL}/layer/${folayerId}`, {
//         headers: {
//           Authorization: `Bearer ${session?.accessToken}`,
//         },
//       })

//       if (response.status === 200) {
//         // Map API response to AdminFolayerConf
//         const folayerConf: AdminFolayerConf = {
//           id: response.data.id,
//           name: response.data.name,
//           description: response.data.description || '',
//           isVisible: !response.data.is_hidden, // Note the inversion of is_hidden to isVisible
//           state: FolayerConfState.Idle,
//           createdTs: response.data.created_ts * 1000, // Convert to milliseconds
//           updatedTs: response.data.updated_ts * 1000, // Convert to milliseconds
//         }

//         // Check if this folayer already exists in the store
//         const adminFolayerConfs = useAppletStore.getState().adminFolayerConfs
//         const existingFolayer = adminFolayerConfs.find(
//           (conf) => conf.id === folayerId
//         )

//         if (existingFolayer) {
//           // Update existing folayer
//           updateAdminFolayerConf(folayerConf)
//         } else {
//           // Add new folayer
//           addAdminFolayerConf(folayerConf)
//         }

//         return folayerConf
//       }

//       return null
//     },
//     retry: 3,
//     retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
//     staleTime: 60 * 1000, // 1 minute
//     refetchOnWindowFocus: false,
//   }
// }

// For getting all folayers (if needed)
export const folayersQuery = (): UseQueryOptions<AdminFolayerConf[]> => {
  const setFolayerConfs = useAppletStore.getState().setFolayerConfs

  return {
    queryKey: ['folayers'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/layers`)

      if (response.status === 200) {
        const folayerConfs: AdminFolayerConf[] = response.data.map(
          (folayer: any) => ({
            id: folayer.id,
            name: folayer.name,
            description: folayer.description || '',
            createdTs: folayer.created_ts * 1000,
            updatedTs: folayer.updated_ts * 1000,
            colorCode: folayer.color_code || '#000000',
          })
        )

        setFolayerConfs(folayerConfs)

        return folayerConfs
      }

      return []
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  }
}
