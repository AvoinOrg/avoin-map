import { createFileRoute } from '@tanstack/react-router'

import {
  APP_ROUTE_KEYS,
  defineAppRouteStaticData,
  routeTextKey,
} from '#/common/routing/routeMetadata'
import CategoryPage from 'applets/ui-baseline/pages/CategoryPage'
import NodeFlowContent from 'applets/ui-baseline/pages/NodeFlowContent'

const NodeFlowPage = () => (
  <CategoryPage categoryId="node-flow">
    <NodeFlowContent />
  </CategoryPage>
)

export const Route = createFileRoute(
  '/$locale/_map/(applets)/ui-baseline/node-flow'
)({
  staticData: defineAppRouteStaticData({
    key: APP_ROUTE_KEYS.UI_BASELINE_NODE_FLOW,
    appletNamespace: 'ui-baseline',
    variant: 'canonical',
    title: routeTextKey('ui-baseline', 'route.breadcrumb.node_flow'),
    breadcrumb: routeTextKey('ui-baseline', 'route.breadcrumb.node_flow'),
  }),
  component: NodeFlowPage,
})
