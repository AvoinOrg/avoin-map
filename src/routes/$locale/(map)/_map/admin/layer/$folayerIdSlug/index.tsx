import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerIndexRoute } from 'applets/luonnonmetsakartat/routeComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/layer/$folayerIdSlug/'
)({
  component: LuonnonmetsakartatFolayerIndexRoute,
})
