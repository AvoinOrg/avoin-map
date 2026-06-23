import {
  handleMmlTileProxyRequest,
  type MmlTileProxyParams,
} from '#/start/api/mmlTileProxy'

export const runtime = 'edge' // optional: run at the CDN edge

export async function GET(
  request: Request,
  { params }: { params: Promise<MmlTileProxyParams> }
) {
  return handleMmlTileProxyRequest({
    request,
    params: await params,
  })
}
