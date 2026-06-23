import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatAdminIndexRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute('/$locale/(map)/_map/admin/')({
  component: LuonnonmetsakartatAdminIndexRoute,
})
