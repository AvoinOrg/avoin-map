import { Outlet, createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatFolayerLayoutClient from 'applets/luonnonmetsakartat/(pages)/admin/taso/[folayerIdSlug]/layoutClient'

const LuonnonmetsakartatFolayerLayout = () => (
  <LuonnonmetsakartatFolayerLayoutClient>
    <Outlet />
  </LuonnonmetsakartatFolayerLayoutClient>
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/taso/$folayerIdSlug'
)({
  head: () => ({
    meta: [
      {
        title: 'Luonnonmetsakartat / Admin - Karttataso',
      },
    ],
  }),
  component: LuonnonmetsakartatFolayerLayout,
})
