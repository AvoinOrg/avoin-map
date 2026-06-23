const LEGACY_ZITADEL_CALLBACK_PATTERN = /^\/api\/auth\/callback\/([^/]+)\/?$/

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
