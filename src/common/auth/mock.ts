import type {
  AuthAccessTokenResult,
  AuthSession,
  AuthUserInfo,
} from './types'

export type MockAuthEnv = {
  [key: string]: string | undefined
  NEXT_PUBLIC_MOCK_AUTH_ENABLED?: string
  NEXT_PUBLIC_MOCK_AUTH_INITIAL_STATE?: string
  NODE_ENV?: string
}

export type MockAuthState = 'authenticated' | 'unauthenticated'

export type MockAuthConfig = {
  enabled: boolean
  initialState: MockAuthState
}

export const MOCK_AUTH_QUERY_PARAM = 'mockAuth'
export const MOCK_AUTH_STORAGE_KEY = 'avoin-map:mock-auth-state'
export const MOCK_AUTH_COOKIE_NAME = 'avoin-map-mock-auth'
export const MOCK_AUTH_STATE_CHANGE_EVENT = 'avoin-map:mock-auth-state-change'

export const MOCK_AUTH_USER_ID = 'carbon-mock-user'
export const MOCK_AUTH_EMAIL = 'carbon.mock@example.org'
export const MOCK_AUTH_NAME = 'Carbon Mock User'
export const MOCK_AUTH_SESSION_ID = 'carbon-mock-session'
export const MOCK_AUTH_ACCESS_TOKEN = 'carbon-mock-access-token'
export const MOCK_AUTH_EXPIRES_AT_ISO = '2099-01-01T00:00:00.000Z'

const MOCK_AUTH_ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on'])
const MOCK_AUTH_AUTHENTICATED_VALUES = [
  'authenticated',
  'auth',
  'signed-in',
  'signin',
  '1',
  'true',
]
const MOCK_AUTH_UNAUTHENTICATED_VALUES = [
  'unauthenticated',
  'anonymous',
  'signed-out',
  'signout',
  '0',
  'false',
]
const DEFAULT_MOCK_AUTH_STATE: MockAuthState = 'authenticated'
const MOCK_AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

const getDefaultMockAuthEnv = (): MockAuthEnv => ({
  NEXT_PUBLIC_MOCK_AUTH_ENABLED: process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED,
  NEXT_PUBLIC_MOCK_AUTH_INITIAL_STATE:
    process.env.NEXT_PUBLIC_MOCK_AUTH_INITIAL_STATE,
  NODE_ENV: process.env.NODE_ENV,
})

const normalizeFlag = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ''

const createMockAuthExpiryDate = () => new Date(MOCK_AUTH_EXPIRES_AT_ISO)

const getCookieValue = ({
  cookieHeader,
  name,
}: {
  cookieHeader: string | null | undefined
  name: string
}) => {
  const cookies = cookieHeader?.split(';') ?? []
  const prefix = `${name}=`

  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim()

    if (trimmedCookie.startsWith(prefix)) {
      return decodeURIComponent(trimmedCookie.slice(prefix.length))
    }
  }

  return null
}

export const parseMockAuthState = (
  value: string | null | undefined
): MockAuthState | null => {
  const normalized = normalizeFlag(value ?? undefined)

  if (MOCK_AUTH_AUTHENTICATED_VALUES.includes(normalized)) {
    return 'authenticated'
  }

  if (MOCK_AUTH_UNAUTHENTICATED_VALUES.includes(normalized)) {
    return 'unauthenticated'
  }

  return null
}

export const assertMockAuthAllowed = (
  env: MockAuthEnv = getDefaultMockAuthEnv()
) => {
  const mockAuthEnabled = MOCK_AUTH_ENABLED_VALUES.has(
    normalizeFlag(env.NEXT_PUBLIC_MOCK_AUTH_ENABLED)
  )

  if (
    mockAuthEnabled &&
    env.NODE_ENV === 'production'
  ) {
    throw new Error(
      'Mock auth cannot be enabled when NODE_ENV=production. Unset NEXT_PUBLIC_MOCK_AUTH_ENABLED.'
    )
  }
}

export const isMockAuthEnabled = (
  env: MockAuthEnv = getDefaultMockAuthEnv()
) => {
  assertMockAuthAllowed(env)

  return MOCK_AUTH_ENABLED_VALUES.has(
    normalizeFlag(env.NEXT_PUBLIC_MOCK_AUTH_ENABLED)
  )
}

