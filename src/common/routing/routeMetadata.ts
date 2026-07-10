export const APPLET_NAMESPACES = [
  'main',
  'energy',
  'carbon',
  'luonnonmetsakartat',
  'ui-baseline',
] as const

export type AppletNamespace = (typeof APPLET_NAMESPACES)[number]

export type AppRouteVariant = 'canonical'

export type RouteTextKey = {
  ns: string
  key: string
}

export const APP_ROUTE_KEYS = {
  MAIN_HOME: 'main.home',
  ENERGY_HOME: 'energy.home',
  CARBON_HOME: 'carbon.home',
  CARBON_REPORT: 'carbon.report',
  CARBON_PLANS: 'carbon.plans',
  CARBON_PLAN: 'carbon.plan',
  CARBON_PLAN_AREAS: 'carbon.plan.areas',
  LUONNONMETSAKARTAT_HOME: 'luonnonmetsakartat.home',
  LUONNONMETSAKARTAT_ADMIN: 'luonnonmetsakartat.admin',
  LUONNONMETSAKARTAT_ADMIN_IMPORT: 'luonnonmetsakartat.admin.import',
  LUONNONMETSAKARTAT_ADMIN_FOLAYER: 'luonnonmetsakartat.admin.folayer',
  LUONNONMETSAKARTAT_ADMIN_FOLAYER_SETTINGS:
    'luonnonmetsakartat.admin.folayer.settings',
  LUONNONMETSAKARTAT_ADMIN_FOLAYER_PICTURES:
    'luonnonmetsakartat.admin.folayer.pictures',
  UI_BASELINE_HOME: 'ui-baseline.home',
  UI_BASELINE_CONTENT: 'ui-baseline.content',
  UI_BASELINE_DROPDOWNS: 'ui-baseline.dropdowns',
  UI_BASELINE_BUTTONS_TOGGLES: 'ui-baseline.buttons-toggles',
  UI_BASELINE_INPUTS: 'ui-baseline.inputs',
  UI_BASELINE_NOTIFICATIONS: 'ui-baseline.notifications',
  UI_BASELINE_PANELS: 'ui-baseline.panels',
  UI_BASELINE_DRAWING: 'ui-baseline.drawing',
  UI_BASELINE_NODE_FLOW: 'ui-baseline.node-flow',
  UI_BASELINE_MODALS: 'ui-baseline.modals',
  MAIN_FORESTS: 'main.forests',
} as const

export type AppRouteKey = (typeof APP_ROUTE_KEYS)[keyof typeof APP_ROUTE_KEYS]

export type AppRouteMetadata = {
  key: AppRouteKey
  appletNamespace: AppletNamespace
  variant: AppRouteVariant
  home?: boolean
  breadcrumb?: RouteTextKey
  title?: RouteTextKey
  public?: {
    slug?: string
  }
}

export type AppRouteStaticData = {
  appRoute?: AppRouteMetadata
}

export const defineAppRouteStaticData = (metadata: AppRouteMetadata): AppRouteStaticData =>
  ({ appRoute: metadata })

export const routeTextKey = (ns: string, key: string): RouteTextKey => ({ ns, key })

export const publicRouteConfig = (
  config: AppRouteMetadata['public']
): AppRouteMetadata['public'] => config

export const getAppRouteMetadata = (
  route: unknown
): AppRouteMetadata | undefined => {
  if (!isRouteLike(route)) {
    return undefined
  }

  return getAppRouteMetadataFromStaticData(route.options?.staticData)
}

export const getAppRouteMetadataFromStaticData = (
  staticData: unknown
): AppRouteMetadata | undefined => {
  if (!isRecord(staticData)) {
    return undefined
  }

  const appRoute = staticData.appRoute
  return isAppRouteMetadata(appRoute) ? appRoute : undefined
}

export type AppRouteMetadataIndex = Partial<Record<AppRouteKey, AppRouteMetadata>>

export type AppRouteMetadataCollection = {
  ordered: AppRouteMetadata[]
  index: AppRouteMetadataIndex
}

