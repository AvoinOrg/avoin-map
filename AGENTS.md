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

## Shared agent assets

- Tracked, reusable agent assets live under `agents/`.
- Shared skills live under `agents/skills/`.
- The shared Codex config template lives at `agents/.codex/config.toml.template`.
- The repository-root `.codex/` folder is for local runtime state and remains gitignored.

## Temporary chat notes

- Temporary per-chat markdown notes live under `.tmp/` and remain gitignored.
- Use the `tmp-documenting` skill when the user asks for a running temp note or
  per-chat documentation.
- Keep one markdown file per chat under `.tmp/`.
- Write each user instruction into that file verbatim.
- If you ask the user a question, write the question and the answer verbatim
  too.
- If a later instruction clarifies or overwrites an earlier instruction, update
  the authoritative instruction text in the markdown so it reflects the current
  instruction set.
- After completing each prompt, append a brief summary of the changes made for
  that prompt.

## Skills

### Available tracked skills

- `tmp-documenting`: Maintain a per-chat markdown note under `.tmp/` with
  verbatim user instructions, question-and-answer logging, corrected current
  instructions, and a brief change summary after each prompt. (file:
  `agents/skills/tmp-documenting/SKILL.md`)
- `ui-live-iteration`: Implement and iterate on Avoin Map UI changes with
  visual verification. (file: `agents/skills/ui-live-iteration/SKILL.md`)

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
- For the Energiakartta front-page sketch (`fileKey: Vjf62EF7vUP3cbtSb0D09R`),
  ignore the bottom-right map scale widget (`Group 9423`, node `2478:32264`).
  Do not implement that element in app code.
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
- If a type is only used within one component/file, or is tightly coupled to it
  (for example `Props`), keep it in that file.
- If a type is used by multiple files and ownership is not clearly local to one
  component, move it into a relevant domain type file under `src/common/types`
  or an applet-specific `common/types`.
- If a constant is only used within one component/file, or is tightly coupled to
  it logically, keep it in that file.
- If a constant is used by multiple files and ownership is not clearly local to
  one component, move it into a relevant domain constants file under
  `src/common/constants` or an applet-specific `common/constants`.
- Shared map constants/types should generally live in the relevant map domain
  files such as `src/common/constants/map.ts` and `src/common/types/map.ts`.
- Use Conventional Commits for commit messages (`feat:`, `fix:`, `refactor:`,
  `docs:`, `chore:`, etc.).
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
- Add unique `aria-label` values to icon-only buttons and custom clickable UI
  elements (including menu triggers/items when needed) when a stable
  accessible name is not already present. This is required for reliable
  automated testing and accessibility tooling.

## Tests

- Jest is configured, but coverage is limited (routing has unit tests).
- Applet-specific e2e tests are not standardized yet.
- For UI changes, prefer the repo-controlled visual runner first. The default
  path is `yarn visual:after-edit -- <path1> <path2> ...`, which forwards to
  the targeted visual regression runner.
- Use `yarn visual:changed --files <comma-separated-paths>` when you explicitly
  want changed-file targeting.
- For every completed UI edit pass, verify the layout in both desktop and
  mobile viewports before finalizing.
- The visual runner defaults to `--browser-mode=auto`: non-WebGL routes stay in
  true headless Chromium, while map/WebGL routes switch to Xvfb-backed
  Chromium automatically.
- Only force `--browser-mode=headless` when you specifically need to reproduce
  a strict headless issue. Only force `--browser-mode=xvfb-webgl` when you want
  to probe the WebGL-capable path directly.
- Use `yarn visual:webgl:smoke` to confirm that the WebGL-capable browser path
  is healthy, and `yarn visual:webgl:smoke:headless` to check whether strict
  headless currently lacks WebGL support.
- Prioritize the in-container Playwright visual runner for normal UI
  verification, and use live/shared browser workflows only when the task needs
  interactive review, shared visibility, extension state, or existing auth/app
  state that the runner does not cover.
- If a UI pass is still visibly off after verification, continue iterating:
  edit, recheck in the in-container browser, and repeat until the result is
  acceptable rather than stopping after a single pass.
- If the in-container visual runner or browser workflow is unavailable, fall
  back to the host shared-browser workflow rather than skipping visual
  verification.
- Visual regression artifacts are stored under `.dev/visual-regression/` (gitignored).
- Visual commands target `http://127.0.0.1:3000` first (reuse an already running `yarn dev` server when available). If the server is unreachable, the runner may temporarily start a local dev server as a fallback.
- Use `yarn visual:baseline` to create or refresh local visual baselines intentionally.
- Add `--no-start` when calling `node utils/scripts/visual/run.js` directly if you want to fail instead of allowing the fallback temporary server.
- The built-in MCP browser used by assistants is not the source of truth for
  WebGL verification because its launcher/runtime is not repo-controlled. Use
  the repo visual runner or the documented live-browser workflows instead.
- For host-browser state reuse (auth/imported plans on `localhost:3000`), use the CDP snapshot sync:
  1. Launch a dedicated Chrome profile on Windows with remote debugging enabled.
  2. Open `http://localhost:3000` in that Chrome window and log in/import the plan.
  3. Run `yarn browser-state:sync:localhost` in the devcontainer.
  4. Run host-state visual commands (for example `yarn visual:after-edit:host-state -- <paths>`).
