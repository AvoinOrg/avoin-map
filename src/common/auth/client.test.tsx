import '@testing-library/jest-dom'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'

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
  useAuthSession,
} = jest.requireActual<typeof import('#/common/auth')>('#/common/auth')
const UserStateHandler = jest.requireActual<
  typeof import('#/app/[locale]/(map)/userStateHandler')
>('#/app/[locale]/(map)/userStateHandler').default
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
})
