import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import UiBaselineInputsPage from 'applets/ui-baseline/pages/inputs/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/inputs'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_INPUTS,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.inputs'),
    breadcrumb: routeTextKey('ui-baseline', 'route.breadcrumb.inputs'),
  }),
  component: UiBaselineInputsPage,
})
