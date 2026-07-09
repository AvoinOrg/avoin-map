import { createFileRoute } from '@tanstack/react-router'

import CarbonPlansPage from 'applets/carbon/pages/plans/CarbonPlansPage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/plans/'
)({
  component: CarbonPlansPage,
})
