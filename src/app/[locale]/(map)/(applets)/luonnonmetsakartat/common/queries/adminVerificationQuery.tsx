import axios from 'axios'
import { UseQueryOptions } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { AdminVerificationStatus } from 'applets/luonnonmetsakartat/common/types'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

export const adminVerificationQuery = (): UseQueryOptions<boolean | null> => {
  const { data: session } = useSession()
  const setAdminVerificationStatus =
    useAppletStore.getState().setAdminVerificationStatus

  return {
    queryKey: ['adminVerificationQuery', session?.user?.id],
    queryFn: async () => {
      setAdminVerificationStatus(AdminVerificationStatus.Pending)

      if (session?.user?.id == null) {
        setAdminVerificationStatus(AdminVerificationStatus.NoUser)
        return Promise.resolve(false)
      }

      const response = await axios.get(`${API_URL}/admin/validate`, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (response.status === 200) {
        if (
          response.data?.is_editor === true ||
          response.data?.is_admin === true
        ) {
          setAdminVerificationStatus(AdminVerificationStatus.Verified)
          return true
        }

        setAdminVerificationStatus(AdminVerificationStatus.Rejected)
        return false
      }

      if (response.status === 403) {
        setAdminVerificationStatus(AdminVerificationStatus.Rejected)
        return false
      }

      setAdminVerificationStatus(AdminVerificationStatus.Errored)
      return null
    },
    retry: 3,
  }
}
