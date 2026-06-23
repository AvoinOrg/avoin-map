import { createServerFileRoute } from '@tanstack/react-start/server'

import { getStartAuth } from '#/start/auth/server'

const handleAuthRequest = async ({ request }: { request: Request }) =>
  getStartAuth().handler(request)

export const ServerRoute = createServerFileRoute('/api/auth/$').methods({
  GET: handleAuthRequest,
  POST: handleAuthRequest,
})
