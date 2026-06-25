import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaIndexRoute } from 'applets/hiilikartta/routeComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/carbonmap/'
)({
  component: HiilikarttaIndexRoute,
})
