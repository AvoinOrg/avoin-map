import { Outlet, createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatAdminLayoutClient from 'applets/luonnonmetsakartat/(pages)/admin/layoutClient'

const LuonnonmetsakartatAdminLayout = () => (
  <LuonnonmetsakartatAdminLayoutClient>
    <Outlet />
  </LuonnonmetsakartatAdminLayoutClient>
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin'
)({
  head: () => ({
    meta: [
      {
        title: 'Luonnonmetsakartat / Admin',
      },
    ],
  }),
  component: LuonnonmetsakartatAdminLayout,
})
