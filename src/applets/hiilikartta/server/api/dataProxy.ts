import {
  handleApiProxyRequest,
  type ApiProxyDeps,
} from '#/common/server/apiProxy'

export const handleHiilikarttaDataProxyRequest = async ({
  deps,
  request,
}: {
  deps?: ApiProxyDeps
  request: Request
}) =>
  handleApiProxyRequest({
    baseUrlEnvName: 'HIILIKARTTA_API_URL',
    deps,
    request,
    routePrefix: '/api/hiilikartta',
  })
