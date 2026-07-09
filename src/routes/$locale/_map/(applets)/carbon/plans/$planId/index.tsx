import { createFileRoute } from '@tanstack/react-router'

import HiilikarttaPlanPage from 'applets/carbon/pages/kaavat/plan/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/plans/$planId/'
)({
  component: HiilikarttaPlanPage,
})
