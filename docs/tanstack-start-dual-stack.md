# TanStack Start Build And Runtime Foundation

This repository has one active application stack: TanStack Start. It owns the
local `dev`, `build`, `start`, `prebuild`, `prebuild-dev`, `build-prune`, and
visual-script runtime path. Routes live under `src/routes`, runtime integration
under `src/runtime`, applet implementations under `src/applets`, and shared map
and UI code under `src/components` and `src/common`.

The Start-specific command path is now a real Vite/Nitro build and preview
foundation. Use these scripts:

- `yarn start:dev`: runs the Start dev server on port `6900`.
- `yarn start:build`: runs `vite build --config vite.config.mts` and emits
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

## Production applet build matrix

Canonical builds require server/build-only `TOLGEE_API_URL` and
`TOLGEE_API_KEY`. Applet selection always uses `PUBLIC_COMPILED_APPLETS`:

```bash
PUBLIC_COMPILED_APPLETS=main,energy,carbon,luonnonmetsakartat yarn build
PUBLIC_COMPILED_APPLETS=energy yarn build
PUBLIC_COMPILED_APPLETS=carbon yarn build
PUBLIC_COMPILED_APPLETS=luonnonmetsakartat yarn build
```

Including `main` produces a main build and retains only the listed applets.
Omitting `main` requires exactly one applet and produces a standalone build.
`yarn build:netlify` runs the same contract with `START_TARGET=netlify`.
`ui-baseline` has no `publicRoute`; it remains an internal fixture covered by
manifest-derived selection and pruning tests rather than the deployment matrix.

### Build proof — 2026-07-11

| Command | Normalized mode | Exit | Verified output contract |
| --- | --- | ---: | --- |
| `PUBLIC_COMPILED_APPLETS=main,energy,carbon,luonnonmetsakartat yarn build` | `main` | 0 | `.output/server/index.mjs`, `.output/public/assets`, Vite manifest, `public/files`, and `public/lib/sql-wasm.wasm` |
| `PUBLIC_COMPILED_APPLETS=energy yarn build` | `standalone:energy` | 0 | Same local output contract |
| `PUBLIC_COMPILED_APPLETS=carbon yarn build` | `standalone:carbon` | 0 | Same local output contract |
| `PUBLIC_COMPILED_APPLETS=luonnonmetsakartat yarn build` | `standalone:luonnonmetsakartat` | 0 | Same local output contract |
| `PUBLIC_COMPILED_APPLETS=main,energy,carbon,luonnonmetsakartat yarn build:netlify` | `main` / Netlify target | 0 | `dist/assets`, Vite manifest, `dist/files`, `dist/lib/sql-wasm.wasm`, `dist/_redirects`, and both required `.netlify/functions-internal/server` entries |

The emitted local and Netlify client assets were checked for the configured
Tolgee URL/key and Zitadel client-secret values; none were present. Client
assets also contained none of the server env names `TOLGEE_API_URL`,
`TOLGEE_API_KEY`, `ZITADEL_CLIENT_SECRET`, or `BETTER_AUTH_SECRET`. A raw scan
can still find a legacy public-URL compatibility string inside Better Auth's
third-party bundle; the repository does not read, define, document, or deploy
that variable.

Preview should run directly from that output. Do not create or repair `.output`
symlinks as part of normal Start preview verification.

The Start Vite config is `vite.config.mts`. It uses the Start Vite plugin,
the React Vite plugin, and `vite-tsconfig-paths` pointed at
`tsconfig.json` so existing aliases such as `#/*`, `applets/*`, and
`@i18n/*` resolve consistently. It deliberately defines only loaded `PUBLIC_*`
values for code that reads `process.env.*`; server-only credentials and old
public prefixes are not embedded. The SSR build keeps
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
`PUBLIC_DEBUG_CLIENT_ERRORS=1` flag. For Start builds this enables browser
sourcemaps and disables client JS/CSS minification through Vite `build`
options. The same flag also enables Nitro sourcemaps and disables Nitro
minification through `nitro.config.ts`.

No Start analyzer command is active. A later cleanup can add a Vite/Rollup
analyzer if Start bundle analysis is needed.

Netlify deployment is handled by the same applet-pruned build wrapper with a
Netlify-specific target:

- `yarn build:netlify`: runs `START_TARGET=netlify yarn run build`.
- `netlify.toml`: uses `yarn run build:netlify`, publishes `dist`, and sets repository-owned
  `PUBLIC_COMPILED_APPLETS` defaults for the main and standalone applet
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
as visible Netlify redirects before the internal proxy rewrite rules. The dated
`docs/f048-8-netlify-build-deploy-report.md` preserves historical migration
evidence; the build proof above is the current contract.

The Start client graph currently needs no explicit global `Buffer` polyfill.
Vite externalizes Node built-ins such as `fs`, `path`, and `crypto` for browser
compatibility in inactive GeoPackage/better-sqlite3 branches; no broader
polyfill is added until a Start route proves it needs one at runtime.

Generated routing is handled by the Start/Router Vite plugin. The generated
`src/routeTree.gen.ts` file is committed because `src/router.tsx` imports it
and the Start typecheck expects it to exist. ESLint ignores that generated file.
Build outputs from Start/Nitro/Vite are ignored through `.tanstack/`,
`.output/`, and `.nitro/`.

Current route-file, public-route-fact, metadata, navigation, and request-routing
conventions are documented in `docs/tanstack-start-route-conventions.md`.

## Migration history

The F048 series established the current Start foundation. The feature references
below are historical provenance, not current implementation handoffs:

- `F048.8.2-applet-pruning-generated-assets`: replaced the top-level
  applet-pruned build flow with the Start output contract and prepared generated
  `public/files` and `public/lib` assets before the Start build.
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
- Final removal of the previous runtime assumptions:
  `F048.9-tanstack-start-final-parity`.

Package baseline: this repository's `.nvmrc` is `v20.9.0`. The installed
Start/Router/Vite line was selected to keep that baseline and satisfy Yarn's
30-day package-age gate; recheck both constraints before upgrading it.
