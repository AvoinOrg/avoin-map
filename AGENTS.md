# AGENTS

## Repository overview

Avoin Map is a map-based web app built on Next.js. The codebase contains a core
map experience plus multiple applets that can run inside the main app or as
standalone sites.

## Top-level structure

- `src/app`: Next.js App Router entries (routes, layouts, API handlers).
- `src/app/[locale]/(map)/(applets)`: Applet roots.
- `src/app/[locale]/(map)/(applets)/(main)`: Main app pages/components.
- `src/components`: Shared UI and map components.
- `src/common`: Shared hooks, routing, store, types, and utilities.
- `utils/scripts`: Build-time helpers (translations, folder pruning, Netlify helpers).

## Figma MCP (Prefer Remote; Local Fallback)

- Prefer the remote Figma MCP tools (`mcp__figma_remote__*`) when available.
  Use local/devcontainer MCP only as a fallback when remote MCP is unavailable.
- Local Figma MCP server can run on the Windows host at `http://127.0.0.1:3845/mcp`.
- From inside the devcontainer, local MCP is `http://host.docker.internal:3845/mcp`
  (also available via `FIGMA_MCP_URL` in `.devcontainer/devcontainer.json`).
- Ensure the compose service has
  `extra_hosts: ["host.docker.internal:host-gateway"]` for host reachability.
- `curl`/browser calls that return JSON-RPC `Invalid sessionId` indicate the
  endpoint is reachable and awaiting a proper MCP session.
- When a user shares a public Figma URL, do not pass the full URL to MCP tools.
  Extract `node-id` from the URL and use that as MCP `nodeId`.
- Convert URL-style node IDs to MCP format when needed:
  `node-id=3163-8036` -> `nodeId: "3163:8036"`.
- For exact Figma image/icon assets (not screenshots), prefer this workflow:
  1. Call `get_metadata` on the shared node to inspect child layers and find the
     actual image/vector child node (for example the header image rectangle).
  2. Call `get_design_context` on that child node to get exact asset URLs (MCP
     returns image/SVG asset URLs in the generated output).
  3. Download the returned asset URL and commit the file into repo assets
     (for example under `src/public/...`) instead of recreating/approximating it.
  4. Only use `get_screenshot` as a visual reference/fallback, not as a
     substitute for exact exported vectors/images when exactness matters.

## Applets and build modes

- Applets live under `src/app/[locale]/(map)/(applets)/<namespace>`.
- `NEXT_PUBLIC_COMPILED_APPLETS` drives both runtime routing and build-time
  pruning (see `utils/scripts/prebuildFolderPrune.js`):
  - If it includes `main`, the main app is built and only the listed applets
    remain (unlisted applet folders are removed in the temp build workspace).
  - If it does not include `main`, exactly one applet must be listed; that
    build runs in standalone mode.
- `appletConf.json` declares applets, their Tolgee namespace (`localeNs`),
  languages, and optional domains.
- Builds run in a non-destructive temp workspace:
  - `yarn prebuild-dev`: downloads translations (writes `i18n/*`).
  - `yarn prebuild`: downloads translations + prepares a pruned temp workspace
    (see `utils/scripts/prebuildFolderPruneTmp.js`).
  - `yarn build`: runs `yarn prebuild`, then runs `next build` in the temp
    workspace, then copies `.next` + `public/files` + `public/lib` back to the
    real workspace (see `utils/scripts/buildFromFolderPruneTmp.js`).
    The temp workspace path is tracked in `.applet-build-tmp.json` (gitignored);
    set `BUILD_TMP_KEEP=1` to keep the temp folder for debugging.

## Routing

- Next.js folder routing applies; folders in parentheses are route groups and
  do not appear in the URL.
- Route trees live in `src/common/routing/routes/*.ts` and are converted into
  pathnames in `src/common/navigation/navigation.ts`.
- Use `getRoute`/`MutableLink` for applet-aware links instead of hardcoding
  paths.
- `src/middleware.ts` normalizes locale and applet routing, handling standalone
  applets and domain-based URLs.

## Assets and API copying

- `next.config.js` uses CopyPlugin to copy:
  - `src/public/**/*` into `public/files/*`
  - `src/app/**/public/**/*` into `public/files/<applet>/*`
  - `src/app/(ui)/**/api/**/*` into `src/app/api/<applet>/*`
- `public/` and generated `src/app/api/*` entries are gitignored.
- Avoid dynamic API routes like `[id]` in applet API folders (CopyPlugin
  limitation).

## Localization

- Tolgee powers translations. Applet namespaces and locales are defined in
  `appletConf.json` (`localeNs` + `langs`).
- `utils/scripts/downloadTranslations.js` downloads translation files into
  `i18n/` for applets listed in `NEXT_PUBLIC_COMPILED_APPLETS` (and always
  includes the shared `main` namespace, `avoin-map`, for the active locales;
  requires `TOLGEE_API_URL` and `TOLGEE_API_KEY`).
- Prefer the Tolgee browser plugin (Alt+click) for editing keys.
- Never directly edit the language json files within the i18n folder. Those are automatically downloaded from the Tolgee server.
- Never add a backup string for a key; Always simply use keys. That way we can directly see in UI which keys have not been manually checked.

## State and data

- Zustand manages client state. The map store is sliced under
  `src/common/store/mapStore`, and applets keep their own stores in their
  folders.
- Queries are handled via TanStack Query.

## Notifications

- Notifications are queued via
  `useUIStore().notify({ message, keyName, ns, variant, duration, persist })`.
- Pass `message` directly or provide a Tolgee `keyName` (and optional `ns`);
  `NotificationManager` resolves translation keys before showing.
- `src/components/Notification/NotificationManager.tsx` reads
  `uiStore.notifications` and pushes them into Notistack snackbars.
- `duration` defaults to 6000 ms; use `persist` to keep a notification open.

## Map and styling

- Map rendering uses MapLibre GL JS.
- Layer configs live in `src/components/Map/layers` plus applet-specific layer
  definitions.
- Styles use MapLibre/Mapbox expression syntax for dynamic styling.
- UI uses MUI (Material UI). Prefer styling via the `sx` prop (including `sx`
  arrays) to keep component styling colocated with usage.
- Prefer `sx` over `styled()` / `@emotion/styled`; only use `styled` when it
  materially improves DRY/reuse or encapsulates styling that can’t be expressed
  cleanly with `sx`.
- For responsive `sx`, use the app breakpoint keys `mobile` and `desktop`
  instead of MUI default breakpoint keys (`xs`, `sm`, etc.).

## Auth

- Auth uses NextAuth with a Zitadel issuer.
- Core auth endpoints live in `src/app/api/auth` and `src/app/api/userinfo`.

## Code style

- Prefer `const` arrow functions.
- Use object params for functions with more than two arguments.
- Keep types in `src/common/types` or applet-specific `common/types`.
- Use path aliases (`#/*`, `applets/*`, `@i18n/*`) instead of deep relative
  imports.

## Environment variables

- If you add, rename, or remove environment variables in code, scripts, or
  build configuration, update `.env.template` in the same change.
- Keep `.env.template` non-secret and include a short purpose comment for new
  keys.

## Components

- Always use functional components (const MyComponent = () => {}).
- When creating a stylable component with Sx-prop, extend Sx as array (sx={[{}], ...(Array.isArray(sx) ? sx : [sx])]})

## Tests

- Jest is configured, but coverage is limited (routing has unit tests).
- Applet-specific e2e tests are not standardized yet.
