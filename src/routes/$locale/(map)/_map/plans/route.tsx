import { createFileRoute } from '@tanstack/react-router'

import { guardVisibleAppletRootRoute } from '#/runtime/appletRouteGuards'
import { HiilikarttaVisiblePlansLayoutRoute } from 'applets/hiilikartta/routeComponents'
import { getHiilikarttaHead } from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  publicRouteConfig,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute('/$locale/(map)/_map/plans')({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.HIILIKARTTA_PLANS_VISIBLE_ALIAS,
    appletNamespace: 'hiilikartta',
    variant: 'visible-alias',
    title: routeTextKey('hiilikartta', 'route.breadcrumb.plans'),
    breadcrumb: routeTextKey('hiilikartta', 'route.breadcrumb.plans'),
    public: publicRouteConfig({
      slug: 'plans',
      canonicalRouteKey: APP_ROUTE_KEYS.HIILIKARTTA_PLANS,
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
  component: HiilikarttaVisiblePlansLayoutRoute,
})
