# Verification Workflow

Use this reference after every meaningful UI edit pass.

## Baseline expectations

- Verify UI changes before finalizing.
- Check both desktop and mobile layouts.
- Prefer the in-container repo-controlled visual runner first.
- Let the runner keep its default `--browser-mode=auto` unless you are
  debugging the browser runtime itself.
- If that path is unavailable, fall back to the host shared-browser workflow
  instead of skipping verification.
- When the task is a substantial UI feature or the user asks for pics, capture
  a small representative set of picture snapshots under `.tmp/` after the final
  iteration pass.

## Primary visual commands

- Use `yarn visual:after-edit -- <path1> <path2> ...` for the normal post-edit workflow.
- Use `yarn visual:changed --files <comma-separated-paths>` when you specifically want changed-file targeting.
- Use `yarn visual:baseline` only when intentionally refreshing local baselines.
- Use `yarn visual:webgl:smoke` to probe the Xvfb-backed WebGL path directly.
- Use `yarn visual:webgl:smoke:headless` to check whether strict headless
  currently lacks WebGL support or to confirm that headless support is present.

The visual runner targets `http://127.0.0.1:3000` first and may temporarily start a local dev server if none is reachable.

Runtime safety:

- Do not mass-kill shared `next dev` or Node processes as a first response to a
  flaky dev server.
- Do not delete `.next`, `public/files`, or `public/lib` unless the user has
  explicitly approved a full runtime reset for this environment.
- Prefer safer recovery steps first: verify which server you are actually
  talking to, start a separate dev server on another port, or clean up only the
  specific process you launched yourself.

Browser mode guidance:

- `auto` is the default and should stay the default for normal UI work.
- `auto` keeps non-WebGL pages in true headless Chromium and switches WebGL
  pages to Xvfb-backed Chromium automatically.
- Use `--browser-mode=headless` only when reproducing strict headless issues.
- Use `--browser-mode=xvfb-webgl` only when you need to force the WebGL-capable
  path explicitly.
- Do not rely on the built-in MCP browser for authoritative WebGL verification;
  its launcher/runtime is not repo-controlled.

## Snapshot capture

Use `.tmp/` for the user-facing picture snapshots that document what was
actually implemented.

- Prefer descriptive filenames that encode the feature and state, for example
  `feature-root-desktop.png` or `feature-import-uploaded-mobile.png`.
- Capture both desktop and mobile for the main changed surface.
- Add extra snapshots only for meaningfully different states, such as an empty
  page vs a populated page, or an import step before vs after file selection.
- Keep the set curated. The goal is a readable artifact trail, not exhaustive
  frame dumping.

## Host-state visual workflow

Use the host-state path when the page depends on existing login state, imported plans, or other browser-origin state on `http://localhost:3000`.

1. Launch the dedicated host Chrome profile with remote debugging enabled.
2. Open `http://localhost:3000/...` in that browser and establish the needed state.
3. Run `yarn browser-state:sync:localhost` in the devcontainer.
4. Run a host-state visual command such as `yarn visual:after-edit:host-state -- <path1> <path2> ...`.

Target `localhost:3000` for host-state workflows because browser storage is origin-specific.

## In-container persistent profile workflow

Use this when you need browser storage such as IndexedDB or `localStorage` to
survive browser restarts, but you do not need the user's existing host Chrome
session specifically.

1. Launch Playwright/Chromium with a persistent profile directory under a
   gitignored repo path such as `.dev/browser-state/<name>/`.
2. Reuse that same directory for follow-up verification runs so the same origin
   state is loaded again.
3. Keep access to that profile serial. Do not attach multiple Playwright runs
   to the same persistent profile at once.
4. Use this path for flows such as "import once, restart browser, verify the
   imported plan still exists".

This is a good middle ground when host-state sync would be heavier than needed.

## Live browser workflows

Use a live browser when the task benefits from interactive review, when the
user wants shared visibility during iteration, or when the page depends on
state that the repo visual runner does not provide conveniently.

### Host Chrome shared-tab workflow

Use this when the user already has the page open in the dedicated host Chrome session or when shared state already exists there.

1. Verify attachability with `yarn browser:live:host:check`.
2. Attach with `yarn browser:live:host:attach -- --page-match <pattern>`.
3. Use lock commands if needed to coordinate interactive control.

### Container headed workflow

Use this when host attach is unavailable or when a container-managed browser window is sufficient.

1. Start the shared browser with `yarn browser:live:container:start`.
2. Attach with `yarn browser:live:container:attach`.
3. Stop it with `yarn browser:live:container:stop`.

## Locking and recovery

- Use `yarn browser:live:lock:take:codex`, `:human`, `:status`, and `:release` to coordinate turn-taking when interactive control matters.
- If host CDP is unreachable, relaunch the dedicated host Chrome profile with remote debugging enabled.
- If the container session is stale, use `yarn browser:live:container:stop -- --force-clean`.
- If a stale lock blocks progress, inspect status and release it with force if appropriate.
- If a route appears blank or stalled on its first hit, check the dev-server
  logs before assuming a crash. App Router can spend a long time compiling a
  not-yet-built route.
- If parallel screenshot or browser runs start causing intermittent 500s or
  asset-copy errors, reduce the verification to serial route checks against one
  stable dev server before debugging the UI itself.

## Completion bar

Do not treat a UI task as complete until:

- the changed surface has been checked visually
- both desktop and mobile have been covered
- any live-browser or auth-state dependency has been handled by the correct workflow
- any remaining verification gap has been stated explicitly
