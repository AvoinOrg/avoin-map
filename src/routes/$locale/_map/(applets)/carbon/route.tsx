import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/runtime/appletRouteGuards'
import HiilikarttaLayout from 'applets/hiilikartta/pages/layout'
import { getHiilikarttaHead } from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
  publicRouteConfig,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.HIILIKARTTA_HOME,
    appletNamespace: 'hiilikartta',
    variant: 'canonical',
    home: true,
    title: routeTextKey('hiilikartta', 'route.breadcrumb.home'),
    breadcrumb: routeTextKey('hiilikartta', 'route.breadcrumb.home'),
    public: publicRouteConfig({
      slug: 'carbon',
    }),
  }),
  beforeLoad: ({ params, location }) => {
    guardAppletLocale({
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
  component: HiilikarttaLayout,
})
