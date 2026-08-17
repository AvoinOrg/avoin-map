import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'

import {
  decideRequestRouting,
  getRequestRoutingTargetUrl,
} from '#/common/routing/requestRouting'

import { createRouter } from './router'

const startHandler = createStartHandler({
  createRouter,
})(defaultStreamHandler)

const isRoutablePageRequest = (request: Request) =>
  request.method === 'GET' || request.method === 'HEAD'

export default async function handler({ request }: { request: Request }) {
  if (!isRoutablePageRequest(request)) {
    return startHandler({ request })
  }

  const decision = decideRequestRouting({
    url: request.url,
    host: request.headers.get('host'),
  })

  if (decision.type === 'redirect') {
    return new Response(null, {
      status: decision.status,
      headers: {
        Location: getRequestRoutingTargetUrl(request.url, decision).toString(),
      },
    })
  }

  if (decision.type === 'rewrite') {
    return startHandler({
      request: new Request(
        getRequestRoutingTargetUrl(request.url, decision),
        request
      ),
    })
  }

  return startHandler({ request })
}
