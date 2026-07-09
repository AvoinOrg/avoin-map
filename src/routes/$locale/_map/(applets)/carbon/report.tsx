import { createFileRoute } from '@tanstack/react-router'

import CarbonReportPage from 'applets/carbon/pages/report/CarbonReportPage'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
  publicRouteConfig,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/report'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.CARBON_REPORT,
    appletNamespace: 'carbon',
    variant: 'canonical',
    title: routeTextKey('hiilikartta', 'route.breadcrumb.report'),
    breadcrumb: routeTextKey('hiilikartta', 'route.breadcrumb.report'),
    public: publicRouteConfig({
      slug: 'report',
    }),
  }),
  component: CarbonReportPage,
})
