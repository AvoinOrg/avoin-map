import type { Query, QueryClient } from '@tanstack/react-query'

import { queryClient as defaultQueryClient } from '#/common/queries/queryClient'
import { useAppletStore } from 'applets/carbon/state/appletStore'

import { clearCreationImportFiles } from '../creationImportFileStorage'
import { GlobalState } from '../types'

export const HIILIKARTTA_MOCK_QUERY_KEY_PREFIXES = [
  'planStatsQuery',
  'plan',
  'calcPoll',
  'externalPlan',
] as const

type ResetHiilikarttaMockStateOptions = {
  clearImportFiles?: () => Promise<void>
  clearPersistedStore?: () => Promise<void>
  queryClients?: QueryClient | QueryClient[]
}

export const isHiilikarttaMockScenarioQueryKey = (
  queryKey: readonly unknown[]
) => {
  const [prefix] = queryKey

  return (
    typeof prefix === 'string' &&
    HIILIKARTTA_MOCK_QUERY_KEY_PREFIXES.includes(
      prefix as (typeof HIILIKARTTA_MOCK_QUERY_KEY_PREFIXES)[number]
    )
  )
}

export const isHiilikarttaMockScenarioQuery = (query: Query) =>
  isHiilikarttaMockScenarioQueryKey(query.queryKey)

export const waitForHiilikarttaStoreHydration = async () => {
  if (useAppletStore.persist.hasHydrated()) {
    return
  }

  await new Promise<void>((resolve) => {
    let resolved = false
    let unsubscribe: (() => void) | undefined
    const resolveOnce = () => {
      if (resolved) {
        return
      }

      resolved = true
      unsubscribe?.()
      resolve()
    }

    unsubscribe = useAppletStore.persist.onFinishHydration(resolveOnce)

    if (useAppletStore.persist.hasHydrated()) {
      resolveOnce()
    }
  })
}

export const clearHiilikarttaPersistedAppletStore = async () => {
  const { name, storage } = useAppletStore.persist.getOptions()

  if (!name) {
    throw new Error('Hiilikartta persisted store name is not configured.')
  }

  await Promise.resolve(storage?.removeItem(name))
}

const getResetQueryClients = (
  queryClients: ResetHiilikarttaMockStateOptions['queryClients']
) => {
  const clients = Array.isArray(queryClients)
    ? queryClients
    : queryClients
      ? [queryClients]
      : [defaultQueryClient]

  return Array.from(new Set(clients))
}

const resetHiilikarttaAppletStoreState = () => {
  useAppletStore.setState({
    planConfs: {},
    placeholderPlanConfs: {},
    creationPlaceholderPlanConfs: {},
    externalPlanConfs: {},
    globalState: GlobalState.INITIALIZING,
  })
}

export const resetHiilikarttaMockState = async ({
  clearImportFiles = clearCreationImportFiles,
  clearPersistedStore = clearHiilikarttaPersistedAppletStore,
  queryClients,
}: ResetHiilikarttaMockStateOptions = {}) => {
  const scopedQueryClients = getResetQueryClients(queryClients)

  await waitForHiilikarttaStoreHydration()

  await Promise.all(
    scopedQueryClients.map((client) =>
      client.cancelQueries({ predicate: isHiilikarttaMockScenarioQuery })
    )
  )

  resetHiilikarttaAppletStoreState()
  await clearPersistedStore()
  await clearImportFiles()

  scopedQueryClients.forEach((client) => {
    client.removeQueries({ predicate: isHiilikarttaMockScenarioQuery })
  })
}
