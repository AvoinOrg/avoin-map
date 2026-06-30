import { FetchStatus } from '#/common/types/general'

type ServerBackedReportPlan = {
  serverId?: string | null
}

type ExternalReportPlanStatus = {
  status?: FetchStatus | null
}

export const findReportPlanByServerId = <TPlan extends ServerBackedReportPlan>(
  records: Record<string, TPlan>,
  serverId: string,
  predicate?: (plan: TPlan) => boolean
) =>
  Object.values(records).find(
    (plan) => plan.serverId === serverId && (predicate?.(plan) ?? true)
  )

export const keepExistingExternalReportRequestIds = ({
  externalPlanConfs,
  requestedServerIds,
}: {
  externalPlanConfs: Record<string, ServerBackedReportPlan>
  requestedServerIds: string[]
}) =>
  requestedServerIds.filter(
    (serverId) =>
      findReportPlanByServerId(externalPlanConfs, serverId) != null
  )

export const isReportPlanIdSettled = ({
  allPlanConfs,
  externalPlanConfs,
  placeholderPlanConfs,
  serverId,
}: {
  allPlanConfs: Record<string, ServerBackedReportPlan>
  externalPlanConfs: Record<
    string,
    ServerBackedReportPlan & ExternalReportPlanStatus
  >
  placeholderPlanConfs: Record<string, ServerBackedReportPlan>
  serverId: string
}) => {
  if (findReportPlanByServerId(allPlanConfs, serverId) != null) {
    return true
  }

  if (findReportPlanByServerId(placeholderPlanConfs, serverId) != null) {
    return true
  }

  const externalPlanConf = findReportPlanByServerId(
    externalPlanConfs,
    serverId
  )

  return (
    externalPlanConf != null &&
    [FetchStatus.FETCHED, FetchStatus.ERRORED].includes(
      externalPlanConf.status as FetchStatus
    )
  )
}

export const shouldSyncReportPlanSelectionToRoute = ({
  eventType,
  reason,
}: {
  eventType?: string
  reason?: string
}) => {
  if (reason == null) {
    return true
  }

  if (
    ['item-press', 'chip-remove-press', 'list-navigation', 'clear-press'].includes(
      reason
    )
  ) {
    return true
  }

  return reason === 'none' && ['keydown', 'keyup'].includes(eventType ?? '')
}
