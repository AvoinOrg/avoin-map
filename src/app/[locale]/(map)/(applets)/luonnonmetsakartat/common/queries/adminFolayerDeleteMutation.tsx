import { UseMutationOptions } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useTranslate } from '@tolgee/react'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { AdminFolayerConf, FolayerConfState } from '../types'
import { useUIStore } from '#/common/store'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

export const adminFolayerDeleteMutation = (): UseMutationOptions<
  void,
  Error,
  AdminFolayerConf
> => {
  const deleteAdminFolayerConf = useAppletStore(
    (state) => state.deleteAdminFolayerConf
  )
  const updateAdminFolayerConf = useAppletStore(
    (state) => state.updateAdminFolayerConf
  )
  const { data: session } = useSession()
  const notify = useUIStore((state) => state.notify)
  const { t } = useTranslate('luonnonmetsakartat')

  return {
    mutationFn: async (folayerConf: AdminFolayerConf) => {
      // Update folayer state to show it's being deleted
      updateAdminFolayerConf(folayerConf.id, {
        ...folayerConf,
        state: FolayerConfState.Deleting,
      })

      if (session) {
        const deleteRes = await axios.delete(
          `${API_URL}/layer/${folayerConf.id}`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        )

        if (
          deleteRes.status !== 200 &&
          deleteRes.status !== 204 &&
          deleteRes.status !== 404
        ) {
          throw new Error('Failed to delete the folayer')
        }
      }

      // Remove from store
      deleteAdminFolayerConf(folayerConf.id)
    },
    onError: (error, folayerConf) => {
      console.error(error)

      // Revert folayer state if deletion fails
      updateAdminFolayerConf(folayerConf.id, {
        ...folayerConf,
        state: FolayerConfState.Idle,
      })

      // Notify user of error
      notify({
        message: t('notifications.folayer_delete_error'),
        variant: 'error',
      })
    },
    onSuccess: (_, folayerConf) => {
      // Notify user of successful deletion
      notify({
        message: t('notifications.folayer_delete_success', {
          name: folayerConf.name,
        }),
        variant: 'success',
      })
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
  }
}
