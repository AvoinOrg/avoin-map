import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import CategoryPage from 'applets/ui-baseline/pages/CategoryPage'

const NotificationsPage = () => <CategoryPage categoryId="notifications" />

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/notifications'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_NOTIFICATIONS,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.notifications'),
    breadcrumb: routeTextKey('ui-baseline', 'route.breadcrumb.notifications'),
  }),
  component: NotificationsPage,
})
