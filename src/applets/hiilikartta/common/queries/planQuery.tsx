import { FetchStatus } from '#/common/types/general'
import { UseQueryOptions } from '@tanstack/react-query'
import axios from 'axios'
import { FeatureCollection } from 'geojson'
import { area as turfArea } from '@turf/turf'

import { useAuthSession } from '#/common/auth'
import { useAppletStore } from 'applets/hiilikartta/state/appletStore'

import { HIILIKARTTA_API_URL } from '../api'
import { CalculationState, PlanConf, PlanConfState } from '../types'
import { processCalcQueryToReportData, stripFeatureExtras } from '../utils'

const API_URL = HIILIKARTTA_API_URL

export const usePlanQuery = (
  serverId: string
): UseQueryOptions<PlanConf | null> => {
  const { data: session } = useAuthSession()
  const accessToken = session?.accessToken
  const updatePlaceholderPlanConf =
    useAppletStore.getState().updatePlaceholderPlanConf
  const deletePlaceholderPlanConf =
    useAppletStore.getState().deletePlaceholderPlanConf
  const updatePlanConf = useAppletStore.getState().updatePlanConf
  const addPlanConf = useAppletStore.getState().addPlanConf

  return {
    queryKey: ['plan', serverId],
    queryFn: async () => {
      updatePlaceholderPlanConf(serverId, { status: FetchStatus.FETCHING })

      if (!accessToken) {
        updatePlaceholderPlanConf(serverId, { status: FetchStatus.ERRORED })
        throw new Error('Missing access token for Hiilikartta plan fetch')
      }

      const response = await axios.get(`${API_URL}/plan`, {
        params: { id: serverId },

        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        let reportData = undefined
        if (response.data.report_data != null) {
          reportData = processCalcQueryToReportData(response.data.report_data)
        }
        const planData = stripFeatureExtras(
          response.data.data
        ) as PlanConf['data']

        let calculationState: CalculationState = CalculationState.NOT_STARTED

        if (response.data.calculation_status != null) {
          switch (response.data.calculation_status) {
            case 'ERROR':
              calculationState = CalculationState.ERRORED
              break
            case 'PROCESSING':
              calculationState = CalculationState.CALCULATING
              break
            case 'FINISHED':
              calculationState = CalculationState.FINISHED
              break
          }
        }

        const forestryScenario =
          response.data.forestry_scenario ??
          response.data.metadata?.forestry_scenario

        const planConf = {
          id: response.data.visible_id ?? response.data.id,
          name: response.data.name,
          serverId: response.data.id ?? serverId,
          created: response.data.created_ts * 1000,
          state: PlanConfState.IDLE,
          calculationState,
          cloudLastSaved: response.data.saved_ts * 1000,
          localLastSaved: response.data.saved_ts * 1000,
          localLastEdited: response.data.saved_ts * 1000,
          userId: response.data.user_id,
          forestryScenario,
          importState: 'confirmed' as const,
          data: planData,
          areaHa: turfArea(response.data.data as FeatureCollection) / 10000,
          reportData: reportData,
        }

        const planConfs = useAppletStore.getState().planConfs
        if (Object.keys(planConfs).includes(planConf.id)) {
          if (
            planConfs[planConf.id].localLastEdited != null &&
            (planConfs[planConf.id].localLastEdited ?? 0) <=
              planConf.cloudLastSaved
          ) {
            const updatedPlanConf = await updatePlanConf(planConf.id, planConf)
            return updatedPlanConf
          }
        } else {
          const newPlanConf = await addPlanConf(planConf)
          return newPlanConf
        }
        deletePlaceholderPlanConf(serverId)
      }
      return null
    },
    retry: 3,
  }
}
