---
name: ui-live-iteration
description: Implement and iterate on Avoin Map UI changes with visual verification. Use when requests involve page or component styling, layout tweaks, responsive fixes, Figma-based UI work, or live browser review and iteration on desktop and mobile.
---

# UI Live Iteration

## Overview

Use this skill to make Avoin Map UI changes, verify them visually, and iterate until the result is correct in both desktop and mobile layouts.

Keep this file focused on workflow. Read the referenced files only when their context is needed.

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
- Read [references/project-ui-rules.md](references/project-ui-rules.md) for local conventions.
- Read [references/verification-workflow.md](references/verification-workflow.md) before final verification.
- If the task includes Figma, also read [references/figma-ui-workflow.md](references/figma-ui-workflow.md).

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
- Treat `yarn visual:after-edit -- <paths>` as the default verification path.
- Let the runner use its default `--browser-mode=auto` unless you are
  intentionally debugging strict headless behavior or forcing the Xvfb-backed
  WebGL path.
- Use the WebGL smoke commands when the task touches map pages and browser
  runtime health is in doubt.
- Fall back to the host shared-browser workflow instead of skipping visual
  checks.

### 5. Iterate

- Compare the result against the request, screenshots, or Figma.
- Make the next smallest correction.
- Re-run targeted verification after each meaningful UI pass, using the same
  browser mode unless the verification itself is what you are debugging.
- Stop only when the layout, styling, and responsive behavior are correct.

## Decision Guide

- UI change without Figma: read the project UI rules and verification workflow.
- Figma-driven work: read all three references.
- Auth-dependent or imported-plan pages: prefer the host-state or shared-browser workflows from the verification reference.
- Map/WebGL pages: still start with the repo visual runner in `auto` mode; only
  switch to live/shared browser workflows when stateful interaction or
  collaborative review is the real need.
- Shared navigation or routing UI: inspect existing route helpers before changing links.

## Expected Output

- Implement the requested UI change.
- State how the change was verified.
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
