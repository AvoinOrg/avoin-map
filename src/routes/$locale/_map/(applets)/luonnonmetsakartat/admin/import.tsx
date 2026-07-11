import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatAdminImportPage from 'applets/luonnonmetsakartat/pages/admin/import/LuonnonmetsakartatAdminImportPage'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_IMPORT_TITLE,
} from '#/runtime/headMetadata'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/import'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_IMPORT,
    appletNamespace: 'luonnonmetsakartat',
    variant: 'canonical',
    title: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.import'),
    breadcrumb: routeTextKey('luonnonmetsakartat', 'route.breadcrumb.import'),
  }),
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_IMPORT_TITLE,
    }),
  component: LuonnonmetsakartatAdminImportPage,
})
