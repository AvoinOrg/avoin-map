import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'

import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { AdminFolayerConf, FolayerConfState } from '../types'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

// For getting all folayers (if needed)
export const adminFolayersQuery = (): UseQueryOptions<AdminFolayerConf[]> => {
  const { data: session } = useSession()
  const addAdminFolayerConf = useAppletStore.getState().addAdminFolayerConf
  const updateAdminFolayerConf = useAppletStore.getState().updateAdminFolayerConf

  return {
    queryKey: ['adminFolayers'],
    queryFn: async () => {
      const existingFolayers = useAppletStore.getState().adminFolayerConfs

      for (const folayerId in existingFolayers) {
        const folayer = existingFolayers[folayerId]
        updateAdminFolayerConf(folayer.id, { state: FolayerConfState.Fetching })
      }

      const response = await axios.get(`${API_URL}/layers`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (response.status === 200) {
        const folayerConfs: AdminFolayerConf[] = response.data.map(
          (folayer: any) => ({
            id: folayer.id,
            name: folayer.name,
            description: folayer.description || '',
            colorCode: response.data.color_code || '',
            isVisible: !folayer.is_hidden,
            state: FolayerConfState.Idle,
            createdTs: folayer.created_ts * 1000,
            updatedTs: folayer.updated_ts * 1000,
            unsyncedChanges: false,
          })
        )

        for (const folayerConf of folayerConfs) {
          const existingFolayer =
            useAppletStore.getState().adminFolayerConfs[folayerConf.id]

          if (existingFolayer) {
            updateAdminFolayerConf(folayerConf.id, folayerConf)
          } else {
            addAdminFolayerConf(folayerConf)
          }
        }

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
