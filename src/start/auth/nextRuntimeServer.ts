import { createStartAuthCore } from './core'
import { getStartAuthEnv } from './env'

type NextRuntimeStartAuthInstance = ReturnType<typeof createStartAuthCore>

let nextRuntimeStartAuthInstance: NextRuntimeStartAuthInstance | null = null

export const getNextRuntimeStartAuth = () => {
  nextRuntimeStartAuthInstance ??= createStartAuthCore({
    env: getStartAuthEnv(),
  })

  return nextRuntimeStartAuthInstance
}
