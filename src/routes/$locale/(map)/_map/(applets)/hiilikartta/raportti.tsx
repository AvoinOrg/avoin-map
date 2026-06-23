import { createFileRoute } from '@tanstack/react-router'

import HiilikarttaReportPage from 'applets/hiilikartta/(pages)/raportti/page'

const HiilikarttaReportRoute = () => <HiilikarttaReportPage />

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/raportti'
)({
  component: HiilikarttaReportRoute,
})
