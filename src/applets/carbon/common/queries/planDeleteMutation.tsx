import { UseMutationOptions } from '@tanstack/react-query'
import axios from 'axios'

import { useAuthSession } from '#/common/auth'

import { useAppletStore } from 'applets/carbon/state/appletStore'
import { HIILIKARTTA_API_URL } from '../api'
import { PlanConfState, PlanConf } from '../types'

const API_URL = HIILIKARTTA_API_URL

export const usePlanDeleteMutation = (): UseMutationOptions<
  void,
  Error,
  PlanConf
> => {
  const deletePlanConf = useAppletStore((state) => state.deletePlanConf)
  const updatePlanConf = useAppletStore((state) => state.updatePlanConf)
  const { data: session } = useAuthSession()
  const accessToken = session?.accessToken

  return {
    mutationFn: async (planConf: PlanConf) => {
      await updatePlanConf(planConf.id, {
        state: PlanConfState.DELETING,
      })

      if (planConf.cloudLastSaved != null) {
        if (!accessToken) {
          throw new Error('Missing access token for Hiilikartta plan delete')
        }

        const delRes = await axios.delete(`${API_URL}/plan`, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
          params: { id: planConf.serverId },
        })

        if (delRes.status !== 200 && delRes.status !== 404) {
          throw new Error('Failed to delete the plan')
        }
      }

      await deletePlanConf(planConf.id)
    },
    onError: (error, planConf) => {
      console.error(error)
      updatePlanConf(planConf.id, {
        state: PlanConfState.IDLE,
      })
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(attemptIndex * 1000, 3000),
  }
}
