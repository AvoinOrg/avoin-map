import { createFileRoute } from '@tanstack/react-router'

import { LuonnonmetsakartatAdminIndexRoute } from 'applets/luonnonmetsakartat/routeComponents'

export const Route = createFileRoute('/$locale/(map)/_map/admin/')({
  component: LuonnonmetsakartatAdminIndexRoute,
})
