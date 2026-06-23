import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatAdminPage from 'applets/luonnonmetsakartat/(pages)/admin/page'

const LuonnonmetsakartatAdminIndexRoute = () => (
  <LuonnonmetsakartatAdminPage />
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/'
)({
  component: LuonnonmetsakartatAdminIndexRoute,
})
