import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerLayout } from '#/start/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_FOLAYER_TITLE,
} from '#/start/headMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/admin/taso/$folayerIdSlug'
)({
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_TITLE,
    }),
  component: LuonnonmetsakartatFolayerLayout,
})
