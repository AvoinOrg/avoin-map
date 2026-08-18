import assert from 'node:assert/strict'
import { createServer, type IncomingMessage, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'

import {
  appendStartAuthSetCookieHeaders,
  getStartAccessToken,
  getStartAuthSession,
} from '../../src/runtime/auth/session'
import { getStartAuth } from '../../src/runtime/auth/server'

type HeadersWithSetCookieList = Headers & {
  getSetCookie?: () => string[]
}

const AUTH_BASE_URL = 'http://127.0.0.1:39051'
const AUTH_ZITADEL_REDIRECT_URI = `${AUTH_BASE_URL}/api/auth/callback/zitadel`
const OIDC_SCOPES = 'openid email profile offline_access'

let mockIssuer = ''
const tokenRequestGrantTypes: string[] = []

const readRequestBody = async (request: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []

    request.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk))
    })
    request.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    request.on('error', reject)
  })

const writeJson = ({
  body,
  response,
  status = 200,
}: {
  body: unknown
  response: import('node:http').ServerResponse
  status?: number
}) => {
  response.writeHead(status, {
    'content-type': 'application/json',
  })
  response.end(JSON.stringify(body))
}

const startMockOidcServer = async () =>
  new Promise<Server>((resolve, reject) => {
    const server = createServer(async (request, response) => {
      if (request.url === '/.well-known/openid-configuration') {
        writeJson({
          response,
          body: {
            issuer: mockIssuer,
            authorization_endpoint: `${mockIssuer}/authorize`,
            token_endpoint: `${mockIssuer}/token`,
            userinfo_endpoint: `${mockIssuer}/userinfo`,
            jwks_uri: `${mockIssuer}/jwks`,
            response_types_supported: ['code'],
            subject_types_supported: ['public'],
            id_token_signing_alg_values_supported: ['RS256'],
            scopes_supported: OIDC_SCOPES.split(' '),
          },
        })
        return
      }

      if (request.url === '/token' && request.method === 'POST') {
        const tokenBody = new URLSearchParams(await readRequestBody(request))
        const grantType = tokenBody.get('grant_type') ?? ''
        tokenRequestGrantTypes.push(grantType)

        assert.equal(
          request.headers.authorization,
          `Basic ${Buffer.from('client-id:client-secret').toString('base64')}`
        )

        if (grantType === 'authorization_code') {
          assert.equal(tokenBody.get('code'), 'auth-code')
          assert.equal(tokenBody.get('redirect_uri'), AUTH_ZITADEL_REDIRECT_URI)
          assert.ok(tokenBody.get('code_verifier'))

          writeJson({
            response,
            body: {
              access_token: 'expired-access-token',
              expires_in: -60,
              refresh_token: 'initial-refresh-token',
              scope: OIDC_SCOPES,
              token_type: 'Bearer',
            },
          })
          return
        }

        if (grantType === 'refresh_token') {
          assert.equal(tokenBody.get('refresh_token'), 'initial-refresh-token')

          writeJson({
            response,
            body: {
              access_token: 'refreshed-access-token',
              expires_in: 3600,
              refresh_token: 'rotated-refresh-token',
              scope: OIDC_SCOPES,
              token_type: 'Bearer',
            },
          })
          return
        }

        writeJson({
          response,
          status: 400,
          body: {
            error: 'unsupported_grant_type',
          },
        })
        return
      }

      if (request.url === '/userinfo') {
        assert.equal(request.headers.authorization, 'Bearer expired-access-token')

        writeJson({
          response,
          body: {
            sub: 'zitadel-user-id',
            name: 'Ada Lovelace',
            email: 'ada@example.org',
            email_verified: true,
            picture: 'https://example.org/ada.png',
            preferred_username: 'ada@example.org',
            given_name: 'Ada',
            family_name: 'Lovelace',
          },
        })
        return
      }

      response.writeHead(404)
      response.end('not found')
    })

    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo
      mockIssuer = `http://127.0.0.1:${port}`
      resolve(server)
    })
  })

const getSetCookieHeaders = (headers: Headers) => {
  const setCookies = (headers as HeadersWithSetCookieList).getSetCookie?.()

  if (setCookies && setCookies.length > 0) {
    return setCookies
  }

  const fallback = headers.get('set-cookie')

  return fallback ? fallback.split(/,(?=\s*[^;,]+=)/) : []
}

const toCookieHeader = (setCookieHeaders: string[]) =>
  setCookieHeaders
    .map((setCookie) => setCookie.split(';')[0])
    .filter(Boolean)
    .join('; ')

