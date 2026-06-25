import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlansIndexRoute } from 'applets/hiilikartta/routeComponents'

export const Route = createFileRoute('/$locale/(map)/_map/plans/')({
  component: HiilikarttaPlansIndexRoute,
})
