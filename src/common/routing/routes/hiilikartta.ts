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
      name: 'Kaavat',
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
