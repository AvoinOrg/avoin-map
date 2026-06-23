import { createServerFileRoute } from '@tanstack/react-start/server'

import { getStartAuthEnv } from '#/start/auth/env'
import {
  appendStartAuthSetCookieHeaders,
  getStartAccessToken,
} from '#/start/auth/session'

const getZitadelUserInfo = async ({ request }: { request: Request }) => {
  const tokenResult = await getStartAccessToken({ request })
  const responseHeaders = new Headers({
    'content-type': 'application/json',
  })

  appendStartAuthSetCookieHeaders({
    target: responseHeaders,
    source: tokenResult.responseHeaders,
  })

  if (!tokenResult.ok) {
    return new Response(null, {
      status: 401,
      headers: responseHeaders,
    })
  }

  const userInfoResponse = await fetch(
    `${getStartAuthEnv().zitadelIssuer}/oidc/v1/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${tokenResult.accessToken}`,
        'content-type': 'application/json',
      },
    }
  )

  if (!userInfoResponse.ok) {
    return new Response(await userInfoResponse.text(), {
      status: userInfoResponse.status,
      statusText: userInfoResponse.statusText,
      headers: responseHeaders,
    })
  }

  return new Response(await userInfoResponse.text(), {
    status: 200,
    headers: responseHeaders,
  })
}

export const ServerRoute = createServerFileRoute('/api/userinfo').methods({
  GET: getZitadelUserInfo,
})

