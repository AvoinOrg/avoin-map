import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import UiBaselineDrawingPage from 'applets/ui-baseline/pages/drawing/UiBaselineDrawingPage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/drawing'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_DRAWING,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.drawing'),
    breadcrumb: routeTextKey('ui-baseline', 'route.breadcrumb.drawing'),
  }),
  component: UiBaselineDrawingPage,
})
