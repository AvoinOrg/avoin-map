import { createFileRoute } from '@tanstack/react-router'

import HiilikarttaPage from 'applets/hiilikartta/(pages)/page'

const HiilikarttaIndexRoute = () => <HiilikarttaPage />

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/'
)({
  component: HiilikarttaIndexRoute,
})
