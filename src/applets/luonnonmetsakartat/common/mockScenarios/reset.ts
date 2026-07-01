import type { Query, QueryClient } from '@tanstack/react-query'

import { queryClient as defaultQueryClient } from '#/common/queries/queryClient'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'

import { AdminVerificationStatus } from '../types'

export const LUONNONMETSAKARTAT_MOCK_QUERY_KEY_PREFIXES = [
  'folayers',
  'folayerAreas',
  'adminFolayers',
  'adminFolayer',
  'adminFolayerAreas',
  'adminVerificationQuery',
] as const

type ResetLuonnonmetsakartatMockStateOptions = {
  queryClients?: QueryClient | QueryClient[]
}

export const getLuonnonmetsakartatMockQueryClients = (
  queryClients: ResetLuonnonmetsakartatMockStateOptions['queryClients']
) => {
  const clients = Array.isArray(queryClients)
    ? queryClients
    : queryClients
      ? [queryClients]
      : [defaultQueryClient]

  return Array.from(new Set(clients))
}

export const isLuonnonmetsakartatMockScenarioQueryKey = (
  queryKey: readonly unknown[]
) => {
  const [prefix] = queryKey

  return (
    typeof prefix === 'string' &&
    LUONNONMETSAKARTAT_MOCK_QUERY_KEY_PREFIXES.includes(
      prefix as (typeof LUONNONMETSAKARTAT_MOCK_QUERY_KEY_PREFIXES)[number]
    )
  )
}

export const isLuonnonmetsakartatMockScenarioQuery = (query: Query) =>
  isLuonnonmetsakartatMockScenarioQueryKey(query.queryKey)

const resetLuonnonmetsakartatAppletStoreState = () => {
  useAppletStore.setState({
    folayerConfs: {},
    adminFolayerConfs: {},
    folayerAreaConfs: {},
    adminVerificationStatus: AdminVerificationStatus.NoUser,
  })
}

export const resetLuonnonmetsakartatMockState = async ({
  queryClients,
}: ResetLuonnonmetsakartatMockStateOptions = {}) => {
  const scopedQueryClients =
    getLuonnonmetsakartatMockQueryClients(queryClients)

  await Promise.all(
    scopedQueryClients.map((client) =>
      client.cancelQueries({
        predicate: isLuonnonmetsakartatMockScenarioQuery,
      })
    )
  )

  resetLuonnonmetsakartatAppletStoreState()

  scopedQueryClients.forEach((client) => {
    client.removeQueries({ predicate: isLuonnonmetsakartatMockScenarioQuery })
  })
}
