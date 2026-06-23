import type { StartAuthEnv } from './types'

type EnvSource = Record<string, string | undefined>

const getRequired = ({
  env,
  key,
}: {
  env: EnvSource
  key: string
}) => {
  const value = env[key]?.trim()

  if (!value) {
    throw new Error(`Start Better Auth requires ${key}`)
  }

  return value
}

const getRequiredWithFallback = ({
  env,
  key,
  fallbackKey,
}: {
  env: EnvSource
  key: string
  fallbackKey: string
}) => {
  const value = env[key]?.trim() || env[fallbackKey]?.trim()

  if (!value) {
    throw new Error(`Start Better Auth requires ${key} or ${fallbackKey}`)
  }

  return value
}

export const parseTrustedOrigins = (value: string | undefined) =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []

export const resolveStartAuthEnv = (env: EnvSource): StartAuthEnv => ({
  betterAuthSecret: getRequired({ env, key: 'BETTER_AUTH_SECRET' }),
  betterAuthUrl: getRequired({ env, key: 'BETTER_AUTH_URL' }),
  trustedOrigins: parseTrustedOrigins(env.BETTER_AUTH_TRUSTED_ORIGINS),
  zitadelIssuer: getRequiredWithFallback({
    env,
    key: 'ZITADEL_ISSUER',
    fallbackKey: 'NEXT_PUBLIC_ZITADEL_ISSUER',
  }),
  zitadelClientId: getRequired({ env, key: 'ZITADEL_CLIENT_ID' }),
  zitadelClientSecret: getRequired({ env, key: 'ZITADEL_CLIENT_SECRET' }),
  isProduction: env.NODE_ENV === 'production',
})

export const getStartAuthEnv = () => resolveStartAuthEnv(process.env)
