import {
  handleApiProxyRequest,
  type ApiProxyDeps,
} from '#/common/server/apiProxy'
import {
  handleHiilikarttaMockApiRequest,
  isHiilikarttaMockApiEnabled,
} from './mockDataProxy'

export const handleHiilikarttaDataProxyRequest = async ({
  deps,
  request,
}: {
  deps?: ApiProxyDeps
  request: Request
}) => {
  const env = deps?.env ?? process.env

  if (isHiilikarttaMockApiEnabled(env)) {
    return handleHiilikarttaMockApiRequest({ request })
  }

  return handleApiProxyRequest({
    baseUrlEnvName: 'HIILIKARTTA_API_URL',
    deps: { ...deps, env },
    request,
    routePrefix: '/api/hiilikartta',
  })
}
