import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatIndexRoute } from 'applets/luonnonmetsakartat/routeComponents'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/'
)({
  component: LuonnonmetsakartatIndexRoute,
})
