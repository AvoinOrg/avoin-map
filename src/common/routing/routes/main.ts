import { RouteTree } from '#/common/types/routing'
import { compiledApplets } from '../routing'

import {
  routeTree as energiakarttaRouteTree,
  APPLET_NAMESPACE as ENERGIAKARTTA_NAMESPACE,
} from '#/common/routing/routes/energiakartta'
import {
  routeTree as hiilikarttaRouteTree,
  APPLET_NAMESPACE as HIIILIKARTTA_NAMESPACE,
} from '#/common/routing/routes/hiilikartta'
import {
  routeTree as luonnonmetsakartatRouteTree,
  APPLET_NAMESPACE as LUONNONMETSAKARTAT_NAMESPACE,
} from '#/common/routing/routes/luonnonmetsakartat'

export const MAIN_NAMESPACE = 'main' as const

const isMainAppletCompiled = compiledApplets.includes(MAIN_NAMESPACE)
const mainDomain = process.env.NEXT_PUBLIC_MAIN_APP_DOMAIN

export const mainRouteTree = {
  _conf: {
    path: '/',
    name: isMainAppletCompiled ? 'Home' : 'Avoin Map',
    ...(mainDomain && { domain: mainDomain }),
    isAppletRoot: true,
  },
  forests: {
    _conf: {
      path: '/forests',
      name: 'Forests',
    },
  },
  [ENERGIAKARTTA_NAMESPACE]: energiakarttaRouteTree,
  [HIIILIKARTTA_NAMESPACE]: hiilikarttaRouteTree,
  [LUONNONMETSAKARTAT_NAMESPACE]: luonnonmetsakartatRouteTree,
} as const satisfies RouteTree
