import { createFileRoute } from '@tanstack/react-router'

import { guardVisibleAppletRootRoute } from '#/runtime/appletRouteGuards'
import { LuonnonmetsakartatVisibleAdminLayout } from 'applets/luonnonmetsakartat/routeComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_ADMIN_TITLE,
} from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  publicRouteConfig,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute('/$locale/(map)/_map/admin')({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_VISIBLE_ALIAS,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'visible-alias',
    title: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.admin'),
    breadcrumb: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.admin'),
    public: publicRouteConfig({
      slug: 'admin',
      canonicalRouteKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN,
    }),
  }),
  beforeLoad: ({ params, location }) => {
    guardVisibleAppletRootRoute({
      namespace: 'luonnonmetsakartat',
      locale: params.locale,
      location,
    })
  },
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_ADMIN_TITLE,
      umamiWebsiteId:
        process.env.NEXT_PUBLIC_APPLETS_LUONNONMETSAKARTAT_UMAMI_ID,
    }),
  component: LuonnonmetsakartatVisibleAdminLayout,
})
