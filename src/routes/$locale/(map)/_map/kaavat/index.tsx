import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlansIndexRoute } from '#/runtime/appletRouteComponents'

export const Route = createFileRoute('/$locale/(map)/_map/kaavat/')({
  component: HiilikarttaPlansIndexRoute,
})