export const resolveMockAuthConfig = (
  env: MockAuthEnv = getDefaultMockAuthEnv()
): MockAuthConfig => {
  const enabled = isMockAuthEnabled(env)

  return {
    enabled,
    initialState:
      parseMockAuthState(env.NEXT_PUBLIC_MOCK_AUTH_INITIAL_STATE) ??
      DEFAULT_MOCK_AUTH_STATE,
  }
}

export const createMockAccessTokenResult = (): AuthAccessTokenResult => ({
  ok: true,
  accessToken: MOCK_AUTH_ACCESS_TOKEN,
  accessTokenExpiresAt: createMockAuthExpiryDate(),
  scopes: ['openid', 'profile', 'email'],
})

export const createMockAuthSession = (): AuthSession => ({
  session: {
    id: MOCK_AUTH_SESSION_ID,
    userId: MOCK_AUTH_USER_ID,
    expiresAt: createMockAuthExpiryDate(),
  },
  user: {
    id: MOCK_AUTH_USER_ID,
    name: MOCK_AUTH_NAME,
    email: MOCK_AUTH_EMAIL,
    image: null,
    loginName: MOCK_AUTH_EMAIL,
  },
  accessToken: MOCK_AUTH_ACCESS_TOKEN,
  accessTokenExpiresAt: createMockAuthExpiryDate(),
})

export const createMockUserInfo = (): AuthUserInfo => ({
  id: MOCK_AUTH_USER_ID,
  sub: MOCK_AUTH_USER_ID,
  name: MOCK_AUTH_NAME,
  email: MOCK_AUTH_EMAIL,
  image: null,
  picture: null,
})

export const readMockAuthStateFromCookieHeader = (
  cookieHeader: string | null | undefined
) =>
  parseMockAuthState(
    getCookieValue({
      cookieHeader,
      name: MOCK_AUTH_COOKIE_NAME,
    })
  )

const persistMockAuthStateToBrowser = (state: MockAuthState) => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(MOCK_AUTH_STORAGE_KEY, state)
    } catch {
      // Browser privacy settings can disable localStorage; the cookie still
      // keeps the mock API branch in sync for normal manual test runs.
    }
  }

  if (typeof document !== 'undefined') {
    document.cookie = `${MOCK_AUTH_COOKIE_NAME}=${encodeURIComponent(
      state
    )}; Path=/; SameSite=Lax; Max-Age=${MOCK_AUTH_COOKIE_MAX_AGE_SECONDS}`
  }
}

const readMockAuthStateFromBrowserStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const storageState = parseMockAuthState(
        window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY)
      )

      if (storageState) {
        return storageState
      }
    } catch {
      // Ignore storage access failures and fall back to the cookie/default.
    }
  }

  if (typeof document !== 'undefined') {
    return readMockAuthStateFromCookieHeader(document.cookie)
  }

  return null
}

const readMockAuthStateFromBrowserUrl = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return parseMockAuthState(
    new URL(window.location.href).searchParams.get(MOCK_AUTH_QUERY_PARAM)
  )
}

export const setBrowserMockAuthState = (state: MockAuthState) => {
  persistMockAuthStateToBrowser(state)

  if (typeof window === 'undefined') {
    return
  }

  const event =
    typeof CustomEvent === 'function'
      ? new CustomEvent(MOCK_AUTH_STATE_CHANGE_EVENT, { detail: { state } })
      : new Event(MOCK_AUTH_STATE_CHANGE_EVENT)

  window.dispatchEvent(event)
}

export const resolveBrowserMockAuthState = (
  config: MockAuthConfig = resolveMockAuthConfig()
) => {
  const urlState = readMockAuthStateFromBrowserUrl()

  if (urlState) {
    persistMockAuthStateToBrowser(urlState)
    return urlState
  }

  return readMockAuthStateFromBrowserStorage() ?? config.initialState
}

export const resolveRequestMockAuthState = ({
  config,
  env = getDefaultMockAuthEnv(),
  request,
}: {
  config?: MockAuthConfig
  env?: MockAuthEnv
  request: Request
}) => {
  const resolvedConfig = config ?? resolveMockAuthConfig(env)
  const urlState = parseMockAuthState(
    new URL(request.url).searchParams.get(MOCK_AUTH_QUERY_PARAM)
  )

  if (urlState) {
    return urlState
  }

  return (
    readMockAuthStateFromCookieHeader(request.headers.get('cookie')) ??
    resolvedConfig.initialState
  )
}
