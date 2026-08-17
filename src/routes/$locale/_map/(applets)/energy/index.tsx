import { createFileRoute } from '@tanstack/react-router'

import EnergyHomePage from 'applets/energy/pages/EnergyHomePage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/energy/'
)({
  component: EnergyHomePage,
})
