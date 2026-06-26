import { Outlet, createFileRoute } from '@tanstack/react-router'

import ForestsLayoutClient from 'applets/forests/layoutClient'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'

const ForestsLayout = () => (
  <ForestsLayoutClient>
    <Outlet />
  </ForestsLayoutClient>
)

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
  component: ForestsLayout,
})
