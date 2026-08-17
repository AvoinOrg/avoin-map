import { getStartAuth } from './server'
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

export const getStartAuthSession = ({
  request,
  headers,
}: StartAuthRequestInput) =>
  getStartAuthSessionFromAuth({
    auth: getStartAuth(),
    request,
    headers,
  })

export const getStartAccessToken = ({
  request,
  headers,
}: StartAuthRequestInput) =>
  getStartAccessTokenFromAuth({
    auth: getStartAuth(),
    request,
    headers,
  })
