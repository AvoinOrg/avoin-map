import { QueryClient } from '@tanstack/react-query'

jest.mock('#/common/store', () => ({
  useMapStore: {
    getState: () => ({
      removeSerializableLayerGroup: jest.fn(async () => undefined),
    }),
  },
}))

jest.mock('#/common/utils/store', () => {
  const actual = jest.requireActual<typeof import('#/common/utils/store')>(
    '#/common/utils/store'
  )

  return {
    ...actual,
    createIndexedDbStorage: () => () => ({
      getItem: async () => null,
      removeItem: async () => undefined,
      setItem: async () => undefined,
    }),
  }
})

import { queryClient as sharedQueryClient } from '#/common/queries/queryClient'
import { useAppletStore } from 'applets/carbon/state/appletStore'

import { GlobalState } from '../types'
import {
  isHiilikarttaMockScenarioQueryKey,
  resetHiilikarttaMockState,
} from './reset'

const resetAppletStoreForTests = () => {
  useAppletStore.setState({
    planConfs: {},
    placeholderPlanConfs: {},
    creationPlaceholderPlanConfs: {},
    externalPlanConfs: {},
    globalState: GlobalState.INITIALIZING,
  })
}

describe('resetHiilikarttaMockState', () => {
  beforeEach(() => {
    resetAppletStoreForTests()
    sharedQueryClient.clear()
  })

  afterEach(() => {
    resetAppletStoreForTests()
    sharedQueryClient.clear()
  })

  it('matches only Hiilikartta mock scenario query key prefixes', () => {
    expect(isHiilikarttaMockScenarioQueryKey(['planStatsQuery', 'user'])).toBe(
      true
    )
    expect(isHiilikarttaMockScenarioQueryKey(['plan', 'plan-1'])).toBe(true)
    expect(isHiilikarttaMockScenarioQueryKey(['calcPoll', 'plan-1'])).toBe(
      true
    )
    expect(isHiilikarttaMockScenarioQueryKey(['externalPlan', 'plan-1'])).toBe(
      true
    )

    expect(isHiilikarttaMockScenarioQueryKey(['userinfo'])).toBe(false)
    expect(isHiilikarttaMockScenarioQueryKey(['folayers'])).toBe(false)
    expect(isHiilikarttaMockScenarioQueryKey([])).toBe(false)
  })

  it('clears Hiilikartta applet state, persistence hooks, import files, and only matching query cache entries', async () => {
    const clearImportFiles = jest.fn(async () => undefined)
    const clearPersistedStore = jest.fn(async () => undefined)
    const client = new QueryClient()
    const addPlanConf = useAppletStore.getState().addPlanConf

    useAppletStore.setState({
      planConfs: {
        'plan-1': { id: 'plan-1' } as any,
      },
      placeholderPlanConfs: {
        'server-plan-1': { id: 'server-plan-1' } as any,
      },
      creationPlaceholderPlanConfs: {
        'creation-1': { id: 'creation-1' } as any,
      },
      externalPlanConfs: {
        'external-1': { serverId: 'external-1' } as any,
      },
      globalState: GlobalState.FETCHING,
    })

    client.setQueryData(['planStatsQuery', 'user-1'], 'plan-stats')
    client.setQueryData(['plan', 'plan-1'], 'plan')
    client.setQueryData(['calcPoll', 'plan-1'], 'calc')
    client.setQueryData(['externalPlan', 'external-1'], 'external')
    client.setQueryData(['userinfo'], 'user')
    client.setQueryData(['folayers'], 'folayers')

    await resetHiilikarttaMockState({
      clearImportFiles,
      clearPersistedStore,
      queryClients: client,
    })

    const state = useAppletStore.getState()

    expect(state.planConfs).toEqual({})
    expect(state.placeholderPlanConfs).toEqual({})
    expect(state.creationPlaceholderPlanConfs).toEqual({})
    expect(state.externalPlanConfs).toEqual({})
    expect(state.globalState).toBe(GlobalState.INITIALIZING)
    expect(state.addPlanConf).toBe(addPlanConf)

    expect(clearPersistedStore).toHaveBeenCalledTimes(1)
    expect(clearImportFiles).toHaveBeenCalledTimes(1)

    expect(client.getQueryData(['planStatsQuery', 'user-1'])).toBeUndefined()
    expect(client.getQueryData(['plan', 'plan-1'])).toBeUndefined()
    expect(client.getQueryData(['calcPoll', 'plan-1'])).toBeUndefined()
    expect(client.getQueryData(['externalPlan', 'external-1'])).toBeUndefined()
    expect(client.getQueryData(['userinfo'])).toBe('user')
    expect(client.getQueryData(['folayers'])).toBe('folayers')
  })
})
