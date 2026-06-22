# TanStack Start Dual-Stack Bootstrap

This repository is intentionally dual-stack while the F048 migration is in
progress. Next.js remains the production app and still owns the existing
`dev`, `build`, `start`, `prebuild`, `prebuild-dev`, `build-prune`, and visual
scripts.

TanStack Start currently exists only as a toolchain proof with a minimal
placeholder route. Use these Start-specific scripts:

- `yarn start:dev`: runs the Start dev server on port `3001`.
- `yarn start:build`: builds the Start placeholder app through Vite and Nitro.
- `yarn start:preview`: serves the built Start output from `.output` on port
  `3002`.
- `yarn start:typecheck`: type-checks only the Start bootstrap files.

The Start Vite config is `vite.start.config.mts`. It uses the Start Vite plugin,
the React Vite plugin, and `vite-tsconfig-paths` pointed at
`tsconfig.base.json` so existing aliases such as `#/*`, `applets/*`, and
`@i18n/*` resolve consistently. The placeholder route imports only
`#/startBootstrapMarker` to prove alias resolution without pulling in applet,
Tolgee, auth, map, or Next-only runtime code.

Generated routing is handled by the Start/Router Vite plugin. The generated
`src/routeTree.gen.ts` file is committed because `src/router.tsx` imports it
and the Start typecheck expects it to exist. ESLint ignores that generated file.
Build outputs from Start/Nitro/Vite are ignored through `.tanstack/`,
`.output/`, and `.nitro/`.

Route-file conventions for the migration scaffold are documented in
`docs/tanstack-start-route-conventions.md`. Start routes live under
`src/routes`; do not move them into the production Next App Router tree under
`src/app` during the dual-stack phase.

Temporary pieces and later owners:

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
