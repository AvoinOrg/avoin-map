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
export interface GetRouteArgs {
  routeNode: RouteTree
  routeTree: RouteTree
  params?: Params
  removeSteps?: number
  removeStepsFromRoot?: number
}

export const getRoute = ({
  routeNode,
  routeTree,
  params = {},
  removeSteps = 0,
  removeStepsFromRoot = 0,
}: GetRouteArgs) => {
  const isBaseDomainForApplet = useUIStore.getState().isBaseDomainForApplet
  const { routeParams = {}, queryParams = {} } = params

  if (
    removeStepsFromRoot === 0 &&
    routeTree._conf.isAppletRoot &&
    isBaseDomainForApplet
  ) {
    removeStepsFromRoot = 1
  }

  return getRouteNoStoreCheck({
    routeNode: routeNode,
    routeTree: routeTree,
    params: { routeParams, queryParams },
    removeSteps: removeSteps,
    removeStepsFromRoot: removeStepsFromRoot,
  })
}
