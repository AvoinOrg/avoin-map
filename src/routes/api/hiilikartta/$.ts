import { createServerFileRoute } from '@tanstack/react-start/server'

import { handleHiilikarttaDataProxyRequest } from 'applets/carbon/server/api/dataProxy'

export const ServerRoute = createServerFileRoute('/api/hiilikartta/$').methods({
  DELETE: handleHiilikarttaDataProxyRequest,
  GET: handleHiilikarttaDataProxyRequest,
  PATCH: handleHiilikarttaDataProxyRequest,
  POST: handleHiilikarttaDataProxyRequest,
  PUT: handleHiilikarttaDataProxyRequest,
})
