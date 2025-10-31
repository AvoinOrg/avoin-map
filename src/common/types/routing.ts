import { ReadonlyURLSearchParams } from 'next/navigation'

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
  [key: string]: RouteTree | any
}

export type Params = {
  routeParams?: Record<string, string>
  queryParams?:
    | Record<string, string>
    | URLSearchParams
    | ReadonlyURLSearchParams
}

export type RouteForLinks = {
  name: string
  path: string
  routeTree: RouteTree
  params?: Params
}
