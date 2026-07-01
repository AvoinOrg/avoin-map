import { QueryClient } from '@tanstack/react-query'

import { queryClient as sharedQueryClient } from '#/common/queries/queryClient'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'

import {
  AdminVerificationStatus,
  FolayerConfState,
} from '../types'
import {
  isLuonnonmetsakartatMockScenarioQueryKey,
  resetLuonnonmetsakartatMockState,
} from './reset'

const resetAppletStoreForTests = () => {
  useAppletStore.setState({
    folayerConfs: {},
    adminFolayerConfs: {},
    folayerAreaConfs: {},
    adminVerificationStatus: AdminVerificationStatus.NoUser,
  })
}

describe('resetLuonnonmetsakartatMockState', () => {
  beforeEach(() => {
    resetAppletStoreForTests()
    sharedQueryClient.clear()
  })

  afterEach(() => {
    resetAppletStoreForTests()
    sharedQueryClient.clear()
  })

  it('matches only Luonnonmetsakartat mock scenario query key prefixes', () => {
    expect(isLuonnonmetsakartatMockScenarioQueryKey(['folayers'])).toBe(true)
    expect(
      isLuonnonmetsakartatMockScenarioQueryKey([
        'folayerAreas',
        'mock-visible-layer',
      ])
    ).toBe(true)
    expect(isLuonnonmetsakartatMockScenarioQueryKey(['adminFolayers'])).toBe(
      true
    )
    expect(
      isLuonnonmetsakartatMockScenarioQueryKey([
        'adminFolayer',
        'mock-visible-layer',
      ])
    ).toBe(true)
    expect(
      isLuonnonmetsakartatMockScenarioQueryKey([
        'adminFolayerAreas',
        'mock-visible-layer',
      ])
    ).toBe(true)
    expect(
      isLuonnonmetsakartatMockScenarioQueryKey([
        'adminVerificationQuery',
        'user-1',
      ])
    ).toBe(true)

    expect(isLuonnonmetsakartatMockScenarioQueryKey(['userinfo'])).toBe(false)
    expect(isLuonnonmetsakartatMockScenarioQueryKey(['plan'])).toBe(false)
    expect(isLuonnonmetsakartatMockScenarioQueryKey([])).toBe(false)
  })

  it('clears Luonnonmetsakartat applet state and only matching query cache entries', async () => {
    const client = new QueryClient()
    const addFolayerConf = useAppletStore.getState().addFolayerConf

    useAppletStore.setState({
      folayerConfs: {
        'layer-1': { id: 'layer-1' } as any,
      },
      adminFolayerConfs: {
        'layer-1': {
          id: 'layer-1',
          state: FolayerConfState.Saving,
        } as any,
      },
      folayerAreaConfs: {
        'layer-1': { id: 'layer-1' } as any,
      },
      adminVerificationStatus: AdminVerificationStatus.Verified,
    })

    client.setQueryData(['folayers'], 'public')
    client.setQueryData(['folayerAreas', 'layer-1'], 'public-areas')
    client.setQueryData(['adminFolayers'], 'admin')
    client.setQueryData(['adminFolayer', 'layer-1'], 'admin-detail')
    client.setQueryData(['adminFolayerAreas', 'layer-1'], 'admin-areas')
    client.setQueryData(['adminVerificationQuery', 'user-1'], true)
    client.setQueryData(['userinfo'], 'user')
    client.setQueryData(['plan', 'plan-1'], 'plan')

    await resetLuonnonmetsakartatMockState({
      queryClients: [client, client],
    })

    const state = useAppletStore.getState()

    expect(state.folayerConfs).toEqual({})
    expect(state.adminFolayerConfs).toEqual({})
    expect(state.folayerAreaConfs).toEqual({})
    expect(state.adminVerificationStatus).toBe(AdminVerificationStatus.NoUser)
    expect(state.addFolayerConf).toBe(addFolayerConf)

    expect(client.getQueryData(['folayers'])).toBeUndefined()
    expect(client.getQueryData(['folayerAreas', 'layer-1'])).toBeUndefined()
    expect(client.getQueryData(['adminFolayers'])).toBeUndefined()
    expect(client.getQueryData(['adminFolayer', 'layer-1'])).toBeUndefined()
    expect(
      client.getQueryData(['adminFolayerAreas', 'layer-1'])
    ).toBeUndefined()
    expect(
      client.getQueryData(['adminVerificationQuery', 'user-1'])
    ).toBeUndefined()
    expect(client.getQueryData(['userinfo'])).toBe('user')
    expect(client.getQueryData(['plan', 'plan-1'])).toBe('plan')
  })
})
