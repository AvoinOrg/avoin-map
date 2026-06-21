'use client'

import React, { useEffect, useState } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import { useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/common/style/theme'
import { getRoute } from '#/common/routing/routing-client'
import { ButtonBase } from '#/components/common/Button'
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
import ZoneAccordion from './_components/ZoneAccordion'

const CONTENT_PADDING_X = { mobile: '2.5rem', desktop: '2.5rem' } as const
const SIDEBAR_BACKGROUND = '#F3F3F3'
const ACTION_BUTTON_MIN_WIDTH = '8rem'
const ACTION_BUTTON_HEIGHT = '1.25rem'

type TooltipTriggerProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'color'
> & {
  ref?: React.Ref<HTMLSpanElement>
}

const DisabledZoneCalculateTooltip = ({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) => {
  if (title == null) {
    return <>{children}</>
  }

  return (
    <Tooltip.Root>
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
              component="span"
              {...resolvedTriggerProps}
              data-slot="zone-calculate-disabled-tooltip-trigger"
              sx={{
                display: 'inline-flex',
              }}
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
                data-slot="zone-calculate-disabled-tooltip"
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
        sxOuter={{
          height: '100%',
          backgroundColor: SIDEBAR_BACKGROUND,
        }}
        sxInner={{
          p: 0,
          px: 0,
          height: '100%',
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

  const actionButton = (
    <ButtonBase
      type="button"
      data-slot="zone-calculate-action"
      aria-label={t('sidebar.plan_settings.areas.confirm_and_calculate')}
      disabled={!isReportActionEnabled}
      onClick={isReportActionEnabled ? handleSubmit : undefined}
      sx={{
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
        '&:disabled, &[data-disabled], &[aria-disabled="true"]': {
          color: '#808080',
          opacity: 1,
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        component="span"
        sx={{
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
          data-visual-mask="zone-calculate-spinner"
          size={12}
          thickness={6}
          color="inherit"
          sx={{
            color: 'inherit',
            flexShrink: 0,
          }}
        />
      )}
    </ButtonBase>
  )

  return (
    <SidebarContentBox
      scrollFadeColor={SIDEBAR_BACKGROUND}
      sxOuter={{
        height: '100%',
        backgroundColor: SIDEBAR_BACKGROUND,
      }}
      sxInner={{
        p: 0,
        px: 0,
        height: '100%',
        minHeight: '100%',
        backgroundColor: SIDEBAR_BACKGROUND,
      }}
    >
      <Box
        className="plan-sidebar-container"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '100%',
          width: '100%',
          backgroundColor: SIDEBAR_BACKGROUND,
        }}
      >
        <Box
          sx={{
            px: CONTENT_PADDING_X,
            pt: { mobile: '2.5rem', desktop: '2.5rem' },
            pb: { mobile: '1.75rem', desktop: '1.75rem' },
          }}
        >
          <Box
            component="p"
            sx={{
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
            sx={{
              mt: '0.5rem',
              mb: '1rem',
              height: '1px',
              width: '100%',
              backgroundColor: '#D6D6D6',
            }}
          />

          <Box
            component="p"
            sx={{
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
          sx={{
            mt: 'auto',
            px: CONTENT_PADDING_X,
            pt: '4rem',
            pb: { mobile: '5.5rem', desktop: '2.5rem' },
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <DisabledZoneCalculateTooltip
            title={
              disabledTooltipKey != null ? t(disabledTooltipKey) : null
            }
          >
            {actionButton}
          </DisabledZoneCalculateTooltip>
        </Box>
      </Box>
    </SidebarContentBox>
  )
}

export default Page
