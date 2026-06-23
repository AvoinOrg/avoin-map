import { getNextRuntimeStartAuth } from './nextRuntimeServer'
import {
  appendStartAuthSetCookieHeaders,
  getStartAccessTokenFromAuth,
  getStartAuthSessionFromAuth,
  normalizeStartAuthUser,
} from './sessionCore'

type StartAuthRequestInput = {
  request?: Request
  headers?: HeadersInit
}

export { appendStartAuthSetCookieHeaders, normalizeStartAuthUser }

export const getNextRuntimeStartAuthSession = ({
  request,
  headers,
}: StartAuthRequestInput) =>
  getStartAuthSessionFromAuth({
    auth: getNextRuntimeStartAuth(),
    request,
    headers,
  })

export const getNextRuntimeStartAccessToken = ({
  request,
  headers,
}: StartAuthRequestInput) =>
  getStartAccessTokenFromAuth({
    auth: getNextRuntimeStartAuth(),
    request,
    headers,
  })
