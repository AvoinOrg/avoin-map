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
- Use the `tmp-plan` skill when the user wants a chat-specific planning folder
  with a detailed `plan.md`, a chronological `history.md`, and planning-only
  investigation without implementation yet.
- The `tmp-documenting` workflow keeps one markdown file per chat under `.tmp/`.
- When using `tmp-plan`, keep one chat-specific folder under `.tmp/` with
  `plan.md` and `history.md`.
- Write each user instruction into the active temp note or planning history
  file verbatim.
- If you ask the user a question, write the question and the answer verbatim
  too.
- If a later instruction clarifies or overwrites an earlier instruction, update
  the authoritative instruction text in the active temp note or plan so it
  reflects the current instruction set.
- After completing each prompt, append a brief summary of the changes made for
  that prompt when the active temp workflow expects one.

## Skills

### Available tracked skills

- `tmp-documenting`: Maintain a per-chat markdown note under `.tmp/` with
  verbatim user instructions, question-and-answer logging, corrected current
  instructions, and a brief change summary after each prompt. (file:
  `agents/skills/tmp-documenting/SKILL.md`)
- `tmp-plan`: Maintain a per-chat planning workspace under `.tmp/` with a
  chat-specific folder, an authoritative `plan.md`, and a chronological
  `history.md`. Use it for implementation planning, plan revisions, and design
  investigation that must stay planning-only until the user asks to implement.
  It should inspect the real code paths and mechanisms involved, keep the plan
  scoped to only the necessary changes, and coordinate with `figma-mcp` and
  `tolgee-api-upsert` when relevant.
  (file: `agents/skills/tmp-plan/SKILL.md`)
- `figma-mcp`: Inspect Figma files and nodes through the global HTTP Figma MCP,
  normalize public Figma URLs into `fileKey` and `nodeId` inputs, and fetch
  metadata, screenshots, design context, or exact asset URLs. (file:
  `agents/skills/figma-mcp/SKILL.md`)
- `tolgee-api-upsert`: Add or update Tolgee translation keys via the Tolgee
  API, refresh local exports, and follow the repo’s `TText`/ICU authoring
  rules. (file: `agents/skills/tolgee-api-upsert/SKILL.md`)
- `component-refactor`: Use the component fixture harness for individual
  component refactors and migrations that need isolated before/after visual
  checks. (file: `agents/skills/component-refactor/SKILL.md`)

## Figma MCP (Global HTTP)

- Use the `figma-mcp` skill when the task is primarily about Figma connectivity,
  credential handling, URL normalization, metadata fetches, screenshots, design
  context, or exact asset extraction.
- Use only the raw global HTTP Figma MCP server named `figma`.
- Its tool-style aliases are `mcp__figma__*` and must point at:
  `https://mcp.figma.com/mcp`.
- If `mcp__figma__*` aliases are not exposed in the current Codex session, call
  the same global HTTP endpoint directly with JSON-RPC and the Figma MCP
  credential from `.codex/.credentials.json`; absence of aliases is not itself
  a Figma access block.
- The devcontainer image includes `jq`, which is useful for safe inspection of
  `.codex/.credentials.json` and quick MCP response parsing.
- When a user shares a public Figma URL, do not pass the full URL to MCP tools.
  Extract `node-id` from the URL and use that as MCP `nodeId`.
- Convert URL-style node IDs to MCP format when needed:
  `node-id=3163-8036` -> `nodeId: "3163:8036"`.
- Use `agents/skills/figma-mcp/scripts/figma-url-to-mcp-target.js` when you
  want a deterministic parse of a shared URL into `fileKey`, `nodeId`, and the
  fixed MCP endpoint details.
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
  surface errors such as `Functions are not valid as a React child`.
- Tolgee React rich-text tags are not self-closing. Use `<lb></lb>` or
  `<br></br>`, not `<lb />` or `<br />`.
- Handle counts with ICU plural blocks instead of JS-side singular/plural
  concatenation. Always include `other`, and add `=0`, `one`, `few`, `many`,
  or other categories as the locale requires. Example:
  `{count, plural, one {# kaava} other {# kaavaa}}`
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
- Choose verification appropriate to the task instead of assuming browser-based
  visual testing by default.
- Use `yarn visual:after-edit -- --no-start <path1> <path2> ...` or
  `yarn visual:changed -- --no-start --files <comma-separated-paths>` when
  visual regression coverage is explicitly needed.
- Use browser-based verification only when the user asks for it or the task
  clearly requires it.
- Visual regression artifacts are stored under `.dev/visual-regression/` (gitignored).
- Visual commands must target the stable, already-running dev server at
  `http://127.0.0.1:3000`. Always pass `--no-start`; agents must not start or
  stop `yarn dev`. If `:3000` is unreachable, stop the coding task, inform the
  user that the main dev server is unavailable, and investigate what happened
  to that main process.
- Do not perform a "full dev-runtime reset" on your own in this devcontainer.
  Do not mass-kill shared `next dev`/Node processes, and do not wipe generated
  runtime directories such as `.next`, `public/files`, or `public/lib` unless
  the user explicitly asks for that reset. In this environment those actions
  can break the shared dev runtime and even stop the devcontainer session you
  are working in. Prefer safer options first: reuse the existing server,
  inspect the main dev-server process and logs, or pause and ask the user
  before any broad reset.
- Use `yarn visual:baseline` to create or refresh local visual baselines intentionally.
- Add `--no-start` when calling `node utils/scripts/visual/run.js` directly.