- Host-state scripts intentionally target `http://localhost:3000` (not `127.0.0.1`) because browser storage state is origin-specific.
- Exported browser state is sensitive (cookies + local app state). It is stored under `.dev/browser-state/` (gitignored). Use a dedicated Chrome debug profile, not your main daily profile.
- For ad-hoc interactive Playwright scripts, use `browser.newContext({ ignoreHTTPSErrors: true, storageState: '.dev/browser-state/localhost-3000.storage-state.json' })` and target `http://localhost:3000/...` routes (not `127.0.0.1`).
- Windows PowerShell example for starting Chrome with CDP (dedicated profile):
  ```powershell
  $chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
  $profile = "$env:LOCALAPPDATA\AvoinMap-Codex-Chrome"
  Start-Process -FilePath $chrome -ArgumentList @(
    '--remote-debugging-port=9222',
    '--remote-debugging-address=0.0.0.0',
    "--user-data-dir=$profile",
    'http://localhost:3000/fi/hiilikartta'
  )
  ```
- The PowerShell host Chrome command uses a fixed `--user-data-dir` path, so it is a persistent profile by design (extensions, cache, cookies, localStorage, IndexedDB, etc. survive restarts as long as you reuse the same path).
- Host-state visual scripts:
  - `yarn visual:baseline:host-state`
  - `yarn visual:changed:host-state --files <comma-separated-paths>`
  - `yarn visual:after-edit:host-state -- <path1> <path2> ...`
- Live shared browser control (real-time shared interaction, separate from storage-state sync):
  - `browser-state:sync:localhost` exports a storage snapshot for visual screenshots. It does **not** provide live shared control.
  - `browser:live:*` commands attach to a real shared browser session (host Chrome via CDP, or headed Chromium in the container).
  - Live control metadata (lock/session/log files) is stored under `.dev/live-browser/` (gitignored).
  - Container shared-browser profile persistence:
    - The container browser already persists state because it uses `--user-data-dir` under `/app` (a host bind mount).
    - The persistent host folder can be relocated with `.env` variable `LIVE_BROWSER_CONTAINER_DATA_HOST_DIR`.
    - When unset, Docker Compose defaults to project-local `./.dev/live-browser-persist` (gitignored).
    - The container path remains fixed at `/app/.dev/live-browser-persist`.
  - Container browser runtime for extensions:
    - `browser:live:container:start` prefers Google Chrome stable in the container (for easier extension install from the Chrome Web Store or manual extension workflows).
    - If Chrome stable is unavailable, it falls back to Playwright bundled Chromium and prints a warning.
    - Container start now enables WebGL via software rendering defaults (SwiftShader) to avoid Linux container GPU blocklist failures in map views.
    - You can pass extra launch flags with repeated `-- --browser-arg=<flag>` (for example `-- --browser-arg=--use-angle=gl`).
    - Window sizing controls: `-- --window-size=1600,960`, `-- --start-maximized`, or `-- --no-window-size`.
    - Manual extension install is acceptable and extension/profile data persists when using the same profile folder.
  - Optional `.env` example for relocating the container shared-browser persistent profile (WSL/Linux path format):
    - `LIVE_BROWSER_CONTAINER_DATA_HOST_DIR=/mnt/c/Users/<you>/AvoinMap/live-browser-data`
  - Turn-taking lock (recommended before interactive actions):
    - `yarn browser:live:lock:take:codex`
    - `yarn browser:live:lock:take:human`
    - `yarn browser:live:lock:status`
    - `yarn browser:live:lock:release` (defaults to `codex`; override with `-- --owner=human`)
    - Use `-- --mode=container-headed` when locking for the container-headed workflow.
  - Host Chrome shared-tab workflow (what you see is what Codex sees):
    1. Launch dedicated Windows Chrome with CDP enabled (PowerShell example above).
    2. Open `http://localhost:3000/...` in that Chrome window.
    3. (Optional but recommended) Take a lock: `yarn browser:live:lock:take:human`
    4. Verify attachability: `yarn browser:live:host:check`
    5. Attach from the devcontainer: `yarn browser:live:host:attach -- --page-match hiilikartta`
    6. If host attach is unavailable/fails, immediately switch to the container
       headed workflow below (`browser:live:container:start` + `attach`) to
       continue visual verification without blocking.
  - Container headed Chromium shared-window workflow (native host window via devcontainer GUI bridge):
    1. Start the shared browser: `yarn browser:live:container:start`
    2. (Optional) Take a lock with `-- --mode=container-headed`
    3. Attach from the devcontainer: `yarn browser:live:container:attach`
    4. Stop the session: `yarn browser:live:container:stop`
  - Quick verification options:
    - `--screenshot-out .dev/visual-regression/report/live-check.png`
    - `--assert-lock-owner codex` (or `human`) to enforce turn-taking
  - Recovery:
    - Host CDP unreachable: relaunch the dedicated host Chrome profile with `--remote-debugging-port=9222`.
    - Stale container session file: `yarn browser:live:container:stop -- --force-clean`
    - Stale lock: check `yarn browser:live:lock:status`, then release with `--force` if needed.
