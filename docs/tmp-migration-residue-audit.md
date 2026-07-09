# Project Migration Residue Audit

Date: 2026-07-09

Feature: `F070.2-project-migration-residue-audit`

This is a catalogue-only audit of retained active source, tooling, config, and
docs. It does not implement cleanup.

## Scope

In scope:

- `src/`, `utils/`, current docs, root config files, and package/build metadata.
- Active compatibility layers when they appear to be migration leftovers or need
  an explicit sunset decision.
- Queued-feature overlap, especially `F069-remove-redundant-stuff`,
  `F070.1-font-constants-migration`, and
  `F070.3-applet-component-duplication-audit`.

Excluded as primary evidence:

- `legacy/`, `i18n/`, generated root `public/`, `dist/`, `.output/`,
  `node_modules/`, `.dev/`, `.tmp/`, `.yarn/`, generated visual artifacts, and
  build/test outputs.
- Applet-local component duplication that should become shared UI. That belongs
  to `F070.3-applet-component-duplication-audit`.
- Remaining `fontConstants.ts` work. That belongs to
  `F070.1-font-constants-migration`.

Precondition check:

- `rg --files ... | rg 'fontConstants|font-constants|font_constants'` over the
  scoped active tree returned no matches.
- `rg -n -S 'fontConstants|font-constants|font_constants' ...` over the same
  scoped active tree returned no matches.
- The known `fontConstants.ts` residue from `F070.1` is gone in retained source.

## Method

Inventory and targeted checks were run from `/workspace/project`.

Representative commands:

```bash
rg --files --hidden -g 'src/**' -g 'utils/**' -g 'docs/**' \
  -g 'README.md' -g 'AGENTS.md' -g 'package.json' \
  -g 'vite.config.mts' -g 'nitro.config.ts' -g 'netlify.toml' \
  -g 'eslint.config.mjs' -g 'tsconfig.json' -g '.env.template' \
  -g 'appletConf.json' -g '!legacy/**' -g '!i18n/**' \
  -g '!public/**' -g '!dist/**' -g '!.output/**' \
  -g '!node_modules/**' -g '!.dev/**' -g '!.tmp/**' | wc -l

rg -n --hidden -i \
  '(TODO|FIXME|legacy|deprecated|compat|compatibility|temporary|obsolete|migration|remove later|remove after)' \
  src utils docs README.md AGENTS.md package.json vite.config.mts \
  nitro.config.ts netlify.toml eslint.config.mjs tsconfig.json \
  .env.template appletConf.json -g '!legacy/**' -g '!i18n/**' \
  -g '!public/**' -g '!dist/**' -g '!.output/**' \
  -g '!node_modules/**' -g '!.dev/**' -g '!.tmp/**'

rg -n --hidden -i \
  '(next/|@next|Next\.js|App Router|_next|\.next|next-intl|react-app|create-react-app|webpack|babel-loader|bundle-analyzer|react-scripts|CRA)' \
  src utils docs README.md AGENTS.md package.json vite.config.mts \
  nitro.config.ts netlify.toml eslint.config.mjs tsconfig.json \
  .env.template appletConf.json -g '!legacy/**' -g '!i18n/**' \
  -g '!public/**' -g '!dist/**' -g '!.output/**' \
  -g '!node_modules/**' -g '!.dev/**' -g '!.tmp/**'

rg -n --hidden \
  '(@mui/material|@material-ui|@mui/icons-material|@emotion/styled|styled\(|Mui-)' \
  src utils docs README.md AGENTS.md package.json vite.config.mts \
  nitro.config.ts netlify.toml eslint.config.mjs tsconfig.json \
  .env.template appletConf.json -g '!legacy/**' -g '!i18n/**' \
  -g '!public/**' -g '!dist/**' -g '!.output/**' \
  -g '!node_modules/**' -g '!.dev/**' -g '!.tmp/**'

rg -n --hidden \
  '(FrameworkImage|AppLink|MutableLink|AppletWrapper|MapShell|ShellProvider|legacyRouteRedirects|userinfo|LoadingSpinnerOld|prebuildHiilikartta|NEXT_PUBLIC_COMPILED_APPLETS)' \
  src utils docs README.md AGENTS.md package.json vite.config.mts \
  nitro.config.ts netlify.toml eslint.config.mjs tsconfig.json \
  .env.template appletConf.json -g '!legacy/**' -g '!i18n/**' \
  -g '!public/**' -g '!dist/**' -g '!.output/**' \
  -g '!node_modules/**' -g '!.dev/**' -g '!.tmp/**'
```

