import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerSettingsRoute } from 'applets/luonnonmetsakartat/routeComponents'
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
  '/$locale/(map)/_map/admin/layer/$folayerIdSlug/settings'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER_SETTINGS_VISIBLE_ALIAS,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'visible-alias',
    title: routeTextKey(
      'luonnonmetsakartat',
      'route.breadcrumb.folayer_settings'
    ),
    breadcrumb: routeTextKey(
      'luonnonmetsakartat',
      'route.breadcrumb.folayer_settings'
    ),
    public: {
      slug: 'settings',
      canonicalRouteKey:
        APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER_SETTINGS,
    },
  }),
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_SETTINGS_TITLE,
    }),
  component: LuonnonmetsakartatFolayerSettingsRoute,
})
