import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaReportRoute } from '#/runtime/appletRouteComponents'

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/raportti'
)({
  component: HiilikarttaReportRoute,
})
