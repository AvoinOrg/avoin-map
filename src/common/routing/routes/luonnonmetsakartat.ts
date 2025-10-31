import { RouteTree } from '#/common/types/routing'
import { getAppletRouteConfs } from '../routing'

export const APPLET_NAMESPACE = 'luonnonmetsakartat' as const

const appletConf = getAppletRouteConfs(APPLET_NAMESPACE)

export const routeTree: RouteTree = {
  _conf: {
    name: 'Etusivu',
    ...appletConf,
  },
  admin: {
    _conf: {
      path: 'admin',
      name: 'Admin',
    },
    import: {
      _conf: {
        path: 'tuo',
        name: 'Tuo',
      },
    },
    folayer: {
      _conf: {
        path: 'taso/[folayerId]',
        name: 'Karttataso',
      },
      settings: {
        _conf: {
          path: 'asetukset',
          name: 'Asetukset',
        },
      },
      pictures: {
        _conf: {
          path: 'kuvat',
          name: 'Kuvat',
        },
      },
    },
  },
}
