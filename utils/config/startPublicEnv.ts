export const PUBLIC_ENV_PREFIX = 'PUBLIC_'

export type StartLoadedEnv = Record<string, string | undefined>

export const isStartPublicEnvKey = (key: string) =>
  key.startsWith(PUBLIC_ENV_PREFIX)

export const getStartPublicEnvDefines = (env: StartLoadedEnv) =>
  Object.fromEntries(
    Object.entries(env)
      .filter(
        (entry): entry is [string, string] =>
          isStartPublicEnvKey(entry[0]) && entry[1] !== undefined
      )
      .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
  )

export const isStartDebugClientBuild = (env: StartLoadedEnv) =>
  env.PUBLIC_DEBUG_CLIENT_ERRORS === '1'
