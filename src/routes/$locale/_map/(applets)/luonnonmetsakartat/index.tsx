import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatPage from 'applets/luonnonmetsakartat/pages/page'

export const Route = createFileRoute(
  '/$locale/_map/(applets)/luonnonmetsakartat/'
)({
  component: LuonnonmetsakartatPage,
})
