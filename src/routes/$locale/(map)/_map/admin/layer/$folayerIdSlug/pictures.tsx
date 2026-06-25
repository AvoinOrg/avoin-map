import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerPicturesRoute } from 'applets/luonnonmetsakartat/routeComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_FOLAYER_PICTURES_TITLE,
} from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/layer/$folayerIdSlug/pictures'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER_PICTURES_VISIBLE_ALIAS,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'visible-alias',
    title: routeTextKey(
      'luonnonmetsakartat',
      'route.breadcrumb.folayer_pictures'
    ),
    breadcrumb: routeTextKey(
      'luonnonmetsakartat',
      'route.breadcrumb.folayer_pictures'
    ),
    public: {
      slug: 'pictures',
      canonicalRouteKey:
        APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER_PICTURES,
    },
  }),
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_PICTURES_TITLE,
    }),
  component: LuonnonmetsakartatFolayerPicturesRoute,
})
