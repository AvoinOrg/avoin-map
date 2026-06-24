import { createServerFileRoute } from '@tanstack/react-start/server'

import { handleUserinfoRequest } from '#/runtime/api/userinfo'
import { getStartAccessToken } from '#/runtime/auth/session'

export const ServerRoute = createServerFileRoute('/api/userinfo').methods({
  GET: ({ request }) =>
    handleUserinfoRequest({
      request,
      deps: {
        getAccessToken: getStartAccessToken,
      },
    }),
})
