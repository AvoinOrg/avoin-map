import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import UiBaselineModalsPage from 'applets/ui-baseline/pages/modals/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/modals'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_MODALS,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.modals'),
    breadcrumb: routeTextKey('ui-baseline', 'route.breadcrumb.modals'),
  }),
  component: UiBaselineModalsPage,
})
