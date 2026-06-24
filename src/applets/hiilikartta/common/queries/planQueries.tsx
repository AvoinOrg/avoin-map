import { FetchStatus } from '#/common/types/general'
import axios from 'axios'
import { FeatureCollection } from 'geojson'
import { area as turfArea } from '@turf/turf'
import { useTranslate } from '@tolgee/react'

import { useAuthSession } from '#/common/auth'
import { useUIStore } from '#/common/store'

import { useAppletStore } from 'applets/hiilikartta/state/appletStore'
import {
  CalculationState,
  PlaceholderPlanConf,
  PlanConf,
  PlanConfState,
  ReportData,
} from '../types'
import { processCalcQueryToReportData, stripFeatureExtras } from '../utils'

const API_URL = process.env.NEXT_PUBLIC_HIILIKARTTA_API_URL

export const usePlanQueries = (
  placeholderPlanConfs: PlaceholderPlanConf[] | undefined
) => {
  placeholderPlanConfs = placeholderPlanConfs || []

  const { data: session } = useAuthSession()
  const accessToken = session?.accessToken
  const notify = useUIStore((state) => state.notify)
  const { t } = useTranslate('hiilikartta')
  const updatePlaceholderPlanConf =
    useAppletStore.getState().updatePlaceholderPlanConf
  const deletePlaceholderPlanConf =
    useAppletStore.getState().deletePlaceholderPlanConf
  const updatePlanConf = useAppletStore.getState().updatePlanConf
  const addPlanConf = useAppletStore.getState().addPlanConf

  return {
    queries: placeholderPlanConfs.map((placeholderPlanConf) => ({
      queryKey: ['plan', placeholderPlanConf.id],
      queryFn: async () => {
        updatePlaceholderPlanConf(placeholderPlanConf.id, {
          ...placeholderPlanConf,
          status: FetchStatus.FETCHING,
        })

        if (!accessToken) {
          updatePlaceholderPlanConf(placeholderPlanConf.id, {
            status: FetchStatus.ERRORED,
          })
          throw new Error('Missing access token for Hiilikartta plan fetch')
        }

        const response = await axios.get(`${API_URL}/plan`, {
          params: { id: placeholderPlanConf.serverId },

          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 200) {
          try {
            let reportData: ReportData | undefined = undefined
            if (response.data.report_data != null) {
              reportData = processCalcQueryToReportData(
                response.data.report_data
              )
            }

            let calculationState: CalculationState =
              CalculationState.NOT_STARTED

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

            const planConf: PlanConf = {
              id: response.data.visible_id,
              name: response.data.name,
              serverId: response.data.id,
              created: response.data.created_ts * 1000,
              state: PlanConfState.IDLE,
              calculationState: calculationState,
              cloudLastSaved: response.data.saved_ts * 1000,
              localLastSaved: response.data.saved_ts * 1000,
              localLastEdited: response.data.saved_ts * 1000,
              userId: response.data.user_id,
              forestryScenario:
                response.data.forestry_scenario ??
                response.data.metadata?.forestry_scenario,
              importState: 'confirmed',
              data: stripFeatureExtras(response.data.data),
              areaHa: turfArea(response.data.data as FeatureCollection) / 10000,
              reportData: reportData,
            }

            const planConfs = useAppletStore.getState().planConfs

            await deletePlaceholderPlanConf(placeholderPlanConf.id)
            if (Object.keys(planConfs).includes(planConf.id)) {
              if (
                planConfs[planConf.id].localLastEdited != null &&
                (planConfs[planConf.id].localLastEdited ?? 0) <
                  (planConf.cloudLastSaved ?? 0)
              ) {
                const updatedPlanConf = await updatePlanConf(
                  planConf.id,
                  planConf
                )
                return updatedPlanConf
              } else {
                updatePlanConf(planConf.id, { state: PlanConfState.IDLE })
              }
            } else {
              const newPlanConf = await addPlanConf(planConf)
              return newPlanConf
            }
          } catch (error: unknown) {
            console.error(error)
            updatePlaceholderPlanConf(placeholderPlanConf.id, {
              status: FetchStatus.ERRORED,
            })
            const responseStatus = axios.isAxiosError(error)
              ? error.response?.status
              : undefined

            if (responseStatus === 401) {
              notify({
                message: `${t('notifications.authorized_to_fetch_plan')} ${
                  placeholderPlanConf.id
                }`,
                variant: 'error',
              })
            }
            if (responseStatus === 404) {
              notify({
                message: `${t('notifications.plan_not_found')} ${
                  placeholderPlanConf.id
                }`,
                variant: 'error',
              })
            }
          }
        }
        return null
      },
      retry: 3,
      enabled: false,
    })),
  }

  // return {
  //   queries: serverIds.map((serverId) => ({
  //     queryKey: ['plan', serverId],
  //     queryFn: async (context: any) => {
  //       // Add the context argument with type 'unknown'
  //       const options = usePlanQuery(serverId)
  //       if (options.queryFn) {
  //         return options.queryFn(context) // Pass the context argument
  //       }
  //       return null
  //     },
  //   })),
}
