import { jest } from '@jest/globals'

const mockCreateZitadelAuthorizationUrl = jest.fn()
const mockSignInWithZitadel = jest.fn()
const mockResolveBrowserMockAuthState = jest.fn()
const mockResolveMockAuthConfig = jest.fn()
const mockShouldUseRealAuthForMockState = jest.fn()

jest.mock('#/common/auth/client', () => ({
  createZitadelAuthorizationUrl: mockCreateZitadelAuthorizationUrl,
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

describe('auth window utilities', () => {
  beforeEach(() => {
    mockResolveMockAuthConfig.mockReturnValue({
      enabled: true,
      initialState: 'unauthenticated',
    })
    mockResolveBrowserMockAuthState.mockReturnValue('unauthenticated')
    mockShouldUseRealAuthForMockState.mockReturnValue(false)
    mockSignInWithZitadel.mockResolvedValue({ data: null, error: null })
    window.open = jest.fn()
  })

  it('uses the in-place mock sign-in transition without opening a popup', async () => {
    await openLoginWindow('en')

    expect(mockSignInWithZitadel).toHaveBeenCalledWith()
    expect(mockCreateZitadelAuthorizationUrl).not.toHaveBeenCalled()
    expect(window.open).not.toHaveBeenCalled()
  })
})
