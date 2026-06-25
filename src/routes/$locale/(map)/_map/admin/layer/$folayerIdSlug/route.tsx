import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerLayout } from 'applets/luonnonmetsakartat/routeComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_FOLAYER_TITLE,
} from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/layer/$folayerIdSlug'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER_VISIBLE_ALIAS,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'visible-alias',
    title: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.folayer'),
    breadcrumb: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.folayer'),
    public: {
      slug: 'layer/$folayerIdSlug',
      canonicalRouteKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
    },
  }),
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_TITLE,
    }),
  component: LuonnonmetsakartatFolayerLayout,
})
