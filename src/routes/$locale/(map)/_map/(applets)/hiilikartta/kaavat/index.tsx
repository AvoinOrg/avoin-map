import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlansIndexRoute } from '#/runtime/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/kaavat/'
)({
  component: HiilikarttaPlansIndexRoute,
})
