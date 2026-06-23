import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatAdminLayout } from '#/start/appletRouteComponents'
import {
  getStaticAppletHead,
  LUONNONMETSAKARTAT_ADMIN_TITLE,
} from '#/start/headMetadata'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin'
)({
  head: () =>
    getStaticAppletHead({
      title: LUONNONMETSAKARTAT_ADMIN_TITLE,
    }),
  component: LuonnonmetsakartatAdminLayout,
})
