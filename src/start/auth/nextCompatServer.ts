import { createStartAuthCore } from './core'
import { getStartAuthEnv } from './env'

type NextCompatibleStartAuthInstance = ReturnType<typeof createStartAuthCore>

let nextCompatibleStartAuthInstance: NextCompatibleStartAuthInstance | null =
  null

export const getNextCompatibleStartAuth = () => {
  nextCompatibleStartAuthInstance ??= createStartAuthCore({
    env: getStartAuthEnv(),
  })

  return nextCompatibleStartAuthInstance
}
