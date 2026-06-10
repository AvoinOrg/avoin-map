'use client'

import React from 'react'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/components/common/PandaBox'
import MutableLink from '#/components/common/MutableLink'
import { CircleArrowRight, Error as ErrorIcon, Info } from '#/components/icons'
import { LoadingSpinner } from '#/components/Loading'
import { routeTree } from '#/common/routing/routes/hiilikartta'

import { CalculationState } from '../common/types'
import PlanOutlineIcon from './PlanOutlineIcon'

type StatusDisplay = {
  color: string
  icon: React.ReactNode
  text: string
}

const getStatusDisplay = ({
  calculationState,
  t,
}: {
  calculationState: CalculationState
  t: (key: string) => string
}): StatusDisplay | null => {
  switch (calculationState) {
    case CalculationState.INITIALIZING:
      return {
        color: '#0D6044',
        icon: (
          <LoadingSpinner
            size={10}
            thickness={7}
            styleProps={{ color: 'inherit', flexShrink: 0 }}
            color="inherit"
          />
        ),
        text: t('sidebar.my_plans.calculations_starting'),
      }
    case CalculationState.CALCULATING:
      return {
        color: '#0D6044',
        icon: (
          <LoadingSpinner
            size={10}
            thickness={7}
            styleProps={{ color: 'inherit', flexShrink: 0 }}
            color="inherit"
          />
        ),
        text: t('sidebar.my_plans.calculations_in_progress'),
      }
    case CalculationState.ERRORED:
      return {
        color: '#7A3D2B',
        icon: (
          <ErrorIcon
            styleProps={{ width: '0.625rem', height: '0.625rem', color: 'inherit' }}
          />
        ),
        text: t('sidebar.my_plans.calculations_errored'),
      }
    case CalculationState.FINISHED:
      return {
        color: '#0D6044',
        icon: (
          <Info
            styleProps={{ width: '0.625rem', height: '0.625rem', color: 'inherit' }}
          />
        ),
        text: t('sidebar.my_plans.calculations_finished'),
      }
    case CalculationState.NOT_STARTED:
    default:
      return null
  }
}

const PlanListItem = ({
  planId,
  name,
  calculationState,
  statusText,
  statusColor = '#0D6044',
}: {
  planId: string
  name: string
  calculationState?: CalculationState
  statusText?: string
  statusColor?: string
}) => {
  const { t } = useTranslate('hiilikartta')
  const statusDisplay =
    statusText != null
      ? {
          color: statusColor,
          icon: (
            <Info
              styleProps={{ width: '0.625rem', height: '0.625rem', color: 'inherit' }}
            />
          ),
          text: statusText,
        }
      : calculationState != null
        ? getStatusDisplay({
            calculationState,
            t,
          })
        : null

  return (
    <MutableLink
      route={routeTree.plans.plan}
      routeTree={routeTree}
      params={{ routeParams: { planId } }}
      aria-label={`Open plan ${name}`}
      styleProps={{
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.75rem',
        py: '0.75rem',
        color: '#111111',
        transition: 'color 160ms cubic-bezier(.2,0,.2,1)',
        '&:hover .plan-list-item-arrow': {
          transform: 'translateX(1px)',
        },
        '&:focus-visible': {
          outline: '2px solid rgba(17,17,17,0.45)',
          outlineOffset: '3px',
          borderRadius: '0.5rem',
        },
      }}
    >
      <Box
        styleProps={{
          display: 'grid',
          gridTemplateColumns: '0.8125rem minmax(0, 1fr)',
          columnGap: '0.875rem',
          rowGap: '0.3125rem',
          minWidth: 0,
          flex: 1,
        }}
      >
        <Box
          styleProps={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '1rem',
            color: '#0D6044',
          }}
        >
          <PlanOutlineIcon
            styleProps={{
              flexShrink: 0,
              color: 'inherit',
            }}
          />
        </Box>
        <Box
          component="span"
          styleProps={{
            fontSize: '0.625rem',
            fontWeight: 700,
            lineHeight: '1rem',
            letterSpacing: '0.1em',
            color: '#111111',
            textTransform: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Box>

        {statusDisplay && (
          <>
            <Box
              styleProps={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '0.875rem',
                color: statusDisplay.color,
              }}
            >
              {statusDisplay.icon}
            </Box>
            <Box
              component="span"
              styleProps={{
                fontSize: '0.5rem',
                fontWeight: 400,
                lineHeight: '0.875rem',
                letterSpacing: '0.12em',
                color: statusDisplay.color,
                wordBreak: 'break-word',
              }}
            >
              {statusDisplay.text}
            </Box>
          </>
        )}
      </Box>

      <Box
        className="plan-list-item-arrow"
        styleProps={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '1rem',
          flexShrink: 0,
          color: '#111111',
          transition: 'transform 160ms cubic-bezier(.2,0,.2,1)',
        }}
      >
        <CircleArrowRight
          styleProps={{
            width: '1.0625rem',
            height: '1.0625rem',
            color: 'inherit',
          }}
        />
      </Box>
    </MutableLink>
  )
}

export default PlanListItem
