import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import {
  APP_ROUTE_KEYS,
  type AppRouteMetadata,
} from '#/common/routing/routeMetadata'

import BreadcrumbNav from './BreadcrumbNav'

type MockMatch = {
  routeId: string
  params: Record<string, string>
  staticData: {
    appRoute?: AppRouteMetadata
  }
}

type AppRouteLinkMockProps = {
  routeKey: string
  routeParams?: Record<string, string>
  'aria-label'?: string
  children: React.ReactNode
}

let mockMatches: MockMatch[] = []

const mockedAppRouteLink = jest.fn(
  ({
    routeKey,
    routeParams,
    children,
    'aria-label': ariaLabel,
  }: AppRouteLinkMockProps) => (
    <a
      href={`/${routeKey}`}
      aria-label={ariaLabel}
      data-route-key={routeKey}
      data-route-params={JSON.stringify(routeParams ?? {})}
    >
      {children}
    </a>
  )
)

jest.mock('@tanstack/react-router', () => ({
  useMatches: (options?: { select?: (matches: MockMatch[]) => unknown }) =>
    options?.select ? options.select(mockMatches) : mockMatches,
}))

jest.mock('@tolgee/react', () => ({
  useTranslate: (ns: string) => ({
    t: (key: string) => `${ns}:${key}`,
  }),
}))

jest.mock('#/components/common/TText', () => ({
  __esModule: true,
  default: ({ ns, keyName }: { ns: string; keyName: string }) => (
    <span>{`${ns}:${keyName}`}</span>
  ),
}))

jest.mock('#/common/navigation/appRouteLinks', () => ({
  AppRouteLink: (props: AppRouteLinkMockProps) => mockedAppRouteLink(props),
}))

const match = ({
  routeId,
  params = { locale: 'fi' },
  appRoute,
}: {
  routeId: string
  params?: Record<string, string>
  appRoute?: AppRouteMetadata
}): MockMatch => ({
  routeId,
  params,
  staticData: appRoute ? { appRoute } : {},
})

const appRoute = (
  metadata: AppRouteMetadata
): AppRouteMetadata => metadata

