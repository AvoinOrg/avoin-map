import {
  handleApiProxyRequest,
  type ApiProxyDeps,
} from '#/common/server/apiProxy'

export const handleLuonnonmetsakartatDataProxyRequest = async ({
  deps,
  request,
}: {
  deps?: ApiProxyDeps
  request: Request
}) =>
  handleApiProxyRequest({
    baseUrlEnvName: 'LUONNONMETSAKARTAT_API_URL',
    deps,
    request,
    routePrefix: '/api/luonnonmetsakartat',
  })
