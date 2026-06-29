import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, waitFor } from '@testing-library/react'

import {
  MOCK_CARBON_STATE_QUERY_PARAM,
  MOCK_RESET_QUERY_PARAM,
} from './config'

const mockUseAppSearchParams = jest.fn()
const mockResetHiilikarttaMockState = jest.fn()
const mockApplyHiilikarttaMockScenarioState = jest.fn()

jest.mock('#/common/navigation/navigation', () => ({
  useAppSearchParams: () => mockUseAppSearchParams(),
}))

jest.mock('./reset', () => ({
  resetHiilikarttaMockState: (...args: unknown[]) =>
    mockResetHiilikarttaMockState(...args),
}))

jest.mock('./scenarios', () => ({
  applyHiilikarttaMockScenarioState: (...args: unknown[]) =>
    mockApplyHiilikarttaMockScenarioState(...args),
}))

import HiilikarttaMockScenarioBootstrap, {
  applyHiilikarttaMockScenarioSeed,
} from './HiilikarttaMockScenarioBootstrap'

const renderBootstrap = (client = new QueryClient()) => ({
  client,
  ...render(
    <QueryClientProvider client={client}>
      <HiilikarttaMockScenarioBootstrap />
    </QueryClientProvider>
  ),
})

describe('HiilikarttaMockScenarioBootstrap', () => {
  beforeEach(() => {
    mockUseAppSearchParams.mockReturnValue(new URLSearchParams())
    mockResetHiilikarttaMockState.mockResolvedValue(undefined)
    mockApplyHiilikarttaMockScenarioState.mockImplementation((state) => {
      const normalizedState =
        typeof state === 'string'
          ? state.trim().toLowerCase().replace(/[\s_]+/g, '-')
          : ''

      if (normalizedState === 'plan-valid') {
        return {
          state: 'plan-valid',
          storeState: {},
        }
      }

      return null
    })
    delete window.__avoinCarbonMocks
  })

  afterEach(() => {
    cleanup()
    jest.restoreAllMocks()
    mockUseAppSearchParams.mockReset()
    mockResetHiilikarttaMockState.mockReset()
    mockApplyHiilikarttaMockScenarioState.mockReset()
    delete window.__avoinCarbonMocks
  })

  it('installs and cleans up the browser helper API', async () => {
    const client = new QueryClient()
    const { unmount } = renderBootstrap(client)

    await waitFor(() => {
      expect(window.__avoinCarbonMocks?.reset).toEqual(expect.any(Function))
      expect(window.__avoinCarbonMocks?.seed).toEqual(expect.any(Function))
    })

    await act(async () => {
      await window.__avoinCarbonMocks?.reset()
    })

    expect(mockResetHiilikarttaMockState).toHaveBeenCalledTimes(1)
    expect(mockResetHiilikarttaMockState.mock.calls[0][0].queryClients[0]).toBe(
      client
    )
    expect(mockResetHiilikarttaMockState.mock.calls[0][0].queryClients).toHaveLength(
      2
    )

    unmount()

    expect(window.__avoinCarbonMocks).toBeUndefined()
  })

  it('runs reset when mockReset=1 is present', async () => {
    mockUseAppSearchParams.mockReturnValue(
      new URLSearchParams(`${MOCK_RESET_QUERY_PARAM}=1`)
    )

    renderBootstrap()

    await waitFor(() =>
      expect(mockResetHiilikarttaMockState).toHaveBeenCalledTimes(1)
    )
  })

  it('runs the reset-safe seed path when mockCarbonState=empty is present', async () => {
    mockUseAppSearchParams.mockReturnValue(
      new URLSearchParams(`${MOCK_CARBON_STATE_QUERY_PARAM}=empty`)
    )

    renderBootstrap()

    await waitFor(() =>
      expect(mockResetHiilikarttaMockState).toHaveBeenCalledTimes(1)
    )
    expect(mockApplyHiilikarttaMockScenarioState).not.toHaveBeenCalled()
  })

  it('applies supported non-reset query seed states', async () => {
    mockUseAppSearchParams.mockReturnValue(
      new URLSearchParams(`${MOCK_CARBON_STATE_QUERY_PARAM}=plan-valid`)
    )

    renderBootstrap()

    await waitFor(() =>
      expect(mockApplyHiilikarttaMockScenarioState).toHaveBeenCalledWith(
        'plan-valid'
      )
    )
    expect(mockResetHiilikarttaMockState).not.toHaveBeenCalled()
  })

  it('applies supported states through the browser helper API', async () => {
    renderBootstrap()

    await waitFor(() => {
      expect(window.__avoinCarbonMocks?.seed).toEqual(expect.any(Function))
    })

    let result: Awaited<
      ReturnType<NonNullable<typeof window.__avoinCarbonMocks>['seed']>
    > | null = null

    await act(async () => {
      result = (await window.__avoinCarbonMocks?.seed('PLAN_VALID')) ?? null
    })

    expect(mockApplyHiilikarttaMockScenarioState).toHaveBeenCalledWith(
      'PLAN_VALID'
    )
    expect(result).toEqual({
      action: 'seed',
      applied: true,
      state: 'plan-valid',
    })
  })

  it('keeps unknown seed states as non-throwing no-ops', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const reset = jest.fn(async () => undefined)

    const result = await applyHiilikarttaMockScenarioSeed({
      reset,
      state: 'future-catalog-state',
    })

    expect(reset).not.toHaveBeenCalled()
    expect(result).toEqual({
      action: 'noop',
      applied: false,
      reason: 'unsupported-state',
      state: 'future-catalog-state',
    })
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