The scoped active-source inventory counted 840 files. `find src -maxdepth 2`
confirmed the active source roots are `src/applets`, `src/common`,
`src/components`, `src/public`, `src/routes`, `src/runtime`, and `src/types`;
`src/app` does not exist.

## Summary Table

| ID | Finding | Priority | Cleanup risk | Queued-feature overlap |
| --- | --- | --- | --- | --- |
| MR-01 | Active docs still describe an absent `src/app` and old route scaffold state | Medium | Low | No known queued cleanup owner |
| MR-02 | `src/routes/-helpers/scaffoldLabels.ts` is dead route scaffold residue | High | Low | Directly covered by `F069-remove-redundant-stuff` |
| MR-03 | Sidebar spacing constants remain in a component-local helper | Medium | Low | Directly covered by `F069-remove-redundant-stuff` |
| MR-04 | `utils/scripts/prebuildHiilikartta.js` is an obsolete failing stub | Medium | Low | Potential broad cleanup overlap with `F069-remove-redundant-stuff` |
| MR-05 | `package.json` retains CRA/Webpack/Babel-era metadata and likely stale direct deps | High | Medium | Potential broad cleanup overlap with `F069-remove-redundant-stuff` |
| MR-06 | OpenLayers/hybrid-map residue remains in active MapLibre code and CSS | Medium | High | No known queued cleanup owner |
| MR-07 | Applet public-route/build-mode constants are duplicated across runtime and scripts | Medium | Medium | No direct queued owner; broad helper cleanup may overlap with `F069` |
| MR-08 | Start auth has long-lived compatibility bridges without visible sunset criteria | Medium | High | No known queued cleanup owner |
| MR-09 | Legacy localized route redirects remain active and should get a support-window decision | Low | High | No known queued cleanup owner |
| MR-10 | `LoadingSpinnerOld` is fixture-only compatibility residue | Low | Low | Potential broad cleanup overlap with `F069`; not `F070.3` |
| MR-11 | Global CSS still carries CRA/OpenLayers/font-era residue | Medium | Medium | Partial font-adjacent overlap with `F070.1`; style cleanup may overlap with `F069` |
| MR-12 | Build asset generation has a stale `src/app/(ui)` guard | Low | Low | Potential broad cleanup overlap with `F069` |

## Detailed Findings

### MR-01: Active docs still describe an absent `src/app` and old route scaffold state

Priority: Medium

Cleanup risk: Low for doc corrections, medium if paired with source moves.

Evidence:

- `README.md` says reusable applet and map source remains under `src/app`, and
  lists `src/app` in the app structure.
- `AGENTS.md` says `src/app` is reusable map shell source retained from the App
  Router tree.
- `docs/tanstack-start-route-conventions.md` says reusable applet/map source
  remains under `src/app`, lists an initial scaffold with only a few route
  files, references `src/common/routing/routes/*.ts`, references
  `src/components/common/MutableLink.tsx`, and includes a Next-to-Start mapping
  for old App Router paths.
- `docs/tanstack-start-dual-stack.md` says reusable source remains under
  `src/app` and tells readers to keep reusable applet/map components there.
- `find src/app -maxdepth 2 -type f` failed with `No such file or directory`.
- `find src/routes -type f | wc -l` returned 53 current route files, far beyond
  the initial scaffold documented in `docs/tanstack-start-route-conventions.md`.
- `rg -n 'MutableLink|components/common/MutableLink' src docs README.md
  AGENTS.md ...` found only stale doc references, not an active component.

Why it looks like residue:

The live TanStack Start structure has moved on from the intermediate scaffold
and the `src/app` retained-source story. These docs now mix useful historical
context with inaccurate current instructions.

Suggested cleanup direction:

