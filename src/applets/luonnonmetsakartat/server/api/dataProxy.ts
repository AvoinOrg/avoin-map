import {
  handleApiProxyRequest,
  type ApiProxyDeps,
} from '#/common/server/apiProxy'
import {
  handleLuonnonmetsakartatMockApiRequest,
  isLuonnonmetsakartatMockApiEnabled,
} from './mockDataProxy'

export const handleLuonnonmetsakartatDataProxyRequest = async ({
  deps,
  request,
}: {
  deps?: ApiProxyDeps
  request: Request
}) => {
  const env = deps?.env ?? process.env

  if (isLuonnonmetsakartatMockApiEnabled(env)) {
    return handleLuonnonmetsakartatMockApiRequest({ request })
  }

  return handleApiProxyRequest({
    baseUrlEnvName: 'LUONNONMETSAKARTAT_API_URL',
    deps: { ...deps, env },
    request,
    routePrefix: '/api/luonnonmetsakartat',
  })
}
