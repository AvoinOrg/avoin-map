import { createServerFileRoute } from '@tanstack/react-start/server'

import { handleMmlTileProxyRequest } from '#/start/api/mmlTileProxy'

export const ServerRoute = createServerFileRoute(
  '/api/map/core/mml/tms/$z/$x/$y'
).methods({
  GET: handleMmlTileProxyRequest,
})