Update `README.md`, `AGENTS.md`, and the Start migration docs so current source
ownership points to `src/applets`, `src/components`, `src/common`, `src/routes`,
and `src/runtime`. Keep historical F048 rationale only in explicitly historical
sections. Remove or revise references to missing `src/app`,
`src/common/routing/routes/*.ts`, and `MutableLink`.

Queued-feature overlap:

No known queued cleanup owner. This is documentation-only and should not be
folded into `F070.3`, which is about applet UI duplication.

Verification needed before cleanup:

Re-run `find src/app`, `find src/routes -type f`, and `rg` for old doc-only
paths after any edits. No runtime test should be needed for doc-only cleanup.

### MR-02: `src/routes/-helpers/scaffoldLabels.ts` is dead route scaffold residue

Priority: High

Cleanup risk: Low.

Evidence:

- `src/routes/-helpers/scaffoldLabels.ts` exports only
  `startRouteScaffoldLabel = 'TanStack Start route scaffold'`.
- `rg -n -- '-helpers|scaffold|startRouteScaffoldLabel|TanStack Start route scaffold'
  src/routeTree.gen.ts src/routes vite.config.mts utils` found only that file.
- `docs/tanstack-start-route-conventions.md` still lists
  `src/routes/-helpers/scaffoldLabels.ts` as part of the initial scaffold.

Why it looks like residue:

The helper was part of the initial Start scaffold, is not imported by active
route files or the generated route tree, and contributes no runtime behavior.

Suggested cleanup direction:

Delete `src/routes/-helpers/scaffoldLabels.ts` and the empty `-helpers` folder,
then remove stale scaffold references from docs if those docs are updated in the
same or a later docs pass.

Queued-feature overlap:

Directly covered by `F069-remove-redundant-stuff`; do not duplicate the
implementation in this audit feature.

Verification needed before cleanup:

Re-run the `rg` command above and confirm `src/routeTree.gen.ts` has no
dependency on `-helpers`.

### MR-03: Sidebar spacing constants remain in a component-local helper

Priority: Medium

Cleanup risk: Low if values are moved unchanged.

Evidence:

- `src/components/Sidebar/sidebarSpacing.ts` exports
  `SIDEBAR_HEADER_EDGE_INSET_REM`, `SIDEBAR_CONTENT_BOX_PADDING_X`,
  `SIDEBAR_CONTENT_BOX_PADDING_BOTTOM`, and
  `SIDEBAR_HEADER_TITLE_PADDING_X`.
- `src/components/Sidebar/SidebarHeader.tsx` and
  `src/components/Sidebar/SidebarContentBox.tsx` import from `./sidebarSpacing`.
- `src/common/style/theme/constants.ts` already owns shared style constants such
  as sidebar widths, padding, breakpoints, scrollbar width, and shared control
  radius.

Why it looks like residue:

The constants are shared style-only values but live in a component-local helper
instead of the current shared theme constants module.

Suggested cleanup direction:

Move the exports into `src/common/style/theme/constants.ts`, update the two
imports, and delete `src/components/Sidebar/sidebarSpacing.ts` once unused.

Queued-feature overlap:

Directly covered by `F069-remove-redundant-stuff`; do not duplicate the
implementation in this audit feature.

Verification needed before cleanup:

Re-run `rg -n 'sidebarSpacing|SIDEBAR_HEADER_EDGE_INSET_REM|SIDEBAR_CONTENT_BOX_PADDING_X|SIDEBAR_CONTENT_BOX_PADDING_BOTTOM|SIDEBAR_HEADER_TITLE_PADDING_X'
src/components src/common` and run `yarn start:typecheck`.

### MR-04: `utils/scripts/prebuildHiilikartta.js` is an obsolete failing stub

Priority: Medium

Cleanup risk: Low.

Evidence:

- `utils/scripts/prebuildHiilikartta.js` prints
  `prebuildHiilikartta.js is obsolete.` and exits with status 1.
- `rg -n 'prebuildHiilikartta|prebuild-hiili|hiilikartta.*prebuild'
  package.json utils docs README.md src` found only the stub itself.
- Current `package.json` build scripts route through `prebuild-dev`,
  `prebuild`, `build`, and `build:netlify`.

Why it looks like residue:

It is an explicitly obsolete migration-era command stub with no active caller.
Keeping failing historical commands in active tooling can confuse maintainers
and automated discovery.

