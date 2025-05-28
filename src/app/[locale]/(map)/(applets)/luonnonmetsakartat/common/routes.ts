import { RouteTree } from '#/common/types/routing'
import path from 'path'

const basePath =
  process.env.NEXT_PUBLIC_USE_BASE_ROUTE_FOR_APPLETS === 'true'
    ? ''
    : 'luonnonmetsakartat'

export const routeTree: RouteTree = {
  _conf: {
    path: basePath,
    name: 'Etusivu',
    isAppletRoot: true,
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
    },
  },
}
