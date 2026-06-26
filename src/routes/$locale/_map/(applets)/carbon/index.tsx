import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaIndexRoute } from 'applets/hiilikartta/routeComponents'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/'
)({
  component: HiilikarttaIndexRoute,
})
