# TanStack Start Dual-Stack Build Foundation

TanStack Start owns the active local `dev`, `build`, `start`, `prebuild`,
`prebuild-dev`, `build-prune`, and visual-script runtime path. Reusable applet
and map source remains under `src/app`, but the live route/runtime surface is
the Start tree under `src/routes`.

The Start-specific command path is now a real Vite/Nitro build and preview
foundation. Use these scripts:

- `yarn start:dev`: runs the Start dev server on port `3000`.
- `yarn start:build`: runs `vite build --config vite.start.config.mts` and emits
  TanStack Start client assets plus the Nitro server output.
- `yarn start:preview`: serves `.output/server/index.mjs` on port `3002` by
  default and supplies Node's `production` export condition for package exports
  such as Tolgee. Override with `PORT=<port> yarn start:preview`.
- `yarn start:typecheck`: type-checks the active Start app/config surface.

Top-level local commands route through that foundation:

- `yarn dev`: runs `yarn start:dev`.
- `yarn start`: runs `yarn start:preview`.
- `yarn clean`: removes Start output/cache directories (`.output`,
  `.tanstack`, `.nitro`, and `node_modules/.cache`).

The local Start output contract is:

- server entry: `.output/server/index.mjs`
- public client/static output: `.output/public`
- Start client build assets: `.output/public/assets`
- Vite manifest: `.output/public/.vite/manifest.json`

Preview should run directly from that output. Do not create or repair `.output`
symlinks as part of normal Start preview verification.

The Start Vite config is `vite.start.config.mts`. It uses the Start Vite plugin,
the React Vite plugin, and `vite-tsconfig-paths` pointed at
`tsconfig.base.json` so existing aliases such as `#/*`, `applets/*`, and
`@i18n/*` resolve consistently. It also preserves the temporary
`NEXT_PUBLIC_*` define bridge used by migrated shared code. The SSR build keeps
`@visx/shape` bundled with the server build instead of externalizing it; Nitro
2.12 otherwise traces multiple `@visx/shape` versions into a package symlink
layout that Node cannot load from `.output/server/index.mjs`.

The Start Nitro config is `nitro.config.ts`. The installed Start plugin loads
this through Nitro's normal config loader while still constructing the Start
renderer internally. It keeps `inlineDynamicImports` enabled so the Node server
entry remains `.output/server/index.mjs` and Nitro's generated static asset
reader resolves `.output/public` correctly without a symlink.

The preview command sets `NODE_OPTIONS="--conditions=production"` while
preserving any existing `NODE_OPTIONS` value. This matches the files Nitro
traces for packages with production export conditions and prevents the built
server from selecting development-only package entries at runtime.

Production-debug behavior uses the existing
`NEXT_PUBLIC_DEBUG_CLIENT_ERRORS=1` flag. For Start builds this enables browser
sourcemaps and disables client JS/CSS minification through Vite `build`
options. The same flag also enables Nitro sourcemaps and disables Nitro
minification through `nitro.config.ts`.

No Start analyzer command is active. A later cleanup can add a Vite/Rollup
analyzer if Start bundle analysis is needed.

Netlify deployment is handled by the same applet-pruned build wrapper with a
Netlify-specific target:

- `yarn build:netlify`: runs `START_TARGET=netlify yarn run build`.
- `netlify.toml`: uses `NEXT_PUBLIC_URL=$DEPLOY_PRIME_URL yarn run
  build:netlify`, publishes `dist`, and sets repository-owned
  `NEXT_PUBLIC_COMPILED_APPLETS` defaults for the main and standalone applet
  deploy contexts.
- `START_TARGET=netlify` selects Nitro's Netlify preset for the installed
  `@tanstack/react-start@1.131.50` package line. The current official Netlify
  docs use `@netlify/vite-plugin-tanstack-start` for newer Start versions, but
  specify `target: "netlify"` and `publish = "dist"` for Start `1.121.0` to
  `1.131.x`.
- Netlify output contract: `dist` for publish assets and
  `.netlify/functions-internal/server/{main.mjs,server.mjs}` for the server
  function wrapper.

`utils/scripts/writeNetlifyRedirects.js` generates Start-compatible
`_redirects` rules during Netlify builds. It writes to the requested output
path in the temp workspace, no longer writes to `.next/_redirects`, and no
longer emits `_next` asset rules. Applet-domain root, missing-locale,
known-unsupported-locale, and standalone duplicate-namespace paths are emitted
as visible Netlify redirects before the internal proxy rewrite rules. See
`docs/f048-8-netlify-build-deploy-report.md` for the verified matrix.

The Start client graph currently needs no explicit global `Buffer` polyfill.
Vite externalizes Node built-ins such as `fs`, `path`, and `crypto` for browser
compatibility in inactive GeoPackage/better-sqlite3 branches; no broader
polyfill is added until a Start route proves it needs one at runtime.

Generated routing is handled by the Start/Router Vite plugin. The generated
`src/routeTree.gen.ts` file is committed because `src/router.tsx` imports it
and the Start typecheck expects it to exist. ESLint ignores that generated file.
Build outputs from Start/Nitro/Vite are ignored through `.tanstack/`,
`.output/`, and `.nitro/`.

Route-file conventions for the migration scaffold are documented in
`docs/tanstack-start-route-conventions.md`. Start routes live under
`src/routes`; keep reusable applet/map components under `src/app` unless a
route/component ownership change explicitly moves them.

Later F048.8 handoffs:

- `F048.8.2-applet-pruning-generated-assets`: replace the top-level
  applet-pruned `yarn build` flow with the Start output contract above and
  decide how generated `public/files` and `public/lib` assets are prepared
  before Start build. This child does not rewrite pruning or generated asset
  copying.
- `F048.8.3-local-runtime-docker-visual`: completed the local runtime, Docker,
  and visual-runner migration to Start-compatible commands. Docker passes
  `PORT=3000` to the preview runtime so compose can keep mapping host
  `DEV_PORT` to container port `3000`; the reusable `yarn start:preview`
  script itself still defaults to port `3002` and supports `PORT=<port>`
  overrides without editing scripts.
- `F048.8.4-netlify-deploy-build-matrix`: completed the Netlify command,
  Nitro preset, publish directory, redirect generation, and main/standalone
  build matrix. The default local output remains Nitro `node-server` with
  inline server output at `.output/server/index.mjs` and public assets in
  `.output/public`.

Earlier migration owners:

- Minimal route convention and placeholder routes:
  `F048.2.2-start-route-convention-scaffold`.
- Missing shared provider/root shell:
  `F048.2.3-start-shared-provider-shell`.
- Next routing and middleware parity:
  `F048.3-tanstack-router-routing-middleware`.
- Auth session migration:
  `F048.4-better-auth-session-migration`.
- Tolgee integration:
  `F048.5-tolgee-start-integration`.
- Next wrapper replacements:
  `F048.6-next-wrapper-replacements`.
- API route and proxy migration:
  `F048.7-start-api-routes-proxies`.
- Build/deploy replacement and script consolidation:
  `F048.8-start-build-deploy-pipeline`.
- Final removal of Next-only runtime assumptions:
  `F048.9-tanstack-start-final-parity`.

Version note: the current latest Start/Vite docs target newer package lines
that require Node `20.19` or `22.12`. This repo's `.nvmrc` is `v20.9.0`, so the
bootstrap uses the newest coherent Start/Router/Vite line that keeps that
baseline and satisfies Yarn's 30-day package age gate.
