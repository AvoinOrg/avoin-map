import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlanAreasRoute } from '#/runtime/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/kaavat/$planId/alueet'
)({
  component: HiilikarttaPlanAreasRoute,
})
