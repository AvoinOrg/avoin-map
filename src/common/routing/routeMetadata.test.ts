import {
  APP_ROUTE_KEYS,
  collectAppRouteMetadata,
  getAppRouteMetadata,
  getAppRouteMetadataFromStaticData,
} from './routeMetadata'

describe('routeMetadata', () => {
  it('extracts canonical metadata from TanStack route trees in route order', () => {
    const routeTree = {
      id: 'root',
      children: [
        {
          id: 'mainHome',
          options: {
            staticData: {
              appRoute: {
                key: APP_ROUTE_KEYS.MAIN_HOME,
                appletNamespace: 'main',
                variant: 'canonical',
                home: true,
                title: {
                  ns: 'avoin-map',
                  key: 'route.title.home',
                },
              },
            },
          },
        },
        {
          id: 'carbonHome',
          options: {
            staticData: {
              appRoute: {
                key: APP_ROUTE_KEYS.CARBON_HOME,
                appletNamespace: 'carbon',
                variant: 'canonical',
                home: true,
                public: {
                  slug: 'carbon',
                },
              },
            },
          },
          children: {
            report: {
              id: 'carbonReport',
              options: {
                staticData: {
                  appRoute: {
                    key: APP_ROUTE_KEYS.CARBON_REPORT,
                    appletNamespace: 'carbon',
                    variant: 'canonical',
                    breadcrumb: {
                      ns: 'hiilikartta',
                      key: 'route.breadcrumb.report',
                    },
                  },
                },
              },
            },
          },
        },
        {
          id: 'canonicalPlan',
          options: {
            staticData: {
              appRoute: {
                key: APP_ROUTE_KEYS.CARBON_PLAN,
                appletNamespace: 'carbon',
                variant: 'canonical',
              },
            },
          },
        },
      ],
    }

    const { ordered, index } = collectAppRouteMetadata(routeTree)

    expect(ordered.map((metadata) => metadata.key)).toEqual([
      APP_ROUTE_KEYS.MAIN_HOME,
      APP_ROUTE_KEYS.CARBON_HOME,
      APP_ROUTE_KEYS.CARBON_REPORT,
      APP_ROUTE_KEYS.CARBON_PLAN,
    ])

    expect(index[APP_ROUTE_KEYS.MAIN_HOME]?.appletNamespace).toBe('main')
    expect(index[APP_ROUTE_KEYS.CARBON_HOME]?.public?.slug).toBe('carbon')
    expect(index[APP_ROUTE_KEYS.CARBON_REPORT]?.breadcrumb?.key).toBe(
      'route.breadcrumb.report'
    )
  })

  it('ignores routes without valid canonical app route metadata', () => {
    const routeTree = {
      id: 'root',
      children: [
        {
          id: 'invalid-key',
          options: {
            staticData: {
              appRoute: {
                key: 'invalid-key',
                appletNamespace: 'carbon',
                variant: 'canonical',
              },
            },
          },
        },
        {
          id: 'non-canonical-variant',
          options: {
            staticData: {
              appRoute: {
                key: APP_ROUTE_KEYS.CARBON_REPORT,
                appletNamespace: 'carbon',
                variant: 'legacy-alias',
              },
            },
          },
        },
        {
          id: 'nullable-namespace',
          options: {
            staticData: {
              appRoute: {
                key: APP_ROUTE_KEYS.MAIN_HOME,
                appletNamespace: null,
                variant: 'canonical',
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
                key: APP_ROUTE_KEYS.CARBON_HOME,
                appletNamespace: 'carbon',
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
                key: APP_ROUTE_KEYS.CARBON_HOME,
                appletNamespace: 'carbon',
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
          key: APP_ROUTE_KEYS.CARBON_PLAN,
          appletNamespace: 'carbon',
          variant: 'canonical',
          breadcrumb: {
            ns: 'hiilikartta',
            key: 'route.breadcrumb.plan',
          },
        },
      })?.key
    ).toBe(APP_ROUTE_KEYS.CARBON_PLAN)

    expect(
      getAppRouteMetadataFromStaticData({
        appRoute: {
          key: 'not-a-route-key',
          appletNamespace: 'carbon',
          variant: 'canonical',
        },
      })
    ).toBeUndefined()

    expect(
      getAppRouteMetadataFromStaticData({
        appRoute: {
          key: APP_ROUTE_KEYS.CARBON_PLAN,
          appletNamespace: 'carbon',
          variant: 'root-alias',
        },
      })
    ).toBeUndefined()

    expect(
      getAppRouteMetadataFromStaticData({
        appRoute: {
          key: APP_ROUTE_KEYS.ENERGY_HOME,
          appletNamespace: 'energy',
          variant: 'canonical',
          title: {
            ns: 'energiakartta',
            key: 'sidebar.title',
          },
        },
      })?.key
    ).toBe(APP_ROUTE_KEYS.ENERGY_HOME)

    expect(
      getAppRouteMetadataFromStaticData({
        appRoute: {
          key: APP_ROUTE_KEYS.ENERGY_HOME,
          appletNamespace: 'energiakartta',
          variant: 'canonical',
        },
      })
    ).toBeUndefined()

    expect(
      getAppRouteMetadataFromStaticData({
        appRoute: {
          key: APP_ROUTE_KEYS.UI_BASELINE_HOME,
          appletNamespace: 'ui-baseline',
          variant: 'canonical',
          home: true,
          breadcrumb: {
            ns: 'ui-baseline',
            key: 'route.breadcrumb.home',
          },
        },
      })?.appletNamespace
    ).toBe('ui-baseline')
  })
})
