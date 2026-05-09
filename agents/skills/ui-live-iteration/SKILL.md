---
name: ui-live-iteration
description: Implement and iterate on Avoin Map UI changes with visual verification. Use when requests involve page or component styling, layout tweaks, responsive fixes, Figma-to-UI implementation work, or live browser review and iteration on desktop and mobile. Pair with `figma-mcp` when the task needs Figma URL parsing, MCP access checks, metadata, screenshots, design context, or exact asset extraction.
---

# UI Live Iteration

## Overview

Use this skill to make Avoin Map UI changes, verify them visually, and iterate until the result is correct in both desktop and mobile layouts.

Keep this file focused on workflow. Read the referenced files only when their context is needed.
Use `figma-mcp` first or alongside this skill when the task includes Figma URL
normalization, MCP reachability, node metadata, screenshots, or exact asset
lookup.

## Use This Skill

Use this skill when the user asks for any of the following:

- Adjust spacing, sizing, typography, colors, or alignment in existing UI
- Refine a page or component until it matches a screenshot or Figma design
- Fix responsive layout issues
- Implement or polish MUI-based UI in this repo
- Verify UI changes visually, including live browser checks

## Workflow

### 1. Gather context

- Inspect the route, component, and nearby patterns before editing.
- Identify whether the work is shared UI or applet-specific UI.
- For narrow spacing/alignment changes, keep context gathering deliberately
  small: read the target component, its tests, one primary consumer, and the
  verification reference. Do not read old feature plans, unrelated layer files,
  visual-runner internals, or broad applet histories unless the first-pass
  evidence shows they are relevant.
- Read [references/project-ui-rules.md](references/project-ui-rules.md) for local conventions.
- Read [references/verification-workflow.md](references/verification-workflow.md) before final verification.
- If the task includes Figma, use `figma-mcp` for the Figma-side workflow and
  also read [references/figma-ui-workflow.md](references/figma-ui-workflow.md).
- If the user explicitly directs you to inspect, compare against, or use Figma
  and Figma access is unavailable, stop immediately and report the blockage
  instead of continuing from memory, old screenshots, or earlier notes unless
  the user explicitly approves that fallback.

### 2. Plan the smallest correct change

- Preserve the established visual language unless the user asks for a redesign.
- Reuse existing patterns and shared components where practical.
- Prefer a narrow edit set over broad refactors during UI iteration.

### 3. Implement the change

- Follow the local UI and component rules from the project reference.
- Keep styling colocated and prefer `sx` unless there is a strong reason not to.
- Add stable accessibility labels when icon-only or custom clickable UI would otherwise lack one.
- If the change depends on exact Figma assets, use the asset workflow instead of approximating them.

### 4. Verify visually

- Run targeted visual verification for the edited files with the repo visual
  runner first.
- Verify both desktop and mobile before considering the task complete.
- For layout-stability fixes, add a focused geometry spot check when visual
  diffs alone do not prove that elements stayed in the same position. Keep the
  check inline unless it repeats across multiple tasks; if it does repeat,
  promote the recipe or a small helper into the project skill/reference docs.
- Treat `yarn visual:after-edit -- --no-start <paths>` as the default
  verification path so the runner never starts or stops a dev server.
- Run repo visual commands inside the project `app` container whenever the
  caller is the host or the `codex-agent` container:
  `docker compose -f /workspace/project/docker-compose.dev.yml --project-directory /workspace/project exec app sh -lc 'cd /app && yarn visual:after-edit -- --no-start <paths>'`.
  Inside that container, `http://127.0.0.1:3000` is the correct app URL.
- If you need to inspect the app from the host or the `codex-agent` container,
  read `DEV_PORT` from `.env` and target `http://127.0.0.1:${DEV_PORT}` or
  `http://localhost:${DEV_PORT}`. Do not probe `127.0.0.1:3000` from outside
  the `app` container.
- If the expected dev server is unavailable in the correct namespace, stop the
  coding task, tell the user the main dev server is unavailable, and investigate
  what happened to the main dev-server process. Do not start `yarn dev`
  yourself.
- If the visual runner reports `missing-baseline` and the current screenshots
  are otherwise valid, generate local baselines from the existing dev server
  inside the `app` container with `yarn visual:baseline -- --no-start`, then
  rerun the changed visual check.
- Let the runner use its default `--browser-mode=auto` unless you are
  intentionally debugging strict headless behavior or forcing the Xvfb-backed
  WebGL path.
- Treat WebGL-compatible browser launch as the default for map routes in this
  repo. When you are not using the repo runner, prefer `xvfb-run -a` plus the
  Chromium WebGL/SwiftShader flags instead of plain headless defaults.
- Use the WebGL smoke commands when the task touches map pages and browser
  runtime health is in doubt.
- Fall back to the host shared-browser workflow instead of skipping visual
  checks.
- When the page needs browser-origin state to persist across restarts but does
  not specifically need the user's host Chrome session, use an in-container
  persistent Playwright/Chromium profile under `.dev/browser-state/` or another
  gitignored path inside the repo bind mount.
- Do not open the same persistent profile from multiple Playwright runs at the
  same time. Keep stateful verification serial when reusing one profile.
- If a Next.js route seems hung on first load, check whether App Router is
  still compiling that route before assuming the dev server crashed.
- After the final iteration pass, save representative picture snapshots of the
  implemented feature surfaces and any key adjacent states under `.tmp/` when
  the task is substantial or when the user asks for pics.
- Prefer a small, curated set of snapshots with descriptive filenames over a
  large undifferentiated dump.

### 5. Iterate

- Compare the result against the request, screenshots, or Figma.
- Make the next smallest correction.
- Re-run targeted verification after each meaningful UI pass, using the same
  browser mode unless the verification itself is what you are debugging.
- When checking that a removed style or selector is absent, make the shell
  command express "absence is success" so successful logs are not marked as
  failed. For example: `! rg -n "old-selector" path/to/file`.
- Stop only when the layout, styling, responsive behavior, and requested
  snapshot capture are complete.

## Decision Guide

- UI change without Figma: read the project UI rules and verification workflow.
- Figma-only inspection or MCP troubleshooting: use `figma-mcp`.
- Figma-driven UI implementation: use `figma-mcp` for design retrieval and this
  skill for the edit and verification loop.
- Figma-directed task but no Figma access: stop and surface the block; do not
  continue implementing or claiming design fidelity from stale context.
- Auth-dependent or imported-plan pages: prefer the host-state or shared-browser workflows from the verification reference.
- Imported-plan or other browser-storage-dependent checks that do not need the
  host browser can use an in-container persistent profile workflow instead of
  host-state sync.
- Map/WebGL pages: still use the repo visual runner in `auto` mode with
  `--no-start`; only
  switch to live/shared browser workflows when stateful interaction or
  collaborative review is the real need.
- Shared navigation or routing UI: inspect existing route helpers before changing links.

## Expected Output

- Implement the requested UI change.
- State how the change was verified.
- Mention which `.tmp/` snapshots were captured when picture snapshots were part
  of the task.
- Mention any verification gap if live or visual checks were blocked.

## References

- [references/project-ui-rules.md](references/project-ui-rules.md)
- [references/figma-ui-workflow.md](references/figma-ui-workflow.md)
- [references/verification-workflow.md](references/verification-workflow.md)

## Example Triggers

- "Tighten spacing in the main sidebar and verify on mobile."
- "Implement this Figma node in the front page and iterate until it matches."
- "Fix the collapsed sidebar layout and check it live in the browser."
- "Polish this dialog and run targeted visual regression after each edit."
