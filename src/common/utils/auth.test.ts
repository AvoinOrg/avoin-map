import { jest } from '@jest/globals'

const mockCreateZitadelAuthorizationUrl = jest.fn()
const mockNotifyAuthSessionChanged = jest.fn()
const mockSignInWithZitadel = jest.fn()
const mockResolveBrowserMockAuthState = jest.fn()
const mockResolveMockAuthConfig = jest.fn()
const mockShouldUseRealAuthForMockState = jest.fn()

jest.mock('#/common/auth/client', () => ({
  createZitadelAuthorizationUrl: mockCreateZitadelAuthorizationUrl,
  notifyAuthSessionChanged: mockNotifyAuthSessionChanged,
  signInWithZitadel: mockSignInWithZitadel,
}))

jest.mock('#/common/auth/mock', () => ({
  resolveBrowserMockAuthState: mockResolveBrowserMockAuthState,
  resolveMockAuthConfig: mockResolveMockAuthConfig,
  shouldUseRealAuthForMockState: mockShouldUseRealAuthForMockState,
}))

jest.mock('#/common/store/uiStore', () => ({
  useUIStore: {
    getState: jest.fn(() => ({
      mapDims: {
        visible: undefined,
      },
    })),
  },
}))

const { openLoginWindow } =
  jest.requireActual<typeof import('#/common/utils/auth')>('#/common/utils/auth')

const originalWindowOpen = window.open

describe('auth window utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockResolveMockAuthConfig.mockReturnValue({
      enabled: true,
      initialState: 'unauthenticated',
    })
    mockResolveBrowserMockAuthState.mockReturnValue('unauthenticated')
    mockShouldUseRealAuthForMockState.mockReturnValue(false)
    mockSignInWithZitadel.mockResolvedValue({ data: null, error: null })
    window.open = jest.fn()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    window.open = originalWindowOpen
    jest.clearAllMocks()
  })

  it('uses the in-place mock sign-in transition without opening a popup', async () => {
    await openLoginWindow('en')

    expect(mockSignInWithZitadel).toHaveBeenCalledWith()
    expect(mockCreateZitadelAuthorizationUrl).not.toHaveBeenCalled()
    expect(mockNotifyAuthSessionChanged).not.toHaveBeenCalled()
    expect(window.open).not.toHaveBeenCalled()
    expect(jest.getTimerCount()).toBe(0)
  })

  it('refreshes the opener session once after a live login popup closes', async () => {
    const popup = {
      close: jest.fn(),
      closed: false,
      location: { href: 'about:blank' },
    }
    const authorizationUrl = 'https://auth.example.test/authorize'

    mockResolveMockAuthConfig.mockReturnValue({ enabled: false })
    mockCreateZitadelAuthorizationUrl.mockResolvedValue(authorizationUrl)
    window.open = jest.fn(() => popup as unknown as Window)

    await expect(openLoginWindow('fi')).resolves.toBe(popup)

    expect(window.open).toHaveBeenCalledWith(
      'about:blank',
      '_blank',
      expect.any(String)
    )
    expect(mockCreateZitadelAuthorizationUrl).toHaveBeenCalledWith({
      callbackURL: '/fi/adds/login/callback',
    })
    expect(popup.location.href).toBe(authorizationUrl)
    expect(jest.getTimerCount()).toBe(1)

    jest.advanceTimersByTime(500)
    expect(mockNotifyAuthSessionChanged).not.toHaveBeenCalled()

    popup.closed = true
    jest.advanceTimersByTime(500)

    expect(mockNotifyAuthSessionChanged).toHaveBeenCalledTimes(1)
    expect(jest.getTimerCount()).toBe(0)

    jest.advanceTimersByTime(1_000)
    expect(mockNotifyAuthSessionChanged).toHaveBeenCalledTimes(1)
  })
})