Suggested cleanup direction:

Delete the stub, or move the deprecation note into docs if an external team may
still call that filename. If external automation is possible, first search CI,
Netlify settings, and deployment scripts outside this repository.

Queued-feature overlap:

Potential broad cleanup overlap with `F069-remove-redundant-stuff`, but `F069`
currently scopes only `src/routes/-helpers` and sidebar style constants.

Verification needed before cleanup:

Search repository and deployment config for `prebuildHiilikartta`; run
`yarn prebuild` or targeted build-script checks if the file is removed.

### MR-05: `package.json` retains CRA/Webpack/Babel-era metadata and likely stale direct deps

Priority: High

Cleanup risk: Medium.

Evidence:

- `package.json` still has `"name": "climate-map"`, `"main": "index.html"`,
  and repository `git@github.com:ButtonProgram/climate-map.git`.
- `package.json` includes `browserslist` and a Babel section using
  `react-app`.
- Direct dependencies/devDependencies include Webpack-era packages such as
  `webpack`, `webpack-bundle-analyzer`, `webpack-cli`,
  `webpack-dev-server`, `terser-webpack-plugin`, `babel-loader`,
  `babel-preset-react-app`, `clean-webpack-plugin`,
  `css-minimizer-webpack-plugin`, `dotenv-webpack`,
  `eslint-webpack-plugin`, `git-revision-webpack-plugin`,
  `html-webpack-plugin`, `style-loader`, `sass-loader`, and
  `mini-css-extract-plugin`.
- A refined active-source search for those exact package names over `src`,
  `utils`, docs, and root config found no exact active references outside
  `package.json`.
- `docs/f048-8-netlify-build-deploy-report.md` says Next dependencies and
  `@next/bundle-analyzer` were already removed in later F048 cleanup, making
  this remaining package metadata look like older CRA/Webpack residue.
- The `favicon` script calls `real-favicon`, but `rg` found no declared
  dependency or other active reference for that CLI.

Why it looks like residue:

The active build runs TanStack Start through Vite/Nitro, not CRA/Webpack. The
old app name/repo/main fields and Babel preset do not match the current app.

Suggested cleanup direction:

Run a package audit with `yarn why` and package-manager constraints before
removing anything. Remove or update stale metadata, the CRA Babel config, and
unused direct dependencies in a dedicated dependency cleanup. Keep packages that
are still required transitively, by Jest transforms, by build scripts, or by
runtime code.

Queued-feature overlap:

Potential broad cleanup overlap with `F069-remove-redundant-stuff`, though the
current F069 plan does not cover package cleanup.

Verification needed before cleanup:

Use `yarn why <package>`, exact active-source `rg` checks, `yarn start:typecheck`,
targeted tests, and at least one build path before removing direct dependencies.

### MR-06: OpenLayers/hybrid-map residue remains in active MapLibre code and CSS

Priority: Medium

Cleanup risk: High.

Evidence:

- `src/components/Map/MapHandler.tsx` starts with comments saying there is
  leftover OpenLayers/hybrid implementation code not currently used.
- The same file contains commented `ol` imports, commented `OlMap`/overlay
  setup, commented hybrid switch branches, `mapLibraryMode` handling, and
  commented `.ol-scale-line` styling.
- `src/common/types/map.ts` defines `MapLibraryMode = 'hybrid' | 'maplibre'`.
- `src/common/store/mapStore/mapCoreSlice.ts` has commented OpenLayers helper
  code marked "Broken after removing ActiveLayerGroupIds".
- `src/common/store/mapStore/mapLayerSlice.ts` has a TODO for OpenLayer usage.
- `src/common/style/index.css` still defines `.ol-popup` and
  `.ol-popup-closer` rules.
- `package.json` still declares `ol` and `ol-mapbox-style`.
- Exact active import search found no uncommented `ol` imports in retained
  source; `@ngageoint/geopackage` remains actively imported for GPKG import and
  should not be conflated with OpenLayers cleanup.

Why it looks like residue:

The current map runtime is MapLibre. OpenLayers support appears to exist mostly
as commented future-reference code, a `hybrid` mode type, CSS selectors, and
direct dependencies rather than a usable active mode.

