import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import ButtonsTogglesContent from 'applets/ui-baseline/pages/ButtonsTogglesContent'
import CategoryPage from 'applets/ui-baseline/pages/CategoryPage'

const ButtonsTogglesPage = () => (
  <CategoryPage categoryId="buttons-toggles">
    <ButtonsTogglesContent />
  </CategoryPage>
)

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/buttons-toggles'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_BUTTONS_TOGGLES,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.buttons_toggles'),
    breadcrumb: routeTextKey(
      'ui-baseline',
      'route.breadcrumb.buttons_toggles'
    ),
  }),
  component: ButtonsTogglesPage,
})
