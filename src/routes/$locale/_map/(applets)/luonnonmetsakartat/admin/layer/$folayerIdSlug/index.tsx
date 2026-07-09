import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatAdminLayerFolayerPage from 'applets/luonnonmetsakartat/pages/admin/layer/folayer/LuonnonmetsakartatAdminLayerFolayerPage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/layer/$folayerIdSlug/'
)({
  component: LuonnonmetsakartatAdminLayerFolayerPage,
})
