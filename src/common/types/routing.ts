export type RouteObject = {
  name: string
  path: string
  isAppletRoot?: boolean
  domain?: string
}

export type AppletRouteObject = RouteObject & {
  isAppletRoot: true
  domain?: string
}

export type RouteTree = {
  _conf: RouteObject | AppletRouteObject
} & {
  // Route objects intentionally expose named child routes through property
  // access during the dual Next/Start migration; keep this broad until the
  // route tree can become generated/typed end to end.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: RouteTree | any
}

export type Params = {
  routeParams?: Record<string, string>
  queryParams?: QueryParams
}

export type RouteForLinks = {
  name: string
  path: string
  routeTree: RouteTree
  params?: Params
}

export type QueryParamPrimitive = string | number | boolean

export type QueryParamValue =
  | QueryParamPrimitive
  | null
  | undefined

export type QueryParamRecord = Record<string, QueryParamValue>

export type SearchParamsLike = {
  toString: () => string
  entries?: () => IterableIterator<[string, string]>
  forEach?: (
    callback: (value: string, key: string, parent: SearchParamsLike) => void
  ) => void
}

export type QueryParams = QueryParamRecord | URLSearchParams | SearchParamsLike
