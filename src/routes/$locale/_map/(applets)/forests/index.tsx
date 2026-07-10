import { createFileRoute } from '@tanstack/react-router'

import ForestsHomePage from 'applets/forests/ForestsHomePage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/forests/'
)({
  component: ForestsHomePage,
})
