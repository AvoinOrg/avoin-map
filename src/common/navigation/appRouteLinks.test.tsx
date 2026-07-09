import {
  APP_ROUTE_KEYS,
  type AppRouteMetadata,
} from '#/common/routing/routeMetadata'

import {
  collectAppRouteEntries,
  resolveAppRouteHref,
  selectAppRouteEntry,
  type AppRouteEntry,
} from './appRouteLinks'

const makeRoute = ({
  id,
  fullPath,
  to = fullPath,
  metadata,
}: {
  id: string
  fullPath: string
  to?: string
  metadata: AppRouteMetadata
}) => ({
  id,
  fullPath,
  to,
  options: {
    staticData: {
      appRoute: metadata,
    },
  },
})

const makeRouter = () => ({
  buildLocation: jest.fn(
    ({
      to,
      params = {},
      search,
    }: {
      to: string
      params?: Record<string, string>
      search?: Record<string, unknown>
    }) => {
      const pathname = Object.entries(params).reduce(
        (path, [key, value]) => path.replace(`$${key}`, value),
        to
      )
      const query = new URLSearchParams(
        Object.entries(search ?? {}).flatMap(([key, value]) =>
          value == null
            ? []
            : Array.isArray(value)
              ? value.map((item) => [key, String(item)])
              : [[key, String(value)]]
        )
      ).toString()

      return {
        href: query ? `${pathname}?${query}` : pathname,
      }
    }
  ),
})

const mainRoutesById = {
  canonicalHome: makeRoute({
    id: 'canonicalHome',
    fullPath: '/$locale/carbon',
    metadata: {
      key: APP_ROUTE_KEYS.CARBON_HOME,
      appletNamespace: 'carbon',
      variant: 'canonical',
      home: true,
    },
  }),
  canonicalPlans: makeRoute({
    id: 'canonicalPlans',
    fullPath: '/$locale/carbon/plans',
    metadata: {
      key: APP_ROUTE_KEYS.CARBON_PLANS,
      appletNamespace: 'carbon',
      variant: 'canonical',
    },
  }),
  canonicalReport: makeRoute({
    id: 'canonicalReport',
    fullPath: '/$locale/carbon/report',
    metadata: {
      key: APP_ROUTE_KEYS.CARBON_REPORT,
      appletNamespace: 'carbon',
      variant: 'canonical',
    },
  }),
  canonicalPlan: makeRoute({
    id: 'canonicalPlan',
    fullPath: '/$locale/carbon/plans/$planId',
    metadata: {
      key: APP_ROUTE_KEYS.CARBON_PLAN,
      appletNamespace: 'carbon',
      variant: 'canonical',
    },
  }),
  canonicalPlanAreas: makeRoute({
    id: 'canonicalPlanAreas',
    fullPath: '/$locale/carbon/plans/$planId/areas',
    metadata: {
      key: APP_ROUTE_KEYS.CARBON_PLAN_AREAS,
      appletNamespace: 'carbon',
      variant: 'canonical',
    },
  }),
  canonicalFolayer: makeRoute({
    id: 'canonicalFolayer',
    fullPath: '/$locale/luonnonmetsakartat/admin/layer/$folayerIdSlug',
    metadata: {
      key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
      appletNamespace: 'luonnonmetsakartat',
      variant: 'canonical',
    },
  }),
}

const standaloneCarbonRoutesById = {
  standaloneHome: makeRoute({
    id: 'standaloneHome',
    fullPath: '/$locale/',
    to: '/$locale',
    metadata: {
      key: APP_ROUTE_KEYS.CARBON_HOME,
      appletNamespace: 'carbon',
      variant: 'canonical',
      home: true,
    },
  }),
  standalonePlans: makeRoute({
    id: 'standalonePlans',
    fullPath: '/$locale/plans',
    metadata: {
      key: APP_ROUTE_KEYS.CARBON_PLANS,
      appletNamespace: 'carbon',
      variant: 'canonical',
    },
  }),
  standaloneReport: makeRoute({
    id: 'standaloneReport',
    fullPath: '/$locale/report',
    metadata: {
      key: APP_ROUTE_KEYS.CARBON_REPORT,
      appletNamespace: 'carbon',
      variant: 'canonical',
    },
  }),
  standalonePlan: makeRoute({
    id: 'standalonePlan',
    fullPath: '/$locale/plans/$planId',
    metadata: {
      key: APP_ROUTE_KEYS.CARBON_PLAN,
      appletNamespace: 'carbon',
      variant: 'canonical',
    },
  }),
  standalonePlanAreas: makeRoute({
    id: 'standalonePlanAreas',
    fullPath: '/$locale/plans/$planId/areas',
    metadata: {
      key: APP_ROUTE_KEYS.CARBON_PLAN_AREAS,
      appletNamespace: 'carbon',
      variant: 'canonical',
    },
  }),
}

