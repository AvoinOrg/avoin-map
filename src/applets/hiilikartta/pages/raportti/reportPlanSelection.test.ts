import { FetchStatus } from '#/common/types/general'
import {
  findReportPlanByServerId,
  isReportPlanIdSettled,
  keepExistingExternalReportRequestIds,
  shouldSyncReportPlanSelectionToRoute,
} from './reportPlanSelection'

describe('report plan selection helpers', () => {
  it('finds external reports by server id even when the store key is an alias', () => {
    const plan = findReportPlanByServerId(
      {
        'route-facing-alias': {
          serverId: 'api-backed-external-id',
          name: 'External report',
        },
      },
      'api-backed-external-id'
    )

    expect(plan?.name).toBe('External report')
  })

  it('supports report predicates such as hidden local plan filtering', () => {
    const plan = findReportPlanByServerId(
      {
        hidden: { serverId: 'plan-1', isHidden: true },
        visible: { serverId: 'plan-1', isHidden: false },
      },
      'plan-1',
      (candidate) => !candidate.isHidden
    )

    expect(plan).toEqual({ serverId: 'plan-1', isHidden: false })
  })

  it('does not settle API-backed external reports before fetch completion', () => {
    expect(
      isReportPlanIdSettled({
        allPlanConfs: {},
        placeholderPlanConfs: {},
        externalPlanConfs: {
          'external-id': {
            serverId: 'external-id',
            status: FetchStatus.FETCHING,
          },
        },
        serverId: 'external-id',
      })
    ).toBe(false)

    expect(
      isReportPlanIdSettled({
        allPlanConfs: {},
        placeholderPlanConfs: {},
        externalPlanConfs: {
          'external-id': {
            serverId: 'external-id',
            status: FetchStatus.FETCHED,
          },
        },
        serverId: 'external-id',
      })
    ).toBe(true)
  })

  it('allows external report ids to be requested again after reset clears them', () => {
    expect(
      keepExistingExternalReportRequestIds({
        externalPlanConfs: {},
        requestedServerIds: ['external-id'],
      })
    ).toEqual([])

    expect(
      keepExistingExternalReportRequestIds({
        externalPlanConfs: {
          'external-id': { serverId: 'external-id' },
        },
        requestedServerIds: ['external-id'],
      })
    ).toEqual(['external-id'])
  })

  it('ignores programmatic report selector normalization changes', () => {
    expect(
      shouldSyncReportPlanSelectionToRoute({
        reason: 'none',
        eventType: 'base-ui',
      })
    ).toBe(false)
    expect(
      shouldSyncReportPlanSelectionToRoute({
        reason: 'none',
        eventType: 'keydown',
      })
    ).toBe(true)
    expect(
      shouldSyncReportPlanSelectionToRoute({ reason: 'item-press' })
    ).toBe(true)
    expect(
      shouldSyncReportPlanSelectionToRoute({ reason: 'chip-remove-press' })
    ).toBe(true)
    expect(
      shouldSyncReportPlanSelectionToRoute({ reason: 'list-navigation' })
    ).toBe(true)
  })
})
