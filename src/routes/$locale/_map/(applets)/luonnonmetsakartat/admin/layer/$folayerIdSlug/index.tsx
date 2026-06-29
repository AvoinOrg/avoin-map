import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatFolayerPage from 'applets/luonnonmetsakartat/pages/admin/taso/folayer/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/layer/$folayerIdSlug/'
)({
  component: LuonnonmetsakartatFolayerPage,
})
