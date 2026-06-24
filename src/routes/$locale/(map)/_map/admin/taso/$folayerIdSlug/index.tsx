import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerIndexRoute } from '#/runtime/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/taso/$folayerIdSlug/'
)({
  component: LuonnonmetsakartatFolayerIndexRoute,
})
