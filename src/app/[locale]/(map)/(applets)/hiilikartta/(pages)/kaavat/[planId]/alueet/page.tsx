'use client'

import React, { useEffect, useState } from 'react'
import { Box, CircularProgress, Tooltip, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useTranslate } from '@tolgee/react'

import { getRoute } from '#/common/routing/routing-client'
import TText from '#/components/common/TText'
import { ArrowNextBig } from '#/components/icons'
import { LoadingSpinner } from '#/components/Loading'
import SidebarContentBox from '#/components/Sidebar/SidebarContentBox'

import useAppletStoreHasHydrated from '#/app/[locale]/(map)/(applets)/hiilikartta/common/useAppletStoreHasHydrated'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
import { routeTree } from '#/common/routing/routes/hiilikartta'
import {
  GlobalState,
  PlanConfState,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import { calcPostMutation } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/queries/calcPostMutation'
import usePlanReportEligibility from '#/app/[locale]/(map)/(applets)/hiilikartta/common/usePlanReportEligibility'
import ZoneAccordion from './_components/ZoneAccordion'

const CONTENT_PADDING_X = { mobile: '1.25rem', desktop: '2.5rem' } as const
const SIDEBAR_BACKGROUND = '#F3F3F3'

const Page = () => {
  const params = useParams<{ planId: string }>()
  const hasHydrated = useAppletStoreHasHydrated()
  const planConf = useAppletStore((state) => state.planConfs[params.planId])
  const globalState = useAppletStore((state) => state.globalState)
  const placeholderPlanConfs = useAppletStore(
    (state) => state.placeholderPlanConfs
  )
  const updatePlanConf = useAppletStore((state) => state.updatePlanConf)
  const calcPost = useMutation(calcPostMutation())
  const router = useRouter()
  const { t } = useTranslate('hiilikartta')
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasPendingLandUseEdits, setHasPendingLandUseEdits] = useState(false)
  const {
    disabledTooltipKey,
    hasNoFeatures,
    isCalculationRunning,
    isReportActionEnabled,
  } = usePlanReportEligibility({
    hasPendingLocalLandUseEdits: hasPendingLandUseEdits,
    planConf,
    isCalculationMutationPending: calcPost.isPending,
  })

  const handleSubmit = async () => {
    if (!planConf || !isReportActionEnabled) {
      return
    }

    const nextPlanConf =
      planConf.reportData != null
        ? {
            ...planConf,
            reportData: undefined,
          }
        : planConf

    if (planConf.reportData != null) {
      await updatePlanConf(planConf.id, { reportData: undefined })
    }

    calcPost.mutate(nextPlanConf)

    router.push(
      getRoute({
        routeNode: routeTree.plans.plan,
        routeTree,
        params: {
          routeParams: { planId: planConf.id },
        },
      })
    )
  }

  useEffect(() => {
    if (!hasHydrated) {
      setIsLoaded(false)
      return
    }

    if (planConf == null) {
      if (
        globalState === GlobalState.FETCHING &&
        !Object.keys(placeholderPlanConfs).includes(params.planId)
      ) {
        router.push(getRoute({ routeNode: routeTree.plans, routeTree }))
      } else if (globalState === GlobalState.IDLE) {
        router.push(getRoute({ routeNode: routeTree.plans, routeTree }))
      }

      setIsLoaded(false)
      return
    }

    if (globalState === GlobalState.IDLE && planConf.isHidden) {
      router.push(getRoute({ routeNode: routeTree, routeTree }))
      setIsLoaded(false)
      return
    }

    if (
      planConf.state == null ||
      [PlanConfState.IDLE, PlanConfState.SAVING].includes(planConf.state)
    ) {
      setIsLoaded(true)
      return
    }

    setIsLoaded(false)
  }, [
    globalState,
    hasHydrated,
    params.planId,
    planConf,
    placeholderPlanConfs,
    router,
  ])

  useEffect(() => {
    setHasPendingLandUseEdits(false)
  }, [planConf?.id])

  if (!hasHydrated || !isLoaded || !planConf) {
    return (
      <SidebarContentBox
        scrollFadeColor={SIDEBAR_BACKGROUND}
        sxOuter={{ backgroundColor: SIDEBAR_BACKGROUND }}
        sxInner={{
          p: 0,
          px: 0,
          backgroundColor: SIDEBAR_BACKGROUND,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            mt: 9,
          }}
        >
          <LoadingSpinner />
        </Box>
      </SidebarContentBox>
    )
  }

  return (
    <Box
      className="plan-sidebar-container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: SIDEBAR_BACKGROUND,
      }}
    >
      <SidebarContentBox
        scrollFadeColor={SIDEBAR_BACKGROUND}
        sxOuter={{ backgroundColor: SIDEBAR_BACKGROUND }}
        sxInner={{
          p: 0,
          px: 0,
          backgroundColor: SIDEBAR_BACKGROUND,
        }}
      >
        <Box
          sx={{
            px: CONTENT_PADDING_X,
            pt: { mobile: '1.5rem', desktop: '2.5rem' },
            pb: { mobile: '1.5rem', desktop: '1.75rem' },
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 400,
              lineHeight: '1.125rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#075CFF',
            }}
          >
            <TText
              keyName="sidebar.plan_settings.areas.title"
              ns="hiilikartta"
            />
          </Typography>

          <Box
            sx={{
              mt: '0.5rem',
              mb: '1rem',
              height: '1px',
              width: '100%',
              backgroundColor: '#D6D6D6',
            }}
          />

          <Typography
            sx={{
              maxWidth: '16.25rem',
              fontSize: '0.75rem',
              lineHeight: '1.125rem',
              letterSpacing: '0.04em',
              color: '#111111',
            }}
          >
            <TText
              keyName="sidebar.plan_settings.areas.description"
              ns="hiilikartta"
            />
          </Typography>
        </Box>

        <ZoneAccordion
          planConfId={planConf.id}
          onPendingLandUseEditsChange={setHasPendingLandUseEdits}
          sx={{ pb: '1.5rem' }}
        />
      </SidebarContentBox>

      <Box
        sx={{
          px: CONTENT_PADDING_X,
          py: { mobile: '1rem', desktop: '1.25rem' },
          borderTop: '1px solid #D6D6D6',
          backgroundColor: SIDEBAR_BACKGROUND,
        }}
      >
        <Tooltip
          title={disabledTooltipKey != null ? t(disabledTooltipKey) : ''}
          disableHoverListener={disabledTooltipKey == null}
          disableFocusListener={disabledTooltipKey == null}
          disableTouchListener={disabledTooltipKey == null}
        >
          <Box
            component="button"
            type="button"
            aria-label={t('sidebar.plan_settings.areas.confirm_and_calculate')}
            disabled={!isReportActionEnabled}
            onClick={isReportActionEnabled ? handleSubmit : undefined}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              p: 0,
              border: 'none',
              background: 'none',
              textAlign: 'left',
              color:
                hasNoFeatures || !isReportActionEnabled ? '#A0A0A0' : '#111111',
              cursor: !isReportActionEnabled ? 'default' : 'pointer',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.75rem',
                lineHeight: '1rem',
                letterSpacing: '0.04em',
                color: 'inherit',
              }}
            >
              <TText
                keyName="sidebar.plan_settings.areas.confirm_and_calculate"
                ns="hiilikartta"
              />
            </Typography>

            {isCalculationRunning ? (
              <CircularProgress
                size={18}
                sx={{
                  color: 'inherit',
                  flexShrink: 0,
                }}
              />
            ) : (
              <ArrowNextBig
                sx={{
                  width: 10,
                  height: 18,
                  color: 'inherit',
                  flexShrink: 0,
                }}
              />
            )}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default Page
