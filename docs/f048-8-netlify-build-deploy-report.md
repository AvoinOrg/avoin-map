# F048.8 Netlify Build And Deploy Report

Date: 2026-06-24

## Adapter Decision

- Installed Start packages: `@tanstack/react-start@1.131.50` and
  `@tanstack/react-router@1.131.50`.
- Official docs rechecked on 2026-06-24:
  - Netlify TanStack Start guide:
    `https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/`
  - TanStack Start hosting guide:
    `https://tanstack.com/start/latest/docs/framework/react/guide/hosting`
- Decision: use the pre-1.132 Start path, `START_TARGET=netlify`, with
  Nitro's Netlify preset and `publish = "dist"`.
- Rejected for this package line: `@netlify/vite-plugin-tanstack-start` with
  `publish = "dist/client"`. The Netlify guide reserves that path for newer
  Start versions; it says Start `1.121.0` through `1.131.x` should use
  `target: "netlify"` and `publish = "dist"`.

Local/default `yarn build` still uses Nitro `node-server` output:

- `.output/server/index.mjs`
- `.output/public`
- `.output/public/assets`
- `.output/public/.vite/manifest.json`

Netlify `yarn build:netlify` uses:

- `dist/` as the publish directory
- `dist/assets/`
- `dist/.vite/manifest.json`
- `dist/files/`
- `dist/lib/sql-wasm.wasm`
- `dist/_redirects`
- `.netlify/functions-internal/server/main.mjs`
- `.netlify/functions-internal/server/server.mjs`

## Netlify Configuration

`netlify.toml` now owns the repository-side settings:

- Build command:
  `NEXT_PUBLIC_URL=$DEPLOY_PRIME_URL yarn run build:netlify`
- Publish directory: `dist`
- Default applet matrix:
  `NEXT_PUBLIC_COMPILED_APPLETS=main,energiakartta,hiilikartta,luonnonmetsakartat`
- Standalone contexts:
  - `hiilikartta_deploy`: `NEXT_PUBLIC_COMPILED_APPLETS=hiilikartta`
  - `luonnonmetsakartat_deploy`:
    `NEXT_PUBLIC_COMPILED_APPLETS=luonnonmetsakartat`

`yarn build:netlify` is intentionally only a thin wrapper:

```bash
START_TARGET=netlify yarn run build
```

That keeps the accepted temp-pruned build pipeline as the single build path.

## Redirect Output

`utils/scripts/writeNetlifyRedirects.js` now writes Start-compatible Netlify
rules to a requested output path. The temp build wrapper generates
`public/_redirects` before the Start build; Nitro copies it into `dist/_redirects`
and appends its own Netlify handling as needed.

The generated rules no longer write to `.next/_redirects` and no longer mention
`_next`. They now split visible URL normalization from internal proxy rewrites:
applet-domain root paths, missing-locale paths, known unsupported locale paths,
and standalone duplicate namespace paths are emitted as forced Netlify `301!`
redirects before broader applet proxy rewrites. This preserves the accepted
visible URL behavior from `decideRequestRouting`; the Start runtime still emits
its own `308` redirects when these requests reach the server directly.

The domain rules are ordered before broad catch-alls:

- `/assets/*`, `/_build/*`, `/_serverFn/*`
- `/files/*`, `/lib/*`
- favicon/icon/robots/sitemap paths
- `/api/*`
- `/adds/*` and `/:locale/adds/*`
- `/:locale/api/*`
- canonical applet-domain paths such as `/:locale/hiilikartta/*`, kept from
  being duplicated by the broader `/:locale/*` rule
- localized applet aliases such as `/:locale/energymap/*`, rewritten to the
  canonical `/:locale/energiakartta/*` target before catch-alls
- standalone duplicate namespace paths such as `/:locale/hiilikartta/*`,
  redirected to namespace-stripped standalone paths
- supported `/:locale`, `/:locale/*` proxy rewrites
- known unsupported `/:locale`, `/:locale/*` redirects based on
  `appletConf.json`
- domain root and missing-locale domain catch-all redirects

For Netlify deploys, targets use `DEPLOY_PRIME_URL` or `URL`. Local evidence
commands used `NETLIFY_REDIRECTS_BASE_URL=https://*.example.netlify.app` so the
generated proxy target was deterministic and non-secret.

## Command Matrix

All commands below were run from `/workspace/project`.

