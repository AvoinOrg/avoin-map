import { UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import JSZip from 'jszip'
import { useSession } from 'next-auth/react'
import { FeatureCollection } from 'geojson'

import {
  AdminFolayerConf,
  FolayerConf,
  FolayerConfState,
  ColOptions,
} from '../types'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { useUIStore } from '#/common/store'
import { useTranslate } from '@tolgee/react'

const API_URL = process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_API_URL

interface MutationData extends AdminFolayerConf {
  rawShapefile?: ArrayBuffer
  deleteAreasNotUpdated?: boolean
}

type ResponseData = {
  status: number
  id: string
}

export const adminFolayerPatchMutation = (): UseMutationOptions<
  ResponseData,
  Error,
  MutationData
> => {
  const queryClient = useQueryClient()
  const addAdminFolayerConf = useAppletStore(
    (state) => state.addAdminFolayerConf
  )
  const notify = useUIStore((state) => state.notify)
  const { t } = useTranslate('luonnonmetsakartat')
  const { data: session } = useSession()

  return {
    mutationFn: async (mutationData: MutationData) => {
      const formData = new FormData()

      if (mutationData.rawShapefile) {
        const blob = new Blob([mutationData.rawShapefile], {
          type: 'application/zip',
        })
        formData.append('zip_file', blob, 'shapefile.zip')
      }

      // Whether to delete areas not present in the uploaded update
      if (typeof mutationData.deleteAreasNotUpdated !== 'undefined') {
        formData.append(
          'delete_areas_not_updated',
          String(!!mutationData.deleteAreasNotUpdated)
        )
      }

      const isHidden = !mutationData.isVisible
      formData.append('is_hidden', isHidden.toString())

      formData.append('name', mutationData.name)

      if (mutationData.colorCode && mutationData.colorCode !== '') {
        formData.append('color_code', mutationData.colorCode)
      }

      if (mutationData.colOptions) {
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
      }

      const postRes = await axios.patch(
        `${API_URL}/layer/${mutationData.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      )

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
    onSuccess: async (_data, variables) => {
      // Invalidate and refetch admin area data for this layer
      await queryClient.invalidateQueries({
        queryKey: ['adminFolayerAreas', variables.id],
        exact: true,
      })
      await queryClient.refetchQueries({
        queryKey: ['adminFolayerAreas', variables.id],
        type: 'inactive',
      })

      // Optionally refetch normal folayer areas if present in store
      const state = useAppletStore.getState()
      const hasNormalAreas = !!state.folayerAreaConfs?.[variables.id]
      const hasNormalConf = Array.isArray((state as any).folayerConfs)
        ? (state as any).folayerConfs.some((c: any) => c?.id === variables.id)
        : !!(state as any).folayerConfs?.[variables.id]

      if (hasNormalAreas || hasNormalConf) {
        await queryClient.invalidateQueries({
          queryKey: ['folayerAreas', variables.id],
          exact: true,
        })
        await queryClient.refetchQueries({
          queryKey: ['folayerAreas', variables.id],
          type: 'inactive',
        })
      }

      // Refresh the list of layers
      await queryClient.invalidateQueries({ queryKey: ['folayers'] })
      await queryClient.refetchQueries({ queryKey: ['folayers'], type: 'inactive' })
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
