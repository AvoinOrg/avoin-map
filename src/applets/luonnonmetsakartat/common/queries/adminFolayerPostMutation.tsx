import { UseMutationOptions } from '@tanstack/react-query'
import axios from 'axios'

import { useAuthSession } from '#/common/auth'
import { AdminFolayerConf, ColOptions, FolayerConfState } from '../types'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { useUIStore } from '#/common/store'
import { useTranslate } from '@tolgee/react'
import { LUONNONMETSAKARTAT_API_URL } from '../api'
import { getRequiredBearerAuthHeader } from './authHeaders'

const API_URL = LUONNONMETSAKARTAT_API_URL

type MutationData = {
  colOptions: ColOptions
  name: string
  isHidden: boolean
  rawShapefile: ArrayBuffer
  colorCode: string
}

type ResponseData = {
  status: number
  id: string
}

export const useAdminFolayerPostMutationOptions = (): UseMutationOptions<
  ResponseData,
  Error,
  MutationData
> => {
  const addAdminFolayerConf = useAppletStore(
    (state) => state.addAdminFolayerConf
  )
  const notify = useUIStore((state) => state.notify)
  const { t } = useTranslate('luonnonmetsakartat')
  const { data: session } = useAuthSession()
  const { accessToken } = session ?? {}

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
      formData.append(
        'indexing_strategy',
        mutationData.colOptions.indexingStrategy
      )
      formData.append('name_col', mutationData.colOptions.nameCol)
      formData.append(
        'municipality_col',
        mutationData.colOptions.municipalityCol
      )
      if (mutationData.colOptions.regionCol) {
        formData.append('region_col', mutationData.colOptions.regionCol)
      }
      if (mutationData.colOptions.descriptionCol) {
        formData.append(
          'description_col',
          mutationData.colOptions.descriptionCol
        )
      }
      if (mutationData.colOptions.areaCol) {
        formData.append('area_col', mutationData.colOptions.areaCol)
      }
      if (mutationData.colOptions.idCol) {
        formData.append('id_col', mutationData.colOptions.idCol)
      }

      const postRes = await axios.post(`${API_URL}/layer`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getRequiredBearerAuthHeader({
            accessToken,
            requestName: 'Luonnonmetsakartat folayer create',
          }),
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
        isVisible: !postRes.data.is_hidden,
        state: FolayerConfState.Idle,
        createdTs: postRes.data.created_ts,
        updatedTs: postRes.data.updated_ts,
        unsyncedChanges: false,
        colorCode: postRes.data.color_code,
        colOptions: postRes.data.col_options,
      }
      await addAdminFolayerConf(adminFolayerConf)

      return { status: postRes.status, id: postRes.data.id }
    },
    onSuccess: async () => {
      notify({
        message: t('notifications.folayer_create_success'),
        variant: 'success',
      })
    },
    onError: (error) => {
      console.error(error)
      notify({
        message: `${t('notifications.folayer_creation_error')}`,
        variant: 'error',
        persist: true,
      })
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
  }
}
