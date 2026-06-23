import { NextResponse, NextRequest } from 'next/server'
import {
  decideRequestRouting,
  getRequestRoutingTargetUrl,
} from './common/routing/requestRouting'

export function middleware(req: NextRequest) {
  const decision = decideRequestRouting({
    url: req.url,
    host: req.headers.get('host'),
  })

  if (decision.type === 'redirect') {
    return NextResponse.redirect(
      getRequestRoutingTargetUrl(req.url, decision),
      decision.status
    )
  }

  if (decision.type === 'rewrite') {
    return NextResponse.rewrite(getRequestRoutingTargetUrl(req.url, decision))
  }

  return NextResponse.next()
}

// Narrow scope so assets truly bypass (and to reduce edge work)
export const config = {
  matcher: [
    '/((?!_next|_build|_serverFn|api|favicon.ico|apple-icon|icon|robots.txt|sitemap.xml|files|lib).*)',
  ],
}
