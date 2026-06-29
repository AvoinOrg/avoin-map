import {
  APP_ROUTE_KEYS,
  type AppRouteMetadata,
} from '#/common/routing/routeMetadata'

import {
  collectAppRouteEntries,
  resolveAppRouteHref,
  selectAppRouteEntry,
  type AppRouteMatchContext,
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

const routesById = {
  canonicalHome: makeRoute({
    id: 'canonicalHome',
    fullPath: '/$locale/carbon',
    metadata: {
      key: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
      appletNamespace: 'hiilikartta',
      variant: 'canonical',
      home: true,
    },
  }),
  canonicalPlans: makeRoute({
    id: 'canonicalPlans',
    fullPath: '/$locale/carbon/plans',
    metadata: {
      key: APP_ROUTE_KEYS.HIILIKARTTA_PLANS,
      appletNamespace: 'hiilikartta',
      variant: 'canonical',
    },
  }),
  canonicalReport: makeRoute({
    id: 'canonicalReport',
    fullPath: '/$locale/carbon/report',
    metadata: {
      key: APP_ROUTE_KEYS.HIILIKARTTA_REPORT,
      appletNamespace: 'hiilikartta',
      variant: 'canonical',
    },
  }),
  visibleReport: makeRoute({
    id: 'visibleReport',
    fullPath: '/$locale/report',
    metadata: {
      key: APP_ROUTE_KEYS.HIILIKARTTA_REPORT_VISIBLE_ALIAS,
      appletNamespace: 'hiilikartta',
      variant: 'visible-alias',
      public: {
        canonicalRouteKey: APP_ROUTE_KEYS.HIILIKARTTA_REPORT,
      },
    },
  }),
  canonicalPlan: makeRoute({
    id: 'canonicalPlan',
    fullPath: '/$locale/carbon/plans/$planId',
    metadata: {
      key: APP_ROUTE_KEYS.HIILIKARTTA_PLAN,
      appletNamespace: 'hiilikartta',
      variant: 'canonical',
    },
  }),
  canonicalPlanAreas: makeRoute({
    id: 'canonicalPlanAreas',
    fullPath: '/$locale/carbon/plans/$planId/areas',
    metadata: {
      key: APP_ROUTE_KEYS.HIILIKARTTA_PLAN_AREAS,
      appletNamespace: 'hiilikartta',
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
  visibleRoot: makeRoute({
    id: 'visibleRoot',
    fullPath: '/$locale/',
    to: '/$locale',
    metadata: {
      key: APP_ROUTE_KEYS.MAIN_HOME_VISIBLE_ROOT,
      appletNamespace: null,
      variant: 'visible-root-alias',
      home: true,
      public: {
        visibleRootCanonicalRouteKeys: {
          hiilikartta: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
        },
      },
    },
  }),
}

describe('appRouteLinks', () => {
  it('resolves canonical route keys through TanStack route entries', () => {
    const router = makeRouter()
    const entries = collectAppRouteEntries(routesById)

    expect(
      resolveAppRouteHref({
        router,
        entries,
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_PLANS,
        routeParams: { locale: 'fi' },
      })
    ).toBe('/fi/carbon/plans')

    expect(router.buildLocation).toHaveBeenCalledWith({
      to: '/$locale/carbon/plans',
      params: { locale: 'fi' },
      search: undefined,
    })
  })

  it('prefers the current visible alias for a canonical route key', () => {
    const entries = collectAppRouteEntries(routesById)
    const currentMatches: AppRouteMatchContext[] = [
      { routeId: 'visibleReport' },
    ]

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        currentMatches,
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_REPORT,
        routeParams: { locale: 'fi' },
      })
    ).toBe('/fi/report')
  })

  it('resolves requested visible aliases directly', () => {
    const entries = collectAppRouteEntries(routesById)

    expect(
      selectAppRouteEntry({
        entries,
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_REPORT_VISIBLE_ALIAS,
        currentMatches: [{ routeId: 'canonicalReport' }],
      }).routeId
    ).toBe('visibleReport')
  })

  it('prefers the current visible-root route for canonical applet homes', () => {
    const entries = collectAppRouteEntries(routesById)

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        currentMatches: [{ routeId: 'visibleRoot' }],
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
        routeParams: { locale: 'fi' },
      })
    ).toBe('/fi')
  })

  it('resolves applet homes to the visible root from nested visible aliases', () => {
    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries: collectAppRouteEntries(routesById),
        currentMatches: [{ routeId: 'visibleReport' }],
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
        routeParams: { locale: 'fi' },
      })
    ).toBe('/fi')
  })

  it('can force canonical applet hrefs when visible aliases are active', () => {
    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries: collectAppRouteEntries(routesById),
        currentMatches: [{ routeId: 'visibleRoot' }],
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
        routeParams: { locale: 'fi' },
        preferVisible: false,
      })
    ).toBe('/fi/carbon')
  })

  it('passes query params to TanStack href materialization', () => {
    const entries = collectAppRouteEntries(routesById)

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_PLANS,
        routeParams: { locale: 'fi' },
        search: new URLSearchParams({ tab: 'own' }),
      })
    ).toBe('/fi/carbon/plans?tab=own')
  })

  it('resolves report scenario query params and close-link plan targets with local ids', () => {
    const entries = collectAppRouteEntries(routesById)
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
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_REPORT,
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
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_PLAN,
        routeParams: { locale: 'fi', planId: 'mock-local-plan' },
      })
    ).toBe('/fi/carbon/plans/mock-local-plan')

    expect(
      resolveAppRouteHref({
        router: makeRouter(),
        entries,
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_PLAN_AREAS,
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
        entries: collectAppRouteEntries(routesById),
        routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
        routeParams: { locale: 'fi', folayerIdSlug: 'layer-1' },
        search,
      })
    ).toBe(
      '/fi/luonnonmetsakartat/admin/layer/layer-1?tab=areas&tab=pictures'
    )
  })
})