const runSmoke = async () => {
  const server = await startMockOidcServer()

  try {
    process.env.BETTER_AUTH_SECRET =
      '12345678901234567890123456789012-smoke'
    process.env.BETTER_AUTH_URL = AUTH_BASE_URL
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = AUTH_BASE_URL
    process.env.ZITADEL_ISSUER = mockIssuer
    process.env.ZITADEL_CLIENT_ID = 'client-id'
    process.env.ZITADEL_CLIENT_SECRET = 'client-secret'
    process.env.ZITADEL_REDIRECT_URI = AUTH_ZITADEL_REDIRECT_URI

    const auth = getStartAuth()
    const signInResponse = await auth.handler(
      new Request(`${AUTH_BASE_URL}/api/auth/sign-in/oauth2`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          providerId: 'zitadel',
          callbackURL: `${AUTH_BASE_URL}/after-login`,
          disableRedirect: true,
        }),
      })
    )
    const signInBody = (await signInResponse.json()) as { url: string }
    const authorizationUrl = new URL(signInBody.url)
    const state = authorizationUrl.searchParams.get('state')

    assert.equal(signInResponse.status, 200)
    assert.equal(authorizationUrl.origin, mockIssuer)
    assert.equal(authorizationUrl.pathname, '/authorize')
    assert.equal(authorizationUrl.searchParams.get('scope'), OIDC_SCOPES)
    assert.equal(
      authorizationUrl.searchParams.get('code_challenge_method'),
      'S256'
    )
    assert.ok(state)

    const mismatchedIssuerSignInResponse = await auth.handler(
      new Request(`${AUTH_BASE_URL}/api/auth/sign-in/oauth2`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          providerId: 'zitadel',
          callbackURL: `${AUTH_BASE_URL}/after-login`,
          disableRedirect: true,
        }),
      })
    )
    const mismatchedIssuerSignInBody =
      (await mismatchedIssuerSignInResponse.json()) as { url: string }
    const mismatchedIssuerState = new URL(
      mismatchedIssuerSignInBody.url
    ).searchParams.get('state')

    assert.ok(mismatchedIssuerState)

    const mismatchedIssuerResponse = await auth.handler(
      new Request(
        `${AUTH_BASE_URL}/api/auth/oauth2/callback/zitadel?${new URLSearchParams(
          {
            code: 'auth-code',
            iss: `${mockIssuer}/unexpected`,
            state: mismatchedIssuerState,
          }
        )}`,
        {
          headers: {
            cookie: toCookieHeader(
              getSetCookieHeaders(mismatchedIssuerSignInResponse.headers)
            ),
          },
        }
      )
    )

    assert.equal(mismatchedIssuerResponse.status, 302)
    assert.equal(
      mismatchedIssuerResponse.headers.get('location'),
      `${AUTH_BASE_URL}/api/auth/error?error=issuer_mismatch`
    )
    assert.deepEqual(tokenRequestGrantTypes, [])

    const callbackResponse = await auth.handler(
      new Request(
        `${AUTH_BASE_URL}/api/auth/oauth2/callback/zitadel?${new URLSearchParams(
          {
            code: 'auth-code',
            state,
          }
        )}`,
        {
          headers: {
            cookie: toCookieHeader(getSetCookieHeaders(signInResponse.headers)),
          },
        }
      )
    )
    const callbackSetCookies = getSetCookieHeaders(callbackResponse.headers)
    const sessionCookieHeader = toCookieHeader(callbackSetCookies)

    assert.equal(callbackResponse.status, 302)
    assert.equal(
      callbackResponse.headers.get('location'),
      `${AUTH_BASE_URL}/after-login`
    )
    assert.match(sessionCookieHeader, /better-auth\.session_token=/)
    assert.match(sessionCookieHeader, /better-auth\.session_data=/)
    assert.match(sessionCookieHeader, /better-auth\.account_data=/)

    const session = await getStartAuthSession({
      headers: {
        cookie: sessionCookieHeader,
      },
    })

    assert.ok(session)
    assert.deepEqual(
      {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        loginName: session.user.loginName,
      },
      {
        name: 'Ada Lovelace',
        email: 'ada@example.org',
        image: 'https://example.org/ada.png',
        loginName: 'ada@example.org',
      }
    )
    assert.equal(session.session.userId, session.user.id)

    const accessTokenResult = await getStartAccessToken({
      request: new Request(`${AUTH_BASE_URL}/api/proxy-target`, {
        headers: {
          cookie: sessionCookieHeader,
        },
      }),
    })

    if (!accessTokenResult.ok) {
      throw new Error(`Expected access token, got ${accessTokenResult.error}`)
    }

    assert.equal(accessTokenResult.accessToken, 'refreshed-access-token')
    assert.deepEqual(accessTokenResult.scopes, OIDC_SCOPES.split(' '))
    assert.deepEqual(tokenRequestGrantTypes, [
      'authorization_code',
      'refresh_token',
    ])
    assert.match(
      accessTokenResult.responseHeaders.get('set-cookie') ?? '',
      /better-auth\.account_data=/
    )

    const forwardedHeaders = appendStartAuthSetCookieHeaders({
      target: new Headers(),
      source: accessTokenResult.responseHeaders,
    })

    assert.match(
      forwardedHeaders.get('set-cookie') ?? '',
      /better-auth\.account_data=/
    )

    const signOutResponse = await auth.handler(
      new Request(`${AUTH_BASE_URL}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
          cookie: sessionCookieHeader,
          origin: AUTH_BASE_URL,
        },
      })
    )

    assert.equal(signOutResponse.status, 200)
    assert.deepEqual(await signOutResponse.json(), { success: true })
    assert.match(
      signOutResponse.headers.get('set-cookie') ?? '',
      /better-auth\.session_token=/
    )

    const signedOutSession = await getStartAuthSession({
      headers: {
        cookie: toCookieHeader(getSetCookieHeaders(signOutResponse.headers)),
      },
    })

    assert.equal(signedOutSession, null)

    console.log(
      'Start Better Auth missing-issuer, session, refresh, and logout contract smoke passed'
    )
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  }
}

void runSmoke().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