const uiBaselineRoutesById = {
  uiBaselineHome: makeRoute({
    id: 'uiBaselineHome',
    fullPath: '/$locale/ui-baseline',
    metadata: {
      key: APP_ROUTE_KEYS.UI_BASELINE_HOME,
      appletNamespace: 'ui-baseline',
      variant: 'canonical',
      home: true,
    },
  }),
  uiBaselineDropdowns: makeRoute({
    id: 'uiBaselineDropdowns',
    fullPath: '/$locale/ui-baseline/dropdowns',
    metadata: {
      key: APP_ROUTE_KEYS.UI_BASELINE_DROPDOWNS,
      appletNamespace: 'ui-baseline',
      variant: 'canonical',
    },
  }),
  uiBaselineButtonsToggles: makeRoute({
    id: 'uiBaselineButtonsToggles',
    fullPath: '/$locale/ui-baseline/buttons-toggles',
    metadata: {
      key: APP_ROUTE_KEYS.UI_BASELINE_BUTTONS_TOGGLES,
      appletNamespace: 'ui-baseline',
      variant: 'canonical',
    },
  }),
  uiBaselineInputs: makeRoute({
    id: 'uiBaselineInputs',
    fullPath: '/$locale/ui-baseline/inputs',
    metadata: {
      key: APP_ROUTE_KEYS.UI_BASELINE_INPUTS,
      appletNamespace: 'ui-baseline',
      variant: 'canonical',
    },
  }),
  uiBaselineNotifications: makeRoute({
    id: 'uiBaselineNotifications',
    fullPath: '/$locale/ui-baseline/notifications',
    metadata: {
      key: APP_ROUTE_KEYS.UI_BASELINE_NOTIFICATIONS,
      appletNamespace: 'ui-baseline',
      variant: 'canonical',
    },
  }),
  uiBaselinePanels: makeRoute({
    id: 'uiBaselinePanels',
    fullPath: '/$locale/ui-baseline/panels',
    metadata: {
      key: APP_ROUTE_KEYS.UI_BASELINE_PANELS,
      appletNamespace: 'ui-baseline',
      variant: 'canonical',
    },
  }),
  uiBaselineDrawing: makeRoute({
    id: 'uiBaselineDrawing',
    fullPath: '/$locale/ui-baseline/drawing',
    metadata: {
      key: APP_ROUTE_KEYS.UI_BASELINE_DRAWING,
      appletNamespace: 'ui-baseline',
      variant: 'canonical',
    },
  }),
  uiBaselineNodeFlow: makeRoute({
    id: 'uiBaselineNodeFlow',
    fullPath: '/$locale/ui-baseline/node-flow',
    metadata: {
      key: APP_ROUTE_KEYS.UI_BASELINE_NODE_FLOW,
      appletNamespace: 'ui-baseline',
      variant: 'canonical',
    },
  }),
  uiBaselineModals: makeRoute({
    id: 'uiBaselineModals',
    fullPath: '/$locale/ui-baseline/modals',
    metadata: {
      key: APP_ROUTE_KEYS.UI_BASELINE_MODALS,
      appletNamespace: 'ui-baseline',
      variant: 'canonical',
    },
  }),
}

