import { RouteTree } from '#/common/types/routing'
import { getAppletRouteConfs } from '../routing'

export const APPLET_NAMESPACE = 'hiilikartta' as const

const appletConf = getAppletRouteConfs(APPLET_NAMESPACE)
export const routeTree = {
  _conf: {
    name: 'Etusivu',
    ...appletConf,
  },
  plans: {
    _conf: {
      path: 'kaavat',
      name: 'Kaavat',
    },
    plan: {
      _conf: {
        path: '[planId]',
        name: 'Kaava',
      },
      areas: {
        _conf: {
          path: 'alueet',
          name: 'Alueet',
        },
      },
    },
  },
  report: {
    _conf: {
      path: 'raportti',
      name: 'Raportti',
    },
  },
} as const satisfies RouteTree
