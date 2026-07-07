'use client'

import React, { useMemo, useState } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import { useTranslate } from '@tolgee/react'

import { Box, type AppBoxProps, toSxArray } from '#/common/style/theme'
import { ButtonBase } from '#/components/common/Button'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import TText from '#/components/common/TText'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import { LoadingSpinner } from '#/components/Loading'
import {
  NODE_FLOW_OUTER_OFFSET,
  NODE_FLOW_OUTER_WIDTH,
  NodeFlowStatus,
  NodeFlowButtonProps,
  NodeFlowButton,
} from '#/components/common/NodeFlow'
import { Delete, Eco, Error as ErrorIcon } from '#/components/icons'
import { pp } from '#/common/utils/general'

import {
  CalculationState,
  PlanConf,
} from 'applets/hiilikartta/common/types'
import { getReportCalculatedDate } from 'applets/hiilikartta/common/utils'
import {
  PLAN_ACTION_BUTTON_COLOR,
  PLAN_ACTION_BUTTON_HOVER_COLOR,
} from './PlanActionFooter'

type PlanReportFlowStepProps = Pick<
  NodeFlowButtonProps,
  'showConnector' | 'showConnectorTop' | 'showConnectorBottom'
> & {
  planConf?: PlanConf
  locale: string
  isReportActionEnabled: boolean
  disabledTooltipKey?: string
  disabledTooltipOpen?: boolean
  isCalculationRunning: boolean
  onCalculate: () => void
  onOpenReport: () => void
  onResetReportAndRecalculate: () => void
}

type PlanReportFlowStepComponent = React.FC<PlanReportFlowStepProps> & {
  flowNodeMarker?: string
}

type SelectedReportYear = {
  reportKey: string
  year: string
}

const EMPTY_FEATURE_YEARS: string[] = []

const getDefaultYear = (featureYears: string[]): string | undefined => {
  return featureYears[1] ?? featureYears[0]
}

type ReportTextProps = {
  children: React.ReactNode
  component?: React.ElementType
  sx?: AppBoxProps['sx']
}

type TooltipTriggerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'color'
> & {
  ref?: React.Ref<HTMLDivElement>
}

const REPORT_TEXT_SX = {
  m: 0,
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
  color: '#111111',
}

const ReportText = ({ children, component = 'span', sx }: ReportTextProps) => (
  <Box component={component} sx={[REPORT_TEXT_SX, ...toSxArray(sx)]}>
    {children}
  </Box>
)

