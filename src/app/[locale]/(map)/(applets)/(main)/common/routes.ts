import { RouteTree } from '#/common/types/routing'

export const routeTree: RouteTree = {
  _conf: {
    path: '/',
    name: 'Home',
    isAppletRoot: true,
  },
  forests: {
    _conf: {
      path: '/forests',
      name: 'Forests',
    },
  },
}
