import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatFolayerPicturesPage from 'applets/luonnonmetsakartat/(pages)/admin/taso/[folayerIdSlug]/kuvat/page'

const LuonnonmetsakartatFolayerPicturesRoute = () => (
  <LuonnonmetsakartatFolayerPicturesPage />
)

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/taso/$folayerIdSlug/kuvat'
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
