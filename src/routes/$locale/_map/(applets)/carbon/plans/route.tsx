import { createFileRoute } from '@tanstack/react-router'

import CarbonPlansShell from 'applets/carbon/pages/plans/CarbonPlansShell'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
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
  }),
  component: CarbonPlansShell,
})
