import {
  getStartPublicEnvDefines,
  isStartDebugClientBuild,
  isStartPublicEnvKey,
} from './startPublicEnv'

describe('Start public environment exposure', () => {
  it('defines only explicitly public values for client code', () => {
    const oldPublicSentinel = ['NEXT', 'PUBLIC_OLD_SENTINEL'].join('_')
    const defines = getStartPublicEnvDefines({
      PUBLIC_EXAMPLE: 'client-visible',
      PUBLIC_BLANK: '',
      PUBLIC_UNDEFINED: undefined,
      [oldPublicSentinel]: 'old-public-value',
      TOLGEE_API_KEY: 'tolgee-secret',
      TOLGEE_API_URL: 'https://tolgee.example.test',
      ZITADEL_CLIENT_SECRET: 'zitadel-secret',
      ZITADEL_PROJECT_ID: 'server-only-project-id',
      BETTER_AUTH_SECRET: 'better-auth-secret',
    })

    expect(defines).toEqual({
      'process.env.PUBLIC_EXAMPLE': JSON.stringify('client-visible'),
      'process.env.PUBLIC_BLANK': JSON.stringify(''),
    })
  })

  it('matches the settled public prefix and debug flag', () => {
    const oldPublicExample = ['NEXT', 'PUBLIC_EXAMPLE'].join('_')
    expect(isStartPublicEnvKey('PUBLIC_EXAMPLE')).toBe(true)
    expect(isStartPublicEnvKey(oldPublicExample)).toBe(false)
    expect(isStartDebugClientBuild({ PUBLIC_DEBUG_CLIENT_ERRORS: '1' })).toBe(
      true
    )
    expect(isStartDebugClientBuild({ PUBLIC_DEBUG_CLIENT_ERRORS: '0' })).toBe(
      false
    )
  })
})
