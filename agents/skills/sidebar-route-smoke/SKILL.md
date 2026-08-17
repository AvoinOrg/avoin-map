---
name: sidebar-route-smoke
description: Run reusable Avoin Map sidebar route smoke checks with Playwright. Use when a task changes SidebarRoot, SidebarBoundary, sidebar slots, floating/home/panel sidebars, map controls that depend on sidebar state, or route migrations that need live desktop/mobile sidebar verification.
---

# Sidebar Route Smoke

Use this skill instead of writing one-off inline Playwright/Xvfb scripts when a
feature touches the shared sidebar system or route-level sidebar behavior.

This is a runtime smoke check. It verifies that routes load, the expected
sidebar toggle is present or absent, key sidebar containers are mounted, and
obvious runtime errors did not appear. It does not replace pixel-level visual
comparison for Figma or spacing work.

## Default command

Run from the project `app` container whenever possible:

```bash
docker compose -f /workspace/project/docker-compose.dev.yml --project-directory /workspace/project exec app sh -lc \
  'cd /app && node agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js --route /en,/fi/carbon,/fi/energy,/fi/forests,/fi/luonnonmetsakartat --viewport both --expect-sidebar yes'
```

Inside the `app` container, the dev server URL is `http://127.0.0.1:6900`.
Do not target that URL from the `codex-agent` container; from outside the app
container, read `DEV_PORT` from `.env` and pass `--base-url`.

Use explicit canonical `--route` values. The helper's built-in scenarios still
contain pre-migration route and runtime assumptions and must be reconciled in a
separately scoped executable-tooling change before they are used again.

## Common uses

- Shared sidebar refactors:
  ```bash
  node agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js \
    --route /en,/fi/carbon,/fi/energy,/fi/forests,/fi/luonnonmetsakartat \
    --viewport both \
    --expect-sidebar yes
  ```
- A single route in both desktop and mobile:
  ```bash
  node agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js \
    --route /fi/energy \
    --viewport both \
    --expect-sidebar yes
  ```
- A fullscreen/no-sidebar route:
  ```bash
  node agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js \
    --route /fi/carbon/report \
    --expect-sidebar no
  ```
- A route expected to render specific test ids after an interaction prepared by
  the feature or test setup:
  ```bash
  node agents/skills/sidebar-route-smoke/scripts/sidebar-route-smoke.js \
    --route /fi/energy \
    --expect-testid building-info-desktop-sidebar
  ```

## Workflow

1. Run the default canonical route matrix after shared sidebar, route migration,
   or map-control changes.
2. Add focused `--route` checks for any route the feature specifically touched.
3. Use `--expect-sidebar no` for fullscreen routes that intentionally suppress
   sidebar chrome.
4. Include the command and high-level result in the coder or reviewer report.
5. If this smoke check passes but layout fidelity matters, still run the visual
   runner or live UI iteration workflow.

## Output

The helper prints JSON with one result per route and viewport. Treat any
non-zero exit code as a failed verification. Important fields:

- `ok`: whether this route/viewport passed its assertions.
- `sidebarToggle.visible`: whether `.sidebar-toggle-button` was visible.
- `sidebarContainer.visible`: whether a standard sidebar container/root was visible.
- `errors`: assertion failures or obvious route/runtime errors.
- `warnings`: console errors and non-blocking layout notes to inspect.
