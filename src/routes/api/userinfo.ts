import { createServerFileRoute } from '@tanstack/react-start/server'

import { handleUserinfoRequest } from '#/start/api/userinfo'
import { getStartAccessToken } from '#/start/auth/session'

export const ServerRoute = createServerFileRoute('/api/userinfo').methods({
  GET: ({ request }) =>
    handleUserinfoRequest({
      request,
      deps: {
        getAccessToken: getStartAccessToken,
      },
    }),
})
