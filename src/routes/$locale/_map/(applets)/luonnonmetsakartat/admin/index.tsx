import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatAdminPage from 'applets/luonnonmetsakartat/pages/admin/LuonnonmetsakartatAdminPage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/admin/'
)({
  component: LuonnonmetsakartatAdminPage,
})
