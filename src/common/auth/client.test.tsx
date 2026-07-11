import '@testing-library/jest-dom'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'

const mockUseSession = jest.fn()
const mockGetAccessToken = jest.fn()
const mockGetSession = jest.fn()
const mockSignInOauth2 = jest.fn()
const mockSignOut = jest.fn()
const mockNotifySessionChanged = jest.fn()
const mockAxiosGet = jest.fn()

jest.mock('better-auth/react', () => ({
  createAuthClient: jest.fn(() => ({
    useSession: mockUseSession,
    getAccessToken: mockGetAccessToken,
    getSession: mockGetSession,
    signIn: {
      oauth2: mockSignInOauth2,
    },
    signOut: mockSignOut,
    $store: {
      notify: mockNotifySessionChanged,
    },
  })),
}))

jest.mock('better-auth/client/plugins', () => ({
  genericOAuthClient: jest.fn(() => ({})),
}))

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: mockAxiosGet,
  },
  get: mockAxiosGet,
}))

const {
  AUTH_REFRESH_ERROR,
  AuthSessionProvider,
  MOCK_AUTH_ACCESS_TOKEN,
  MOCK_AUTH_COOKIE_NAME,
  MOCK_AUTH_EMAIL,
  MOCK_AUTH_MISSING_TOKEN_EMAIL,
  MOCK_AUTH_MISSING_TOKEN_NAME,
  MOCK_AUTH_MISSING_TOKEN_USER_ID,
  MOCK_AUTH_NAME,
  MOCK_AUTH_REJECTED_ACCESS_TOKEN,
  MOCK_AUTH_REJECTED_EMAIL,
  MOCK_AUTH_REJECTED_NAME,
  MOCK_AUTH_REJECTED_USER_ID,
  MOCK_AUTH_STORAGE_KEY,
  MOCK_AUTH_USER_ID,
  createMockUserInfo,
  createZitadelAuthorizationUrl,
  getAuthAccessToken,
  getAuthSession,
  signInWithZitadel,
  signOutAuth,
  useAuthSession,
} = jest.requireActual<typeof import('#/common/auth')>('#/common/auth')
const UserStateHandler = jest.requireActual<
  typeof import('#/runtime/ShellComponents/userStateHandler')
>('#/runtime/ShellComponents/userStateHandler').default
const { useUserStore } = jest.requireActual<
  typeof import('#/common/store/userStore')
>('#/common/store/userStore')
const { UserAuthState, UserDataState } = jest.requireActual<
  typeof import('#/common/types/state')
>('#/common/types/state')

type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}

const betterAuthSession = {
  session: {
    id: 'session-id',
    userId: 'user-id',
    expiresAt: '2027-01-02T03:04:05.000Z',
  },
  user: {
    id: 'user-id',
    name: 'Ada Lovelace',
    email: 'ada@example.org',
    image: null,
  },
}

const successfulAccessTokenResponse = {
  data: {
    accessToken: 'access-token',
    accessTokenExpiresAt: '2027-02-03T04:05:06.000Z',
    scopes: ['openid'],
  },
  error: null,
}

const originalMockAuthEnabled = process.env.PUBLIC_MOCK_AUTH_ENABLED
const originalMockAuthInitialState =
  process.env.PUBLIC_MOCK_AUTH_INITIAL_STATE

const resetMockAuthEnvironment = () => {
  delete process.env.PUBLIC_MOCK_AUTH_ENABLED
  delete process.env.PUBLIC_MOCK_AUTH_INITIAL_STATE
  window.history.replaceState({}, '', '/')
  window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY)
  document.cookie = `${MOCK_AUTH_COOKIE_NAME}=; Path=/; Max-Age=0`
}

const persistMockAuthBrowserState = (state: string) => {
  window.localStorage.setItem(MOCK_AUTH_STORAGE_KEY, state)
  document.cookie = `${MOCK_AUTH_COOKIE_NAME}=${encodeURIComponent(
    state
  )}; Path=/`
}