describe('BreadcrumbNav', () => {
  beforeEach(() => {
    mockMatches = []
    mockedAppRouteLink.mockClear()
  })

  it('renders breadcrumbs from TanStack matches and carries Hiilikartta planId params', () => {
    mockMatches = [
      match({ routeId: 'layout', appRoute: undefined }),
      match({
        routeId: 'hiilikarttaHome',
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
          appletNamespace: 'hiilikartta',
          variant: 'canonical',
          breadcrumb: {
            ns: 'hiilikartta',
            key: 'route.breadcrumb.home',
          },
        }),
      }),
      match({
        routeId: 'hiilikarttaPlans',
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.HIILIKARTTA_PLANS,
          appletNamespace: 'hiilikartta',
          variant: 'canonical',
          breadcrumb: {
            ns: 'hiilikartta',
            key: 'route.breadcrumb.plans',
          },
        }),
      }),
      match({
        routeId: 'hiilikarttaPlan',
        params: { locale: 'fi', planId: 'plan-123' },
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.HIILIKARTTA_PLAN,
          appletNamespace: 'hiilikartta',
          variant: 'canonical',
          breadcrumb: {
            ns: 'hiilikartta',
            key: 'route.breadcrumb.plan',
          },
        }),
      }),
      match({
        routeId: 'hiilikarttaPlanAreas',
        params: { locale: 'fi', planId: 'plan-123' },
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.HIILIKARTTA_PLAN_AREAS,
          appletNamespace: 'hiilikartta',
          variant: 'canonical',
          breadcrumb: {
            ns: 'hiilikartta',
            key: 'route.breadcrumb.plan_areas',
          },
        }),
      }),
    ]

    render(<BreadcrumbNav />)

    expect(
      screen.getByText('hiilikartta:route.breadcrumb.home')
    ).toBeInTheDocument()
    expect(
      screen.getByText('hiilikartta:route.breadcrumb.plans')
    ).toBeInTheDocument()
    expect(
      screen.getByText('hiilikartta:route.breadcrumb.plan')
    ).toBeInTheDocument()
    expect(
      screen.getByText('hiilikartta:route.breadcrumb.plan_areas')
    ).toBeInTheDocument()

    expect(screen.getByLabelText('avoin-map:breadcrumb.back')).toHaveAttribute(
      'data-route-key',
      APP_ROUTE_KEYS.HIILIKARTTA_PLAN
    )

    expect(mockedAppRouteLink).toHaveBeenCalledWith(
      expect.objectContaining({
        routeKey: APP_ROUTE_KEYS.HIILIKARTTA_PLAN,
        routeParams: { locale: 'fi', planId: 'plan-123' },
      })
    )
  })

  it('collapses root breadcrumbs when requested', () => {
    mockMatches = [
      match({
        routeId: 'hiilikarttaHome',
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
          appletNamespace: 'hiilikartta',
          variant: 'canonical',
          breadcrumb: {
            ns: 'hiilikartta',
            key: 'route.breadcrumb.home',
          },
        }),
      }),
    ]

    render(<BreadcrumbNav collapseIfRoot />)

    expect(
      screen.queryByText('hiilikartta:route.breadcrumb.home')
    ).not.toBeInTheDocument()
  })

  it('uses remaining visible alias matches without adding old main-tree root crumbs', () => {
    mockMatches = [
      match({
        routeId: 'visibleRoot',
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.MAIN_HOME,
          appletNamespace: null,
          variant: 'visible-root-alias',
          public: {
            visibleRootCanonicalRouteKeys: {
              hiilikartta: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
            },
          },
        }),
      }),
      match({
        routeId: 'visibleReport',
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.HIILIKARTTA_REPORT_VISIBLE_ALIAS,
          appletNamespace: 'hiilikartta',
          variant: 'visible-alias',
          breadcrumb: {
            ns: 'hiilikartta',
            key: 'route.breadcrumb.report',
          },
          public: {
            canonicalRouteKey: APP_ROUTE_KEYS.HIILIKARTTA_REPORT,
          },
        }),
      }),
      match({
        routeId: 'hiilikarttaPlan',
        params: { locale: 'fi', planId: 'plan-123' },
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.HIILIKARTTA_PLAN,
          appletNamespace: 'hiilikartta',
          variant: 'canonical',
          breadcrumb: {
            ns: 'hiilikartta',
            key: 'route.breadcrumb.plan',
          },
        }),
      }),
    ]

    render(<BreadcrumbNav />)

    expect(
      screen.getByText('hiilikartta:route.breadcrumb.report')
    ).toBeInTheDocument()
    expect(
      screen.getByText('hiilikartta:route.breadcrumb.plan')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('hiilikartta:route.breadcrumb.home')
    ).not.toBeInTheDocument()
  })

  it('passes Luonnonmetsakartat folayerIdSlug params through nested admin breadcrumbs', () => {
    mockMatches = [
      match({
        routeId: 'luonnonmetsakartatHome',
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_HOME,
          appletNamespace: 'luonnonmetsakartat',
          variant: 'canonical',
          breadcrumb: {
            ns: 'luonnonmetsakartat',
            key: 'route.breadcrumb.home',
          },
        }),
      }),
      match({
        routeId: 'luonnonmetsakartatAdmin',
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN,
          appletNamespace: 'luonnonmetsakartat',
          variant: 'canonical',
          breadcrumb: {
            ns: 'luonnonmetsakartat',
            key: 'route.breadcrumb.admin',
          },
        }),
      }),
      match({
        routeId: 'luonnonmetsakartatFolayer',
        params: { locale: 'fi', folayerIdSlug: 'layer-123' },
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
          appletNamespace: 'luonnonmetsakartat',
          variant: 'canonical',
          breadcrumb: {
            ns: 'luonnonmetsakartat',
            key: 'route.breadcrumb.folayer',
          },
        }),
      }),
      match({
        routeId: 'luonnonmetsakartatFolayerSettings',
        params: { locale: 'fi', folayerIdSlug: 'layer-123' },
        appRoute: appRoute({
          key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER_SETTINGS,
          appletNamespace: 'luonnonmetsakartat',
          variant: 'canonical',
          breadcrumb: {
            ns: 'luonnonmetsakartat',
            key: 'route.breadcrumb.folayer_settings',
          },
        }),
      }),
    ]

    render(<BreadcrumbNav />)

    expect(
      screen.getByText('luonnonmetsakartat:route.breadcrumb.admin')
    ).toBeInTheDocument()
    expect(
      screen.getByText('luonnonmetsakartat:route.breadcrumb.folayer')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'luonnonmetsakartat:route.breadcrumb.folayer_settings'
      )
    ).toBeInTheDocument()

    expect(mockedAppRouteLink).toHaveBeenCalledWith(
      expect.objectContaining({
        routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
        routeParams: { locale: 'fi', folayerIdSlug: 'layer-123' },
      })
    )
  })
})
