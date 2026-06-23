import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerSettingsRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/taso/$folayerIdSlug/asetukset'
)({
  head: () => ({
    meta: [
      {
        title: 'Luonnonmetsakartat / Admin - Asetukset',
      },
    ],
  }),
  component: LuonnonmetsakartatFolayerSettingsRoute,
})
