import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import { guardAppletLocale } from '#/runtime/appletRouteGuards'
import { getStaticAppletHead } from '#/runtime/headMetadata'
import UiBaselineLayout from 'applets/ui-baseline/pages/layout'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_HOME,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    home: true,
    title: routeTextKey('ui-baseline', 'route.breadcrumb.home'),
    breadcrumb: routeTextKey('ui-baseline', 'route.breadcrumb.home'),
  }),
  beforeLoad: ({ params, location }) => {
    guardAppletLocale({
      namespace: 'ui-baseline',
      locale: params.locale,
      location,
    })
  },
  head: () => getStaticAppletHead({ title: 'UI Baseline' }),
  component: UiBaselineLayout,
})