describe('appRouteLinks', () => {
  it('resolves canonical route keys through main-build TanStack route entries', () => {
    const router = makeRouter()
    const entries = collectAppRouteEntries(mainRoutesById)

    expect(
      resolveAppRouteHref({
        router,
        entries,
        routeKey: APP_ROUTE_KEYS.CARBON_PLANS,
        routeParams: { locale: 'fi' },
      })
    ).toBe('/fi/carbon/plans')

    expect(router.buildLocation).toHaveBeenCalledWith({
      to: '/$locale/carbon/plans',
      params: { locale: 'fi' },
      search: undefined,
    })
  })

  it('resolves standalone promoted routes through the same canonical keys', () => {
    const entries = collectAppRouteEntries(standaloneCarbonRoutesById)

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        routeKey: APP_ROUTE_KEYS.CARBON_HOME,
        routeParams: { locale: 'fi' },
      })
    ).toBe('/fi')

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        routeKey: APP_ROUTE_KEYS.CARBON_PLANS,
        routeParams: { locale: 'fi' },
      })
    ).toBe('/fi/plans')

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        routeKey: APP_ROUTE_KEYS.CARBON_REPORT,
        routeParams: { locale: 'fi' },
      })
    ).toBe('/fi/report')
  })

  it.each([
    [APP_ROUTE_KEYS.UI_BASELINE_HOME, '/fi/ui-baseline'],
    [APP_ROUTE_KEYS.UI_BASELINE_DROPDOWNS, '/fi/ui-baseline/dropdowns'],
    [
      APP_ROUTE_KEYS.UI_BASELINE_BUTTONS_TOGGLES,
      '/fi/ui-baseline/buttons-toggles',
    ],
    [APP_ROUTE_KEYS.UI_BASELINE_INPUTS, '/fi/ui-baseline/inputs'],
    [
      APP_ROUTE_KEYS.UI_BASELINE_NOTIFICATIONS,
      '/fi/ui-baseline/notifications',
    ],
    [APP_ROUTE_KEYS.UI_BASELINE_PANELS, '/fi/ui-baseline/panels'],
    [APP_ROUTE_KEYS.UI_BASELINE_DRAWING, '/fi/ui-baseline/drawing'],
    [APP_ROUTE_KEYS.UI_BASELINE_NODE_FLOW, '/fi/ui-baseline/node-flow'],
    [APP_ROUTE_KEYS.UI_BASELINE_MODALS, '/fi/ui-baseline/modals'],
  ])('resolves ui-baseline route key %s', (routeKey, expectedHref) => {
    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries: collectAppRouteEntries(uiBaselineRoutesById),
        routeKey,
        routeParams: { locale: 'fi' },
      })
    ).toBe(expectedHref)
  })

  it('selects exactly the requested canonical route key', () => {
    const entries = collectAppRouteEntries(mainRoutesById)

    expect(
      selectAppRouteEntry({
        entries,
        routeKey: APP_ROUTE_KEYS.CARBON_REPORT,
      }).routeId
    ).toBe('canonicalReport')
  })

  it('passes query params to TanStack href materialization', () => {
    const entries = collectAppRouteEntries(mainRoutesById)

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        routeKey: APP_ROUTE_KEYS.CARBON_PLANS,
        routeParams: { locale: 'fi' },
        search: new URLSearchParams({ tab: 'own' }),
      })
    ).toBe('/fi/carbon/plans?tab=own')
  })

  it('resolves report scenario query params and close-link plan targets with local ids', () => {
    const entries = collectAppRouteEntries(mainRoutesById)
    const reportSearch = new URLSearchParams({
      mockReset: '1',
      mockCarbonState: 'report-single-local',
      planIds: 'mock-plan-local',
      prevPageId: 'mock-local-plan',
      prevPageStep: 'areas',
    })

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        routeKey: APP_ROUTE_KEYS.CARBON_REPORT,
        routeParams: { locale: 'fi' },
        search: reportSearch,
      })
    ).toBe(
      '/fi/carbon/report?mockReset=1&mockCarbonState=report-single-local&planIds=mock-plan-local&prevPageId=mock-local-plan&prevPageStep=areas'
    )

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        routeKey: APP_ROUTE_KEYS.CARBON_PLAN,
        routeParams: { locale: 'fi', planId: 'mock-local-plan' },
      })
    ).toBe('/fi/carbon/plans/mock-local-plan')

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        routeKey: APP_ROUTE_KEYS.CARBON_PLAN_AREAS,
        routeParams: { locale: 'fi', planId: 'mock-local-plan' },
      })
    ).toBe('/fi/carbon/plans/mock-local-plan/areas')
  })

  it('passes dynamic folayerIdSlug params and repeated URLSearchParams values', () => {
    const search = new URLSearchParams()
    search.append('tab', 'areas')
    search.append('tab', 'pictures')

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries: collectAppRouteEntries(mainRoutesById),
        routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
        routeParams: { locale: 'fi', folayerIdSlug: 'layer-1' },
        search,
      })
    ).toBe(
      '/fi/luonnonmetsakartat/admin/layer/layer-1?tab=areas&tab=pictures'
    )
  })

  it('throws for a route key that is not present in the current route entries', () => {
    expect(() =>
      selectAppRouteEntry({
        entries: collectAppRouteEntries(standaloneCarbonRoutesById),
        routeKey: APP_ROUTE_KEYS.ENERGY_HOME,
      })
    ).toThrow('Unknown AppRouteKey "energy.home"')
  })

  it('throws for duplicate canonical route keys in a single entry set', () => {
    const [homeEntry] = collectAppRouteEntries(standaloneCarbonRoutesById)
    const duplicateHomeEntry: AppRouteEntry = {
      ...homeEntry,
      routeId: 'duplicateStandaloneHome',
    }

    expect(() =>
      selectAppRouteEntry({
        entries: [homeEntry, duplicateHomeEntry],
        routeKey: APP_ROUTE_KEYS.CARBON_HOME,
      })
    ).toThrow(/Duplicate AppRouteKey "carbon.home"/)
  })
})
