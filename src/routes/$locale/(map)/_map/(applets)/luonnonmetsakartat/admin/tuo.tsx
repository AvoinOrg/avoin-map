import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatImportPage from 'applets/luonnonmetsakartat/(pages)/admin/tuo/page'

const LuonnonmetsakartatImportRoute = () => <LuonnonmetsakartatImportPage />

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/tuo'
)({
  head: () => ({
    meta: [
      {
        title: 'Luonnonmetsakartat / Admin - Tuo',
      },
    ],
  }),
  component: LuonnonmetsakartatImportRoute,
})