| Check | Result |
| --- | --- |
| `node --check utils/scripts/writeNetlifyRedirects.js && node --check utils/scripts/buildFromFolderPruneTmp.js && node --check utils/scripts/prebuildFolderPruneTmp.js` | Pass |
| `yarn test utils/scripts/writeNetlifyRedirects.test.js --runInBand` | Pass, 5 tests |
| `yarn test src/common/routing/requestRouting.test.ts --runInBand` | Pass, 38 tests |
| `yarn start:typecheck` | Pass |
| `yarn eslint utils/scripts/writeNetlifyRedirects.js utils/scripts/writeNetlifyRedirects.test.js utils/scripts/buildFromFolderPruneTmp.js utils/scripts/prebuildFolderPruneTmp.js vite.start.config.mts eslint.config.mjs utils/visual/impactMap.js __tests__/visual/impactMap.test.js` | Pass |
| `NEXT_PUBLIC_COMPILED_APPLETS=main,energiakartta,hiilikartta,luonnonmetsakartat NEXT_PUBLIC_APPLET_ENERGIAKARTTA_DOMAIN=https://energy.example.test NETLIFY_REDIRECTS_BASE_URL=https://main.example.netlify.app yarn build:netlify` | Pass |
| `NEXT_PUBLIC_COMPILED_APPLETS=hiilikartta NETLIFY_REDIRECTS_BASE_URL=https://hiilikartta.example.netlify.app yarn build:netlify` | Pass |
| `NEXT_PUBLIC_COMPILED_APPLETS=luonnonmetsakartat NETLIFY_REDIRECTS_BASE_URL=https://luonnonmetsakartat.example.netlify.app yarn build:netlify` | Pass |
| `NEXT_PUBLIC_COMPILED_APPLETS=main,energiakartta,hiilikartta,luonnonmetsakartat yarn build` | Pass |
| `yarn lint` | Fails on pre-existing lint debt after generated Netlify output is ignored |

After each successful Netlify matrix build, these paths were checked and
present:

- `dist/`
- `dist/assets/`
- `dist/.vite/manifest.json`
- `dist/files/`
- `dist/lib/sql-wasm.wasm`
- `dist/_redirects`
- `.netlify/functions-internal/server/main.mjs`
- `.netlify/functions-internal/server/server.mjs`

After the default local build, these paths were checked and present:

- `.output/server/index.mjs`
- `.output/public`
- `.output/public/assets`
- `.output/public/.vite/manifest.json`
- `public/files`
- `public/lib/sql-wasm.wasm`

## Warnings Observed

The build matrix completed with warnings that were already characteristic of
the Start migration build:

- Rollup circular chunk warnings for `useMapStore` re-exports.
- Vite browser externalization warnings for inactive GeoPackage and
  `better-sqlite3` branches.
- Base UI package `"use client"` directive warnings during Nitro bundling.
- Large chunk warnings.
- `caniuse-lite` outdated warning.

None of these warnings blocked output generation.

The first lint run attempted to parse generated `dist` and `.netlify` bundles
and hit a Node heap OOM. `eslint.config.mjs` now ignores those generated
directories and applies the CommonJS override to both the new
`utils/scripts/**/*.js` path and the pre-existing visual helper paths. After
that, `yarn lint` completed normally but failed on the repository's existing
lint backlog, including legacy source, `any` usage in shared map
types/utilities, and React hook lint findings. Those failures are not
introduced by the Netlify build path.

## Skipped Checks

- Netlify CLI/site-linked `netlify build` was not run. The workspace does not
  contain committed Netlify site linkage or deploy credentials, and this pass
  avoided assuming a site ID or auth token.
- No hosted deploy was triggered from this agent. The repository-side command,
  output, and context matrix were verified locally.

## Manual Netlify Settings

These settings cannot be safely represented with committed values:

- Netlify site linkage and team/project ownership.
- Custom domains and aliases for applet domains. Netlify domain-level redirect
  rules only apply when those domains are assigned to the site.
- Secret or deployment-specific environment variables, including
  `TOLGEE_API_URL`, `TOLGEE_API_KEY`, `BETTER_AUTH_URL`,
  `BETTER_AUTH_SECRET`, `ZITADEL_ISSUER`, `ZITADEL_CLIENT_ID`,
  `ZITADEL_CLIENT_SECRET`, `MML_API_KEY`, and upstream API credentials.
- Public deployment variables whose values are environment-specific, such as
  GeoServer URLs, Mapbox tokens, analytics IDs, and applet-domain overrides.

## F048.9 Handoff

- The Next app tree, Next middleware compatibility skip for `/_next`,
  `next-intl`, Next dependencies, and `@next/bundle-analyzer` remain temporary
  dual-stack cleanup work for `F048.9`.
- `@next/bundle-analyzer` remains installed but is not invoked by the active
  Start or Netlify build/deploy command path.
- Rollup circular chunk warnings for `useMapStore` re-exports remain a Start
  build quality follow-up, not a Netlify output blocker.
