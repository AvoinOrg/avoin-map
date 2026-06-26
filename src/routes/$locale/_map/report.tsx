import { createFileRoute } from '@tanstack/react-router'

import { guardVisibleAppletRootRoute } from '#/runtime/appletRouteGuards'
import { HiilikarttaVisibleReportRoute } from 'applets/hiilikartta/routeComponents'
import { getHiilikarttaHead } from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  publicRouteConfig,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute('/$locale/_map/report')({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.HIILIKARTTA_REPORT_VISIBLE_ALIAS,
    appletNamespace: 'hiilikartta',
    variant: 'visible-alias',
    title: routeTextKey('hiilikartta', 'route.breadcrumb.report'),
    breadcrumb: routeTextKey('hiilikartta', 'route.breadcrumb.report'),
    public: publicRouteConfig({
      slug: 'report',
      canonicalRouteKey: APP_ROUTE_KEYS.HIILIKARTTA_REPORT,
    }),
  }),
  beforeLoad: ({ params, location }) => {
    guardVisibleAppletRootRoute({
      namespace: 'hiilikartta',
      locale: params.locale,
      location,
    })
  },
  head: ({ params }) =>
    getHiilikarttaHead({
      locale: params.locale,
      umamiWebsiteId: process.env.NEXT_PUBLIC_APPLETS_HIILIKARTTA_UMAMI_ID,
    }),
  component: HiilikarttaVisibleReportRoute,
})
