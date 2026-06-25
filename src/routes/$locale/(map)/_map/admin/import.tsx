import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatImportRoute } from 'applets/luonnonmetsakartat/routeComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_IMPORT_TITLE,
} from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute('/$locale/(map)/_map/admin/import')({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_IMPORT_VISIBLE_ALIAS,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'visible-alias',
    title: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.import'),
    breadcrumb: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.import'),
    public: {
      slug: 'import',
      canonicalRouteKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_IMPORT,
    },
  }),
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_IMPORT_TITLE,
    }),
  component: LuonnonmetsakartatImportRoute,
})
