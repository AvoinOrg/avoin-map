import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatFolayerPage from 'applets/luonnonmetsakartat/(pages)/admin/taso/[folayerIdSlug]/page'

const LuonnonmetsakartatFolayerIndexRoute = () => (
  <LuonnonmetsakartatFolayerPage />
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/taso/$folayerIdSlug/'
)({
  component: LuonnonmetsakartatFolayerIndexRoute,
})
