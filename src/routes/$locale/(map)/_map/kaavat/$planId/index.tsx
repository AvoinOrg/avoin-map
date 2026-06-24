import { createFileRoute } from '@tanstack/react-router'

import { HiilikarttaPlanIndexRoute } from '#/runtime/appletRouteComponents'

export const Route = createFileRoute('/$locale/(map)/_map/kaavat/$planId/')({
  component: HiilikarttaPlanIndexRoute,
})
