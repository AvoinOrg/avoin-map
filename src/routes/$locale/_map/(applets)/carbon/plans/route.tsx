import { createFileRoute } from '@tanstack/react-router'

import HiilikarttaPlansLayout from 'applets/carbon/pages/kaavat/layout'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
  publicRouteConfig,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/plans'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.CARBON_PLANS,
    appletNamespace: 'carbon',
    variant: 'canonical',
    title: routeTextKey('hiilikartta', 'route.breadcrumb.plans'),
    breadcrumb: routeTextKey('hiilikartta', 'route.breadcrumb.plans'),
    public: publicRouteConfig({
      slug: 'plans',
    }),
  }),
  component: HiilikarttaPlansLayout,
})