const restoreMockAuthEnvironment = () => {
  if (originalMockAuthEnabled === undefined) {
    delete process.env.PUBLIC_MOCK_AUTH_ENABLED
  } else {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = originalMockAuthEnabled
  }

  if (originalMockAuthInitialState === undefined) {
    delete process.env.PUBLIC_MOCK_AUTH_INITIAL_STATE
  } else {
    process.env.PUBLIC_MOCK_AUTH_INITIAL_STATE =
      originalMockAuthInitialState
  }
}

const createDeferred = <T,>(): Deferred<T> => {
  let resolve: Deferred<T>['resolve']
  let reject: Deferred<T>['reject']
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, resolve: resolve!, reject: reject! }
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const AuthProbe = () => {
  const session = useAuthSession()

  return (
    <div>
      <span data-testid="auth-status">{session.status}</span>
      <span data-testid="auth-token">
        {session.data?.accessToken ?? session.data?.error ?? 'null'}
      </span>
      <span data-testid="auth-user">{session.data?.user.id ?? 'null'}</span>
      <span data-testid="auth-email">
        {session.data?.user.email ?? 'null'}
      </span>
      <span data-testid="auth-name">{session.data?.user.name ?? 'null'}</span>
      <span data-testid="auth-loading">{String(session.isLoading)}</span>
      <span data-testid="auth-token-loading">
        {String(session.isAccessTokenLoading)}
      </span>
    </div>
  )
}

const StoreProbe = () => {
  const userAuth = useUserStore((state) => state.userAuth)
  const userData = useUserStore((state) => state.userData)
  const userAuthState = useUserStore((state) => state.userAuthState)
  const userDataState = useUserStore((state) => state.userDataState)

  return (
    <div>
      <span data-testid="store-auth-state">{userAuthState}</span>
      <span data-testid="store-data-state">{userDataState}</span>
      <span data-testid="store-token">{userAuth?.accessToken ?? 'null'}</span>
      <span data-testid="store-user">{userData?.id ?? 'null'}</span>
    </div>
  )
}

const renderAuthProvider = (children: React.ReactNode) =>
  render(<AuthSessionProvider>{children}</AuthSessionProvider>)

const renderUserStateHandler = () => {
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <UserStateHandler>
          <StoreProbe />
        </UserStateHandler>
      </AuthSessionProvider>
    </QueryClientProvider>
  )
}

