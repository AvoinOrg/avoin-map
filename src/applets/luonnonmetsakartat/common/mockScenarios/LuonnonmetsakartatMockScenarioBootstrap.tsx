import { useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useAppSearchParams } from '#/common/navigation/navigation'
import { queryClient as sharedQueryClient } from '#/common/queries/queryClient'

import {
  MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM,
  MOCK_RESET_QUERY_PARAM,
} from './config'
import { resetLuonnonmetsakartatMockState } from './reset'
import { applyLuonnonmetsakartatMockScenarioState } from './scenarios'

export type AvoinLuonnonmetsakartatMockSeedResult = {
  action: 'noop' | 'reset' | 'seed'
  applied: boolean
  reason?: 'unsupported-state'
  state: string
}

export type AvoinLuonnonmetsakartatMockApi = {
  reset: () => Promise<void>
  seed: (
    state?: string
  ) => Promise<AvoinLuonnonmetsakartatMockSeedResult>
}

declare global {
  interface Window {
    __avoinLuonnonmetsakartatMocks?: AvoinLuonnonmetsakartatMockApi
  }
}

const normalizeMockLuonnonmetsakartatState = (
  state: string | null | undefined
) => state?.trim().toLowerCase().replace(/[\s_]+/g, '-') ?? ''

export const applyLuonnonmetsakartatMockScenarioSeed = async ({
  reset,
  seed,
  state,
}: {
  reset: () => Promise<void>
  seed: (state: string | null | undefined) => ReturnType<
    typeof applyLuonnonmetsakartatMockScenarioState
  >
  state?: string | null
}): Promise<AvoinLuonnonmetsakartatMockSeedResult> => {
  const normalizedState = normalizeMockLuonnonmetsakartatState(state)

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

  const appliedScenario = seed(state)

  if (appliedScenario != null) {
    return {
      action: 'seed',
      applied: true,
      state: appliedScenario.state,
    }
  }

  console.warn(
    `Unsupported Luonnonmetsakartat mock scenario state "${state}". Later scenario catalogs may add it.`
  )

  return {
    action: 'noop',
    applied: false,
    reason: 'unsupported-state',
    state: normalizedState,
  }
}

const LuonnonmetsakartatMockScenarioBootstrap = () => {
  const reactQueryClient = useQueryClient()
  const searchParams = useAppSearchParams()
  const mockReset = searchParams.get(MOCK_RESET_QUERY_PARAM)
  const mockLuonnonmetsakartatState = searchParams.get(
    MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM
  )

  const queryClients = [reactQueryClient, sharedQueryClient]

  const reset = useCallback(
    () => resetLuonnonmetsakartatMockState({ queryClients }),
    [reactQueryClient]
  )

  const seed = useCallback(
    (state?: string | null) =>
      applyLuonnonmetsakartatMockScenarioState({
        queryClients,
        state,
      }),
    [reactQueryClient]
  )

  const seedWithResetHandling = useCallback(
    (state?: string | null) =>
      applyLuonnonmetsakartatMockScenarioSeed({
        reset,
        seed,
        state,
      }),
    [reset, seed]
  )

  useEffect(() => {
    const api: AvoinLuonnonmetsakartatMockApi = {
      reset,
      seed: seedWithResetHandling,
    }

    window.__avoinLuonnonmetsakartatMocks = api

    return () => {
      if (window.__avoinLuonnonmetsakartatMocks === api) {
        delete window.__avoinLuonnonmetsakartatMocks
      }
    }
  }, [reset, seedWithResetHandling])

  useEffect(() => {
    if (mockReset !== '1' && mockLuonnonmetsakartatState == null) {
      return
    }

    const applyQueryScenario = async () => {
      if (mockReset === '1') {
        await reset()
      }

      if (mockLuonnonmetsakartatState != null) {
        await seedWithResetHandling(mockLuonnonmetsakartatState)
      }
    }

    applyQueryScenario().catch((error) => {
      console.error(
        'Luonnonmetsakartat mock scenario bootstrap failed',
        error
      )
    })
  }, [mockLuonnonmetsakartatState, mockReset, reset, seedWithResetHandling])

  return null
}

export default LuonnonmetsakartatMockScenarioBootstrap
