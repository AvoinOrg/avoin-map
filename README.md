# Avoin Map

A map-based web app for visualizing sustainability-related data. The app is
available at https://map.avoin.org.

## Development

The app uses Next.js (App Router) and runs via Docker Compose.

Create `.env` from `.env.template`, then set at least:

```bash
# Map data source.
NEXT_PUBLIC_GEOSERVER_URL=https://gis.example.org/geoserver

# Tolgee runtime config (used in the client).
NEXT_PUBLIC_TOLGEE_API_URL=
NEXT_PUBLIC_TOLGEE_API_KEY=

# Tolgee export API (used by utils/scripts/downloadTranslations.js).
TOLGEE_API_URL=
TOLGEE_API_KEY=
```

If you need auth flows, also set:

```bash
NEXT_PUBLIC_ZITADEL_ISSUER=
ZITADEL_ISSUER=
ZITADEL_CLIENT_ID=
ZITADEL_CLIENT_SECRET=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_TRUSTED_ORIGINS=
# Optional when the Zitadel app registration uses a non-default callback.
# ZITADEL_REDIRECT_URI=
```

Run the development app:

```bash
docker compose -f docker-compose.dev.yml up
```

The app serves on `http://localhost:3000` unless `DEV_PORT` overrides it.

Run the production image flow:

```bash
docker compose -f docker-compose.prod.yml up
```

## Commits

Use Conventional Commits for commit messages, for example `feat: ...`,
`fix: ...`, `refactor: ...`, `docs: ...`, or `chore: ...`.

## Figma MCP in devcontainer

When the Figma MCP server runs on the Windows host (for example at
`http://127.0.0.1:3845/mcp` on Windows), use this endpoint from the
devcontainer:

- `http://host.docker.internal:3845/mcp`
- `.devcontainer/devcontainer.json` exposes this as `FIGMA_MCP_URL`
- The compose service must include
  `extra_hosts: ["host.docker.internal:host-gateway"]` (present in the dev
  compose file)

The devcontainer uses `docker-compose.dev.yml` and attaches to the `app`
service.

Quick connectivity check from inside the container:

```bash
curl -i "$FIGMA_MCP_URL"
```

If you get a JSON-RPC error like `Invalid sessionId`, networking is working.
That response means the server is reachable but expects an MCP session, not a
plain HTTP request.

## App structure

- `src/app`: Next.js App Router entries (routes, layouts, API handlers).
- `src/app/[locale]/(map)/(applets)`: Applet roots.
- `src/app/[locale]/(map)/(applets)/(main)`: Main app pages/components.
- `src/common`: Shared hooks, routing, store, types, utilities.
- `src/components`: Shared UI and map components.
- `utils/scripts`: Build-time helpers (translations, folder pruning, Netlify helpers).
- `legacy/`: Archival old implementation excluded from current app builds and
  `tsconfig.json`; full-MUI imports here are scan false positives unless this
  tree is explicitly reactivated.

## Applets and build modes

Applets are self-contained apps that reuse shared map components but keep their
own pages, stores, and layer configs. They can run inside the main app or as
standalone deployments.

- `NEXT_PUBLIC_COMPILED_APPLETS` drives both runtime routing and build-time
  pruning:
  - If it includes `main`, we build the main app and only the listed applets
    (unlisted applet folders are pruned).
  - If it does not include `main`, exactly one applet must be listed; that
    build runs in standalone mode.
- `appletConf.json` defines applets, their Tolgee namespace (`localeNs`),
  languages, and optional domains.
- Builds run in a temp workspace (non-destructive):
  - `yarn prebuild-dev`: downloads translations (writes `i18n/*`).
  - `yarn prebuild`: downloads translations + prepares a pruned temp workspace
    (see `utils/scripts/prebuildFolderPruneTmp.js` and
    `utils/scripts/prebuildFolderPrune.js`).
  - `yarn build`: runs `yarn prebuild`, then runs `next build` in the temp
    workspace, then copies `.next` plus `public/files` + `public/lib` back to
    the real workspace (see `utils/scripts/buildFromFolderPruneTmp.js`).
    The temp workspace path is persisted in `.applet-build-tmp.json` (gitignored);
    set `BUILD_TMP_KEEP=1` to keep the temp folder for debugging.
- `utils/scripts/writeNetlifyRedirects.js` exists for legacy Netlify domain
  setups, but is not part of the default build pipeline.

## Routing and navigation

- Next.js folder routing applies; route groups in parentheses do not appear in
  the URL.
- Route trees in `src/common/routing/routes/*.ts` power `getRoute` and
  `MutableLink` for applet-aware paths.
- `src/middleware.ts` normalizes locale and applet routing and supports
  standalone applets or domain-based URLs.

## Assets and API copying

`next.config.js` copies:
- `src/public/**/*` into `public/files/*`
- `src/app/**/public/**/*` into `public/files/<applet>/*`
- `src/app/(ui)/**/api/**/*` into `src/app/api/<applet>/*`

`public/` and generated `src/app/api/*` entries are gitignored. Avoid dynamic
API route segments (like `[id]`) in applet API folders due to webpack
limitations.

## State, data, and map

- Map rendering uses MapLibre GL JS.
- UI components are built with Base UI and MUI System; prefer the `sx` prop for
  styling over `styled()` / `@emotion/styled` and separate style sheets when
  possible (use `styled` only when it significantly improves DRY/reuse).
