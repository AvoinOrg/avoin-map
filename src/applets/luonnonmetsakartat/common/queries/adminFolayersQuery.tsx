import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'

import { useAuthSession } from '#/common/auth'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { AdminFolayerConf, FolayerConfState } from '../types'
import { getRequiredBearerAuthHeader } from './authHeaders'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

type AdminFolayerApiItem = {
  id: string
  name: string
  description?: string | null
  color_code?: string | null
  is_hidden?: boolean
  created_ts: number
  updated_ts: number
  col_options?: AdminFolayerConf['colOptions']
}

// For getting all folayers (if needed)
export const useAdminFolayersQueryOptions =
  (): UseQueryOptions<AdminFolayerConf[]> => {
  const { data: session } = useAuthSession()
  const { accessToken } = session ?? {}
  const addAdminFolayerConf = useAppletStore.getState().addAdminFolayerConf
  const updateAdminFolayerConf =
    useAppletStore.getState().updateAdminFolayerConf

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
          ...getRequiredBearerAuthHeader({
            accessToken,
            requestName: 'Luonnonmetsakartat admin folayer list',
          }),
        },
      })

      if (response.status === 200) {
        const folayerConfs: AdminFolayerConf[] = (
          response.data as AdminFolayerApiItem[]
        ).map((folayer) => ({
          id: folayer.id,
          name: folayer.name,
          description: folayer.description || '',
          colorCode: folayer.color_code || '',
          isVisible: !folayer.is_hidden,
          state: FolayerConfState.Idle,
          createdTs: folayer.created_ts,
          updatedTs: folayer.updated_ts,
          unsyncedChanges: false,
          colOptions: folayer.col_options,
        }))

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
