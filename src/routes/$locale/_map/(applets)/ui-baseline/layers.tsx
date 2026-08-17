import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import UiBaselineLayersPage from 'applets/ui-baseline/pages/layers/UiBaselineLayersPage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/layers'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_LAYERS,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.layers'),
    breadcrumb: routeTextKey('ui-baseline', 'route.breadcrumb.layers'),
  }),
  component: UiBaselineLayersPage,
})