const APP_ROUTE_KEY_SET = new Set<AppRouteKey>(
  Object.values(APP_ROUTE_KEYS) as AppRouteKey[]
)

const APPLET_NAMESPACE_SET = new Set<AppletNamespace>(APPLET_NAMESPACES)

type RouteChildren =
  | RouteRecord
  | RouteList
  | undefined
  | null

type TanstackRouteLike = {
  id: string
  options?: {
    staticData?: {
      appRoute?: unknown
    }
  }
  children?: RouteChildren
}

type RouteList = TanstackRouteLike[]
type RouteRecord = Record<string, unknown>

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const isRouteLike = (value: unknown): value is TanstackRouteLike =>
  isRecord(value) && typeof value.id === 'string'

const isAppRouteKey = (value: unknown): value is AppRouteKey =>
  typeof value === 'string' && APP_ROUTE_KEY_SET.has(value as AppRouteKey)

const isAppletNamespace = (
  value: unknown
): value is AppletNamespace =>
  typeof value === 'string' && APPLET_NAMESPACE_SET.has(value as AppletNamespace)

const isRouteVariant = (value: unknown): value is AppRouteVariant =>
  value === 'canonical'

const isRouteTextKey = (value: unknown): value is RouteTextKey =>
  isRecord(value) &&
  typeof value.ns === 'string' &&
  typeof value.key === 'string'

const isPublicMetadata = (
  value: unknown
): value is AppRouteMetadata['public'] => {
  if (value === undefined) return true
  if (!isRecord(value)) return false

  const slug = (value as { slug?: unknown }).slug

  if (slug !== undefined && typeof slug !== 'string') {
    return false
  }

  return true
}

const isAppRouteMetadata = (value: unknown): value is AppRouteMetadata => {
  if (!isRecord(value)) {
    return false
  }

  const metadata = value as AppRouteMetadata & {
    home?: unknown
    breadcrumb?: unknown
    title?: unknown
  }

  if (!isAppRouteKey(metadata.key)) return false
  if (!isAppletNamespace(metadata.appletNamespace)) return false
  if (!isRouteVariant(metadata.variant)) return false
  if (metadata.home !== undefined && typeof metadata.home !== 'boolean') return false
  if (metadata.breadcrumb !== undefined && !isRouteTextKey(metadata.breadcrumb))
    return false
  if (metadata.title !== undefined && !isRouteTextKey(metadata.title))
    return false

  if (!isPublicMetadata(metadata.public)) return false

  return true
}

const getRouteChildren = (route: TanstackRouteLike): TanstackRouteLike[] => {
  const children = route.children
  if (!children) return []

  if (Array.isArray(children)) {
    return children.filter(isRouteLike)
  }

  return Object.values(children).filter(isRouteLike)
}

const collectMetadataEntries = (
  routeTree: unknown,
  ordered: AppRouteMetadata[],
  index: AppRouteMetadataIndex
): AppRouteMetadataIndex => {
  if (routeTree == null) {
    return index
  }

  if (Array.isArray(routeTree)) {
    routeTree.forEach((route) =>
      collectMetadataEntries(route, ordered, index)
    )
    return index
  }

  if (!isRouteLike(routeTree)) {
    return index
  }

  const route = routeTree
  const metadata = getAppRouteMetadata(route)
  const routeId = route.id || '<unknown>'

  if (metadata) {
    if (index[metadata.key]) {
      throw new Error(
        `Duplicate AppRouteKey "${metadata.key}" found while collecting metadata ` +
          `at route "${routeId}"`
      )
    }
    index[metadata.key] = metadata
    ordered.push(metadata)
  }

  const children = getRouteChildren(route)
  if (children.length > 0) {
    children.forEach((child) =>
      collectMetadataEntries(child, ordered, index)
    )
  }

  return index
}

export const collectAppRouteMetadata = (
  routeTree: unknown
): AppRouteMetadataCollection => {
  const ordered: AppRouteMetadata[] = []
  const index: AppRouteMetadataIndex = {}

  collectMetadataEntries(routeTree, ordered, index)

  return { ordered, index }
}
