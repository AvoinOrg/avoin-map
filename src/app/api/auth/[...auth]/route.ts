import { rewriteStartAuthRequest } from '#/start/auth/request'
import { getNextRuntimeStartAuth } from '#/start/auth/nextRuntimeServer'

const handler = (request: Request) =>
  getNextRuntimeStartAuth().handler(rewriteStartAuthRequest(request))

export { handler as GET, handler as POST }
