import { handleUserinfoRequest } from '#/start/api/userinfo'
import { getNextRuntimeStartAccessToken } from '#/start/auth/nextRuntimeSession'

const handler = async (request: Request) =>
  handleUserinfoRequest({
    request,
    deps: {
      getAccessToken: getNextRuntimeStartAccessToken,
    },
  })

export { handler as GET }
