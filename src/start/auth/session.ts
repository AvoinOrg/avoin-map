import { getStartAuth } from './server'
import {
  START_AUTH_PROVIDER_ID,
  START_AUTH_REFRESH_ERROR,
  type StartAccessTokenResult,
  type StartAuthSession,
  type StartAuthUser,
} from './types'

type HeadersWithSetCookieList = Headers & {
  getSetCookie?: () => string[]
}

type StartAuthRequestInput = {
  request?: Request
  headers?: HeadersInit
}

type BetterAuthAccessTokenResponse = {
  accessToken?: unknown
  accessTokenExpiresAt?: unknown
  scopes?: unknown
}

type BetterAuthAccessTokenApiResult =
  | Response
  | {
      headers: Headers
      response: BetterAuthAccessTokenResponse
    }

const getHeaders = ({ request, headers }: StartAuthRequestInput) =>
  new Headers(headers ?? request?.headers)

const optionalString = (value: unknown) =>
  typeof value === 'string' && value.length > 0 ? value : null

const toDate = (value: unknown) => {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)

    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  return new Date(0)
}

const toOptionalDate = (value: unknown) => {
  const date = toDate(value)

  return date.getTime() > 0 ? date : null
}

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []

const isResponse = (value: BetterAuthAccessTokenApiResult): value is Response =>
  typeof Response !== 'undefined' && value instanceof Response

const normalizeAccessTokenApiResult = async (
  result: BetterAuthAccessTokenApiResult
) => {
  if (isResponse(result)) {
    const response = (await result.json()) as BetterAuthAccessTokenResponse

    if (!result.ok) {
      throw new Error(`Better Auth access-token request failed: ${result.status}`)
    }

    return {
      response,
      responseHeaders: result.headers,
    }
  }

  return {
    response: result.response,
    responseHeaders: result.headers,
  }
}

export const normalizeStartAuthUser = (
  user: Record<string, unknown>
): StartAuthUser => ({
  id: optionalString(user.id) ?? '',
  name: optionalString(user.name),
  email: optionalString(user.email),
  image: optionalString(user.image),
  loginName: optionalString(user.loginName),
})

export const getStartAuthSession = async ({
  request,
  headers,
}: StartAuthRequestInput): Promise<StartAuthSession | null> => {
  const session = await getStartAuth().api.getSession({
    headers: getHeaders({ request, headers }),
  })

  if (!session) {
    return null
  }

  return {
    session: {
      id: session.session.id,
      userId: session.session.userId,
      expiresAt: toDate(session.session.expiresAt),
    },
    user: normalizeStartAuthUser(session.user),
  }
}

export const getStartAccessToken = async ({
  request,
  headers,
}: StartAuthRequestInput): Promise<StartAccessTokenResult> => {
  const requestHeaders = getHeaders({ request, headers })
  const session = await getStartAuthSession({ headers: requestHeaders })

  if (!session) {
    return {
      ok: false,
      accessToken: null,
      accessTokenExpiresAt: null,
      scopes: [],
      responseHeaders: null,
      error: 'NoSession',
    }
  }

  try {
    const { response, responseHeaders } = await normalizeAccessTokenApiResult(
      (await getStartAuth().api.getAccessToken({
        body: {
          providerId: START_AUTH_PROVIDER_ID,
        },
        headers: requestHeaders,
        request,
        returnHeaders: true,
      })) as BetterAuthAccessTokenApiResult
    )
    const accessToken = optionalString(response.accessToken)

    if (!accessToken) {
      return {
        ok: false,
        accessToken: null,
        accessTokenExpiresAt: null,
        scopes: [],
        responseHeaders,
        error: 'NoAccessToken',
      }
    }

    return {
      ok: true,
      accessToken,
      accessTokenExpiresAt: toOptionalDate(response.accessTokenExpiresAt),
      scopes: toStringArray(response.scopes),
      responseHeaders,
    }
  } catch {
    return {
      ok: false,
      accessToken: null,
      accessTokenExpiresAt: null,
      scopes: [],
      responseHeaders: null,
      error: START_AUTH_REFRESH_ERROR,
    }
  }
}

export const appendStartAuthSetCookieHeaders = ({
  target,
  source,
}: {
  target: Headers
  source: Headers | null
}) => {
  if (!source) {
    return target
  }

  const setCookies = (source as HeadersWithSetCookieList).getSetCookie?.() ?? []
  const fallbackSetCookie = source.get('set-cookie')

  for (const setCookie of setCookies.length > 0
    ? setCookies
    : fallbackSetCookie
      ? [fallbackSetCookie]
      : []) {
    target.append('set-cookie', setCookie)
  }

  return target
}
