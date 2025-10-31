'use client'
import { useUIStore } from '#/common/store'
import { Params, RouteTree } from '#/common/types/routing'
import { getRoute } from '#/common/routing/routing-client'
import { useEffect, useMemo } from 'react'

/**
 * The most accurate way for fetching a route within an applet.
 */
export const useGetRoute = (
  route: RouteTree,
  routeTree: RouteTree,
  { routeParams = {}, queryParams = {} }: Params = {},
  removeSteps = 0,
  removeStepsFromRoot = 0
) => {
  const isBaseDomainForApplet = useUIStore(
    (state) => state.isBaseDomainForApplet
  )

  const computedRoute = useMemo(() => {
    return getRoute({
      routeNode: route,
      routeTree: routeTree,
      params: { routeParams, queryParams },
      removeSteps: removeSteps,
      removeStepsFromRoot: removeStepsFromRoot,
    })
  }, [
    route,
    routeTree,
    routeParams,
    queryParams,
    removeSteps,
    removeStepsFromRoot,
    isBaseDomainForApplet,
  ])

  return computedRoute
}
