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

      try {

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

        setAdminVerificationStatus(AdminVerificationStatus.Errored)
        return null
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            setAdminVerificationStatus(AdminVerificationStatus.Rejected)
            error.name = 'AuthorizationError';
            return false
          }
        }

        // Any other error
        setAdminVerificationStatus(AdminVerificationStatus.Errored)
        return null
      }
    },
    retry: (failureCount, error) => {
      // Don't retry authorization errors (403)
      if (error && error.name === 'AuthorizationError') {
        return false;
      }

      // Retry other errors up to 3 times
      return failureCount < 3;
    },
  }
}
