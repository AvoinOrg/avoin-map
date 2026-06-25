import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlanAreasRoute } from 'applets/hiilikartta/routeComponents'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  publicRouteConfig,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/plans/$planId/areas'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.HIILIKARTTA_PLAN_AREAS_VISIBLE_ALIAS,
    appletNamespace: 'hiilikartta',
    variant: 'visible-alias',
    title: routeTextKey('hiilikartta', 'route.breadcrumb.plan_areas'),
    breadcrumb: routeTextKey('hiilikartta', 'route.breadcrumb.plan_areas'),
    public: publicRouteConfig({
      slug: 'areas',
      canonicalRouteKey: APP_ROUTE_KEYS.HIILIKARTTA_PLAN_AREAS,
    }),
  }),
  component: HiilikarttaPlanAreasRoute,
})
