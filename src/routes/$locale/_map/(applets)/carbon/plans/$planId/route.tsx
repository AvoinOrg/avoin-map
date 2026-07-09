import { createFileRoute } from '@tanstack/react-router'

import CarbonPlansPlanShell from 'applets/carbon/pages/plans/plan/CarbonPlansPlanShell'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  publicRouteConfig,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/plans/$planId'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.CARBON_PLAN,
    appletNamespace: 'carbon',
    variant: 'canonical',
    title: routeTextKey('hiilikartta', 'route.breadcrumb.plan'),
    breadcrumb: routeTextKey('hiilikartta', 'route.breadcrumb.plan'),
    public: publicRouteConfig({
      slug: '$planId',
    }),
  }),
  component: CarbonPlansPlanShell,
})
