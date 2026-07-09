import { createFileRoute } from '@tanstack/react-router'

import HiilikarttaPage from 'applets/carbon/pages/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/'
)({
  component: HiilikarttaPage,
})
