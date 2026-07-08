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

export type MockAuthState =
  | 'authenticated'
  | 'rejected'
  | 'missing-token'
  | 'unauthenticated'
  | 'passthrough'

export type AuthenticatedMockAuthState = Exclude<
  MockAuthState,
  'unauthenticated' | 'passthrough'
>

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
export const MOCK_AUTH_REJECTED_USER_ID = 'mock-rejected-user'
export const MOCK_AUTH_REJECTED_EMAIL = 'mock.rejected@example.org'
export const MOCK_AUTH_REJECTED_NAME = 'Rejected Mock User'
export const MOCK_AUTH_REJECTED_SESSION_ID = 'mock-rejected-session'
export const MOCK_AUTH_REJECTED_ACCESS_TOKEN = 'mock-rejected-access-token'
export const MOCK_AUTH_MISSING_TOKEN_USER_ID = 'mock-missing-token-user'
export const MOCK_AUTH_MISSING_TOKEN_EMAIL =
  'mock.missing-token@example.org'
export const MOCK_AUTH_MISSING_TOKEN_NAME = 'Missing Token Mock User'
export const MOCK_AUTH_MISSING_TOKEN_SESSION_ID =
  'mock-missing-token-session'

const MOCK_AUTH_ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on'])
const MOCK_AUTH_STATE_ALIASES: Record<string, MockAuthState> = {
  '0': 'unauthenticated',
  '1': 'authenticated',
  anonymous: 'unauthenticated',
  auth: 'authenticated',
  authenticated: 'authenticated',
  'authenticated-editor': 'authenticated',
  editor: 'authenticated',
  'false': 'unauthenticated',
  'missing-token': 'missing-token',
  missing_token: 'missing-token',
  'no-access-token': 'missing-token',
  'no-token': 'missing-token',
  noneditor: 'rejected',
  'non-editor': 'rejected',
  live: 'passthrough',
  passthrough: 'passthrough',
  'pass-through': 'passthrough',
  real: 'passthrough',
  'real-auth': 'passthrough',
  real_auth: 'passthrough',
  rejected: 'rejected',
  signin: 'authenticated',
  signout: 'unauthenticated',
  'signed-in': 'authenticated',
  'signed-out': 'unauthenticated',
  'true': 'authenticated',
  unauthenticated: 'unauthenticated',
}
export const DEFAULT_MOCK_AUTH_STATE: AuthenticatedMockAuthState =
  'authenticated'
const MOCK_AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const MOCK_AUTH_SCOPES = ['openid', 'profile', 'email']

type MockAuthProfile = {
  accessToken?: string
  email: string
  name: string
  sessionId: string
  userId: string
}

const MOCK_AUTH_PROFILES: Record<AuthenticatedMockAuthState, MockAuthProfile> =
  {
    authenticated: {
      accessToken: MOCK_AUTH_ACCESS_TOKEN,
      email: MOCK_AUTH_EMAIL,
      name: MOCK_AUTH_NAME,
      sessionId: MOCK_AUTH_SESSION_ID,
      userId: MOCK_AUTH_USER_ID,
    },
    rejected: {
      accessToken: MOCK_AUTH_REJECTED_ACCESS_TOKEN,
      email: MOCK_AUTH_REJECTED_EMAIL,
      name: MOCK_AUTH_REJECTED_NAME,
      sessionId: MOCK_AUTH_REJECTED_SESSION_ID,
      userId: MOCK_AUTH_REJECTED_USER_ID,
    },
    'missing-token': {
      email: MOCK_AUTH_MISSING_TOKEN_EMAIL,
      name: MOCK_AUTH_MISSING_TOKEN_NAME,
      sessionId: MOCK_AUTH_MISSING_TOKEN_SESSION_ID,
      userId: MOCK_AUTH_MISSING_TOKEN_USER_ID,
    },
  }

const getDefaultMockAuthEnv = (): MockAuthEnv => ({
  NEXT_PUBLIC_MOCK_AUTH_ENABLED: process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED,
  NEXT_PUBLIC_MOCK_AUTH_INITIAL_STATE:
    process.env.NEXT_PUBLIC_MOCK_AUTH_INITIAL_STATE,
  NODE_ENV: process.env.NODE_ENV,
})

const normalizeFlag = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ''

const createMockAuthExpiryDate = () => new Date(MOCK_AUTH_EXPIRES_AT_ISO)

export const isMockAuthPassthroughState = (state: MockAuthState) =>
  state === 'passthrough'

export const shouldUseRealAuthForMockState = (state: MockAuthState) =>
  isMockAuthPassthroughState(state)

export const isAuthenticatedMockAuthState = (
  state: MockAuthState
): state is AuthenticatedMockAuthState =>
  state !== 'unauthenticated' && !isMockAuthPassthroughState(state)

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

  return MOCK_AUTH_STATE_ALIASES[normalized] ?? null
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

export const createMockAccessTokenResult = (
  state: MockAuthState = DEFAULT_MOCK_AUTH_STATE
): AuthAccessTokenResult => {
  if (!isAuthenticatedMockAuthState(state)) {
    return {
      ok: false,
      accessToken: null,
      accessTokenExpiresAt: null,
      scopes: [],
      error: 'NoSession',
    }
  }

  const accessToken = MOCK_AUTH_PROFILES[state].accessToken

  if (!accessToken) {
    return {
      ok: false,
      accessToken: null,
      accessTokenExpiresAt: null,
      scopes: [],
      error: 'NoAccessToken',
    }
  }

  return {
    ok: true,
    accessToken,
    accessTokenExpiresAt: createMockAuthExpiryDate(),
    scopes: [...MOCK_AUTH_SCOPES],
  }
}

export const createMockAuthSession = (
  state: AuthenticatedMockAuthState = DEFAULT_MOCK_AUTH_STATE
): AuthSession => {
  const profile = MOCK_AUTH_PROFILES[state]
  const session: AuthSession = {
    session: {
      id: profile.sessionId,
      userId: profile.userId,
      expiresAt: createMockAuthExpiryDate(),
    },
    user: {
      id: profile.userId,
      name: profile.name,
      email: profile.email,
      image: null,
      loginName: profile.email,
    },
  }

  if (profile.accessToken) {
    session.accessToken = profile.accessToken
    session.accessTokenExpiresAt = createMockAuthExpiryDate()
  }

  return session
}

export const createMockUserInfo = (
  state: AuthenticatedMockAuthState = DEFAULT_MOCK_AUTH_STATE
): AuthUserInfo => {
  const profile = MOCK_AUTH_PROFILES[state]

  return {
    id: profile.userId,
    sub: profile.userId,
    name: profile.name,
    email: profile.email,
    image: null,
    picture: null,
  }
}

export const readMockAuthStateFromCookieHeader = (
  cookieHeader: string | null | undefined
) =>
  parseMockAuthState(
    getCookieValue({
      cookieHeader,
      name: MOCK_AUTH_COOKIE_NAME,
    })
  )

type SetBrowserMockAuthStateOptions = {
  clearUrlState?: boolean
}

const clearBrowserMockAuthUrlState = () => {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)

  if (!url.searchParams.has(MOCK_AUTH_QUERY_PARAM)) {
    return
  }

  url.searchParams.delete(MOCK_AUTH_QUERY_PARAM)
  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`
  )
}

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

export const setBrowserMockAuthState = (
  state: MockAuthState,
  options: SetBrowserMockAuthStateOptions = {}
) => {
  if (options.clearUrlState) {
    clearBrowserMockAuthUrlState()
  }

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
