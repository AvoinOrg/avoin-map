import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlanAreasRoute } from 'applets/hiilikartta/routeComponents'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  publicRouteConfig,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/plans/$planId/areas'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.HIILIKARTTA_PLAN_AREAS,
    appletNamespace: 'hiilikartta',
    variant: 'canonical',
    title: routeTextKey('hiilikartta', 'route.breadcrumb.plan_areas'),
    breadcrumb: routeTextKey('hiilikartta', 'route.breadcrumb.plan_areas'),
    public: publicRouteConfig({
      slug: 'areas',
    }),
  }),
  component: HiilikarttaPlanAreasRoute,
})
