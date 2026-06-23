import { Outlet, createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatLayoutClient from 'applets/luonnonmetsakartat/(pages)/layoutClient'

const LuonnonmetsakartatLayout = () => (
  <LuonnonmetsakartatLayoutClient>
    <Outlet />
  </LuonnonmetsakartatLayoutClient>
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat'
)({
  head: () => ({
    meta: [
      {
        title: 'Luonnonmetsakartat',
      },
    ],
  }),
  component: LuonnonmetsakartatLayout,
})
