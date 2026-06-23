import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerLayout } from '#/start/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/taso/$folayerIdSlug'
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
