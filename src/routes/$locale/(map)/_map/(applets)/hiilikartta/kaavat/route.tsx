import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlansLayoutRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/kaavat'
)({
  component: HiilikarttaPlansLayoutRoute,
})
