import { NextRequest, NextResponse } from 'next/server'

import { getStartAuthEnv } from '#/start/auth/env'
import {
  appendStartAuthSetCookieHeaders,
  getNextRuntimeStartAccessToken,
} from '#/start/auth/nextRuntimeSession'

const getDataFromUserInfo = async ({
  responseHeaders = new Headers(),
  token,
}: {
  responseHeaders?: Headers
  token: string
}) => {
  try {
    const response = await fetch(
      `${getStartAuthEnv().zitadelIssuer}/oidc/v1/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return new Response(await response.text(), {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      })
    }

    return NextResponse.json(await response.json(), {
      headers: responseHeaders,
    })
  } catch (error) {
    console.error(error)

    return new Response(error instanceof Error ? error.message : String(error), {
      status: 500,
    })
  }
}

const handler = async (req: NextRequest) => {
  switch (req.method) {
    case 'GET':
      break
    default:
      return new Response(null, {
        status: 405,
      })
  }

  const startToken = await getNextRuntimeStartAccessToken({ request: req })
  const responseHeaders = new Headers()

  appendStartAuthSetCookieHeaders({
    target: responseHeaders,
    source: startToken.responseHeaders,
  })

  if (startToken.ok) {
    return await getDataFromUserInfo({
      responseHeaders,
      token: startToken.accessToken,
    })
  }

  switch (startToken.error) {
    case 'NoSession':
      return new Response(null, {
        status: 401,
        headers: responseHeaders,
      })
    default:
      return new Response(null, {
        status: 401,
        headers: responseHeaders,
      })
  }
}

export { handler as GET }
