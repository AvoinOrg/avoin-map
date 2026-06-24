# TanStack Start Route Conventions

This migration uses `src/routes` as the TanStack Start route root. Reusable
applet and map source remains under `src/app`, but runtime routes are owned by
TanStack Start.

The generated route tree is `src/routeTree.gen.ts`. It is committed because
`src/router.tsx` imports it, but it is owned by the TanStack Start/Router
generator and must not be hand-edited. ESLint ignores it, and Start route
generation may overwrite it whenever `start:*` tooling runs.

## File conventions

- `src/routes/__root.tsx` is the root route and uses `createRootRoute`.
- Route files export `Route`.
- Normal file routes use `createFileRoute(...)` with the verbose file route ID
  generated for that file. Include route group and pathless segments in this ID
  when they are present, for example
  `createFileRoute('/$locale/(map)/_map/(applets)/hiilikartta')`.
- Dynamic URL segments use `$param`, such as
  `kaavat.$planId.tsx` with route ID
  `/$locale/(map)/_map/(applets)/hiilikartta/kaavat/$planId`.
- Layout routes use `route.tsx` and render `<Outlet />`.
- Pathless layouts use leading `_` segments, such as `_map`. These participate
  in the internal file route ID but do not add public URL path segments.
- Route groups use directories in parentheses, such as `(map)` and
  `(applets)`. Do not add route configuration files named like `(map).tsx`; the
  installed generator rejects route-group configuration files.
- Colocated non-route files or folders under `src/routes` must start with `-`,
  such as `-helpers` or `-fixtures`, or live outside `src/routes`. The Start
  config makes `routeFileIgnorePrefix: '-'` explicit.
- `index.tsx` is the index route for its folder.

The initial scaffold routes intentionally rendered placeholders and imported
only TanStack Router plus a tiny Start-safe colocated helper. The current Start
route tree imports migrated applet pages, Tolgee setup, MapLibre runtime code,
and applet Zustand stores where parity work has accepted those routes.

## Current scaffold

```text
src/routes/__root.tsx
src/routes/index.tsx
src/routes/-helpers/scaffoldLabels.ts
src/routes/$locale/route.tsx
src/routes/$locale/(map)/_map/route.tsx
src/routes/$locale/(map)/_map/(applets)/hiilikartta/route.tsx
src/routes/$locale/(map)/_map/(applets)/hiilikartta/index.tsx
src/routes/$locale/(map)/_map/(applets)/hiilikartta/kaavat.$planId.tsx
```

The public paths proven by this scaffold are:

- `/`
- `/$locale`
- `/$locale/hiilikartta`
- `/$locale/hiilikartta/kaavat/$planId`

The `(map)` and `(applets)` directories group files only. The `_map` directory
is a shared pathless layout for the future map shell.

## Architecture handoff

The Start route tree should preserve the current conceptual architecture:

- Applets remain separated by namespace folders under the map shell.
- A shared map shell wraps map applet routes.
- Shared components, Zustand stores, and TanStack Query queries remain shared
  instead of being copied into route files.
- The custom route and breadcrumb abstraction remains the source of current
  applet-aware navigation behavior until F048.3 adapts or bridges it for
  TanStack Router.

F048.3 owns the real URL behavior, locale handling, standalone applet rewrites,
domain trimming, breadcrumbs, and `MutableLink` replacement or bridging.
Existing route objects in
`src/common/routing/routes/*.ts` currently use Next-style `[param]` tokens; the
Start file route target convention is `$param`.

## Next-to-Start mapping for F048.3

| Current Next App Router path | Intended TanStack Start shape |
| --- | --- |
| `src/app/[locale]/layout.tsx` | `src/routes/$locale/route.tsx` |
| Legacy map shell client components | `src/runtime/ShellComponents/**`, mounted by `src/routes/$locale/(map)/_map/route.tsx` |
| `src/applets/main/page.tsx` | Future main-app index under the `$locale` map shell; F048.3 should choose the collision-free file once root URL behavior is migrated. |
| `src/applets/forests/page.tsx` | `src/routes/$locale/(map)/_map/(applets)/forests/index.tsx` |
| `src/applets/hiilikartta/pages/page.tsx` | `src/routes/$locale/(map)/_map/(applets)/hiilikartta/index.tsx` |
| `src/applets/hiilikartta/pages/kaavat/page.tsx` | `src/routes/$locale/(map)/_map/(applets)/hiilikartta/kaavat/index.tsx` |
| `src/applets/hiilikartta/pages/kaavat/plan/page.tsx` | `src/routes/$locale/(map)/_map/(applets)/hiilikartta/kaavat/$planId.tsx` or a directory equivalent. |
| `src/applets/hiilikartta/pages/kaavat/plan/alueet/page.tsx` | `src/routes/$locale/(map)/_map/(applets)/hiilikartta/kaavat/$planId/alueet.tsx` or `alueet/index.tsx`. |
| `src/applets/luonnonmetsakartat/pages/admin/taso/folayer/**` | `src/routes/$locale/(map)/_map/(applets)/luonnonmetsakartat/admin/taso/$folayerIdSlug/**` |
| `src/applets/energiakartta/pages/**` | `src/routes/$locale/(map)/_map/(applets)/energiakartta/**` |
| `src/app/[locale]/adds/**` | `src/routes/$locale/adds/**` |
| `src/app/[locale]/dev/component-fixtures/[fixtureId]/[stateId]/page.tsx` | `src/routes/$locale/dev/component-fixtures/$fixtureId/$stateId.tsx` |

F048.3 should verify how locale stripping, domain-based applet roots, applet
build pruning, and breadcrumb labels flow through the existing
`src/common/routing/routing.ts`, `src/common/routing/routing-client.ts`,
`src/common/navigation/navigation.tsx`, `src/components/common/MutableLink.tsx`,
and `src/components/Sidebar/BreadcrumbNav.tsx` before replacing any runtime
behavior.
