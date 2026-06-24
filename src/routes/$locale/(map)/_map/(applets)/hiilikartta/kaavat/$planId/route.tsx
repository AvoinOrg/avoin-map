import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlanLayoutRoute } from '#/runtime/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/kaavat/$planId'
)({
  component: HiilikarttaPlanLayoutRoute,
})
