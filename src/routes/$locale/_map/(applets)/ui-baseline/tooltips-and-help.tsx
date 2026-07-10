import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import UiBaselineTooltipsAndHelpPage from 'applets/ui-baseline/pages/tooltips-and-help/UiBaselineTooltipsAndHelpPage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/tooltips-and-help'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_TOOLTIPS_AND_HELP,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.tooltips_and_help'),
    breadcrumb: routeTextKey(
      'ui-baseline',
      'route.breadcrumb.tooltips_and_help'
    ),
  }),
  component: UiBaselineTooltipsAndHelpPage,
})
