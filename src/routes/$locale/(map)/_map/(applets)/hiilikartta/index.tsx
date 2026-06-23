import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaIndexRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/'
)({
  component: HiilikarttaIndexRoute,
})
