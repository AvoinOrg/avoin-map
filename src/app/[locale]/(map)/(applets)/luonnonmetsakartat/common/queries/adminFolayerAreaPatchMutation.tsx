import { UseMutationOptions } from '@tanstack/react-query'
import axios from 'axios'
import { useSession } from 'next-auth/react'

import { FolayerFeature, FolayerFeatureProperties } from '../types'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { useUIStore } from '#/common/store'
import { useTranslate } from '@tolgee/react'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

interface AreaPatchMutationPayload {
  layerId: string
  featureId: string
  properties: Partial<
    Omit<
      FolayerFeatureProperties,
      'id' | 'created_ts' | 'updated_ts' | 'layer_id' | 'area_ha'
    >
  >
}

type AreaPatchResponseData = FolayerFeature

export const adminFolayerAreaPatchMutation = (): UseMutationOptions<
  AreaPatchResponseData,
  Error,
  AreaPatchMutationPayload
> => {
  const updateFolayerAreaInStore = useAppletStore(
    (state) => state.updateFolayerArea
  )
  const notify = useUIStore((state) => state.notify)
  const { t } = useTranslate('luonnonmetsakartat')
  const { data: session } = useSession()

  return {
    mutationFn: async (mutationData: AreaPatchMutationPayload) => {
      const formData = new FormData()

      if (mutationData.properties) {
        for (const key in mutationData.properties) {
          if (
            Object.prototype.hasOwnProperty.call(mutationData.properties, key)
          ) {
            const propKey = key as keyof typeof mutationData.properties
            const value = mutationData.properties[propKey]

            if (value !== undefined && value !== null) {
              formData.append(key, String(value))
            }
          }
        }
      }

      const apiUrl = `${API_URL}/layer/${mutationData.layerId}/area/${mutationData.featureId}`

      const patchRes = await axios.patch<FolayerFeature>(apiUrl, formData, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (patchRes.status !== 200) {
        throw new Error(
          `Failed to update the folayer area. Status: ${patchRes.status}`
        )
      }

      const updatedFeatureFromServer = patchRes.data

      await updateFolayerAreaInStore(
        mutationData.layerId,
        updatedFeatureFromServer.id as string,
        updatedFeatureFromServer
      )

      return updatedFeatureFromServer
    },
    onSuccess: (updatedData, variables) => {
      notify({
        message: t('notifications.folayer_area_update_success', {
          name: updatedData.properties.name || variables.featureId,
        }),
        variant: 'success',
      })
    },
    onError: (error, variables) => {
      console.error('Error updating folayer area:', error)
      notify({
        message: t('notifications.folayer_area_update_error', {
          featureId: variables.featureId,
          error: error.message,
        }),
        variant: 'error',
      })
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
  }
}
