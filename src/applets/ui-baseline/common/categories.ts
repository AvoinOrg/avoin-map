import {
  APP_ROUTE_KEYS,
  type AppRouteKey,
} from '#/common/routing/routeMetadata'

export const UI_BASELINE_NAMESPACE = 'ui-baseline'

export type UiBaselineCategoryId =
  | 'content'
  | 'dropdowns'
  | 'tooltips-and-help'
  | 'buttons-toggles'
  | 'layers'
  | 'inputs'
  | 'notifications'
  | 'panels'
  | 'drawing'
  | 'node-flow'
  | 'modals'

export type UiBaselineCategory = {
  id: UiBaselineCategoryId
  routeKey: AppRouteKey
  breadcrumbKey: string
  labelKey: string
}

export const UI_BASELINE_CATEGORIES: UiBaselineCategory[] = [
  {
    id: 'content',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_CONTENT,
    breadcrumbKey: 'route.breadcrumb.content',
    labelKey: 'home.categories.content',
  },
  {
    id: 'dropdowns',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_DROPDOWNS,
    breadcrumbKey: 'route.breadcrumb.dropdowns',
    labelKey: 'home.categories.dropdowns',
  },
  {
    id: 'tooltips-and-help',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_TOOLTIPS_AND_HELP,
    breadcrumbKey: 'route.breadcrumb.tooltips_and_help',
    labelKey: 'home.categories.tooltips_and_help',
  },
  {
    id: 'buttons-toggles',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_BUTTONS_TOGGLES,
    breadcrumbKey: 'route.breadcrumb.buttons_toggles',
    labelKey: 'home.categories.buttons_toggles',
  },
  {
    id: 'layers',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_LAYERS,
    breadcrumbKey: 'route.breadcrumb.layers',
    labelKey: 'home.categories.layers',
  },
  {
    id: 'inputs',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_INPUTS,
    breadcrumbKey: 'route.breadcrumb.inputs',
    labelKey: 'home.categories.inputs',
  },
  {
    id: 'notifications',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_NOTIFICATIONS,
    breadcrumbKey: 'route.breadcrumb.notifications',
    labelKey: 'home.categories.notifications',
  },
  {
    id: 'panels',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_PANELS,
    breadcrumbKey: 'route.breadcrumb.panels',
    labelKey: 'home.categories.panels',
  },
  {
    id: 'drawing',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_DRAWING,
    breadcrumbKey: 'route.breadcrumb.drawing',
    labelKey: 'home.categories.drawing',
  },
  {
    id: 'node-flow',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_NODE_FLOW,
    breadcrumbKey: 'route.breadcrumb.node_flow',
    labelKey: 'home.categories.node_flow',
  },
  {
    id: 'modals',
    routeKey: APP_ROUTE_KEYS.UI_BASELINE_MODALS,
    breadcrumbKey: 'route.breadcrumb.modals',
    labelKey: 'home.categories.modals',
  },
]

export const getUiBaselineCategory = (id: UiBaselineCategoryId) =>
  UI_BASELINE_CATEGORIES.find((category) => category.id === id)
