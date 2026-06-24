import { createServerFileRoute } from '@tanstack/react-start/server'

import { handleLuonnonmetsakartatDataProxyRequest } from 'applets/luonnonmetsakartat/server/api/dataProxy'

export const ServerRoute = createServerFileRoute(
  '/api/luonnonmetsakartat/$'
).methods({
  DELETE: handleLuonnonmetsakartatDataProxyRequest,
  GET: handleLuonnonmetsakartatDataProxyRequest,
  PATCH: handleLuonnonmetsakartatDataProxyRequest,
  POST: handleLuonnonmetsakartatDataProxyRequest,
  PUT: handleLuonnonmetsakartatDataProxyRequest,
})
