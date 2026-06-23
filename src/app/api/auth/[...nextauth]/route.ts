import NextAuth from 'next-auth'
import type { Account, Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import ZitadelProvider from 'next-auth/providers/zitadel'
import { Issuer } from 'openid-client'

import {
  isStartBetterAuthRequest,
  rewriteStartAuthRequest,
} from '#/start/auth/request'
import { getNextCompatibleStartAuth } from '#/start/auth/nextCompatServer'

const isProd = process.env.NODE_ENV === 'production'

type NextAuthTokenUser = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  loginName?: string | null
}

type AppJwt = Omit<
  JWT,
  'accessToken' | 'error' | 'expiresAt' | 'refreshToken' | 'user'
> & {
  accessToken?: string
  error?: string
  expiresAt?: number
  refreshToken?: string
  user?: NextAuthTokenUser | null
}

type AppSession = Session & {
  accessToken?: string
  error?: string
  user?: NextAuthTokenUser | null
}

type JwtCallbackParams = {
  token: AppJwt
  user?: NextAuthTokenUser | null
  account?: Account | null
}

type SessionCallbackParams = {
  session: AppSession
  token: AppJwt
}

const refreshAccessToken = async (token: AppJwt): Promise<AppJwt> => {
  try {
    const issuer = await Issuer.discover(
      process.env.NEXT_PUBLIC_ZITADEL_ISSUER ?? ''
    )
    const client = new issuer.Client({
      client_id: process.env.ZITADEL_CLIENT_ID || '',
      client_secret: process.env.ZITADEL_CLIENT_SECRET || '',
      token_endpoint_auth_method: 'client_secret_basic',
    })

    const { refresh_token, access_token, expires_at } = await client.refresh(
      token.refreshToken as string
    )

    return {
      ...token,
      accessToken: access_token,
      expiresAt: (expires_at ?? 0) * 1000,
      refreshToken: refresh_token, // Fall back to old refresh token
    }
  } catch (error) {
    console.error('Error during refreshAccessToken', error)

    return {
      ...token,
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: 0,
      error: 'RefreshAccessTokenError',
    }
  }
}

const options = () => {
  if (!process.env.NEXT_PUBLIC_ZITADEL_ISSUER)
    throw new Error('ZITADEL_ISSUER is not set')
  if (!process.env.ZITADEL_CLIENT_ID)
    throw new Error('ZITADEL_CLIENT_ID is not set')
  if (!process.env.ZITADEL_CLIENT_SECRET)
    throw new Error('ZITADEL_CLIENT_SECRET is not set')

  return {
    providers: [
      ZitadelProvider({
        issuer: process.env.NEXT_PUBLIC_ZITADEL_ISSUER,
        clientId: process.env.ZITADEL_CLIENT_ID,
        clientSecret: process.env.ZITADEL_CLIENT_SECRET,
        // for accessing Zitadel APIs or other additional information
        authorization: {
          params: {
            scope: `openid email profile offline_access`,
          },
        },

        async profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            firstName: profile.given_name,
            lastName: profile.family_name,
            email: profile.email,
            loginName: profile.preferred_username,
            image: profile.picture,
          }
        },
      }),
    ],
    trustHost: true,
    useSecureCookies: isProd,
    callbacks: {
      async jwt({ token, user, account }: JwtCallbackParams) {
        token.user ??= user
        token.accessToken ??= account?.access_token
        token.refreshToken ??= account?.refresh_token
        token.expiresAt ??= (account?.expires_at ?? 0) * 1000
        token.error = undefined
        // Return previous token if the access token has not expired yet
        if (Date.now() < (token.expiresAt as number)) {
          return token
        }

        // Access token has expired, try to update it
        return refreshAccessToken(token)
      },
      async session({
        session,
        token: { user, error: tokenError, accessToken },
      }: SessionCallbackParams) {
        const normalizedTokenError =
          typeof tokenError === 'string' ? tokenError : undefined

        if (normalizedTokenError === 'RefreshAccessTokenError') {
          return {
            ...session,
            expires: new Date(0).toISOString(), // Set to a date in the past
            user: undefined, // Clear user data
            error: 'RefreshAccessTokenError', // Add error flag
          }
        }

        session.user = {
          id: user?.id ?? '',
          email: user?.email ?? '',
          image: user?.image ?? '',
          name: user?.name ?? '',
          loginName: user?.loginName ?? null,
        }
        // session.clientId = process.env.ZITADEL_CLIENT_ID
        session.accessToken =
          typeof accessToken === 'string' ? accessToken : undefined

        if (normalizedTokenError) {
          session.error = normalizedTokenError
        }

        return session
      },
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // allow relative
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // allow same-origin absolute
      try {
        const u = new URL(url)
        if (u.origin === baseUrl) return url
      } catch {}
      // fallback
      return baseUrl
    },
  }
}

const nextAuthHandler = NextAuth(options())

const handleStartBetterAuthRequest = (request: Request) =>
  getNextCompatibleStartAuth().handler(rewriteStartAuthRequest(request))

const handler = (
  request: Request,
  context: Parameters<typeof nextAuthHandler>[1]
) => {
  if (isStartBetterAuthRequest(request)) {
    return handleStartBetterAuthRequest(request)
  }

  return nextAuthHandler(request, context)
}

export { handler as GET, handler as POST }
