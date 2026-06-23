import { createServerFileRoute } from '@tanstack/react-start/server'

import { rewriteStartAuthRequest } from '#/start/auth/request'
import { getStartAuth } from '#/start/auth/server'

const handleStartBetterAuthRequest = (request: Request) =>
  getStartAuth().handler(rewriteStartAuthRequest(request))

const handleAuthRequest = async ({ request }: { request: Request }) =>
  handleStartBetterAuthRequest(request)

export const ServerRoute = createServerFileRoute('/api/auth/$').methods({
  GET: handleAuthRequest,
  POST: handleAuthRequest,
})
