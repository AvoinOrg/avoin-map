import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

export const adminVerificationQuery = (): UseQueryOptions<boolean | null> => {
  const { data: session } = useSession()

  return {
    queryKey: ['planStatsQuery', session?.user?.id],
    queryFn: async () => {
      if (session?.user?.id == null) {
        return Promise.resolve(false)
      }
      const response = await axios.get(`${API_URL}/user/plans`, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (response.status === 200) {
        return true
      }

      if (response.status === 403) {
        return false
      }

      return null
    },
    retry: 3,
  }
}
