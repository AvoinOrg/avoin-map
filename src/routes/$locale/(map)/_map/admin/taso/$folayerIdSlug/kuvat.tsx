import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerPicturesRoute } from '#/start/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_FOLAYER_PICTURES_TITLE,
} from '#/start/headMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/taso/$folayerIdSlug/kuvat'
)({
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_PICTURES_TITLE,
    }),
  component: LuonnonmetsakartatFolayerPicturesRoute,
})
