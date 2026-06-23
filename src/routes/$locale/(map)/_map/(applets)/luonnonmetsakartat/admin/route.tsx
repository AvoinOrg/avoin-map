import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatAdminLayout } from '#/start/appletRouteComponents'

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
