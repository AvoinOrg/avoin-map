# Verification Workflow

Use this reference after every meaningful UI edit pass.

## Baseline expectations

- Verify UI changes before finalizing.
- Check both desktop and mobile layouts.
- Prefer the in-container Playwright or browser workflow first.
- If that path is unavailable, fall back to the host shared-browser workflow instead of skipping verification.

## Primary visual commands

- Use `yarn visual:after-edit -- <path1> <path2> ...` for the normal post-edit workflow.
- Use `yarn visual:changed --files <comma-separated-paths>` when you specifically want changed-file targeting.
- Use `yarn visual:baseline` only when intentionally refreshing local baselines.

The visual runner targets `http://127.0.0.1:3000` first and may temporarily start a local dev server if none is reachable.

## Host-state visual workflow

Use the host-state path when the page depends on existing login state, imported plans, or other browser-origin state on `http://localhost:3000`.

1. Launch the dedicated host Chrome profile with remote debugging enabled.
2. Open `http://localhost:3000/...` in that browser and establish the needed state.
3. Run `yarn browser-state:sync:localhost` in the devcontainer.
4. Run a host-state visual command such as `yarn visual:after-edit:host-state -- <path1> <path2> ...`.

Target `localhost:3000` for host-state workflows because browser storage is origin-specific.

## Live browser workflows

Use a live browser when the task benefits from interactive review or when the user wants shared visibility during iteration.

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

## Completion bar

Do not treat a UI task as complete until:

- the changed surface has been checked visually
- both desktop and mobile have been covered
- any live-browser or auth-state dependency has been handled by the correct workflow
- any remaining verification gap has been stated explicitly
