import { createServerFileRoute } from '@tanstack/react-start/server'

import { handleHiilikarttaDataProxyRequest } from '#/start/api/hiilikarttaDataProxy'

export const ServerRoute = createServerFileRoute('/$locale/api/data').methods({
  GET: handleHiilikarttaDataProxyRequest,
  POST: handleHiilikarttaDataProxyRequest,
})
