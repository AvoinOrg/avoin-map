const LEGACY_ZITADEL_CALLBACK_PATTERN = /^\/api\/auth\/callback\/([^/]+)\/?$/
const START_BETTER_AUTH_EXACT_PATHS = new Set([
  '/api/auth/error',
  '/api/auth/get-access-token',
  '/api/auth/get-session',
  '/api/auth/ok',
  '/api/auth/sign-in/oauth2',
  '/api/auth/sign-out',
])

const START_BETTER_AUTH_PREFIX_PATHS = [
  '/api/auth/oauth2/callback/',
  '/api/auth/callback/',
]

export const isStartBetterAuthRequest = (request: Request) => {
  const { pathname } = new URL(request.url)

  return (
    START_BETTER_AUTH_EXACT_PATHS.has(pathname) ||
    START_BETTER_AUTH_PREFIX_PATHS.some((prefix) =>
      pathname.startsWith(prefix)
    )
  )
}

export const rewriteStartAuthRequest = (request: Request) => {
  const url = new URL(request.url)
  const legacyCallbackMatch = url.pathname.match(
    LEGACY_ZITADEL_CALLBACK_PATTERN
  )

  if (!legacyCallbackMatch) {
    return request
  }

  const [, providerId] = legacyCallbackMatch
  url.pathname = `/api/auth/oauth2/callback/${providerId}`

  return new Request(url, request)
}
