import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlanLayoutRoute } from 'applets/hiilikartta/routeComponents'
import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  publicRouteConfig,
  routeTextKey,
} from '#/common/routing/routeMetadata'

export const Route = createFileRoute('/$locale/(map)/_map/plans/$planId')({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.HIILIKARTTA_PLAN_VISIBLE_ALIAS,
    appletNamespace: 'hiilikartta',
    variant: 'visible-alias',
    title: routeTextKey('hiilikartta', 'route.breadcrumb.plan'),
    breadcrumb: routeTextKey('hiilikartta', 'route.breadcrumb.plan'),
    public: publicRouteConfig({
      slug: '$planId',
      canonicalRouteKey: APP_ROUTE_KEYS.HIILIKARTTA_PLAN,
    }),
  }),
  component: HiilikarttaPlanLayoutRoute,
})
