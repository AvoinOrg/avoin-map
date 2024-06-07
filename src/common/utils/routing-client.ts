/**
 * This file exists because next.js has tree shaking issues, so everything in a file is imported
 * even when unnecessary. useUIStore uses lodash-es, which uses code that is unsupported edge runtime
 */

import { useUIStore } from '../store/UIStore'
import { RouteTree, Params } from '../types/routing'
import { getRouteNoStoreCheck } from './routing'

/**
 * Creates a route from routeTree. Note that if used within an applet, the function might get called before the
 * isBaseDomainForApplet is properly set, resulting in an incorrect path, depending on whether the applet
 * is the root of the domain or not.
 */
export const getRoute = (
  route: RouteTree,
  routeTree: RouteTree,
  { routeParams = {}, queryParams = {} }: Params = {},
  removeSteps = 0,
  removeStepsFromRoot = 0
) => {
  const isBaseDomainForApplet = useUIStore.getState().isBaseDomainForApplet

  if (
    removeStepsFromRoot === 0 &&
    routeTree._conf.isAppletRoot &&
    isBaseDomainForApplet
  ) {
    removeStepsFromRoot = 1
  }

  return getRouteNoStoreCheck(
    route,
    routeTree,
    { routeParams, queryParams },
    removeSteps,
    removeStepsFromRoot
  )
}
