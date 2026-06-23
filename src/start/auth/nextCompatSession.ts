import { getNextCompatibleStartAuth } from './nextCompatServer'
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

export const getNextCompatibleStartAuthSession = ({
  request,
  headers,
}: StartAuthRequestInput) =>
  getStartAuthSessionFromAuth({
    auth: getNextCompatibleStartAuth(),
    request,
    headers,
  })

export const getNextCompatibleStartAccessToken = ({
  request,
  headers,
}: StartAuthRequestInput) =>
  getStartAccessTokenFromAuth({
    auth: getNextCompatibleStartAuth(),
    request,
    headers,
  })
