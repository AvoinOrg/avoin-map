import { RouteTree } from '#/common/types/routing'
import { getAppletRouteConfs } from '../routing'

export const APPLET_NAMESPACE = 'energiakartta' as const

const appletConf = getAppletRouteConfs(APPLET_NAMESPACE)

export const routeTree = {
  _conf: {
    name: 'Etusivu',
    ...appletConf,
  },
  test: {
    _conf: {
      path: 'test',
      name: 'test',
    },
  },
} satisfies RouteTree