Suggested cleanup direction:

Decide whether OpenLayers/hybrid mode is a supported future requirement. If not,
remove commented implementation blocks, remove `hybrid` from `MapLibraryMode`,
delete `.ol-*` CSS, and audit/remove `ol`/`ol-mapbox-style` dependencies. If it
is a desired future option, move the rationale into an explicit ADR or issue and
avoid carrying broken commented code inside active runtime files.

Queued-feature overlap:

No known queued cleanup owner. This is not `F070.3` applet UI duplication work.

Verification needed before cleanup:

Map behavior is high risk. Before dependency or type removal, run active map
tests/typecheck and a map smoke/visual check. Confirm no applet switches
`mapLibraryMode` to `hybrid`.

### MR-07: Applet public-route/build-mode constants are duplicated across runtime and scripts

Priority: Medium

Cleanup risk: Medium.

Evidence:

- `src/common/routing/publicRoutes.ts` defines `PUBLIC_APPLET_NAMESPACES`,
  `APPLET_PUBLIC_ROUTE_SLUGS`, `APPLET_LEGACY_PUBLIC_ROUTE_SLUGS`,
  `APPLET_LEGACY_SUBPATH_REDIRECTS`, and helper functions.
- `utils/scripts/publicRoutes.js` duplicates the same public namespace, slug,
  legacy slug, subpath redirect, and helper data in CommonJS form.
- `NEXT_PUBLIC_COMPILED_APPLETS` parsing appears separately in
  `utils/scripts/appletBuildConfig.js`, `src/common/routing/requestRouting.ts`,
  `src/common/routing/appletBuildMode.ts`,
  `src/common/navigation/tolgee/shared.ts`,
  `utils/visual/scenarios.js`, and `utils/scripts/downloadTranslations.js`.
- Some parsers dedupe or validate against `appletConf.json`; others only trim,
  lowercase, and filter. Some use fallback behavior when the env var is empty
  while others error.

Why it looks like residue:

The route/build migration left separate runtime TS and tooling JS copies of the
same applet route facts, plus multiple env parsing implementations with
different semantics. That increases drift risk when public slugs, standalone
rules, or applet lists change.

Suggested cleanup direction:

Create one source of truth that can be consumed by both runtime and Node
scripts, such as JSON data plus small typed wrappers, or a generated CommonJS
artifact derived from the TS module. Separately centralize
`NEXT_PUBLIC_COMPILED_APPLETS` parsing with explicit options for "strict build"
versus "runtime fallback" behavior.

Queued-feature overlap:

No direct queued owner. Broad helper cleanup may overlap with
`F069-remove-redundant-stuff` if that feature is later expanded, but the current
F069 plan does not include this.

Verification needed before cleanup:

Run routing unit tests, Netlify redirect tests, translation download selection
checks, visual scenario selection checks, and standalone applet routing checks.

### MR-08: Start auth has long-lived compatibility bridges without visible sunset criteria

Priority: Medium

Cleanup risk: High.

Evidence:

- `src/runtime/README.md` calls `src/routes/api/userinfo.ts` a narrow GET-only
  compatibility bridge for the existing user-store handoff.
- `src/routes/api/userinfo.ts` mounts `/api/userinfo`.
- `src/runtime/ShellComponents/userStateHandler.tsx` fetches `/api/userinfo`
  with Axios to populate the legacy user store.
- `src/runtime/auth/env.ts` falls back from `ZITADEL_ISSUER` to
  `NEXT_PUBLIC_ZITADEL_ISSUER` and defaults Zitadel redirects to the legacy
  `/api/auth/callback/zitadel` path.
- `.env.template` says the public Zitadel issuer fallback is retained during
  migration and that the local Zitadel client is currently registered for the
  legacy callback path.
- `src/runtime/auth/request.ts` rewrites legacy callback paths to Better Auth's
  Generic OAuth callback.

Why it looks like residue:

These are intentional compatibility layers, but they preserve legacy auth
surface area after the Better Auth migration. The docs explain why they exist
but not what condition makes them removable.

Suggested cleanup direction:

Define auth cleanup milestones: migrate the user-store handoff to session/user
data that does not require `/api/userinfo`, require server-only
`ZITADEL_ISSUER` in production, and register/update Zitadel callbacks so the
legacy callback rewrite can be removed. Keep the bridge until those conditions
are satisfied.

