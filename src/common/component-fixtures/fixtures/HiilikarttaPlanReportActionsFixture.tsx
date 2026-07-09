'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import {
  CalculationState,
  type PlanConf,
  type ReportData,
} from 'applets/carbon/common/types'
import PlanActionFooter from 'applets/carbon/pages/kaavat/plan/_components/PlanActionFooter'
import PlanReportFlowStep from 'applets/carbon/pages/kaavat/plan/_components/PlanReportFlowStep'

const noop = () => {}

const emptyPlanData = {
  type: 'FeatureCollection',
  features: [],
} satisfies PlanConf['data']

const emptyCalcFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
} satisfies ReportData['areas']

const createReportData = ({
  reportName = 'Fixture report',
  featureYears = ['2024', '2030', '2040'],
  timestamp = Date.UTC(2026, 0, 15, 12),
  totalBio = { '2024': 0, '2030': 12, '2040': 32 },
  totalGround = { '2024': 0, '2030': 8, '2040': 18 },
  hectareBio = { '2024': 0, '2030': 2, '2040': 5 },
  hectareGround = { '2024': 0, '2030': 1, '2040': 3 },
}: {
  reportName?: string
  featureYears?: string[]
  timestamp?: number
  totalBio?: Record<string, number>
  totalGround?: Record<string, number>
  hectareBio?: Record<string, number>
  hectareGround?: Record<string, number>
} = {}): ReportData => ({
  areas: emptyCalcFeatureCollection,
  totals: emptyCalcFeatureCollection,
  metadata: {
    timestamp,
    reportName,
    featureYears,
  },
  agg: {
    totals: {
      bio_carbon_total_diff: totalBio,
      ground_carbon_total_diff: totalGround,
      bio_carbon_ha_diff: hectareBio,
      ground_carbon_ha_diff: hectareGround,
    },
  },
})

const createPlanConf = ({
  id = 'fixture-plan',
  name = 'Fixture plan',
  calculationState = CalculationState.NOT_STARTED,
  reportData,
}: {
  id?: string
  name?: string
  calculationState?: CalculationState
  reportData?: ReportData
} = {}): PlanConf => ({
  id,
  serverId: `${id}-server`,
  created: Date.UTC(2025, 10, 4, 9),
  name,
  areaHa: 12.4,
  data: emptyPlanData,
  calculationState,
  reportData,
})

const reportBaseProps = {
  locale: 'en',
  onCalculate: noop,
  onOpenReport: noop,
  onResetReportAndRecalculate: noop,
}

const PlanReportFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 360,
      maxWidth: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
    }}
  >
    {children}
  </Box>
)

const PlanFooterFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 320,
      maxWidth: '100%',
      p: 2,
      backgroundColor: '#ffffff',
    }}
  >
    {children}
  </Box>
)

