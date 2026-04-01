import { RouteTree } from '#/common/types/routing'
import { getAppletRouteConfs } from '../routing'

export const APPLET_NAMESPACE = 'hiilikartta' as const

const appletConf = getAppletRouteConfs(APPLET_NAMESPACE)
export const routeTree = {
  _conf: {
    name: 'Etusivu',
    ...appletConf,
  },
  create: {
    _conf: {
      path: 'luo',
      name: 'Luo kaava',
    },
    import: {
      _conf: {
        path: 'tuo',
        name: 'Tuo uusi kaavatiedosto',
      },
    },
  },
  plans: {
    _conf: {
      path: 'kaavat',
      name: 'Omat kaavat',
    },
    import: {
      _conf: {
        path: 'tuo',
        name: 'Tuo uusi kaavatiedosto',
      },
    },
    plan: {
      _conf: {
        path: '[planId]',
        name: 'Kaavan tiedot',
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
