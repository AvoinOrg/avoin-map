import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerIndexRoute } from '#/runtime/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/taso/$folayerIdSlug/'
)({
  component: LuonnonmetsakartatFolayerIndexRoute,
})
