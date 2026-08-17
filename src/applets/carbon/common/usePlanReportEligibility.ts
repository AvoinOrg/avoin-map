import { useMemo } from 'react'

import { CalculationState, PlanConf } from './types'
import { useZoningClasses } from './useZoningClasses'
import {
  checkIsValidLandUseDistribution,
  checkIsValidZoningCode,
} from './utils'

type UsePlanReportEligibilityParams = {
  hasPendingLocalLandUseEdits?: boolean
  planConf?: PlanConf
  isCalculationMutationPending?: boolean
}

export type PlanReportEligibility = {
  hasNoFeatures: boolean
  areZonesValid: boolean
  isZoningClassesLoading: boolean
  isCalculationRunning: boolean
  isReportActionEnabled: boolean
  disabledTooltipKey?: string
}

const usePlanReportEligibility = ({
  hasPendingLocalLandUseEdits = false,
  planConf,
  isCalculationMutationPending = false,
}: UsePlanReportEligibilityParams): PlanReportEligibility => {
  const { isLoading: isZoningClassesLoading } = useZoningClasses()

  const hasNoFeatures = useMemo(() => {
    if (planConf?.data.features != null) {
      return planConf.data.features.length === 0
    }

    return true
  }, [planConf?.data.features])

  const areZonesValid = useMemo(() => {
    if (isZoningClassesLoading) {
      return true
    }

    if (!planConf?.data.features) {
      return false
    }

    for (const feature of planConf.data.features) {
      const hasValidZoningCode =
        feature.properties.extras?.hasValidZoningCode ??
        checkIsValidZoningCode(feature.properties.zoning_code ?? '')

      if (!hasValidZoningCode) {
        return false
      }

      if (!checkIsValidLandUseDistribution(feature.properties)) {
        return false
      }
    }

    return true
  }, [isZoningClassesLoading, planConf?.data.features])

  const isCalculationRunning =
    isCalculationMutationPending ||
    (planConf != null &&
      [CalculationState.INITIALIZING, CalculationState.CALCULATING].includes(
        planConf.calculationState
      ))

  const disabledTooltipKey = hasNoFeatures
    ? 'sidebar.plan_settings.calculate_carbon_effect.tooltip_no_features'
    : !areZonesValid
      ? 'sidebar.plan_settings.calculate_carbon_effect.tooltip_invalid'
      : undefined

  const isReportActionEnabled =
    planConf != null &&
    !hasNoFeatures &&
    areZonesValid &&
    !hasPendingLocalLandUseEdits &&
    !isCalculationRunning

  return {
    hasNoFeatures,
    areZonesValid,
    isZoningClassesLoading,
    isCalculationRunning,
    isReportActionEnabled,
    disabledTooltipKey,
  }
}

export default usePlanReportEligibility
