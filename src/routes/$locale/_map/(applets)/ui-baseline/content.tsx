import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import UiBaselineContentPage from 'applets/ui-baseline/pages/content/UiBaselineContentPage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/content'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_CONTENT,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.content'),
    breadcrumb: routeTextKey('ui-baseline', 'route.breadcrumb.content'),
  }),
  component: UiBaselineContentPage,
})
