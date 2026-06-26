import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlanIndexRoute } from 'applets/hiilikartta/routeComponents'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/plans/$planId/'
)({
  component: HiilikarttaPlanIndexRoute,
})