Queued-feature overlap:

No known queued cleanup owner.

Verification needed before cleanup:

Run auth unit tests, `yarn start:auth-smoke`, and manual/local auth callback
checks after any auth bridge changes.

### MR-09: Legacy localized route redirects remain active and should get a support-window decision

Priority: Low

Cleanup risk: High.

Evidence:

- `src/common/routing/legacyRouteRedirects.ts` provides redirect helpers.
- `src/routes/$locale/_map/(applets)/luonnonmetsakartat/admin/tuo.tsx` redirects
  old `tuo` paths to `import`.
- `src/routes/$locale/_map/(applets)/luonnonmetsakartat/admin/taso/$.tsx` and
  `route.tsx` redirect old `taso` paths to `layer`.
- `src/common/routing/publicRoutes.ts` maps old subpaths like `kaavat`,
  `alueet`, `raportti`, `tuo`, `taso`, `asetukset`, and `kuvat` to current
  route segments.
- `src/common/routing/requestRouting.test.ts` includes legacy standalone
  Hiilikartta and Luonnonmetsakartat redirect expectations.
- `utils/scripts/visual/carbon-mock-smoke.js` and
  `utils/scripts/visual/luonnonmetsakartat-mock-smoke.js` include legacy
  redirect smoke checks.

Why it looks like residue:

The redirect layer is active and tested, so it is not dead code. It is still
legacy URL compatibility from earlier route migrations and should have an
explicit retention policy.

Suggested cleanup direction:

Keep the redirects until a product/analytics owner approves URL deprecation.
Then remove redirect routes, legacy subpath maps, tests, and visual smoke cases
in one focused routing cleanup.

Queued-feature overlap:

No known queued cleanup owner.

Verification needed before cleanup:

Check production analytics/logs for old URL traffic, confirm external docs and
links have moved, then run routing tests and applet mock smokes.

### MR-10: `LoadingSpinnerOld` is fixture-only compatibility residue

Priority: Low

Cleanup risk: Low.

Evidence:

- `src/components/Loading/LoadingSpinnerOld.tsx` exists beside the current
  `src/components/Loading/LoadingSpinner.tsx`.
- `rg -n 'LoadingSpinnerOld|LegacyLoadingSpinner|LoadingSpinner as Legacy'`
  found only `src/common/component-fixtures/fixtures/LoadingFeedbackFixture.tsx`
  and generated fixture manifest references.
- The fixture labels the state `legacy-ellipsis` and describes it as
  compatibility coverage for `LoadingSpinnerOld`.

Why it looks like residue:

The old spinner has no active runtime consumer and is retained only for fixture
comparison/history.

Suggested cleanup direction:

Either declare the legacy fixture state intentionally retained for visual
comparison, or delete `LoadingSpinnerOld.tsx` and remove the fixture state plus
manifest entry in a fixture cleanup pass.

Queued-feature overlap:

Potential broad cleanup overlap with `F069-remove-redundant-stuff`; not part of
`F070.3` because it is not applet-local component duplication.

Verification needed before cleanup:

Regenerate or update component fixture metadata if fixture states are removed,
then run the component fixture tests/visual checks that own loading feedback.

### MR-11: Global CSS still carries CRA/OpenLayers/font-era residue

Priority: Medium

Cleanup risk: Medium.

Evidence:

- `src/common/style/index.css` begins with `/* are both this file and App.css
  needed? */`, but `find src -name 'App.css'` found no `App.css`.
- The same file sets global body/input font stacks to Roboto/Raleway and
  code font to `source-code-pro`.
- The active theme font module is `src/common/style/theme/fonts.ts`, which owns
  Arimo font constants, variable class, Google stylesheet, and variable CSS.
- `src/common/style/index.css` also defines `.ol-popup` styles even though the
  active map runtime is MapLibre and OpenLayers code is commented or inactive.

Why it looks like residue:

The global stylesheet preserves old CRA/App.css questions, old font defaults,
and OpenLayers popup classes while the retained theme moved to Arimo and MUI
System/Base UI.

Suggested cleanup direction:

