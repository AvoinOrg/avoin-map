import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatFolayerLayout } from '#/runtime/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_FOLAYER_TITLE,
} from '#/runtime/headMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/taso/$folayerIdSlug'
)({
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_FOLAYER_TITLE,
    }),
  component: LuonnonmetsakartatFolayerLayout,
})
