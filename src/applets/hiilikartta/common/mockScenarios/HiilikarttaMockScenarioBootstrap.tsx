'use client'

import { useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useAppSearchParams } from '#/common/navigation/navigation'
import { queryClient as sharedQueryClient } from '#/common/queries/queryClient'

import {
  MOCK_CARBON_STATE_QUERY_PARAM,
  MOCK_RESET_QUERY_PARAM,
} from './config'
import { resetHiilikarttaMockState } from './reset'
import { applyHiilikarttaMockScenarioState } from './scenarios'

export type AvoinCarbonMockSeedResult = {
  action: 'noop' | 'reset' | 'seed'
  applied: boolean
  reason?: 'unsupported-state'
  state: string
}

export type AvoinCarbonMockApi = {
  reset: () => Promise<void>
  seed: (state?: string) => Promise<AvoinCarbonMockSeedResult>
}

declare global {
  interface Window {
    __avoinCarbonMocks?: AvoinCarbonMockApi
  }
}

const normalizeMockCarbonState = (state: string | null | undefined) =>
  state?.trim().toLowerCase().replace(/[\s_]+/g, '-') ?? ''

export const applyHiilikarttaMockScenarioSeed = async ({
  reset,
  state,
}: {
  reset: () => Promise<void>
  state?: string | null
}): Promise<AvoinCarbonMockSeedResult> => {
  const normalizedState = normalizeMockCarbonState(state)

  if (
    normalizedState === '' ||
    normalizedState === 'empty' ||
    normalizedState === 'reset'
  ) {
    await reset()

    return {
      action: 'reset',
      applied: true,
      state: normalizedState || 'reset',
    }
  }

  const appliedScenario = applyHiilikarttaMockScenarioState(state)

  if (appliedScenario != null) {
    return {
      action: 'seed',
      applied: true,
      state: appliedScenario.state,
    }
  }

  console.warn(
    `Unsupported Hiilikartta mock scenario state "${state}". Later scenario catalogs may add it.`
  )

  return {
    action: 'noop',
    applied: false,
    reason: 'unsupported-state',
    state: normalizedState,
  }
}

const HiilikarttaMockScenarioBootstrap = () => {
  const reactQueryClient = useQueryClient()
  const searchParams = useAppSearchParams()
  const mockReset = searchParams.get(MOCK_RESET_QUERY_PARAM)
  const mockCarbonState = searchParams.get(MOCK_CARBON_STATE_QUERY_PARAM)

  const reset = useCallback(
    () =>
      resetHiilikarttaMockState({
        queryClients: [reactQueryClient, sharedQueryClient],
      }),
    [reactQueryClient]
  )

  const seed = useCallback(
    (state?: string) =>
      applyHiilikarttaMockScenarioSeed({
        reset,
        state,
      }),
    [reset]
  )

  useEffect(() => {
    const api: AvoinCarbonMockApi = {
      reset,
      seed,
    }

    window.__avoinCarbonMocks = api

    return () => {
      if (window.__avoinCarbonMocks === api) {
        delete window.__avoinCarbonMocks
      }
    }
  }, [reset, seed])

  useEffect(() => {
    if (mockReset !== '1' && mockCarbonState == null) {
      return
    }

    const applyQueryScenario = async () => {
      if (mockReset === '1') {
        await reset()
      }

      if (mockCarbonState != null) {
        await seed(mockCarbonState)
      }
    }

    applyQueryScenario().catch((error) => {
      console.error('Hiilikartta mock scenario bootstrap failed', error)
    })
  }, [mockCarbonState, mockReset, reset, seed])

  return null
}

export default HiilikarttaMockScenarioBootstrap
