import { createFileRoute } from '@tanstack/react-router'

import ForestsPage from 'applets/forests/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/forests/'
)({
  component: ForestsPage,
})
