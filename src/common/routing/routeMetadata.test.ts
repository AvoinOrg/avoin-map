import {
  APP_ROUTE_KEYS,
  collectAppRouteMetadata,
  getAppRouteMetadata,
  getAppRouteMetadataFromStaticData,
} from './routeMetadata'

describe('routeMetadata', () => {
  it('extracts metadata from TanStack route trees and preserves alias links', () => {
    const routeTree = {
      id: 'root',
      children: [
        {
          id: 'visibleRoot',
          options: {
            staticData: {
              appRoute: {
                key: APP_ROUTE_KEYS.MAIN_HOME_VISIBLE_ROOT,
                appletNamespace: null,
                variant: 'visible-root-alias',
                public: {
                  visibleRootCanonicalRouteKeys: {
                    energiakartta: APP_ROUTE_KEYS.ENERGIAKARTTA_HOME,
                    hiilikartta: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
                    luonnonmetsakartat: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_HOME,
                  },
                },
              },
            },
          },
          children: {
            plans: {
              id: 'hiili-alias-plans',
              options: {
                staticData: {
                  appRoute: {
                    key: APP_ROUTE_KEYS.HIILIKARTTA_PLANS_VISIBLE_ALIAS,
                    appletNamespace: 'hiilikartta',
                    variant: 'visible-alias',
                    public: {
                      canonicalRouteKey: APP_ROUTE_KEYS.HIILIKARTTA_PLANS,
                    },
                  },
                },
              },
            },
          },
        },
        {
          id: 'visiblePlan',
          options: {
            staticData: {
              appRoute: {
                key: APP_ROUTE_KEYS.HIILIKARTTA_PLAN_VISIBLE_ALIAS,
                appletNamespace: 'hiilikartta',
                variant: 'visible-alias',
                public: {
                  canonicalRouteKey: APP_ROUTE_KEYS.HIILIKARTTA_PLAN,
                },
              },
            },
          },
        },
      ],
    }

    const { ordered, index } = collectAppRouteMetadata(routeTree)

    expect(ordered.map((metadata) => metadata.key)).toEqual([
      APP_ROUTE_KEYS.MAIN_HOME_VISIBLE_ROOT,
      APP_ROUTE_KEYS.HIILIKARTTA_PLANS_VISIBLE_ALIAS,
      APP_ROUTE_KEYS.HIILIKARTTA_PLAN_VISIBLE_ALIAS,
    ])

    expect(
      index[APP_ROUTE_KEYS.HIILIKARTTA_PLANS_VISIBLE_ALIAS]?.public?.canonicalRouteKey
    ).toBe(APP_ROUTE_KEYS.HIILIKARTTA_PLANS)

    expect(
      index[APP_ROUTE_KEYS.MAIN_HOME_VISIBLE_ROOT]?.public
        ?.visibleRootCanonicalRouteKeys?.luonnonmetsakartat
    ).toBe(APP_ROUTE_KEYS.LUONNONMETSAKARTAT_HOME)
  })

  it('ignores routes without valid app route metadata', () => {
    const routeTree = {
      id: 'root',
      children: [
        {
          id: 'missing-app-route',
          options: {
            staticData: {
              appRoute: {
                key: 'invalid-key',
              },
            },
          },
        },
        {
          id: 'no-static-data',
        },
      ],
    }

    const { ordered } = collectAppRouteMetadata(routeTree)
    expect(ordered).toHaveLength(0)
  })

  it('throws on duplicate AppRouteKey values', () => {
    const routeTree = {
      id: 'root',
      children: [
        {
          id: 'first',
          options: {
            staticData: {
              appRoute: {
                key: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
                appletNamespace: 'hiilikartta',
                variant: 'canonical',
              },
            },
          },
        },
        {
          id: 'second',
          options: {
            staticData: {
              appRoute: {
                key: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
                appletNamespace: 'hiilikartta',
                variant: 'canonical',
              },
            },
          },
        },
      ],
    }

    expect(() => collectAppRouteMetadata(routeTree)).toThrow(
      /Duplicate AppRouteKey/i
    )
  })

  it('requires visible-root aliases to declare a canonical applet route map', () => {
    const routeTree = {
      id: 'root',
      children: [
        {
          id: 'visible-root',
          options: {
            staticData: {
              appRoute: {
                key: APP_ROUTE_KEYS.MAIN_HOME_VISIBLE_ROOT,
                appletNamespace: null,
                variant: 'visible-root-alias',
              },
            },
          },
        },
      ],
    }

    const { ordered } = collectAppRouteMetadata(routeTree)

    expect(ordered).toHaveLength(0)
  })

  it('returns undefined for a route without metadata', () => {
    expect(
      getAppRouteMetadata({
        id: 'route-without-metadata',
      })
    ).toBeUndefined()
  })

  it('validates app route metadata directly from TanStack static data', () => {
    expect(
      getAppRouteMetadataFromStaticData({
        appRoute: {
          key: APP_ROUTE_KEYS.HIILIKARTTA_PLAN,
          appletNamespace: 'hiilikartta',
          variant: 'canonical',
          breadcrumb: {
            ns: 'hiilikartta',
            key: 'route.breadcrumb.plan',
          },
        },
      })?.key
    ).toBe(APP_ROUTE_KEYS.HIILIKARTTA_PLAN)

    expect(
      getAppRouteMetadataFromStaticData({
        appRoute: {
          key: 'not-a-route-key',
          appletNamespace: 'hiilikartta',
          variant: 'canonical',
        },
      })
    ).toBeUndefined()
  })
})
