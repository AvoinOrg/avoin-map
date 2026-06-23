import { createServerFileRoute } from '@tanstack/react-start/server'

import { handleHiilikarttaDataProxyRequest } from '#/start/api/hiilikarttaDataProxy'

export const ServerRoute = createServerFileRoute(
  '/api/hiilikartta/data'
).methods({
  GET: handleHiilikarttaDataProxyRequest,
  POST: handleHiilikarttaDataProxyRequest,
})
