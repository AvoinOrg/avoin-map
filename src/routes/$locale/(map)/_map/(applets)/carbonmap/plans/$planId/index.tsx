import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlanIndexRoute } from 'applets/hiilikartta/routeComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/carbonmap/plans/$planId/'
)({
  component: HiilikarttaPlanIndexRoute,
})
