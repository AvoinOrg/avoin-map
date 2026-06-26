import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerIndexRoute } from 'applets/luonnonmetsakartat/routeComponents'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/layer/$folayerIdSlug/'
)({
  component: LuonnonmetsakartatFolayerIndexRoute,
})
