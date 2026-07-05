import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import CategoryPage from 'applets/ui-baseline/pages/CategoryPage'
import PanelsContent from 'applets/ui-baseline/pages/PanelsContent'

const PanelsPage = () => (
  <CategoryPage categoryId="panels">
    <PanelsContent />
  </CategoryPage>
)

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/panels'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_PANELS,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.panels'),
    breadcrumb: routeTextKey('ui-baseline', 'route.breadcrumb.panels'),
  }),
  component: PanelsPage,
})
