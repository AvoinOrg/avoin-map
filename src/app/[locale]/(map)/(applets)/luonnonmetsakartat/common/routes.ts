import { RouteTree } from '#/common/types/routing'

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
  },
}
