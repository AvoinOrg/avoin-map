import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'

import { useAuthSession } from '#/common/auth'

import { PlaceholderPlanConf } from '../types'

const API_URL = process.env.NEXT_PUBLIC_HIILIKARTTA_API_URL

export const usePlanStatsQuery = (): UseQueryOptions<
  PlaceholderPlanConf[] | null
> => {
  const { data: session } = useAuthSession()
  const accessToken = session?.accessToken

  return {
    queryKey: ['planStatsQuery', session?.user?.id],
    queryFn: async () => {
      if (session?.user?.id == null) {
        return Promise.resolve([])
      }

      if (!accessToken) {
        throw new Error('Missing access token for Hiilikartta plan stats')
      }

      const response = await axios.get(`${API_URL}/user/plans`, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        const parsedStats: PlaceholderPlanConf[] = []

        for (const stats of response.data.stats) {
          parsedStats.push({
            id: stats.visible_id,
            serverId: stats.id,
            userId: session?.user?.id,
            name: stats.name,
            cloudLastSaved: stats.saved_ts * 1000,
          })
        }

        return parsedStats
      }

      return null
    },
    retry: 3,
  }
}
