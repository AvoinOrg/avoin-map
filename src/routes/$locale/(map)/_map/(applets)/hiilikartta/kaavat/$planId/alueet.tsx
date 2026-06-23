import { createFileRoute } from '@tanstack/react-router'

import HiilikarttaPlanAreasPage from 'applets/hiilikartta/(pages)/kaavat/[planId]/alueet/page'

const HiilikarttaPlanAreasRoute = () => <HiilikarttaPlanAreasPage />

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/kaavat/$planId/alueet'
)({
  component: HiilikarttaPlanAreasRoute,
})
