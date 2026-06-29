import { createFileRoute } from '@tanstack/react-router'

import HiilikarttaPlansPage from 'applets/hiilikartta/pages/kaavat/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/plans/'
)({
  component: HiilikarttaPlansPage,
})
