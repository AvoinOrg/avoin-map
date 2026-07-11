import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatAdminShell from 'applets/luonnonmetsakartat/pages/admin/LuonnonmetsakartatAdminShell'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_ADMIN_TITLE,
} from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'canonical',
    title: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.admin'),
    breadcrumb: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.admin'),
  }),
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_ADMIN_TITLE,
    }),
  component: LuonnonmetsakartatAdminShell,
})
