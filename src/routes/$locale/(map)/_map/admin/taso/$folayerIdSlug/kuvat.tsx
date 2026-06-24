import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerPicturesRoute } from '#/runtime/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_FOLAYER_PICTURES_TITLE,
} from '#/runtime/headMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/taso/$folayerIdSlug/kuvat'
)({
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_PICTURES_TITLE,
    }),
  component: LuonnonmetsakartatFolayerPicturesRoute,
})
