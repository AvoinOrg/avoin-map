import { UseMutationOptions } from '@tanstack/react-query'
import axios from 'axios'
import JSZip from 'jszip'
import { useSession } from 'next-auth/react'
import { FeatureCollection } from 'geojson'

import { AdminFolayerConf, FolayerConf, FolayerConfState } from '../types'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { useUIStore } from '#/common/store'
import { useTranslate } from '@tolgee/react'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

type MutationData = {
  name: string
  isHidden: boolean
  rawShapefile: ArrayBuffer
  colorCode: string
}

type ResponseData = {
  status: number
  id: string
}

export const adminFolayerPostMutation = (): UseMutationOptions<
  ResponseData,
  Error,
  MutationData
> => {
  const addAdminFolayerConf = useAppletStore(
    (state) => state.addAdminFolayerConf
  )
  const notify = useUIStore((state) => state.notify)
  const { t } = useTranslate('luonnonmetsakartat')
  const { data: session } = useSession()

  return {
    mutationFn: async (mutationData: MutationData) => {
      const blob = new Blob([mutationData.rawShapefile], {
        type: 'application/zip',
      })
      const formData = new FormData()
      formData.append('zip_file', blob, 'shapefile.zip')
      formData.append('name', mutationData.name)
      formData.append('is_hidden', mutationData.isHidden.toString())
      formData.append('color_code', mutationData.colorCode)

      const postRes = await axios.post(`${API_URL}/layer`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (postRes.status !== 200 && postRes.status !== 201) {
        throw new Error('Failed to save the folayer')
      }

      // updatePlanConf(planConf.id, {
      //   cloudLastSaved: postRes.data.saved_ts * 1000,
      //   localLastSaved: postRes.data.saved_ts * 1000,
      //   state: PlanConfState.IDLE,
      //   userId: postRes.data.user_id,
      // })

      const adminFolayerConf: AdminFolayerConf = {
        id: postRes.data.id,
        name: postRes.data.name,
        isVisible: postRes.data.is_hidden,
        state: FolayerConfState.Idle,
        createdTs: postRes.data.created_ts * 1000,
        updatedTs: postRes.data.updated_ts * 1000,
        unsyncedChanges: false,
        colorCode: postRes.data.color_code,
      }
      await addAdminFolayerConf(adminFolayerConf)

      return { status: postRes.status, id: postRes.data.id }
    },
    onError: (error) => {
      console.error(error)
      notify({
        message: `${t('notifications.folayer_creation_error')}`,
        variant: 'error',
      })
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
  }
}
