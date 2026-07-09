import { createFileRoute } from '@tanstack/react-router'

import CarbonHomePage from 'applets/carbon/pages/CarbonHomePage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/'
)({
  component: CarbonHomePage,
})