- Add unique `aria-label` values to icon-only buttons, custom click targets,
  and menu triggers/items that do not already expose a stable accessible name.
  This improves both accessibility and automated UI test reliability.
- State is managed with Zustand; the map store is split into slices and applet
  stores live in their applet folders.
- Data fetching uses TanStack Query.

## Notifications

- UI notifications are queued with `useUIStore().notify({ message, keyName, ns, variant, duration, persist })`.
- Provide `message` directly or pass a Tolgee `keyName` (and optional `ns`);
  `NotificationManager` resolves translation keys before showing the snackbar.
- `src/components/Notification/NotificationManager.tsx` listens to
  `uiStore.notifications` and enqueues Notistack snackbars, marking them as
  shown to avoid duplicates.
- `duration` defaults to 6000 ms; set it per-notification to auto-dismiss
  sooner or use `persist` to keep it open.

## Localization

- Tolgee provides translations; namespaces and languages live in
  `appletConf.json` (`localeNs` + `langs`).
- `utils/scripts/downloadTranslations.js` generates `i18n/*`. It only downloads
  namespaces for applets listed in `NEXT_PUBLIC_COMPILED_APPLETS` (and always
  includes the shared `main` namespace, `avoin-map`, for the active locales).
- The Tolgee browser plugin (Alt+click) is the preferred editing workflow.
- Prefer `TText` over raw `T` for JSX-rendered translation content. `TText`
  injects repo-wide Tolgee ICU rich-text params from
  `src/components/common/TText.tsx`.
- Keep `useTranslate().t(...)` for string-only use cases such as `aria-label`,
  helper text, metadata, and other non-JSX APIs.
- `TText` default params currently support:
  - `lb` and `br` for line breaks
  - `i` for italics
  - `b` for bold
- Use ICU tag syntax for those params:
  - line break: `Ensimmäinen rivi<lb></lb>Toinen rivi`
  - italic: `Tämä on <i>kursiivia</i>`
  - bold: `Tämä on <b>lihavoitu</b>`
- Do not use `{lb}` or `{br}`. Curly braces are ICU value interpolation and can
  cause errors such as `Functions are not valid as a React child`.
- Tolgee React rich-text tags are not self-closing. Use `<lb></lb>` or
  `<br></br>`, not `<lb />` or `<br />`.
- Handle counts with ICU plural blocks instead of JS-side singular/plural
  concatenation. Always include `other`, and add `=0`, `one`, `few`, `many`,
  or other categories as the locale requires. Example:
  `{count, plural, one {# kaava} other {# kaavaa}}`

## Auth

Authentication uses NextAuth with a Zitadel issuer. Core auth routes live in
`src/app/api/auth` and `src/app/api/userinfo`.

## Tests

Tests are currently light. Routing has unit tests, but applet-specific e2e
coverage is not standardized yet.

## Developer browser collaboration

This repo includes two real-time shared browser workflows in addition to the
visual regression screenshot tooling:

- `browser:live:host:*`: attach from the devcontainer to a Windows host Chrome
  instance over CDP (same tab the human is watching).
- `browser:live:container:*`: run a headed Chromium in the devcontainer and
  attach to it over CDP (visible through the devcontainer GUI bridge).

Use `browser:live:lock:*` commands for turn-taking when both the human and the
automation may interact with the same browser. See `AGENTS.md` for the detailed
runbook and host Chrome startup command.

Local tooling artifacts are gitignored under `.dev/`:
- Visual regression outputs: `.dev/visual-regression/`
- Host browser storage snapshots: `.dev/browser-state/`
- Live shared-browser lock/session/log files: `.dev/live-browser/`
- Container shared-browser persistent profile data: `.dev/live-browser-persist/`

Persistent live-browser profiles:

- Host Chrome persistence is controlled by the `--user-data-dir` path in the
  Windows PowerShell launch command. Reusing the same path keeps extensions,
  cache, cookies, localStorage, and IndexedDB.
- Container shared-browser profiles persist by default and can be relocated on
  the host via optional `.env` variable
  `LIVE_BROWSER_CONTAINER_DATA_HOST_DIR` (WSL/Linux path format recommended).
- When the env var is unset, Docker Compose uses project-local
  `./.dev/live-browser-persist` (gitignored).
- Container live-browser startup uses software WebGL-friendly defaults for
  devcontainer reliability; pass extra Chrome flags with
  `yarn browser:live:container:start -- --browser-arg=<flag>` when needed.
- Window controls are also available: `-- --window-size=1600,960`,
  `-- --start-maximized`, or `-- --no-window-size`.

Visual runner browser modes:

- `utils/scripts/visual/run.js` now accepts `--browser-mode=auto|headless|xvfb-webgl`.
- `auto` is the default. It switches map/WebGL scenarios to headed Playwright
  Chromium under `xvfb-run`, while non-WebGL scenarios stay in true headless
  mode.
- Use `yarn visual:webgl:smoke` and `yarn visual:webgl:smoke:headless` to probe
  raw browser WebGL support without loading the app.
- The built-in MCP browser used by some assistants is not repo-configurable and
  may still fail on WebGL pages even when the repo-controlled Playwright
  workflows work correctly.
