import { createFileRoute } from '@tanstack/react-router'

import LuonnonmetsakartatPage from 'applets/luonnonmetsakartat/(pages)/page'

const LuonnonmetsakartatIndexRoute = () => <LuonnonmetsakartatPage />

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/luonnonmetsakartat/'
)({
  component: LuonnonmetsakartatIndexRoute,
})
