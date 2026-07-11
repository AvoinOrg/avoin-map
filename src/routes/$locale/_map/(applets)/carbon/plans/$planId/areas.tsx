import { createFileRoute } from '@tanstack/react-router'

import CarbonPlansPlanAreasPage from 'applets/carbon/pages/plans/plan/areas/CarbonPlansPlanAreasPage'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/plans/$planId/areas'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.CARBON_PLAN_AREAS,
    appletNamespace: 'carbon',
    variant: 'canonical',
    title: routeTextKey('hiilikartta', 'route.breadcrumb.plan_areas'),
    breadcrumb: routeTextKey('hiilikartta', 'route.breadcrumb.plan_areas'),
  }),
  component: CarbonPlansPlanAreasPage,
})
