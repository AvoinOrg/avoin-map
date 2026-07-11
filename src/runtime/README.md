# TanStack Start Runtime Notes

`src/runtime` owns Start-specific integration shared by route files. Product
pages, applet state, and applet layers remain under `src/applets`; reusable map
and UI components remain under `src/components`; route configuration remains
under `src/routes`.

## Runtime ownership

- `ShellComponents/ShellProvider.tsx` composes `TolgeeAppProvider`,
  `AuthSessionProvider`, `AppThemeProvider`, `NotificationProvider`, and a
  stable TanStack Query client around the route tree. Localized route loaders
  provide its Tolgee static data.
- `ShellComponents/MapShell.tsx` mounts the shared client map layout and loads
  the MapLibre worker configuration. The map layout includes sidebar slots,
  user/UI state handlers, login UI, notifications, and shared dialogs.
- `headMetadata.ts` supplies shared Start head metadata.
- `tolgee/staticData.ts` owns server-side Tolgee static-data loading.
- `auth` owns Better Auth and Zitadel server/session integration.
- `api` owns shared Start server-handler implementations such as userinfo and
  the National Land Survey tile proxy. Route entrypoints under `src/routes/api`
  mount those handlers.

## Auth and server routes

Better Auth uses Zitadel OIDC through the Generic OAuth plugin. The deployment
has no primary auth database: sessions and provider accounts use stateless JWE
cookie storage. Session helpers normalize user/session data and access-token
lookup without returning refresh tokens.

The default Zitadel callback remains
`/api/auth/callback/zitadel` for compatibility with existing registrations.
`src/routes/api/auth/$.ts` rewrites it internally to Better Auth's
`/api/auth/oauth2/callback/zitadel` handler path. Deployments can set
`ZITADEL_REDIRECT_URI` when another callback is registered.

Runtime auth configuration uses `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET`.
Development may use the local defaults implemented by the auth env resolver;
production requires explicit values. `src/routes/api/userinfo.ts` is a
GET-only compatibility bridge used by the current user store.

`getStartAccessToken` can refresh provider tokens and return response headers.
Callers must forward returned `Set-Cookie` values with
`appendStartAuthSetCookieHeaders`; otherwise the browser retains stale encrypted
account data and may repeat refresh work.

Stateless storage has explicit tradeoffs. Signing out clears the current
browser's Better Auth cookies, but without a durable session store or denylist
the server cannot centrally revoke another device's session. Issued Zitadel
access tokens remain valid until provider expiry. Encrypted provider data can
also produce large cookie headers; Better Auth chunks oversized cookies, but
browser and hosting header limits still apply.

`vite.config.mts` excludes `better-auth` from Vite client dependency
optimization after Start config resolution. Better Auth is server-only, and
including it in both the optimizer include and external sets causes an esbuild
conflict during `yarn start:dev`.

## Local build and runtime

- `yarn start:dev` runs the Start dev server on port `3000`.
- `yarn start:build` emits `.output/server/index.mjs`, `.output/public`, client
  assets under `.output/public/assets`, and the Vite manifest under
  `.output/public/.vite/manifest.json`.
- `yarn start:preview` runs `.output/server/index.mjs`, defaults to port `3002`,
  preserves existing `NODE_OPTIONS`, and adds Node's `production` export
  condition. Override it with `PORT=<port> yarn start:preview`.
- Top-level `yarn dev` and `yarn start` delegate to the Start commands above.

`nitro.config.ts` keeps `inlineDynamicImports` enabled so the server entry and
static asset lookup retain the output paths above. No `.output` symlink repair
is part of the runtime contract. `vite.config.mts` keeps `@visx/shape` bundled
for SSR because Nitro otherwise traces incompatible versions into a package
layout that the emitted server cannot load.

`PUBLIC_DEBUG_CLIENT_ERRORS=1` enables browser and Nitro sourcemaps and disables
client and server minification. The Start client graph currently needs no
global `Buffer` polyfill, and there is no active bundle-analyzer command.

## Applet-pruned production builds

`yarn build` downloads translations, creates and prunes a temporary workspace,
generates `public/files` and `public/lib/sql-wasm.wasm` there, runs the Start
build, and copies `.output` plus generated public assets back to the live
workspace. The tracked source tree is not pruned.

Set server/build-only `TOLGEE_API_URL` and `TOLGEE_API_KEY`, then use the one
canonical selection input for the supported production modes:

```bash
PUBLIC_COMPILED_APPLETS=main,energy,carbon,luonnonmetsakartat yarn build
PUBLIC_COMPILED_APPLETS=energy yarn build
PUBLIC_COMPILED_APPLETS=carbon yarn build
PUBLIC_COMPILED_APPLETS=luonnonmetsakartat yarn build
```

Including `main` produces a main build with only selected applets retained.
Without `main`, exactly one applet is required and the build runs in standalone
mode. `ui-baseline` is an internal fixture, not a production deployment target.

Local builds emit `.output/server/index.mjs`, `.output/public`, generated
`public/files`, and `public/lib/sql-wasm.wasm`. `yarn build:netlify` uses the
same selection with `START_TARGET=netlify` and emits `dist` plus
`.netlify/functions-internal`.

Configured applet domains are materialized into Netlify redirect and proxy
rules by `utils/scripts/writeNetlifyRedirects.js`. Runtime main-mode request
routing does not infer standalone or applet-root mode from the request host.

## MapLibre runtime

`MapShell` imports `configureMapLibreWorker`, which points MapLibre at the
package's emitted CSP worker asset. This avoids the default worker bundle path
that drops a class-field helper needed by vector-tile parsing in the current
Vite/Start build. `vite.config.mts` also aliases `maplibre_symbol_utils` to its
ESM entry because its package main expects a browser-global `maplibregl` during
SSR.

## Migration history

This runtime surface was created by the F048 migration series. F048.4 migrated
auth consumers, F048.5 completed Tolgee static-data integration, F048.7 moved
server endpoints into Start routes, and F048.8 established the current build,
Docker, visual-runtime, and Netlify contracts. These identifiers record
provenance only; the ownership and commands above are the current guidance.
