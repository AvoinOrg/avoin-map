import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatImportRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute('/$locale/(map)/_map/admin/tuo')({
  head: () => ({
    meta: [
      {
        title: 'Luonnonmetsakartat / Admin - Tuo',
      },
    ],
  }),
  component: LuonnonmetsakartatImportRoute,
})
