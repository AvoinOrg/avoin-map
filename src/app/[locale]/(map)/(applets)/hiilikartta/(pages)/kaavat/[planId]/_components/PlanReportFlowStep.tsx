'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  ButtonBase,
  CircularProgress,
  Tooltip,
  Typography,
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import { useTranslate } from '@tolgee/react'

import TText from '#/components/common/TText'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import {
  NODE_FLOW_OUTER_OFFSET,
  NODE_FLOW_OUTER_WIDTH,
  NodeFlowButtonState,
  NodeFlowButtonProps,
  NodeFlowButton,
} from '#/components/common/NodeFlow'
import { Delete, Eco, Error as ErrorIcon } from '#/components/icons'
import { pp } from '#/common/utils/general'

import {
  CalculationState,
  PlanConf,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import { getReportCalculatedDate } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'

type PlanReportFlowStepProps = Pick<
  NodeFlowButtonProps,
  'showConnector' | 'showConnectorTop' | 'showConnectorBottom'
> & {
  planConf?: PlanConf
  locale: string
  isReportActionEnabled: boolean
  disabledTooltipKey?: string
  isCalculationRunning: boolean
  onCalculate: () => void
  onOpenReport: () => void
  onResetReportAndRecalculate: () => void
}

type PlanReportFlowStepComponent = React.FC<PlanReportFlowStepProps> & {
  flowNodeMarker?: string
}

const getDefaultYear = (featureYears: string[]) => {
  return featureYears[1] ?? featureYears[0]
}

const PlanReportFlowStepBase = ({
  planConf,
  locale,
  isReportActionEnabled,
  disabledTooltipKey,
  isCalculationRunning,
  onCalculate,
  onOpenReport,
  onResetReportAndRecalculate,
}: PlanReportFlowStepProps) => {
  const { t } = useTranslate('hiilikartta')
  const [selectedYear, setSelectedYear] = useState<string>()

  const reportData = planConf?.reportData
  const featureYears = reportData?.metadata.featureYears ?? []
  const yearOptions = useMemo(
    () => (featureYears.length > 1 ? featureYears.slice(1) : featureYears),
    [featureYears]
  )
  const hasFinishedReport = reportData != null

  useEffect(() => {
    if (reportData == null) {
      setSelectedYear(undefined)
      return
    }

    const nextDefaultYear = getDefaultYear(featureYears)

    setSelectedYear((currentYear) => {
      if (currentYear != null && yearOptions.includes(currentYear)) {
        return currentYear
      }

      return nextDefaultYear
    })
  }, [featureYears, reportData, yearOptions])

  const totals = reportData?.agg.totals

  const totalChange = useMemo(() => {
    if (selectedYear == null || totals == null) {
      return undefined
    }

    const bio = totals.bio_carbon_total_diff[selectedYear]
    const ground = totals.ground_carbon_total_diff[selectedYear]

    if (bio == null || ground == null) {
      return undefined
    }

    return bio + ground
  }, [selectedYear, totals])

  const perHectareChange = useMemo(() => {
    if (selectedYear == null || totals == null) {
      return undefined
    }

    const bio = totals.bio_carbon_ha_diff[selectedYear]
    const ground = totals.ground_carbon_ha_diff[selectedYear]

    if (bio == null || ground == null) {
      return undefined
    }

    return bio + ground
  }, [selectedYear, totals])

  const reportLabel =
    reportData?.metadata.reportName?.trim() || t('report.header.title')

  const formattedCalculatedDate =
    reportData?.metadata.timestamp != null
      ? getReportCalculatedDate(
          reportData.metadata.timestamp
        )?.toLocaleDateString(locale === 'fi' ? 'fi-FI' : locale)
      : undefined

  const calculatedOnLabel =
    formattedCalculatedDate != null
      ? t('sidebar.plan_settings.report_preview.calculated_on', {
          date: formattedCalculatedDate,
        })
      : undefined

  const isErrored = planConf?.calculationState === CalculationState.ERRORED
  const isInitializing =
    planConf?.calculationState === CalculationState.INITIALIZING
  const isCalculating =
    planConf?.calculationState === CalculationState.CALCULATING
  const isInProgress = isCalculationRunning || isInitializing || isCalculating

  let buttonState: NodeFlowButtonState = 'disabled'
  let buttonDisabled = true
  let buttonTitleKey = 'sidebar.plan_flow.calculate_report_step'
  let buttonHelper: string | undefined
  let buttonHelperLeading: React.ReactNode
  let buttonOnClick: (() => void) | undefined

  if (hasFinishedReport) {
    buttonState = 'active'
    buttonDisabled = false
    buttonTitleKey = 'sidebar.plan_settings.report_preview.open_full_report'
    buttonOnClick = onOpenReport
  } else if (isInProgress) {
    buttonState = 'active'
    buttonDisabled = true
    buttonHelper = isInitializing
      ? t('sidebar.my_plans.calculations_starting')
      : t('sidebar.my_plans.calculations_in_progress')
    buttonHelperLeading = (
      <CircularProgress
        size={12}
        thickness={7}
        sx={{ color: '#274AFF', flexShrink: 0 }}
      />
    )
  } else if (isErrored) {
    buttonState = 'error'
    buttonDisabled = !isReportActionEnabled
    buttonHelper = t('sidebar.my_plans.calculations_errored')
    buttonHelperLeading = (
      <ErrorIcon
        sx={{
          width: 12,
          height: 12,
          color: '#7A3D2B',
          flexShrink: 0,
        }}
      />
    )
    buttonOnClick = isReportActionEnabled ? onCalculate : undefined
  } else if (planConf != null && isReportActionEnabled) {
    buttonState = 'available'
    buttonDisabled = false
    buttonOnClick = onCalculate
  }

  const shouldShowTooltip =
    disabledTooltipKey != null &&
    !hasFinishedReport &&
    !isInProgress &&
    !isReportActionEnabled
  const tooltipLabel =
    disabledTooltipKey != null ? t(disabledTooltipKey) : ''

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value)
  }

  const button = (
    <NodeFlowButton
      state={buttonState}
      disabled={buttonDisabled}
      title={<TText keyName={buttonTitleKey} ns="hiilikartta" />}
      leading={
        <Eco
          sx={{
            width: 12,
            height: 12,
            color: buttonState === 'error' ? '#7A3D2B' : '#0D6044',
          }}
        />
      }
      helper={buttonHelper}
      helperLeading={buttonHelperLeading}
      onClick={buttonOnClick}
      ariaLabel={t(buttonTitleKey)}
      disableOuterOffset
    />
  )

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: hasFinishedReport ? '0.875rem' : 0,
        minWidth: 0,
        ml: NODE_FLOW_OUTER_OFFSET,
        width: NODE_FLOW_OUTER_WIDTH,
      }}
    >
      {shouldShowTooltip ? (
        <Tooltip title={tooltipLabel} arrow placement="top">
          <Box sx={{ width: '100%' }}>{button}</Box>
        </Tooltip>
      ) : (
        button
      )}

      {hasFinishedReport && (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9375rem',
              width: '100%',
              px: { mobile: '1rem', desktop: '1.0625rem' },
              py: { mobile: '0.9375rem', desktop: '1rem' },
              borderRadius: '0.625rem',
              backgroundColor: '#EFFBE6',
              boxShadow:
                'inset 0px 0.5px 1px 0px rgba(217, 217, 217, 0.35)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6875rem',
              }}
            >
              <Box
                sx={{
                  width: 17,
                  height: 17,
                  flexShrink: 0,
                  mt: '0.0625rem',
                  borderRadius: '999px',
                  border: '1px solid #0D6044',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Eco
                  sx={{
                    width: 9,
                    height: 9,
                    color: '#0D6044',
                  }}
                />
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    fontWeight: 400,
                    lineHeight: '1.125rem',
                    letterSpacing: '0.1em',
                    color: '#111111',
                    wordBreak: 'break-word',
                  }}
                >
                  {reportLabel}
                </Typography>

                {calculatedOnLabel != null && (
                  <Typography
                    sx={{
                      fontSize: '0.625rem',
                      fontWeight: 400,
                      lineHeight: '1.125rem',
                      letterSpacing: '0.1em',
                      color: '#111111',
                      wordBreak: 'break-word',
                    }}
                  >
                    {calculatedOnLabel}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  minHeight: '2.25rem',
                  pr: '1.25rem',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    lineHeight: '1.125rem',
                    letterSpacing: '0.1em',
                    color: '#111111',
                  }}
                >
                  <TText
                    keyName="sidebar.plan_settings.report_preview.impact_on_carbon_stock"
                    ns="hiilikartta"
                  />
                  :
                </Typography>
                {/* Hidden until the related tooltip copy is ready. */}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    fontWeight: 400,
                    lineHeight: '1.125rem',
                    letterSpacing: '0.1em',
                    color: '#111111',
                  }}
                >
                  <TText
                    keyName="sidebar.plan_settings.report_preview.on_year"
                    ns="hiilikartta"
                  />
                </Typography>

                {selectedYear != null && (
                  <DropDownSelectMinimal
                    ariaLabel={t('sidebar.plan_settings.report_preview.on_year')}
                    value={selectedYear}
                    onChange={handleYearChange}
                    options={yearOptions.map((year) => ({
                      value: year,
                      label: year,
                    }))}
                    sx={{
                      minWidth: '5.625rem',
                      borderRadius: '999px',
                      backgroundColor: '#111111',
                      boxShadow:
                        '0px 1px 1px 0px rgba(189, 189, 189, 0.25)',
                      color: '#F0F0F1',
                      '& .MuiSelect-select': {
                        pl: '0.75rem',
                        pr: '1.75rem !important',
                        py: '0.1875rem',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        lineHeight: '0.875rem',
                        letterSpacing: '0.08em',
                      },
                      '& .MuiSelect-select .MuiTypography-root': {
                        color: '#F0F0F1',
                      },
                      '& .MuiSelect-icon': {
                        color: '#F0F0F1',
                        right: '0.625rem',
                        top: 'calc(50% - 0.21875rem)',
                        width: '0.625rem',
                        height: '0.4375rem',
                      },
                    }}
                    optionSx={{
                      px: '0.75rem',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      lineHeight: '0.875rem',
                      letterSpacing: '0.08em',
                    }}
                  />
                )}
              </Box>

            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {totalChange != null && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '0.75rem',
                    py: '0.3125rem',
                    borderTop: '1px solid rgba(17, 17, 17, 0.14)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.625rem',
                      fontWeight: 400,
                      lineHeight: '1.125rem',
                      letterSpacing: '0.1em',
                      color: '#111111',
                    }}
                  >
                    <TText
                      keyName="sidebar.plan_settings.report_preview.carbon_eqv_unit"
                      ns="hiilikartta"
                    />
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      lineHeight: '1.125rem',
                      letterSpacing: '0.3em',
                      color: '#111111',
                      textAlign: 'right',
                    }}
                  >
                    {pp(totalChange, 0)}
                  </Typography>
                </Box>
              )}

              {perHectareChange != null && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '0.75rem',
                    py: '0.3125rem',
                    borderTop: '1px solid rgba(17, 17, 17, 0.14)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.625rem',
                      fontWeight: 400,
                      lineHeight: '1.125rem',
                      letterSpacing: '0.1em',
                      color: '#111111',
                    }}
                  >
                    <TText
                      keyName="sidebar.plan_settings.report_preview.carbon_eqv_unit_hectare"
                      ns="hiilikartta"
                    />
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      lineHeight: '1.125rem',
                      letterSpacing: '0.3em',
                      color: '#111111',
                      textAlign: 'right',
                    }}
                  >
                    {pp(perHectareChange, 0)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <ButtonBase
            type="button"
            aria-label={t(
              'sidebar.plan_settings.report_preview.reset_and_recalculate'
            )}
            onClick={onResetReportAndRecalculate}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '0.625rem',
              width: 'fit-content',
              maxWidth: '100%',
              mt: 1,
              px: 1.3,
              py: 0,
              color: '#111111',
              textAlign: 'left',
              '&:hover': {
                color: '#0D6044',
              },
            }}
          >
            <Delete
              sx={{
                width: 12,
                height: 12,
                color: 'inherit',
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: '0.625rem',
                fontWeight: 700,
                lineHeight: '1rem',
                letterSpacing: '0.1em',
                color: 'inherit',
              }}
            >
              <TText
                keyName="sidebar.plan_settings.report_preview.reset_and_recalculate"
                ns="hiilikartta"
              />
            </Typography>
          </ButtonBase>
        </>
      )}
    </Box>
  )
}

const PlanReportFlowStep =
  PlanReportFlowStepBase as PlanReportFlowStepComponent

PlanReportFlowStep.flowNodeMarker = 'flow-node'

export default PlanReportFlowStep
