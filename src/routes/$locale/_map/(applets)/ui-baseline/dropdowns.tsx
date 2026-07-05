import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import CategoryPage from 'applets/ui-baseline/pages/CategoryPage'

const DropdownsPage = () => <CategoryPage categoryId="dropdowns" />

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/dropdowns'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_DROPDOWNS,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.dropdowns'),
    breadcrumb: routeTextKey('ui-baseline', 'route.breadcrumb.dropdowns'),
  }),
  component: DropdownsPage,
})