const DisabledReportTooltip = ({
  title,
  open,
  children,
}: {
  title: React.ReactNode
  open?: boolean
  children: React.ReactNode
}) => {
  const rootProps = open === undefined ? {} : { open }

  return (
    <Tooltip.Root {...rootProps}>
      <Tooltip.Trigger
        delay={0}
        closeDelay={0}
        render={(triggerProps) => {
          const {
            color: ignoredColor,
            type: ignoredType,
            ...resolvedTriggerProps
          } = triggerProps as TooltipTriggerProps & {
            color?: string
            type?: string
          }
          void ignoredColor
          void ignoredType

          return (
            <Box
              {...resolvedTriggerProps}
              data-slot="plan-report-disabled-tooltip-trigger"
              sx={{ width: '100%' }}
            >
              {children}
            </Box>
          )
        }}
      />
      <Tooltip.Portal>
        <Tooltip.Positioner
          side="top"
          sideOffset={8}
          style={{ zIndex: 1500, pointerEvents: 'none' }}
        >
          <Tooltip.Popup
            style={{ position: 'relative', pointerEvents: 'none' }}
            render={(popupProps) => (
              <Box
                {...popupProps}
                role="tooltip"
                data-slot="plan-report-disabled-tooltip"
                sx={{
                  maxWidth: 240,
                  px: 1,
                  py: 0.75,
                  borderRadius: '5px',
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  lineHeight: 1.35,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
                }}
              >
                {title}
                <Tooltip.Arrow
                  render={(arrowProps) => (
                    <Box
                      {...arrowProps}
                      sx={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        bottom: -4,
                        left: 'calc(50% - 4px)',
                        backgroundColor: '#111111',
                        transform: 'rotate(45deg)',
                      }}
                    />
                  )}
                />
              </Box>
            )}
          />
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

const PlanReportFlowStepBase = ({
  planConf,
  locale,
  isReportActionEnabled,
  disabledTooltipKey,
  disabledTooltipOpen,
  isCalculationRunning,
  onCalculate,
  onOpenReport,
  onResetReportAndRecalculate,
}: PlanReportFlowStepProps) => {
  const { t } = useTranslate('hiilikartta')
  const [selectedYearState, setSelectedYearState] =
    useState<SelectedReportYear>()

  const reportData = planConf?.reportData
  const featureYears = reportData?.metadata.featureYears ?? EMPTY_FEATURE_YEARS
  const yearOptions = useMemo(
    () => (featureYears.length > 1 ? featureYears.slice(1) : featureYears),
    [featureYears]
  )
  const hasFinishedReport = reportData != null
  const reportSelectionKey =
    reportData == null
      ? undefined
      : `${reportData.metadata.timestamp}:${featureYears.join('|')}`
  const selectedYear =
    reportSelectionKey != null &&
    selectedYearState?.reportKey === reportSelectionKey &&
    yearOptions.includes(selectedYearState.year)
      ? selectedYearState.year
      : reportData != null
        ? getDefaultYear(featureYears)
        : undefined

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

  let buttonStatus: NodeFlowStatus = 'incomplete'
  let buttonDisabled = true
  let buttonTitleKey = 'sidebar.plan_flow.calculate_report_step'
  let buttonHelper: string | undefined
  let buttonHelperLeading: React.ReactNode
  let buttonOnClick: (() => void) | undefined

  if (hasFinishedReport) {
    buttonStatus = 'complete'
    buttonDisabled = false
    buttonTitleKey = 'sidebar.plan_settings.report_preview.open_full_report'
    buttonOnClick = onOpenReport
  } else if (isInProgress) {
    buttonStatus = 'incomplete'
    buttonDisabled = true
    buttonHelper = isInitializing
      ? t('sidebar.my_plans.calculations_starting')
      : t('sidebar.my_plans.calculations_in_progress')
    buttonHelperLeading = (
      <LoadingSpinner
        size={12}
        thickness={7}
        color="inherit"
        data-visual-mask="plan-report-spinner"
        sx={{ color: '#274AFF', flexShrink: 0 }}
      />
    )
  } else if (isErrored) {
    buttonStatus = 'error'
    buttonDisabled = !isReportActionEnabled
    buttonHelper = t('sidebar.my_plans.calculations_errored')
    buttonHelperLeading = (
      <ErrorIcon
        sx={{
          width: 12,
          height: 12,
          color: !isReportActionEnabled ? 'rgba(17, 17, 17, 0.4)' : '#7A3D2B',
          flexShrink: 0,
        }}
      />
    )
    buttonOnClick = isReportActionEnabled ? onCalculate : undefined
  } else if (planConf != null && isReportActionEnabled) {
    buttonStatus = 'incomplete'
    buttonDisabled = false
    buttonOnClick = onCalculate
  }

  const shouldShowTooltip =
    disabledTooltipKey != null &&
    !hasFinishedReport &&
    !isInProgress &&
    !isReportActionEnabled
  const tooltipLabel = disabledTooltipKey != null ? t(disabledTooltipKey) : ''
  const buttonAccentColor = buttonDisabled
    ? 'rgba(17, 17, 17, 0.4)'
    : buttonStatus === 'error'
      ? '#7A3D2B'
      : '#0D6044'

  const handleYearChange = (event: DropDownValueChangeEvent) => {
    if (reportSelectionKey == null) {
      return
    }

    setSelectedYearState({
      reportKey: reportSelectionKey,
      year: event.target.value,
    })
  }

  const button = (
    <NodeFlowButton
      dataSlot="plan-report-action"
      status={buttonStatus}
      disabled={buttonDisabled}
      title={<TText keyName={buttonTitleKey} ns="hiilikartta" />}
      leading={
        hasFinishedReport ? (
          <Eco
            sx={{
              width: 12,
              height: 12,
              color: buttonAccentColor,
            }}
          />
        ) : undefined
      }
      helper={buttonHelper}
      helperLeading={buttonHelperLeading}
      helperSx={{
        pl: 1.6,
      }}
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
        <DisabledReportTooltip title={tooltipLabel} open={disabledTooltipOpen}>
          {button}
        </DisabledReportTooltip>
      ) : (
        button
      )}

      {hasFinishedReport && (
        <>
          <Box
            data-slot="plan-report-preview"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9375rem',
              width: '100%',
              px: { mobile: '1rem', desktop: '1.0625rem' },
              py: { mobile: '0.9375rem', desktop: '1rem' },
              borderRadius: '0.625rem',
              backgroundColor: '#EFFBE6',
              boxShadow: 'inset 0px 0.5px 1px 0px rgba(217, 217, 217, 0.35)',
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
                  mt: '0.25rem',
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
                <ReportText
                  component="p"
                  sx={{
                    wordBreak: 'break-word',
                  }}
                >
                  {reportLabel}
                </ReportText>

                {calculatedOnLabel != null && (
                  <ReportText
                    component="p"
                    sx={{
                      wordBreak: 'break-word',
                    }}
                  >
                    {calculatedOnLabel}
                  </ReportText>
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
                <ReportText
                  component="p"
                  sx={{
                    fontSize: '0.75rem',
                  }}
                >
                  <TText
                    keyName="sidebar.plan_settings.report_preview.impact_on_carbon_stock"
                    ns="hiilikartta"
                  />
                  :
                </ReportText>
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
                <ReportText>
                  <TText
                    keyName="sidebar.plan_settings.report_preview.on_year"
                    ns="hiilikartta"
                  />
                </ReportText>

                {selectedYear != null && (
                  <DropDownSelectMinimal
                    ariaLabel={t(
                      'sidebar.plan_settings.report_preview.on_year'
                    )}
                    value={selectedYear}
                    onChange={handleYearChange}
                    options={yearOptions.map((year) => ({
                      value: year,
                      label: year,
                    }))}
                    sx={{
                      backgroundColor: '#111111',
                      boxShadow: '0px 1px 1px 0px rgba(189, 189, 189, 0.25)',
                      color: '#F0F0F1',
                    }}
                    selectedValueSx={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      lineHeight: '0.875rem',
                      letterSpacing: '0.08em',
                    }}
                    optionSx={{
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
                  <ReportText>
                    <TText
                      keyName="sidebar.plan_settings.report_preview.carbon_eqv_unit"
                      ns="hiilikartta"
                    />
                  </ReportText>

                  <ReportText
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.3em',
                      textAlign: 'right',
                    }}
                  >
                    {pp(totalChange, 0)}
                  </ReportText>
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
                  <ReportText>
                    <TText
                      keyName="sidebar.plan_settings.report_preview.carbon_eqv_unit_hectare"
                      ns="hiilikartta"
                    />
                  </ReportText>

                  <ReportText
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.3em',
                      textAlign: 'right',
                    }}
                  >
                    {pp(perHectareChange, 0)}
                  </ReportText>
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
              color: PLAN_ACTION_BUTTON_COLOR,
              textAlign: 'left',
              '&:hover': {
                color: PLAN_ACTION_BUTTON_HOVER_COLOR,
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
            <ReportText
              sx={{
                fontSize: '0.625rem',
                fontWeight: 700,
                lineHeight: '1rem',
                color: 'inherit',
              }}
            >
              <TText
                keyName="sidebar.plan_settings.report_preview.reset_and_recalculate"
                ns="hiilikartta"
              />
            </ReportText>
          </ButtonBase>
        </>
      )}
    </Box>
  )
}

const PlanReportFlowStep = PlanReportFlowStepBase as PlanReportFlowStepComponent

PlanReportFlowStep.flowNodeMarker = 'flow-node'

export default PlanReportFlowStep
