import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatAdminLayerFolayerPicturesPage from 'applets/luonnonmetsakartat/pages/admin/layer/folayer/pictures/LuonnonmetsakartatAdminLayerFolayerPicturesPage'
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
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/layer/$folayerIdSlug/pictures'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER_PICTURES,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'canonical',
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
    },
  }),
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_PICTURES_TITLE,
    }),
  component: LuonnonmetsakartatAdminLayerFolayerPicturesPage,
})
