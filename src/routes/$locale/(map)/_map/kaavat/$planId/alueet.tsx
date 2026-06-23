import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlanAreasRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/kaavat/$planId/alueet'
)({
  component: HiilikarttaPlanAreasRoute,
})
