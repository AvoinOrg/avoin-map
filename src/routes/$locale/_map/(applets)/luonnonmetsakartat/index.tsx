import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatHomePage from 'applets/luonnonmetsakartat/pages/LuonnonmetsakartatHomePage'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/'
)({
  component: LuonnonmetsakartatHomePage,
})
