import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerPicturesRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/taso/$folayerIdSlug/kuvat'
)({
  head: () => ({
    meta: [
      {
        title: 'Luonnonmetsakartat / Admin - Kuvat',
      },
    ],
  }),
  component: LuonnonmetsakartatFolayerPicturesRoute,
})
