import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatAdminIndexRoute } from 'applets/luonnonmetsakartat/routeComponents'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/'
)({
  component: LuonnonmetsakartatAdminIndexRoute,
})
