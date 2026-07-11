# TanStack Start Route Conventions

TanStack Start file routes under `src/routes` own the application's page and
server route tree. Route files configure TanStack Router, attach route metadata,
and import their page, shell, or handler implementations from `src/applets`,
`src/components`, `src/common`, and `src/runtime`.

The generated registry is `src/routeTree.gen.ts`. It is committed because
`src/router.tsx` imports it, but it is owned by the TanStack Start/Router
generator and must not be hand-edited. Start tooling may overwrite it whenever
route generation runs.

## Ownership and representative topology

- `src/routes/__root.tsx` owns the root route.
- `src/routes/$locale/route.tsx` owns the localized layout.
- `src/routes/$locale/_map/route.tsx` mounts the shared map shell from
  `src/runtime/ShellComponents/MapShell.tsx`.
- `src/routes/$locale/_map/index.tsx` configures the main map index and imports
  `src/applets/main/MainHomePage.tsx`.
- `src/routes/$locale/_map/(applets)/*` configures public applet and internal
  fixture routes while importing applet-owned pages and shells.
- `src/routes/$locale/adds` and `src/routes/$locale/dev` own localized routes
  outside the map applet group.
- `src/routes/api` owns Start server endpoints and delegates applet-specific
  behavior to applet server modules where appropriate.

Applet pages, shells, state, layers, and applet-specific server code belong
under `src/applets/<namespace>`. Shared UI and map components belong under
`src/components`; cross-applet contracts and utilities belong under
`src/common`; Start-specific providers, auth, head metadata, map-shell adapters,
Tolgee static data, and server handlers belong under `src/runtime`.

## File conventions

- Route files export `Route`; server route files export `ServerRoute`.
- Normal page routes use `createFileRoute(...)` with the generated route ID for
  that file. Include route-group and pathless segments in the ID, for example
  `createFileRoute('/$locale/_map/(applets)/carbon/plans/$planId')`.
- Dynamic URL segments use `$param`, such as `$planId` or `$folayerIdSlug`.
- Layout routes use `route.tsx` and normally render `<Outlet />` or a shell
  around it.
- Pathless layouts use a leading `_`, such as `_map`. They participate in the
  route tree without adding a public URL segment.
- Route groups use directories in parentheses, such as `(applets)`. They
  organize route files without adding a URL segment. Do not add a route
  configuration file for a route group; the installed generator rejects it.
- `index.tsx` is the index route for its folder.
- Colocated non-route files or folders under `src/routes` must start with `-`,
  such as `-helpers` or `-fixtures`, or live outside `src/routes`. The Start
  config sets `routeFileIgnorePrefix: '-'`.

## Public applet URL facts

`appletConf.json` is the canonical source for public applet URL facts. An entry
with `publicRoute` is public; `publicRoute.slug`, `legacySlugs`, and ordered
`legacySubpathRedirects` define its canonical and compatibility paths. `main`
and `ui-baseline` intentionally have no `publicRoute` and are not public applet
manifest routes.

`src/common/routing/publicRouteContract/index.js` validates and derives this
contract. `src/common/routing/publicRoutes.ts` exposes it to TypeScript runtime
code, and `utils/scripts/publicRoutes.js` exposes the same contract to build
scripts. Do not duplicate applet slugs or legacy redirect facts in a second
route table.

## Route metadata and applet-aware navigation

Public URL facts are distinct from in-app route identity. Route files attach
semantic metadata with `staticData` and `defineAppRouteStaticData`, using keys
from `APP_ROUTE_KEYS` in `src/common/routing/routeMetadata.ts`. That metadata
provides applet identity, titles, breadcrumbs, and stable route keys without
copying URL templates into callers.

Use `AppRouteLink` for links and `useAppRouteHrefBuilder` when a string href is
required. Both live in `src/common/navigation/appRouteLinks.tsx` and resolve an
`APP_ROUTE_KEYS` value against the current TanStack route registry. Lower-level
TanStack navigation adapters live in `src/common/navigation/navigation.tsx`.
`src/components/Sidebar/BreadcrumbNav.tsx` demonstrates matched-route metadata
and `AppRouteLink` working together.

## Request normalization and applet domains

`src/server.tsx` calls `src/common/routing/requestRouting.ts` before requests
enter the Start handler. That logic uses the selected applets and the manifest
public-route contract to normalize locales, canonical applet paths, legacy
subpaths, and standalone applet roots.

Configured applet domains are a deployment concern in main mode.
`utils/scripts/writeNetlifyRedirects.js` reads `appletConf.json.domains` and
optional public domain overrides to generate domain-specific redirects and
proxy rewrites. Runtime request routing does not turn a configured hostname's
root into an applet root in a main build; it still applies canonical applet-path
normalization when such a request reaches the server.

## Standalone route materialization

`PUBLIC_COMPILED_APPLETS` selects the build mode. Including `main` keeps a main
build with only the listed applets. Omitting `main` requires exactly one applet
and produces a standalone build.

During a standalone build, `utils/scripts/prebuildFolderPrune.js` works only in
the temporary build workspace. It copies the selected canonical route folder
to a pathless `(standalone)` route group, rewrites its literal route IDs, and
removes the main index and unselected route/app code. The tracked canonical
route files remain unchanged. Public route folder selection comes from the
same manifest-derived public-route contract described above.
