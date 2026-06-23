import { handleHiilikarttaDataProxyRequest } from '#/start/api/hiilikarttaDataProxy'

const GET = (request: Request) =>
  handleHiilikarttaDataProxyRequest({ request })

const POST = (request: Request) =>
  handleHiilikarttaDataProxyRequest({ request })

export { GET, POST }