Audit `index.css` against the current theme/global-style responsibilities.
Remove the stale App.css comment, reconcile global fonts with the Arimo theme,
and delete `.ol-*` rules if MR-06 removes OpenLayers compatibility. Avoid
changing typography as part of a broad cleanup unless visual checks are planned.

Queued-feature overlap:

`F070.1-font-constants-migration` owned only the `fontConstants.ts` move and is
already satisfied. Further global font cleanup should coordinate with any future
font feature. Style cleanup may partially overlap with `F069-remove-redundant-stuff`
if that scope is expanded, but current F069 is about sidebar constants.

Verification needed before cleanup:

Run typecheck plus visual checks for pages/components affected by global CSS and
font changes.

### MR-12: Build asset generation has a stale `src/app/(ui)` guard

Priority: Low

Cleanup risk: Low.

Evidence:

- `utils/scripts/prepareGeneratedPublicAssets.js` contains
  `assertNoStaleUiApiCopySource`, which checks for `src/app/(ui)` and aborts if
  it appears.
- `src/app` does not exist in the current source tree.
- `README.md` already says there is no live `src/app/(ui)` API copy source in
  the Start build path.

Why it looks like residue:

The guard protects against reintroducing an old CopyPlugin API source path, but
the path is now outside the retained source structure. It is a historical
migration guard living in active build code.

Suggested cleanup direction:

Either remove the guard after confirming the old `src/app/(ui)` path cannot
return, or keep it with a clearer comment that it is an intentional defensive
assertion for historical source resurrection.

Queued-feature overlap:

Potential broad cleanup overlap with `F069-remove-redundant-stuff`; current
F069 does not include build asset scripts.

Verification needed before cleanup:

Run `node --check utils/scripts/prepareGeneratedPublicAssets.js` and the
generated-public-assets portion of the build/prebuild flow if changed.

## Inspected Areas With No Actionable Finding

- Font constants precondition: no active `fontConstants` file or reference was
  found. `src/common/style/theme/fonts.ts` now owns Arimo font constants.
- Next.js imports: active-source exact import searches found no `next/*`,
  `@next/*`, or `next-intl` runtime imports. Remaining Next mentions are docs,
  generated-output ignores, or historical notes.
- Full Material UI imports: active retained source did not import
  `@mui/material`, `@material-ui`, or `@mui/icons-material`. `@emotion/styled`
  remains a package dependency and `src/common/style/theme/mui-system-foundation.md`
  explains it is kept for MUI System/styled-engine compatibility.
- Framework-neutral wrappers: `FrameworkImage`, `Link`, `AppLink`,
  `AppRouteLink`, `AppletWrapper`, `MapShell`, and `ShellProvider` are actively
  used as Start/runtime adapters. They are not dead code based on current
  import tracing.
- Generated route tree: `src/routeTree.gen.ts` is generated and intentionally
  committed. No cleanup recommendation is made here beyond not hand-editing it.
- Component fixture harness: fixture descriptions preserve migration coverage
  intentionally. Only the fixture-only old spinner is called out because it is a
  concrete unused source component.
- `src/public`: source asset input was not broadly audited; it was only touched
  where active-source findings pointed to generated public asset behavior.
- Applet-local duplicate UI patterns: intentionally deferred to
  `F070.3-applet-component-duplication-audit`.

## Out-Of-Scope Handoffs

- `F070.1-font-constants-migration`: owns any remaining `fontConstants.ts`
  migration work. This audit found no remaining active references.
- `F070.3-applet-component-duplication-audit`: owns applet-local UI/component
  duplication candidates, including repeated dropdown/button/sidebar patterns.
- `F069-remove-redundant-stuff`: directly owns `src/routes/-helpers` removal and
  `sidebarSpacing.ts` consolidation. It may be a natural place for additional
  broad redundant-helper cleanup only if the manager expands its scope.

## Follow-Up Notes

The highest-confidence no-behavior cleanup items are MR-02, MR-03, and MR-04.
The highest-risk cleanup areas are MR-06, MR-08, and MR-09 because they touch
map runtime or public/auth compatibility behavior. Dependency cleanup in MR-05
should be a dedicated pass with package-manager evidence and build/test
verification rather than a quick deletion sweep.
