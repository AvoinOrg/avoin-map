import { createFileRoute } from '@tanstack/react-router'

import HiilikarttaPlansPage from 'applets/hiilikartta/(pages)/kaavat/page'

const HiilikarttaKaavatIndexRoute = () => <HiilikarttaPlansPage />

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/kaavat/'
)({
  component: HiilikarttaKaavatIndexRoute,
})
