import { createFileRoute } from '@tanstack/react-router'

import HiilikarttaPage from 'applets/hiilikartta/pages/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/carbon/'
)({
  component: HiilikarttaPage,
})
