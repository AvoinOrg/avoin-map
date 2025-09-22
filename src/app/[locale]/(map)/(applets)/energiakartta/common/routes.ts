import { RouteTree } from '#/common/types/routing'

const basePath =
  process.env.NEXT_PUBLIC_APPLET_NAMESPACE === 'energiakartta'
    ? ''
    : 'energiakartta'

export const routeTree: RouteTree = {
  _conf: {
    path: basePath,
    name: 'Etusivu',
    isAppletRoot: true,
  },
}
