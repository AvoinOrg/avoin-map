# TanStack Start Shell Notes

This folder is Start-only scaffolding for the F048 migration.

- `StartShellProviders` mounts a temporary Tolgee bridge before notifications.
  It provides the current URL locale with empty sentinel records for the
  `avoin-map`, `fi-forests`, and `energiakartta` namespaces so public map
  applet wrappers can render and missing keys still surface. Full static-data,
  SSR, and live-update behavior belongs to
  `F048.5-tolgee-start-integration`.
- `StartShellProviders` includes a temporary unauthenticated NextAuth
  `SessionProvider` so shared public map components that call `useSession()` can
  render. Start now owns a Better Auth server endpoint at `/api/auth/*`, but the
  client session adapter still belongs to
  `F048.4.2-auth-client-session-adapter`.
- Unmigrated routes keep using the Next provider stack in
  `src/app/[locale]/layoutClient.tsx`, including NextIntl, NextAuth, the shared
  theme, notifications, and the existing Next query client singleton.
- `StartMapShell` reuses the current client map layout so migrated public map
  routes mount MapLibre, sidebar slots, user/UI state handlers, login modal, and
  confirmation dialogs. The Start auth/Tolgee providers above are still
  temporary bridges owned by later F048 features.
- `src/start/auth` contains the Start-only Better Auth server foundation. It
  uses Zitadel OIDC through the Generic OAuth plugin, stateless JWE cookie
  sessions/account storage, and server helpers for normalized session and
  access-token lookup. Later route and client migrations should consume those
  helpers instead of importing `next-auth`.
- `src/routes/api/auth/$.ts` mounts the Better Auth handler directly through the
  TanStack Start server route tree. The old Start dev proxy to the NextAuth
  route has been removed; the Next.js `src/app/api/auth/[...nextauth]` route
  remains only for unmigrated Next runtime consumers.
- `vite.start.config.mts` filters `better-auth` out of Vite's client
  dependency optimizer after TanStack Start config resolution. Better Auth's
  package metadata otherwise causes TanStack's package crawler to include it for
  client optimization while the Start core config excludes it as server-only,
  which crashes `yarn start:dev` with an esbuild include/external conflict.
- Better Auth and TanStack docs rechecked on 2026-06-23 for this foundation:
  Auth.js migration (`https://authjs.dev/getting-started/migrate-to-better-auth`),
  Better Auth installation (`https://better-auth.com/docs/installation`),
  TanStack Start integration (`https://better-auth.com/docs/integrations/tanstack`),
  Generic OAuth/OIDC (`https://better-auth.com/docs/plugins/generic-oauth`),
  session/stateless management
  (`https://better-auth.com/docs/concepts/session-management`), options
  (`https://better-auth.com/docs/reference/options`), and TanStack Start server
  routes
  (`https://tanstack.com/start/latest/docs/framework/react/guide/server-routes`).
- The selected Start auth model intentionally has no primary database. Better
  Auth runs in stateless mode with `session.cookieCache.strategy: 'jwe'`,
  `refreshCache: true`, cookie-backed OAuth state, and encrypted
  `account_data` cookies. The session cookie cache contains the Better Auth
  session/user payload. The account cookie contains provider account data,
  including encrypted Zitadel access-token and refresh-token material when
  Zitadel issues it. The shared helpers never return refresh tokens.
- Logout and revocation tradeoff: local Better Auth sign-out can clear the
  browser's session, session-cache, OAuth-state, and account cookies. With no
  durable session/account store or denylist, the server cannot centrally revoke
  another browser/device session, and already issued Zitadel access tokens stay
  valid until provider expiry. Zitadel refresh-token revocation is not
  implemented in this child feature.
- Cookie and header-size tradeoff: JWE hides session contents from client-side
  inspection and prevents tampering, but provider token material in encrypted
  account cookies can make requests and responses larger. Better Auth chunks
  oversized account/session cookies, but browsers, proxies, and hosting layers
  still have total cookie/header limits. A later database-backed account store
  would be the stronger option if token size or immediate revocation becomes a
  production requirement.
- `getStartAccessToken` calls Better Auth's provider-token API with
  `returnHeaders: true`. Any route that uses this helper after a refresh must
  forward returned `Set-Cookie` headers with `appendStartAuthSetCookieHeaders`,
  otherwise the browser keeps the stale encrypted account cookie and can repeat
  the same refresh work or fall back into refresh errors.
- `F048.4.2-auth-client-session-adapter` must replace temporary Start
  `next-auth/react` usage with Better Auth client/session APIs against provider
  ID `zitadel` and base path `/api/auth`. It also owns the Start sign-in,
  session, and sign-out UI behavior. `F048.7-start-api-routes-proxies` must use
  `getStartAccessToken` for authenticated proxy requests, forward refreshed
  auth cookies, and migrate `/api/userinfo` away from `next-auth/jwt`.
- `vite.start.config.mts` aliases `next/image` to a Start-only `<img>` shim and
  aliases `#/common/navigation/navigation` to a TanStack Router adapter. Full
  Next wrapper and navigation parity belongs to `F048.6` and later `F048.3`
  siblings.
- `vite.start.config.mts` defines loaded `NEXT_PUBLIC_*` environment variables
  for Start client code. This is a temporary Next-public-env compatibility
  bridge for migrated shared map layers and shell UI; full build/deploy parity
  belongs to `F048.8`.
- `vite.start.config.mts` also aliases `maplibre_symbol_utils` to the package's
  ESM entry because the package `main` bundle expects a browser-global
  `maplibregl` during Start SSR.
- `StartMapShell` imports `configureMapLibreWorker`, which points MapLibre at
  the package's emitted CSP worker asset. This avoids the default inlined worker
  bundle used by the Vite/Start build, which currently drops a class-field
  helper required by vector-tile parsing.
