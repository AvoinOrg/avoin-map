import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, waitFor } from '@testing-library/react'

import {
  MOCK_CARBON_STATE_QUERY_PARAM,
  MOCK_RESET_QUERY_PARAM,
} from './config'

const mockUseAppSearchParams = jest.fn()
const mockResetHiilikarttaMockState = jest.fn()

jest.mock('#/common/navigation/navigation', () => ({
  useAppSearchParams: () => mockUseAppSearchParams(),
}))

jest.mock('./reset', () => ({
  resetHiilikarttaMockState: (...args: any[]) =>
    mockResetHiilikarttaMockState(...args),
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
    delete window.__avoinCarbonMocks
  })

  afterEach(() => {
    cleanup()
    jest.restoreAllMocks()
    mockUseAppSearchParams.mockReset()
    mockResetHiilikarttaMockState.mockReset()
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
