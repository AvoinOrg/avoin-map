import { createFileRoute } from '@tanstack/react-router'

import CarbonPlansPlanPage from 'applets/carbon/pages/plans/plan/CarbonPlansPlanPage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/plans/$planId/'
)({
  component: CarbonPlansPlanPage,
})
