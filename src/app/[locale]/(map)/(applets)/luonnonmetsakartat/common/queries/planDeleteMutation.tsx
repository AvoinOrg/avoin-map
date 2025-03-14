import { UseMutationOptions } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useTranslate } from '@tolgee/react'

import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { AdminLayerConf, LayerConfState } from '../types'
import { useUIStore } from '#/common/store'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

export const layerDeleteMutation = (): UseMutationOptions<
  void,
  Error,
  AdminLayerConf
> => {
  const deleteAdminLayerConf = useAppletStore(
    (state) => state.deleteAdminLayerConf
  )
  const updateAdminLayerConf = useAppletStore(
    (state) => state.updateAdminLayerConf
  )
  const { data: session } = useSession()
  const notify = useUIStore((state) => state.notify)
  const { t } = useTranslate('luonnonmetsakartat')

  return {
    mutationFn: async (layerConf: AdminLayerConf) => {
      // Update layer state to show it's being deleted
      updateAdminLayerConf({
        ...layerConf,
        state: LayerConfState.Deleting,
      })

      if (session) {
        const deleteRes = await axios.delete(
          `${API_URL}/layer/${layerConf.id}`,
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
          throw new Error('Failed to delete the layer')
        }
      }

      // Remove from store
      deleteAdminLayerConf(layerConf.id)
    },
    onError: (error, layerConf) => {
      console.error(error)

      // Revert layer state if deletion fails
      updateAdminLayerConf({
        ...layerConf,
        state: LayerConfState.Idle,
      })

      // Notify user of error
      notify({
        message: t('notifications.layer_delete_error'),
        variant: 'error',
      })
    },
    onSuccess: (_, layerConf) => {
      // Notify user of successful deletion
      notify({
        message: t('notifications.layer_delete_success', {
          name: layerConf.name,
        }),
        variant: 'success',
      })
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
  }
}
