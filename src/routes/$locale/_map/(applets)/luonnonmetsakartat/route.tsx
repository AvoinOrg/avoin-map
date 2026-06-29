import { createFileRoute } from '@tanstack/react-router'

import { guardAppletLocale } from '#/runtime/appletRouteGuards'
import LuonnonmetsakartatLayout from 'applets/luonnonmetsakartat/pages/layout'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_TITLE,
} from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
  publicRouteConfig,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_HOME,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'canonical',
    home: true,
    title: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.home'),
    breadcrumb: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.home'),
    public: publicRouteConfig({
      slug: 'luonnonmetsakartat',
    }),
  }),
  beforeLoad: ({ params, location }) => {
    guardAppletLocale({
      namespace: 'luonnonmetsakartat',
      locale: params.locale,
      location,
    })
  },
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_TITLE,
      umamiWebsiteId:
        process.env.NEXT_PUBLIC_APPLETS_LUONNONMETSAKARTAT_UMAMI_ID,
    }),
  component: LuonnonmetsakartatLayout,
})
