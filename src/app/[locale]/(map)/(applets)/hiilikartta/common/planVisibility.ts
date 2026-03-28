import { PlanConf, PlanConfState } from './types'

export const isVisiblePlanConf = (
  planConf?: PlanConf | null
): planConf is PlanConf => {
  return Boolean(
    planConf &&
      !planConf.isHidden &&
      planConf.state !== PlanConfState.FETCHING &&
      planConf.draftType == null
  )
}

export const getVisiblePlanConfs = (
  planConfs: Record<string, PlanConf | undefined> | undefined
) => {
  if (!planConfs) {
    return []
  }

  return Object.values(planConfs).filter(isVisiblePlanConf)
}
