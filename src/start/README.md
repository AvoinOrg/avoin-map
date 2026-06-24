# TanStack Start Shell Notes

This folder is Start-only scaffolding for the F048 migration.

- `StartShellProviders` mounts a temporary Tolgee bridge before notifications.
  It provides the current URL locale with empty sentinel records for the
  `avoin-map`, `fi-forests`, and `energiakartta` namespaces so public map
  applet wrappers can render and missing keys still surface. Full static-data,
  SSR, and live-update behavior belongs to
  `F048.5-tolgee-start-integration`.
- `StartShellProviders` mounts the local Better Auth `AuthSessionProvider`.
  The temporary React auth alias used earlier in the migration has been removed;
  migrated consumers use `#/common/auth` directly.
- `StartMapShell` reuses the current client map layout so migrated public map
  routes mount MapLibre, sidebar slots, user/UI state handlers, login modal, and
  confirmation dialogs.
- `src/start/auth` contains the Start-only Better Auth server foundation. It
  uses Zitadel OIDC through the Generic OAuth plugin, stateless JWE cookie
  sessions/account storage, and server helpers for normalized session and
  access-token lookup. Later route and client migrations should consume those
  helpers instead of legacy Auth.js APIs.
- The current local Zitadel client is registered for the legacy callback
  `http://localhost:3000/api/auth/callback/zitadel`. Start therefore sets the
  Generic OAuth provider `redirectURI` to that legacy-compatible path by default
  and `src/routes/api/auth/$.ts` rewrites it internally to
  `/api/auth/oauth2/callback/zitadel` so Better Auth still handles the callback
  with the Generic OAuth flow. Deployments can set `ZITADEL_REDIRECT_URI` when a
  different callback URL is registered.
- Local Start auth env resolution uses `BETTER_AUTH_URL` and
  `BETTER_AUTH_SECRET` when present. Development can omit them and use
  `http://localhost:3000` plus a stable dev-only Better Auth secret; production
  must set explicit Better Auth values.
- `src/routes/api/auth/$.ts` mounts the Better Auth handler directly through the
  TanStack Start server route tree. The old Start dev proxy and App Router auth
  wrapper have been removed.
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
- `F048.4.2-auth-client-session-adapter` established Better Auth client/session
  APIs against provider ID `zitadel` and base path `/api/auth`. It also owns the
  Start sign-in, session, and sign-out UI behavior. `src/routes/api/userinfo.ts`
  is a narrow GET-only compatibility bridge so the existing user-store handoff
  can fetch Zitadel userinfo in the Start runtime.
- `F048.4.3`, `F048.4.4`, and `F048.4.5` migrated the shared map,
  Hiilikartta, and Luonnonmetsakartat auth consumers to `#/common/auth`.
  `F048.4.6` removed the temporary auth alias, legacy type stubs, fallback
  provider, dependency metadata, and obsolete env names.
- `#/common/navigation/navigation` exports the TanStack Router adapter directly
  for shared Start navigation consumers.
- `vite.start.config.mts` defines loaded `NEXT_PUBLIC_*` environment variables
  for Start client code. This keeps the established public env names while
  migrated shared map layers and shell UI continue to read them.
- `yarn start:build` is the accepted local Start production build foundation. It
  emits the Nitro server entry at `.output/server/index.mjs`, public output at
  `.output/public`, built client assets under `.output/public/assets`, and the
  Vite manifest at `.output/public/.vite/manifest.json`.
- `yarn start:preview` runs that Nitro server output directly. It defaults to
  port `3002`, preserves existing `NODE_OPTIONS`, and adds Node's
  `--conditions=production` export condition so runtime package resolution
  matches Nitro's traced production files. Use
  `PORT=<port> yarn start:preview` when the default port is busy. No `.output`
  symlink repair is expected.
- `NEXT_PUBLIC_DEBUG_CLIENT_ERRORS=1` now applies to Start builds by enabling
  browser sourcemaps and disabling client JS/CSS minification in Vite. The same
  flag controls Start Nitro sourcemaps/minification through `nitro.config.ts`.
- `nitro.config.ts` keeps Nitro `inlineDynamicImports` enabled so the emitted
  server entry stays at `.output/server/index.mjs` and Nitro's static asset
  reader resolves `.output/public` without a manual `.output` symlink repair.
- `vite.start.config.mts` keeps `@visx/shape` bundled for SSR so Nitro 2.12 does
  not emit an unusable multi-version `@visx/shape` package symlink layout in
  `.output/server/node_modules`.
- There is no active Start analyzer command. Add a Vite/Rollup analyzer later
  only if bundle analysis becomes necessary again.
- `yarn build` now uses the non-destructive applet-pruned Start wrapper:
  translations are downloaded in the live workspace, a temp workspace is
  pruned, `utils/scripts/prepareGeneratedPublicAssets.js` creates
  `public/files` and `public/lib/sql-wasm.wasm` in that temp workspace,
  `yarn start:build` emits `.output`, and the wrapper copies `.output` plus
  generated public assets back to the live workspace. `F048.8.3` completed the
  Docker and visual-runtime migration to the Start preview command. `F048.8.4`
  owns Netlify presets, publish directories, redirects, and deploy build matrix
  changes.
- `yarn start:dev` runs the local Start dev server on port `3000`, matching the
  Docker container's internal app port. `DEV_PORT` remains the host-facing
  Docker Compose published port.
- Top-level `yarn dev` now runs `yarn start:dev`, and top-level `yarn start`
  runs the accepted `.output/server/index.mjs` preview path through
  `yarn start:preview`.
- `vite.start.config.mts` also aliases `maplibre_symbol_utils` to the package's
  ESM entry because the package `main` bundle expects a browser-global
  `maplibregl` during Start SSR.
- `StartMapShell` imports `configureMapLibreWorker`, which points MapLibre at
  the package's emitted CSP worker asset. This avoids the default inlined worker
  bundle used by the Vite/Start build, which currently drops a class-field
  helper required by vector-tile parsing.
