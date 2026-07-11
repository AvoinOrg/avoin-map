import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatAdminLayerFolayerSettingsPage from 'applets/luonnonmetsakartat/pages/admin/layer/folayer/settings/LuonnonmetsakartatAdminLayerFolayerSettingsPage'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_FOLAYER_SETTINGS_TITLE,
} from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/layer/$folayerIdSlug/settings'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER_SETTINGS,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'canonical',
    title: routeTextKey(
      'luonnonmetsakartat',
      'route.breadcrumb.folayer_settings'
    ),
    breadcrumb: routeTextKey(
      'luonnonmetsakartat',
      'route.breadcrumb.folayer_settings'
    ),
  }),
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_SETTINGS_TITLE,
    }),
  component: LuonnonmetsakartatAdminLayerFolayerSettingsPage,
})
