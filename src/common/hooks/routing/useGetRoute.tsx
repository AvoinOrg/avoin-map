'use client'
import { useUIStore } from '#/common/store'
import { Params, RouteTree } from '#/common/types/routing'
import { getRoute } from '#/common/utils/routing'

/**
 * The most accurate way for fetching a route within an applet.
 */
export const useGetRoute = (
  route: RouteTree,
  routeTree: RouteTree,
  { routeParams = {}, queryParams = {} }: Params = {},
  removeSteps = 0
) => {
  const isBaseDomainForApplet = useUIStore(
    (state) => state.isBaseDomainForApplet
  )

  let removeStepsFromRoot = 0

  if (routeTree._conf.isAppletRoot && isBaseDomainForApplet) {
    removeStepsFromRoot = 1
  }

  return getRoute(
    route,
    routeTree,
    { routeParams, queryParams },
    removeSteps,
    removeStepsFromRoot
  )
}
