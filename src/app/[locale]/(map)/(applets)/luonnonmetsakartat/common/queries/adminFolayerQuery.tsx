import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'

import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { AdminFolayerConf, FolayerConfState } from '../types'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

export const adminFolayerQuery = (
  folayerId: string
): UseQueryOptions<AdminFolayerConf | null> => {
  const { data: session } = useSession()
  const updateAdminFolayerConf =
    useAppletStore.getState().updateAdminFolayerConf
  const addAdminFolayerConf = useAppletStore.getState().addAdminFolayerConf

  return {
    queryKey: ['adminFolayer', folayerId],
    queryFn: async () => {
      const existingFolayerConf =
        useAppletStore.getState().adminFolayerConfs[folayerId]

      if (existingFolayerConf) {
        if (existingFolayerConf.state !== FolayerConfState.Idle) {
          return null
        }
        updateAdminFolayerConf(folayerId, { state: FolayerConfState.Fetching })
      }
      // Get folayer data from API
      const response = await axios.get(`${API_URL}/layer/${folayerId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (response.status === 200) {
        // Map API response to AdminFolayerConf
        const folayerConf: AdminFolayerConf = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description || '',
          colorCode: response.data.color_code || '',
          isVisible: !response.data.is_hidden, // Note the inversion of is_hidden to isVisible
          state: FolayerConfState.Idle,
          createdTs: response.data.created_ts,
          updatedTs: response.data.updated_ts,
          unsyncedChanges: false,
          colOptions: response.data.col_options,
        }

        const existingFolayer =
          useAppletStore.getState().adminFolayerConfs[folayerConf.id]

        if (existingFolayer) {
          // Update existing folayer
          updateAdminFolayerConf(folayerConf.id, folayerConf)
        } else {
          addAdminFolayerConf(folayerConf)
        }

        return folayerConf
      }

      return null
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  }
}
