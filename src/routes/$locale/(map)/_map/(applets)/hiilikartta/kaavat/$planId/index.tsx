import { createFileRoute } from '@tanstack/react-router'

import HiilikarttaPlanPage from 'applets/hiilikartta/(pages)/kaavat/[planId]/page'

const HiilikarttaPlanIndexRoute = () => <HiilikarttaPlanPage />

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/kaavat/$planId/'
)({
  component: HiilikarttaPlanIndexRoute,
})
