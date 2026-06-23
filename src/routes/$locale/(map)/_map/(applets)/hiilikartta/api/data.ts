import { createServerFileRoute } from '@tanstack/react-start/server'

import { handleHiilikarttaDataProxyRequest } from '#/start/api/hiilikarttaDataProxy'

export const ServerRoute = createServerFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/api/data'
).methods({
  GET: handleHiilikarttaDataProxyRequest,
  POST: handleHiilikarttaDataProxyRequest,
})
