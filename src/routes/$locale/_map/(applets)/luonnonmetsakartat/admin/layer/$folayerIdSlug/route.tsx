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
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/layer/$folayerIdSlug'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'canonical',
    title: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.folayer'),
    breadcrumb: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.folayer'),
    public: {
      slug: 'layer/$folayerIdSlug',
    },
  }),
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_TITLE,
    }),
  component: LuonnonmetsakartatFolayerLayout,
})
