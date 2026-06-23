import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { FolayerConf } from '../types'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

type FolayerApiItem = {
  id: string
  name: string
  description?: string | null
  created_ts: number
  updated_ts: number
  color_code?: string | null
}

// For getting all folayers (if needed)
export const folayersQuery = (): UseQueryOptions<FolayerConf[]> => {
  const setFolayerConfs = useAppletStore.getState().setFolayerConfs

  return {
    queryKey: ['folayers'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/layers`)

      if (response.status === 200) {
        const folayerConfs: FolayerConf[] = (
          response.data as FolayerApiItem[]
        ).map((folayer) => ({
          id: folayer.id,
          name: folayer.name,
          description: folayer.description || '',
          createdTs: folayer.created_ts * 1000,
          updatedTs: folayer.updated_ts * 1000,
          colorCode: folayer.color_code || '#000000',
        }))

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