describe('AuthSessionProvider', () => {
  beforeEach(() => {
    resetMockAuthEnvironment()
    mockUseSession.mockReturnValue({
      data: betterAuthSession,
      error: null,
      isPending: false,
      isRefetching: false,
      refetch: jest.fn(async () => undefined),
    })
    mockGetAccessToken.mockResolvedValue(successfulAccessTokenResponse)
    mockGetSession.mockResolvedValue({ data: betterAuthSession, error: null })
    mockSignOut.mockResolvedValue({ success: true })
    mockAxiosGet.mockResolvedValue({
      data: {
        id: 'user-id',
        name: 'Ada Lovelace',
      },
    })
    useUserStore.setState({
      userAuth: null,
      userData: null,
      userAuthState: UserAuthState.Unauthenticated,
      userDataState: UserDataState.Unfetched,
      signOutActions: {},
    })
  })

  afterEach(() => {
    resetMockAuthEnvironment()
    restoreMockAuthEnvironment()
  })

  it('keeps the current session loading with null data until its access token resolves', async () => {
    const accessTokenRequest =
      createDeferred<typeof successfulAccessTokenResponse>()

    mockGetAccessToken.mockReturnValueOnce(accessTokenRequest.promise)

    renderAuthProvider(<AuthProbe />)

    expect(screen.getByTestId('auth-status')).toHaveTextContent('loading')
    expect(screen.getByTestId('auth-token')).toHaveTextContent('null')
    expect(screen.getByTestId('auth-token-loading')).toHaveTextContent('true')

    await waitFor(() => expect(mockGetAccessToken).toHaveBeenCalledTimes(1))

    await act(async () => {
      accessTokenRequest.resolve(successfulAccessTokenResponse)
      await accessTokenRequest.promise
    })

    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'authenticated'
      )
    )
    expect(screen.getByTestId('auth-token')).toHaveTextContent('access-token')
    expect(screen.getByTestId('auth-token-loading')).toHaveTextContent('false')
  })

  it('keeps the user store unauthenticated while the current access token is pending', async () => {
    const accessTokenRequest =
      createDeferred<typeof successfulAccessTokenResponse>()

    mockGetAccessToken.mockReturnValueOnce(accessTokenRequest.promise)

    renderUserStateHandler()

    await waitFor(() =>
      expect(screen.getByTestId('store-auth-state')).toHaveTextContent(
        UserAuthState.Loading
      )
    )

    expect(screen.getByTestId('store-token')).toHaveTextContent('null')
    expect(useUserStore.getState().userAuth).toBeNull()
    expect(mockAxiosGet).not.toHaveBeenCalled()

    await act(async () => {
      accessTokenRequest.resolve(successfulAccessTokenResponse)
      await accessTokenRequest.promise
    })

    await waitFor(() =>
      expect(useUserStore.getState().userAuth).toEqual({
        id: 'user-id',
        accessToken: 'access-token',
      })
    )
    await waitFor(() =>
      expect(useUserStore.getState().userDataState).toBe(UserDataState.Fetched)
    )

    expect(screen.getByTestId('store-auth-state')).toHaveTextContent(
      UserAuthState.Authenticated
    )
    expect(screen.getByTestId('store-token')).toHaveTextContent('access-token')
    expect(screen.getByTestId('store-user')).toHaveTextContent('user-id')
    expect(mockAxiosGet).toHaveBeenCalledWith('/api/userinfo')
  })

  it('runs user-store sign-out cleanup when access-token refresh fails', async () => {
    const signOutAction = jest.fn()

    useUserStore.setState({
      userAuth: {
        id: 'previous-user',
        accessToken: 'previous-token',
      },
      userData: {
        id: 'previous-user',
      },
      userAuthState: UserAuthState.Authenticated,
      userDataState: UserDataState.Fetched,
      signOutActions: {},
    })
    useUserStore.getState().addSignOutAction('cleanup', signOutAction)
    mockGetAccessToken.mockResolvedValueOnce({
      data: null,
      error: {
        status: 400,
        statusText: 'Bad Request',
      },
    })

    renderUserStateHandler()

    await waitFor(() => expect(signOutAction).toHaveBeenCalledTimes(1))

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockAxiosGet).not.toHaveBeenCalled()
    expect(useUserStore.getState().userAuth).toBeNull()
    expect(useUserStore.getState().userData).toBeNull()
    expect(useUserStore.getState().userAuthState).toBe(
      UserAuthState.Unauthenticated
    )
    expect(useUserStore.getState().userDataState).toBe(UserDataState.Unfetched)
    expect(screen.getByTestId('store-auth-state')).toHaveTextContent(
      UserAuthState.Unauthenticated
    )
    expect(screen.getByTestId('store-token')).toHaveTextContent('null')
    expect(mockNotifySessionChanged).toHaveBeenCalledWith('$sessionSignal')
  })

  it('surfaces refresh errors only after the current token request resolves', async () => {
    mockGetAccessToken.mockResolvedValueOnce({
      data: null,
      error: {
        status: 400,
      },
    })

    renderAuthProvider(<AuthProbe />)

    expect(screen.getByTestId('auth-status')).toHaveTextContent('loading')
    expect(screen.getByTestId('auth-token')).toHaveTextContent('null')

    await waitFor(() =>
      expect(screen.getByTestId('auth-token')).toHaveTextContent(
        AUTH_REFRESH_ERROR
      )
    )
    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'authenticated'
    )
    expect(screen.getByTestId('auth-token-loading')).toHaveTextContent('false')
  })

  it('returns the deterministic authenticated mock session by default without Better Auth calls', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'

    renderAuthProvider(<AuthProbe />)

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'authenticated'
    )
    expect(screen.getByTestId('auth-loading')).toHaveTextContent('false')
    expect(screen.getByTestId('auth-token-loading')).toHaveTextContent('false')
    expect(screen.getByTestId('auth-user')).toHaveTextContent(MOCK_AUTH_USER_ID)
    expect(screen.getByTestId('auth-email')).toHaveTextContent(MOCK_AUTH_EMAIL)
    expect(screen.getByTestId('auth-name')).toHaveTextContent(MOCK_AUTH_NAME)
    expect(screen.getByTestId('auth-token')).toHaveTextContent(
      MOCK_AUTH_ACCESS_TOKEN
    )

    await expect(getAuthSession()).resolves.toMatchObject({
      session: {
        id: 'carbon-mock-session',
        userId: MOCK_AUTH_USER_ID,
      },
      user: {
        id: MOCK_AUTH_USER_ID,
        email: MOCK_AUTH_EMAIL,
        name: MOCK_AUTH_NAME,
      },
      accessToken: MOCK_AUTH_ACCESS_TOKEN,
    })
    await expect(getAuthAccessToken()).resolves.toMatchObject({
      ok: true,
      accessToken: MOCK_AUTH_ACCESS_TOKEN,
    })

    expect(mockUseSession).not.toHaveBeenCalled()
    expect(mockGetSession).not.toHaveBeenCalled()
    expect(mockGetAccessToken).not.toHaveBeenCalled()
  })

  it('returns the deterministic rejected mock session without Better Auth calls', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    process.env.PUBLIC_MOCK_AUTH_INITIAL_STATE = 'rejected'

    renderAuthProvider(<AuthProbe />)

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'authenticated'
    )
    expect(screen.getByTestId('auth-user')).toHaveTextContent(
      MOCK_AUTH_REJECTED_USER_ID
    )
    expect(screen.getByTestId('auth-email')).toHaveTextContent(
      MOCK_AUTH_REJECTED_EMAIL
    )
    expect(screen.getByTestId('auth-name')).toHaveTextContent(
      MOCK_AUTH_REJECTED_NAME
    )
    expect(screen.getByTestId('auth-token')).toHaveTextContent(
      MOCK_AUTH_REJECTED_ACCESS_TOKEN
    )

    await expect(getAuthSession()).resolves.toMatchObject({
      session: {
        userId: MOCK_AUTH_REJECTED_USER_ID,
      },
      user: {
        id: MOCK_AUTH_REJECTED_USER_ID,
        email: MOCK_AUTH_REJECTED_EMAIL,
        name: MOCK_AUTH_REJECTED_NAME,
      },
      accessToken: MOCK_AUTH_REJECTED_ACCESS_TOKEN,
    })
    await expect(getAuthAccessToken()).resolves.toMatchObject({
      ok: true,
      accessToken: MOCK_AUTH_REJECTED_ACCESS_TOKEN,
    })

    expect(mockUseSession).not.toHaveBeenCalled()
    expect(mockGetSession).not.toHaveBeenCalled()
    expect(mockGetAccessToken).not.toHaveBeenCalled()
  })

  it('returns a missing-token mock session without an access token', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    process.env.PUBLIC_MOCK_AUTH_INITIAL_STATE = 'missing-token'

    renderAuthProvider(<AuthProbe />)

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'authenticated'
    )
    expect(screen.getByTestId('auth-user')).toHaveTextContent(
      MOCK_AUTH_MISSING_TOKEN_USER_ID
    )
    expect(screen.getByTestId('auth-email')).toHaveTextContent(
      MOCK_AUTH_MISSING_TOKEN_EMAIL
    )
    expect(screen.getByTestId('auth-name')).toHaveTextContent(
      MOCK_AUTH_MISSING_TOKEN_NAME
    )
    expect(screen.getByTestId('auth-token')).toHaveTextContent('null')

    const session = await getAuthSession()

    expect(session).toMatchObject({
      session: {
        userId: MOCK_AUTH_MISSING_TOKEN_USER_ID,
      },
      user: {
        id: MOCK_AUTH_MISSING_TOKEN_USER_ID,
        email: MOCK_AUTH_MISSING_TOKEN_EMAIL,
        name: MOCK_AUTH_MISSING_TOKEN_NAME,
      },
    })
    expect(session).not.toHaveProperty('accessToken')
    await expect(getAuthAccessToken()).resolves.toMatchObject({
      ok: false,
      error: 'NoAccessToken',
    })

    expect(mockUseSession).not.toHaveBeenCalled()
    expect(mockGetSession).not.toHaveBeenCalled()
    expect(mockGetAccessToken).not.toHaveBeenCalled()
  })

  it('uses URL-controlled mock unauthenticated state without Better Auth calls', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    window.history.pushState({}, '', '/?mockAuth=unauthenticated')

    renderAuthProvider(<AuthProbe />)

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'unauthenticated'
    )
    expect(screen.getByTestId('auth-token')).toHaveTextContent('null')
    expect(screen.getByTestId('auth-user')).toHaveTextContent('null')
    expect(window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY)).toBe(
      'unauthenticated'
    )
    expect(document.cookie).toContain(
      `${MOCK_AUTH_COOKIE_NAME}=unauthenticated`
    )

    await expect(getAuthSession()).resolves.toBeNull()
    await expect(getAuthAccessToken()).resolves.toMatchObject({
      ok: false,
      error: 'NoSession',
    })

    expect(mockUseSession).not.toHaveBeenCalled()
    expect(mockGetSession).not.toHaveBeenCalled()
    expect(mockGetAccessToken).not.toHaveBeenCalled()
  })

  it('switches mock sign-in state without opening Better Auth OAuth', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    process.env.PUBLIC_MOCK_AUTH_INITIAL_STATE = 'unauthenticated'

    renderAuthProvider(<AuthProbe />)

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'unauthenticated'
    )

    await act(async () => {
      await signInWithZitadel()
    })

    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'authenticated'
      )
    )
    expect(window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY)).toBe(
      'authenticated'
    )
    expect(mockSignInOauth2).not.toHaveBeenCalled()
    expect(mockUseSession).not.toHaveBeenCalled()
  })

  it('moves mock sign-out to live unauthenticated mode without Better Auth sign-out', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    window.history.pushState({}, '', '/?mockAuth=authenticated')
    mockUseSession.mockReturnValue({
      data: null,
      error: null,
      isPending: false,
      isRefetching: false,
      refetch: jest.fn(async () => undefined),
    })

    renderAuthProvider(<AuthProbe />)

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'authenticated'
    )

    await act(async () => {
      await signOutAuth()
    })

    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'unauthenticated'
      )
    )
    expect(window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY)).toBe(
      'passthrough'
    )
    expect(document.cookie).toContain(`${MOCK_AUTH_COOKIE_NAME}=passthrough`)
    expect(window.location.search).not.toContain('mockAuth=')
    expect(mockUseSession).toHaveBeenCalled()
    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockNotifySessionChanged).not.toHaveBeenCalled()
  })

  it('moves mock sign-out from rejected state to live auth mode', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    process.env.PUBLIC_MOCK_AUTH_INITIAL_STATE = 'rejected'
    mockUseSession.mockReturnValue({
      data: null,
      error: null,
      isPending: false,
      isRefetching: false,
      refetch: jest.fn(async () => undefined),
    })

    renderAuthProvider(<AuthProbe />)

    expect(screen.getByTestId('auth-user')).toHaveTextContent(
      MOCK_AUTH_REJECTED_USER_ID
    )

    await act(async () => {
      await signOutAuth()
    })

    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'unauthenticated'
      )
    )
    expect(window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY)).toBe(
      'passthrough'
    )
    expect(mockUseSession).toHaveBeenCalled()
    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockNotifySessionChanged).not.toHaveBeenCalled()
  })

  it('delegates login to Better Auth after explicit mock sign-out', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    mockUseSession.mockReturnValue({
      data: null,
      error: null,
      isPending: false,
      isRefetching: false,
      refetch: jest.fn(async () => undefined),
    })
    mockSignInOauth2.mockResolvedValueOnce({ data: null, error: null })

    renderAuthProvider(<AuthProbe />)

    await act(async () => {
      await signOutAuth()
    })

    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'unauthenticated'
      )
    )

    await signInWithZitadel({
      callbackURL: '/after-login',
    })

    expect(mockSignInOauth2).toHaveBeenCalledWith({
      providerId: 'zitadel',
      callbackURL: 'http://localhost/after-login',
      errorCallbackURL: undefined,
      newUserCallbackURL: undefined,
    })
    expect(window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY)).toBe(
      'passthrough'
    )
  })

  it('uses Better Auth session, token, and OAuth paths in mock passthrough mode', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    persistMockAuthBrowserState('passthrough')
    mockSignInOauth2.mockResolvedValueOnce({ data: null, error: null })

    await expect(getAuthSession()).resolves.toMatchObject({
      session: {
        id: 'session-id',
        userId: 'user-id',
      },
      user: {
        id: 'user-id',
        email: 'ada@example.org',
      },
      accessToken: 'access-token',
    })
    await expect(getAuthAccessToken()).resolves.toMatchObject({
      ok: true,
      accessToken: 'access-token',
    })
    await signInWithZitadel({ callbackURL: '/after-login' })

    renderAuthProvider(<AuthProbe />)

    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'authenticated'
      )
    )
    expect(screen.getByTestId('auth-user')).toHaveTextContent('user-id')
    expect(screen.getByTestId('auth-token')).toHaveTextContent('access-token')
    expect(mockGetSession).toHaveBeenCalled()
    expect(mockGetAccessToken).toHaveBeenCalled()
    expect(mockUseSession).toHaveBeenCalled()
    expect(mockSignInOauth2).toHaveBeenCalledWith({
      providerId: 'zitadel',
      callbackURL: 'http://localhost/after-login',
      errorCallbackURL: undefined,
      newUserCallbackURL: undefined,
    })
  })

  it('uses Better Auth sign-out when mock auth is already in passthrough mode', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    persistMockAuthBrowserState('passthrough')

    await signOutAuth()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockNotifySessionChanged).toHaveBeenCalledWith('$sessionSignal')
    expect(window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY)).toBe(
      'passthrough'
    )
  })

  it('keeps non-mock sign-in routed through Better Auth OAuth', async () => {
    mockSignInOauth2.mockResolvedValueOnce({ success: true })

    await signInWithZitadel({
      callbackURL: '/after-login',
      errorCallbackURL: '/login-error',
      newUserCallbackURL: '/new-user',
      scopes: ['openid', 'profile'],
    })

    expect(mockSignInOauth2).toHaveBeenCalledWith({
      providerId: 'zitadel',
      callbackURL: 'http://localhost/after-login',
      errorCallbackURL: 'http://localhost/login-error',
      newUserCallbackURL: 'http://localhost/new-user',
      scopes: ['openid', 'profile'],
    })
  })

  it('creates a non-redirecting Zitadel authorization URL through Better Auth', async () => {
    mockSignInOauth2.mockResolvedValueOnce({
      data: {
        url: 'https://auth.example.org/oauth/v2/authorize?state=abc',
        redirect: false,
      },
      error: null,
    })

    await expect(
      createZitadelAuthorizationUrl({
        callbackURL: '/after-login',
      })
    ).resolves.toBe('https://auth.example.org/oauth/v2/authorize?state=abc')

    expect(mockSignInOauth2).toHaveBeenCalledWith({
      providerId: 'zitadel',
      callbackURL: 'http://localhost/after-login',
      errorCallbackURL: undefined,
      newUserCallbackURL: undefined,
      disableRedirect: true,
    })
  })

  it('drives the user store to authenticated and fetched in mock authenticated mode', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    mockAxiosGet.mockResolvedValueOnce({ data: createMockUserInfo() })

    renderUserStateHandler()

    await waitFor(() =>
      expect(useUserStore.getState().userAuth).toEqual({
        id: MOCK_AUTH_USER_ID,
        accessToken: MOCK_AUTH_ACCESS_TOKEN,
      })
    )
    await waitFor(() =>
      expect(useUserStore.getState().userDataState).toBe(UserDataState.Fetched)
    )

    expect(screen.getByTestId('store-auth-state')).toHaveTextContent(
      UserAuthState.Authenticated
    )
    expect(screen.getByTestId('store-data-state')).toHaveTextContent(
      UserDataState.Fetched
    )
    expect(screen.getByTestId('store-token')).toHaveTextContent(
      MOCK_AUTH_ACCESS_TOKEN
    )
    expect(screen.getByTestId('store-user')).toHaveTextContent(
      MOCK_AUTH_USER_ID
    )
    expect(mockAxiosGet).toHaveBeenCalledWith('/api/userinfo')
    expect(mockUseSession).not.toHaveBeenCalled()
    expect(mockGetAccessToken).not.toHaveBeenCalled()
  })

  it('keeps the user store authenticated and fetched in mock missing-token mode', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    process.env.PUBLIC_MOCK_AUTH_INITIAL_STATE = 'missing-token'
    mockAxiosGet.mockResolvedValueOnce({
      data: createMockUserInfo('missing-token'),
    })

    renderUserStateHandler()

    await waitFor(() =>
      expect(useUserStore.getState().userAuth).toEqual({
        id: MOCK_AUTH_MISSING_TOKEN_USER_ID,
        accessToken: undefined,
      })
    )
    await waitFor(() =>
      expect(useUserStore.getState().userDataState).toBe(UserDataState.Fetched)
    )

    expect(screen.getByTestId('store-auth-state')).toHaveTextContent(
      UserAuthState.Authenticated
    )
    expect(screen.getByTestId('store-data-state')).toHaveTextContent(
      UserDataState.Fetched
    )
    expect(screen.getByTestId('store-token')).toHaveTextContent('null')
    expect(screen.getByTestId('store-user')).toHaveTextContent(
      MOCK_AUTH_MISSING_TOKEN_USER_ID
    )
    expect(mockAxiosGet).toHaveBeenCalledWith('/api/userinfo')
    expect(mockUseSession).not.toHaveBeenCalled()
    expect(mockGetAccessToken).not.toHaveBeenCalled()
  })

  it('keeps the user store unauthenticated and unfetched in mock unauthenticated mode', async () => {
    process.env.PUBLIC_MOCK_AUTH_ENABLED = '1'
    process.env.PUBLIC_MOCK_AUTH_INITIAL_STATE = 'unauthenticated'

    renderUserStateHandler()

    await waitFor(() =>
      expect(screen.getByTestId('store-auth-state')).toHaveTextContent(
        UserAuthState.Unauthenticated
      )
    )

    expect(screen.getByTestId('store-data-state')).toHaveTextContent(
      UserDataState.Unfetched
    )
    expect(screen.getByTestId('store-token')).toHaveTextContent('null')
    expect(screen.getByTestId('store-user')).toHaveTextContent('null')
    expect(useUserStore.getState().userAuth).toBeNull()
    expect(useUserStore.getState().userData).toBeNull()
    expect(mockAxiosGet).not.toHaveBeenCalled()
    expect(mockUseSession).not.toHaveBeenCalled()
    expect(mockGetAccessToken).not.toHaveBeenCalled()
  })
})
