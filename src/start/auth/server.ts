import { betterAuth } from 'better-auth'
import { genericOAuth } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { getStartAuthEnv } from './env'
import { buildZitadelOAuthProvider } from './zitadel'
import type { StartAuthEnv } from './types'

const START_AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export const createStartAuth = (env: StartAuthEnv) =>
  betterAuth({
    appName: 'Avoin Map',
    baseURL: env.betterAuthUrl,
    basePath: '/api/auth',
    secret: env.betterAuthSecret,
    trustedOrigins:
      env.trustedOrigins.length > 0 ? env.trustedOrigins : undefined,
    session: {
      expiresIn: START_AUTH_SESSION_MAX_AGE_SECONDS,
      cookieCache: {
        enabled: true,
        maxAge: START_AUTH_SESSION_MAX_AGE_SECONDS,
        strategy: 'jwe',
        refreshCache: true,
        version: 'start-auth-v1',
      },
    },
    account: {
      storeStateStrategy: 'cookie',
      storeAccountCookie: true,
      updateAccountOnSignIn: true,
    },
    user: {
      additionalFields: {
        loginName: {
          type: 'string',
          required: false,
        },
        firstName: {
          type: 'string',
          required: false,
        },
        lastName: {
          type: 'string',
          required: false,
        },
      },
    },
    advanced: {
      useSecureCookies: env.isProduction,
    },
    plugins: [
      genericOAuth({
        config: [buildZitadelOAuthProvider(env)],
      }),
      tanstackStartCookies(),
    ],
  })

type StartAuthInstance = ReturnType<typeof createStartAuth>

let startAuthInstance: StartAuthInstance | null = null

export const getStartAuth = () => {
  startAuthInstance ??= createStartAuth(getStartAuthEnv())

  return startAuthInstance
}
