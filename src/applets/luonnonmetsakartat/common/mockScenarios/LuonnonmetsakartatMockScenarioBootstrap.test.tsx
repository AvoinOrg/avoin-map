import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, waitFor } from '@testing-library/react'

import {
  MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM,
  MOCK_RESET_QUERY_PARAM,
} from './config'

const mockUseAppSearchParams = jest.fn()
const mockResetLuonnonmetsakartatMockState = jest.fn()
const mockApplyLuonnonmetsakartatMockScenarioState = jest.fn()

jest.mock('#/common/navigation/navigation', () => ({
  useAppSearchParams: () => mockUseAppSearchParams(),
}))

jest.mock('./reset', () => ({
  resetLuonnonmetsakartatMockState: (...args: unknown[]) =>
    mockResetLuonnonmetsakartatMockState(...args),
}))

jest.mock('./scenarios', () => ({
  applyLuonnonmetsakartatMockScenarioState: (...args: unknown[]) =>
    mockApplyLuonnonmetsakartatMockScenarioState(...args),
}))

import LuonnonmetsakartatMockScenarioBootstrap, {
  applyLuonnonmetsakartatMockScenarioSeed,
} from './LuonnonmetsakartatMockScenarioBootstrap'

const renderBootstrap = (client = new QueryClient()) => ({
  client,
  ...render(
    <QueryClientProvider client={client}>
      <LuonnonmetsakartatMockScenarioBootstrap />
    </QueryClientProvider>
  ),
})

describe('LuonnonmetsakartatMockScenarioBootstrap', () => {
  beforeEach(() => {
    mockUseAppSearchParams.mockReturnValue(new URLSearchParams())
    mockResetLuonnonmetsakartatMockState.mockResolvedValue(undefined)
    mockApplyLuonnonmetsakartatMockScenarioState.mockImplementation(
      ({ state }) => {
        const normalizedState =
          typeof state === 'string'
            ? state.trim().toLowerCase().replace(/[\s_]+/g, '-')
            : ''

        if (normalizedState === 'public-layers') {
          return {
            state: 'public-layers',
            storeState: {},
            queryData: [],
          }
        }

        if (normalizedState === 'pictures-unmatched') {
          return {
            state: 'pictures-unmatched',
            storeState: {},
            queryData: [],
          }
        }

        return null
      }
    )
    delete window.__avoinLuonnonmetsakartatMocks
  })

  afterEach(() => {
    cleanup()
    jest.restoreAllMocks()
    mockUseAppSearchParams.mockReset()
    mockResetLuonnonmetsakartatMockState.mockReset()
    mockApplyLuonnonmetsakartatMockScenarioState.mockReset()
    delete window.__avoinLuonnonmetsakartatMocks
  })

  it('installs and cleans up the browser helper API', async () => {
    const client = new QueryClient()
    const { unmount } = renderBootstrap(client)

    await waitFor(() => {
      expect(window.__avoinLuonnonmetsakartatMocks?.reset).toEqual(
        expect.any(Function)
      )
      expect(window.__avoinLuonnonmetsakartatMocks?.seed).toEqual(
        expect.any(Function)
      )
    })

    await act(async () => {
      await window.__avoinLuonnonmetsakartatMocks?.reset()
    })

    expect(mockResetLuonnonmetsakartatMockState).toHaveBeenCalledTimes(1)
    expect(
      mockResetLuonnonmetsakartatMockState.mock.calls[0][0].queryClients[0]
    ).toBe(client)
    expect(
      mockResetLuonnonmetsakartatMockState.mock.calls[0][0].queryClients
    ).toHaveLength(2)

    unmount()

    expect(window.__avoinLuonnonmetsakartatMocks).toBeUndefined()
  })

  it('runs reset when mockReset=1 is present', async () => {
    mockUseAppSearchParams.mockReturnValue(
      new URLSearchParams(`${MOCK_RESET_QUERY_PARAM}=1`)
    )

    renderBootstrap()

    await waitFor(() =>
      expect(mockResetLuonnonmetsakartatMockState).toHaveBeenCalledTimes(1)
    )
  })

  it('runs the reset-safe seed path when mockLuonnonmetsakartatState=empty is present', async () => {
    mockUseAppSearchParams.mockReturnValue(
      new URLSearchParams(`${MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM}=empty`)
    )

    renderBootstrap()

    await waitFor(() =>
      expect(mockResetLuonnonmetsakartatMockState).toHaveBeenCalledTimes(1)
    )
    expect(mockApplyLuonnonmetsakartatMockScenarioState).not.toHaveBeenCalled()
  })

  it('applies supported non-reset query seed states', async () => {
    mockUseAppSearchParams.mockReturnValue(
      new URLSearchParams(
        `${MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM}=public-layers`
      )
    )

    renderBootstrap()

    await waitFor(() =>
      expect(mockApplyLuonnonmetsakartatMockScenarioState).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'public-layers' })
      )
    )
    expect(mockResetLuonnonmetsakartatMockState).not.toHaveBeenCalled()
  })

  it('runs reset before route query seeding when both query flags are present', async () => {
    mockUseAppSearchParams.mockReturnValue(
      new URLSearchParams(
        `${MOCK_RESET_QUERY_PARAM}=1&${MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM}=pictures-unmatched`
      )
    )

    renderBootstrap()

    await waitFor(() =>
      expect(mockApplyLuonnonmetsakartatMockScenarioState).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'pictures-unmatched' })
      )
    )
    expect(mockResetLuonnonmetsakartatMockState).toHaveBeenCalledTimes(1)
    expect(
      mockResetLuonnonmetsakartatMockState.mock.invocationCallOrder[0]
    ).toBeLessThan(
      mockApplyLuonnonmetsakartatMockScenarioState.mock.invocationCallOrder[0]
    )
  })

  it('applies supported states through the browser helper API', async () => {
    renderBootstrap()

    await waitFor(() => {
      expect(window.__avoinLuonnonmetsakartatMocks?.seed).toEqual(
        expect.any(Function)
      )
    })

    let result: Awaited<
      ReturnType<
        NonNullable<typeof window.__avoinLuonnonmetsakartatMocks>['seed']
      >
    > | null = null

    await act(async () => {
      result =
        (await window.__avoinLuonnonmetsakartatMocks?.seed('PUBLIC_LAYERS')) ??
        null
    })

    expect(mockApplyLuonnonmetsakartatMockScenarioState).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'PUBLIC_LAYERS' })
    )
    expect(result).toEqual({
      action: 'seed',
      applied: true,
      state: 'public-layers',
    })
  })

  it('keeps unknown seed states as non-throwing no-ops', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const reset = jest.fn(async () => undefined)
    const seed = jest.fn(() => null)

    const result = await applyLuonnonmetsakartatMockScenarioSeed({
      reset,
      seed,
      state: 'future-catalog-state',
    })

    expect(reset).not.toHaveBeenCalled()
    expect(seed).toHaveBeenCalledWith('future-catalog-state')
    expect(result).toEqual({
      action: 'noop',
      applied: false,
      reason: 'unsupported-state',
      state: 'future-catalog-state',
    })
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
