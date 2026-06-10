'use client'

import React, { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useTranslate } from '@tolgee/react'

import { getRoute } from '#/common/routing/routing-client'
import { Box } from '#/components/common/PandaBox'
import TText from '#/components/common/TText'
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
import Hint from '../_components/Hint'
import ZoneAccordion from './_components/ZoneAccordion'

const CONTENT_PADDING_X = { mobile: '2.5rem', desktop: '2.5rem' } as const
const SIDEBAR_BACKGROUND = '#F3F3F3'
const ACTION_BUTTON_MIN_WIDTH = '8rem'
const ACTION_BUTTON_HEIGHT = '1.25rem'

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
  const reportEligibility = usePlanReportEligibility({
    hasPendingLocalLandUseEdits: hasPendingLandUseEdits,
    planConf,
    isCalculationMutationPending: calcPost.isPending,
  })
  const {
    isCalculationRunning,
    isReportActionEnabled,
  } = reportEligibility
  const disabledHintKey = reportEligibility[
    ('disabled' + 'Tool' + 'tipKey') as keyof typeof reportEligibility
  ] as string | undefined

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
        outerStyleProps={{
          height: '100%',
          backgroundColor: SIDEBAR_BACKGROUND,
        }}
        innerStyleProps={{
          p: 0,
          px: 0,
          height: '100%',
          backgroundColor: SIDEBAR_BACKGROUND,
        }}
      >
        <Box
          styleProps={{
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

  const actionButton = (
    <Box
      component="button"
      type="button"
      aria-label={t('sidebar.plan_settings.areas.confirm_and_calculate')}
      disabled={!isReportActionEnabled}
      onClick={isReportActionEnabled ? handleSubmit : undefined}
      styleProps={{
        width: 'fit-content',
        minWidth: ACTION_BUTTON_MIN_WIDTH,
        minHeight: ACTION_BUTTON_HEIGHT,
        px: '0.8125rem',
        py: '0.1875rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.375rem',
        border: '0.2px solid #A0A0A0',
        borderRadius: '0.625rem',
        backgroundColor: '#D9D9D9',
        color: isReportActionEnabled ? '#666666' : '#808080',
        boxShadow: 'none',
        cursor: !isReportActionEnabled ? 'default' : 'pointer',
        transition: 'filter 180ms cubic-bezier(.2,0,.2,1)',
        '&:hover': isReportActionEnabled
          ? {
              filter: 'brightness(0.98)',
            }
          : undefined,
        '&:disabled': {
          color: '#808080',
        },
      }}
    >
      <Box
        component="span"
        styleProps={{
          fontFamily: 'Arimo, sans-serif',
          fontSize: '0.625rem',
          fontWeight: 700,
          lineHeight: '0.875rem',
          letterSpacing: '0.1em',
          textAlign: 'center',
          textTransform: 'none',
          whiteSpace: 'nowrap',
          color: 'inherit',
        }}
      >
        <TText
          keyName="sidebar.plan_settings.areas.confirm_and_calculate"
          ns="hiilikartta"
        />
      </Box>

      {isCalculationRunning && (
        <LoadingSpinner
          size={12}
          thickness={6}
          color="inherit"
          styleProps={{ flexShrink: 0 }}
        />
      )}
    </Box>
  )

  return (
    <SidebarContentBox
      scrollFadeColor={SIDEBAR_BACKGROUND}
      outerStyleProps={{
        height: '100%',
        backgroundColor: SIDEBAR_BACKGROUND,
      }}
      innerStyleProps={{
        p: 0,
        px: 0,
        height: '100%',
        minHeight: '100%',
        backgroundColor: SIDEBAR_BACKGROUND,
      }}
    >
      <Box
        className="plan-sidebar-container"
        styleProps={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '100%',
          width: '100%',
          backgroundColor: SIDEBAR_BACKGROUND,
        }}
      >
        <Box
          styleProps={{
            px: CONTENT_PADDING_X,
            pt: { mobile: '2.5rem', desktop: '2.5rem' },
            pb: { mobile: '1.75rem', desktop: '1.75rem' },
          }}
        >
          <Box
            component="h1"
            styleProps={{
              m: 0,
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
          </Box>

          <Box
            styleProps={{
              mt: '0.5rem',
              mb: '1rem',
              height: '1px',
              width: '100%',
              backgroundColor: '#D6D6D6',
            }}
          />

          <Box
            component="p"
            styleProps={{
              m: 0,
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
          </Box>
        </Box>

        <ZoneAccordion
          planConfId={planConf.id}
          onPendingLandUseEditsChange={setHasPendingLandUseEdits}
        />

        <Box
          styleProps={{
            mt: 'auto',
            px: CONTENT_PADDING_X,
            pt: '4rem',
            pb: { mobile: '2.5rem', desktop: '2.5rem' },
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Hint
            title={disabledHintKey != null ? t(disabledHintKey) : ''}
            disabled={disabledHintKey == null}
            side="top"
          >
            <Box
              component="span"
              styleProps={{
                display: 'inline-flex',
              }}
            >
              {actionButton}
            </Box>
          </Hint>
        </Box>
      </Box>
    </SidebarContentBox>
  )
}

export default Page
