import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlansIndexRoute } from 'applets/hiilikartta/routeComponents'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/plans/'
)({
  component: HiilikarttaPlansIndexRoute,
})
