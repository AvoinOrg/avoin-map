import type { StartAuthEnv } from './types'

type EnvSource = Record<string, string | undefined>

const LOCAL_BETTER_AUTH_URL = 'http://localhost:6900'
const LEGACY_ZITADEL_CALLBACK_PATH = '/api/auth/callback/zitadel'

const getOptional = ({ env, key }: { env: EnvSource; key: string }) => {
  const value = env[key]?.trim()

  return value || null
}

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

const getRequiredExplicitUnlessDevelopment = ({
  env,
  key,
  developmentFallback,
}: {
  env: EnvSource
  key: string
  developmentFallback: string
}) => {
  const explicitValue = getOptional({ env, key })

  if (explicitValue) {
    return explicitValue
  }

  if (env.NODE_ENV !== 'production') {
    return developmentFallback
  }

  throw new Error(`Start Better Auth requires ${key}`)
}

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const getOrigin = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

const getBetterAuthUrl = (env: EnvSource) =>
  getRequiredExplicitUnlessDevelopment({
    env,
    key: 'BETTER_AUTH_URL',
    developmentFallback: LOCAL_BETTER_AUTH_URL,
  })

const getBetterAuthSecret = (env: EnvSource) =>
  getRequiredExplicitUnlessDevelopment({
    env,
    key: 'BETTER_AUTH_SECRET',
    developmentFallback:
      'start-better-auth-development-secret-do-not-use-in-production',
  })

const getDefaultZitadelRedirectBaseUrl = ({
  betterAuthUrl,
}: {
  betterAuthUrl: string
}) => {
  const betterAuthOrigin = getOrigin(betterAuthUrl)

  if (
    betterAuthOrigin &&
    ['localhost', '127.0.0.1', '[::1]'].includes(
      new URL(betterAuthOrigin).hostname
    )
  ) {
    return LOCAL_BETTER_AUTH_URL
  }

  return stripTrailingSlash(betterAuthUrl)
}

const getZitadelRedirectUri = ({
  betterAuthUrl,
  env,
}: {
  betterAuthUrl: string
  env: EnvSource
}) => {
  const explicitRedirectUri = getOptional({
    env,
    key: 'ZITADEL_REDIRECT_URI',
  })

  if (explicitRedirectUri) {
    return explicitRedirectUri
  }

  return `${stripTrailingSlash(
    getDefaultZitadelRedirectBaseUrl({ betterAuthUrl })
  )}${LEGACY_ZITADEL_CALLBACK_PATH}`
}

const getLocalDevelopmentTrustedOrigins = (env: EnvSource) => {
  if (env.NODE_ENV === 'production') {
    return []
  }

  const devPort = getOptional({ env, key: 'DEV_PORT' })
  const origins = [
    LOCAL_BETTER_AUTH_URL,
    getOrigin(getOptional({ env, key: 'BETTER_AUTH_URL' })),
  ]

  if (devPort && /^\d+$/.test(devPort)) {
    origins.push(`http://localhost:${devPort}`)
    origins.push(`http://127.0.0.1:${devPort}`)
  }

  return origins.filter((origin): origin is string => Boolean(origin))
}

export const parseTrustedOrigins = (value: string | undefined) =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []

const dedupe = (values: string[]) => [...new Set(values)]

export const resolveStartAuthEnv = (env: EnvSource): StartAuthEnv => {
  const betterAuthUrl = getBetterAuthUrl(env)

  return {
    betterAuthSecret: getBetterAuthSecret(env),
    betterAuthUrl,
    trustedOrigins: dedupe([
      ...parseTrustedOrigins(env.BETTER_AUTH_TRUSTED_ORIGINS),
      ...getLocalDevelopmentTrustedOrigins(env),
    ]),
    zitadelIssuer: getRequired({ env, key: 'ZITADEL_ISSUER' }),
    zitadelClientId: getRequired({ env, key: 'ZITADEL_CLIENT_ID' }),
    zitadelClientSecret: getRequired({ env, key: 'ZITADEL_CLIENT_SECRET' }),
    zitadelRedirectUri: getZitadelRedirectUri({ betterAuthUrl, env }),
    isProduction: env.NODE_ENV === 'production',
  }
}

export const getStartAuthEnv = () => resolveStartAuthEnv(process.env)
