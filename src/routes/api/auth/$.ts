import { createServerFileRoute } from '@tanstack/react-start/server'

import { rewriteStartAuthRequest } from '#/runtime/auth/request'
import { getStartAuth } from '#/runtime/auth/server'

const handleStartBetterAuthRequest = (request: Request) =>
  getStartAuth().handler(rewriteStartAuthRequest(request))

const handleAuthRequest = async ({ request }: { request: Request }) =>
  handleStartBetterAuthRequest(request)

export const ServerRoute = createServerFileRoute('/api/auth/$').methods({
  GET: handleAuthRequest,
  POST: handleAuthRequest,
})