export const hiilikarttaPlanReportActionsFixture: ComponentFixture = {
  id: 'hiilikartta-plan-report-actions',
  label: 'Hiilikartta plan report actions',
  description:
    'Plan report flow and footer action states for the Hiilikartta authoring flow.',
  sourceGlobs: [
    'src/applets/carbon/pages/kaavat/plan/_components/PlanReportFlowStep.tsx',
    'src/applets/carbon/pages/kaavat/plan/_components/PlanActionFooter.tsx',
    'src/common/component-fixtures/fixtures/HiilikarttaPlanReportActionsFixture.tsx',
  ],
  states: [
    {
      id: 'report-disabled-tooltip',
      label: 'Report disabled tooltip',
      description:
        'Incomplete report action with the disabled prerequisite tooltip forced open.',
      waitFor: '[data-slot="plan-report-disabled-tooltip"]',
      wrapper: PlanReportFixtureWrapper,
      render: () => (
        <PlanReportFlowStep
          {...reportBaseProps}
          planConf={createPlanConf()}
          isReportActionEnabled={false}
          disabledTooltipKey="sidebar.plan_settings.calculate_carbon_effect.tooltip_no_features"
          disabledTooltipOpen
          isCalculationRunning={false}
        />
      ),
    },
    {
      id: 'report-initializing',
      label: 'Report initializing',
      description:
        'Report calculation has been queued and shows starting copy.',
      maskSelectors: ['[data-visual-mask="plan-report-spinner"]'],
      wrapper: PlanReportFixtureWrapper,
      render: () => (
        <PlanReportFlowStep
          {...reportBaseProps}
          planConf={createPlanConf({
            calculationState: CalculationState.INITIALIZING,
          })}
          isReportActionEnabled
          isCalculationRunning={false}
        />
      ),
    },
    {
      id: 'report-calculating',
      label: 'Report calculating',
      description:
        'Report calculation in progress with spinner and helper text.',
      maskSelectors: ['[data-visual-mask="plan-report-spinner"]'],
      wrapper: PlanReportFixtureWrapper,
      render: () => (
        <PlanReportFlowStep
          {...reportBaseProps}
          planConf={createPlanConf({
            calculationState: CalculationState.CALCULATING,
          })}
          isReportActionEnabled
          isCalculationRunning
        />
      ),
    },
    {
      id: 'report-errored',
      label: 'Report errored',
      description:
        'Errored report action remains retryable when prerequisites pass.',
      wrapper: PlanReportFixtureWrapper,
      render: () => (
        <PlanReportFlowStep
          {...reportBaseProps}
          planConf={createPlanConf({
            calculationState: CalculationState.ERRORED,
          })}
          isReportActionEnabled
          isCalculationRunning={false}
        />
      ),
    },
    {
      id: 'report-finished',
      label: 'Report finished',
      description:
        'Finished report preview with calculated date, default year, metrics, and reset action.',
      wrapper: PlanReportFixtureWrapper,
      render: () => (
        <PlanReportFlowStep
          {...reportBaseProps}
          planConf={createPlanConf({
            calculationState: CalculationState.FINISHED,
            reportData: createReportData(),
          })}
          isReportActionEnabled
          isCalculationRunning={false}
        />
      ),
    },
    {
      id: 'report-finished-alternate-year',
      label: 'Report finished alternate year',
      description:
        'Finished report preview where the default selectable year and metrics differ.',
      wrapper: PlanReportFixtureWrapper,
      render: () => (
        <PlanReportFlowStep
          {...reportBaseProps}
          planConf={createPlanConf({
            calculationState: CalculationState.FINISHED,
            reportData: createReportData({
              reportName: 'Long range fixture report',
              featureYears: ['2024', '2040'],
              totalBio: { '2024': 0, '2040': -22 },
              totalGround: { '2024': 0, '2040': 11 },
              hectareBio: { '2024': 0, '2040': -4 },
              hectareGround: { '2024': 0, '2040': 2 },
            }),
          })}
          isReportActionEnabled
          isCalculationRunning={false}
        />
      ),
    },
    {
      id: 'footer-copy-delete',
      label: 'Footer copy and delete',
      description: 'Plan footer with copy and delete actions visible.',
      wrapper: PlanFooterFixtureWrapper,
      render: () => (
        <PlanActionFooter showCopy showDelete onCopy={noop} onDelete={noop} />
      ),
    },
    {
      id: 'footer-login-cloud',
      label: 'Footer login cloud action',
      description: 'Plan footer prompting a signed-out user to log in.',
      wrapper: PlanFooterFixtureWrapper,
      render: () => (
        <PlanActionFooter
          showCloudAction
          cloudActionKind="login"
          cloudActionLabel="Log in to save"
          onCloudAction={noop}
        />
      ),
    },
    {
      id: 'footer-save-cloud',
      label: 'Footer save cloud action',
      description: 'Plan footer with an enabled cloud save action.',
      wrapper: PlanFooterFixtureWrapper,
      render: () => (
        <PlanActionFooter
          showCloudAction
          cloudActionKind="save"
          cloudActionLabel="Save to cloud"
          onCloudAction={noop}
        />
      ),
    },
    {
      id: 'footer-disabled-cloud',
      label: 'Footer disabled cloud action',
      description: 'Plan footer with the cloud action visible but disabled.',
      wrapper: PlanFooterFixtureWrapper,
      render: () => (
        <PlanActionFooter
          showCloudAction
          cloudActionKind="save"
          cloudActionLabel="Save to cloud"
          isCloudActionDisabled
          onCloudAction={noop}
        />
      ),
    },
    {
      id: 'footer-last-saved',
      label: 'Footer last saved label',
      description:
        'Plan footer with cloud save action and last-saved metadata.',
      wrapper: PlanFooterFixtureWrapper,
      render: () => (
        <PlanActionFooter
          showCloudAction
          cloudActionKind="save"
          cloudActionLabel="Saved to cloud"
          lastSavedLabel="Saved Jan 15, 2026, 12:00"
          onCloudAction={noop}
        />
      ),
    },
  ],
}
