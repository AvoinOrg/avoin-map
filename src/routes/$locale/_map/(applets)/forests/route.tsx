import { createFileRoute } from '@tanstack/react-router'

import ForestsShell from 'applets/forests/ForestsShell'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/forests'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.MAIN_FORESTS,
    appletNamespace: 'main',
    variant: 'canonical',
    title: routeTextKey('avoin-map', 'sidebar.forests'),
    breadcrumb: routeTextKey('avoin-map', 'sidebar.forests'),
    public: {
      slug: 'forests',
    },
  }),
  component: ForestsShell,
})
