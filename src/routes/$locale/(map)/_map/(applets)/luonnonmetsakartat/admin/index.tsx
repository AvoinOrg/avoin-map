import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatAdminIndexRoute } from '#/runtime/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/'
)({
  component: LuonnonmetsakartatAdminIndexRoute,
})
