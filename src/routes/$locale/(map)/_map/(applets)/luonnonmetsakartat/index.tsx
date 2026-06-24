import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatIndexRoute } from '#/runtime/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/'
)({
  component: LuonnonmetsakartatIndexRoute,
})
