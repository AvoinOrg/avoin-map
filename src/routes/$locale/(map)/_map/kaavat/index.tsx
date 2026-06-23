import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlansIndexRoute } from '#/start/appletRouteComponents'

export const Route = createFileRoute('/$locale/(map)/_map/kaavat/')({
  component: HiilikarttaPlansIndexRoute,
})
