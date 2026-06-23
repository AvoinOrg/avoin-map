import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatFolayerSettingsPage from 'applets/luonnonmetsakartat/(pages)/admin/taso/[folayerIdSlug]/asetukset/page'

const LuonnonmetsakartatFolayerSettingsRoute = () => (
  <LuonnonmetsakartatFolayerSettingsPage />
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/taso/$folayerIdSlug/asetukset'
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
