import 'next-auth'

declare module 'next-auth' {
  interface Session {
    error?: 'RefreshAccessTokenError' | string
  }
}
