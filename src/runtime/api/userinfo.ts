import {
  createMockUserInfo,
  isAuthenticatedMockAuthState,
  resolveMockAuthConfig,
  resolveRequestMockAuthState,
  shouldUseRealAuthForMockState,
  type MockAuthEnv,
} from '#/common/auth/mock'
import { getStartAuthEnv } from '#/runtime/auth/env'
import { appendStartAuthSetCookieHeaders } from '#/runtime/auth/sessionCore'
import type { StartAccessTokenResult, StartAuthEnv } from '#/runtime/auth/types'

type AccessTokenGetter = ({
  request,
}: {
  request: Request
}) => Promise<StartAccessTokenResult>

type UserinfoLogger = {
  error: (...args: unknown[]) => void
}

type UserinfoHandlerDeps = {
  appendSetCookieHeaders?: typeof appendStartAuthSetCookieHeaders
  env?: MockAuthEnv
  fetchFn?: typeof fetch
  getAccessToken: AccessTokenGetter
  getAuthEnv?: () => Pick<StartAuthEnv, 'zitadelIssuer'>
  logger?: UserinfoLogger
}

const USERINFO_ERROR_MESSAGE = 'Internal server error'

export const handleUserinfoRequest = async ({
  deps,
  request,
}: {
  deps: UserinfoHandlerDeps
  request: Request
}) => {
  const {
    appendSetCookieHeaders = appendStartAuthSetCookieHeaders,
    env = process.env,
    fetchFn,
    getAccessToken,
    getAuthEnv = getStartAuthEnv,
    logger = console,
  } = deps
  const responseHeaders = new Headers({
    'content-type': 'application/json',
  })

  const mockConfig = resolveMockAuthConfig(env)

  if (mockConfig.enabled) {
    const mockState = resolveRequestMockAuthState({
      config: mockConfig,
      env,
      request,
    })

    if (!shouldUseRealAuthForMockState(mockState)) {
      if (!isAuthenticatedMockAuthState(mockState)) {
        return new Response(null, {
          status: 401,
          headers: responseHeaders,
        })
      }

      return new Response(JSON.stringify(createMockUserInfo(mockState)), {
        status: 200,
        headers: responseHeaders,
      })
    }
  }

  try {
    const userInfoFetch = fetchFn ?? fetch
    const tokenResult = await getAccessToken({ request })

    appendSetCookieHeaders({
      target: responseHeaders,
      source: tokenResult.responseHeaders,
    })

    if (!tokenResult.ok) {
      return new Response(null, {
        status: 401,
        headers: responseHeaders,
      })
    }

    const userInfoResponse = await userInfoFetch(
      `${getAuthEnv().zitadelIssuer}/oidc/v1/userinfo`,
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
  } catch (error) {
    logger.error('Zitadel userinfo proxy failed', error)

    return new Response(USERINFO_ERROR_MESSAGE, {
      status: 500,
      headers: responseHeaders,
    })
  }
}
