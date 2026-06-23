import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { createStartAuthCore } from './core'
import { getStartAuthEnv } from './env'
import type { StartAuthEnv } from './types'

export const createStartAuth = (env: StartAuthEnv) =>
  createStartAuthCore({
    env,
    plugins: [
      tanstackStartCookies(),
    ],
  })

type StartAuthInstance = ReturnType<typeof createStartAuth>

let startAuthInstance: StartAuthInstance | null = null

export const getStartAuth = () => {
  startAuthInstance ??= createStartAuth(getStartAuthEnv())

  return startAuthInstance
}
