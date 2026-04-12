---
name: tmp-plan
description: Maintain a per-chat temporary planning workspace under `.tmp/` for plan-only work. Use when the user wants a super in-depth implementation plan, wants a plan revised across the chat, wants user prompts preserved in chronological order, or wants Figma/UI investigation captured in a plan without implementing code yet. The plan must be grounded in the relevant real code paths and stay scoped to only the necessary changes.
---

# Tmp Plan

## Overview

Use this skill when the user wants planning work captured under `.tmp/` and
explicitly does not want implementation yet.

This skill creates and maintains one chat-specific folder containing:

- `plan.md`: the current authoritative implementation plan
- `history.md`: the chronological prompt log for that chat

Keep this skill focused on planning. Do not edit application code, assets,
translations, or tests while this skill is the active workflow unless the user
explicitly tells you to stop planning and start implementing.

The plan should be based on the actual mechanisms in the codebase, not on
surface-level assumptions from filenames, screenshots, or prior memory.

## Use This Skill

Use this skill when the user asks for any of the following:

- A super in-depth implementation plan before coding
- A `.tmp/` chat plan folder with separate plan and history files
- Revisions, clarifications, or extensions to an existing per-chat plan
- Plan-only Figma or UI investigation with no implementation yet
- A running history of user prompts tied to the planning work
- A bug-resistant, minimal-change implementation plan grounded in real code

## Workflow

### 1. Start or reuse the chat workspace

- On first use in the chat, derive a concise slug from the user’s requested
  fixes or features.
- Run
  `node agents/skills/tmp-plan/scripts/init_tmp_plan_chat.mjs --title "<slug words>"`.
- This creates `.tmp/chat-<timestamp>-<randomid>-<slug>/`.
- Reuse the same folder for the rest of the planning thread.
- If the user explicitly says to keep `tmp-plan` active for the current chat,
  continue updating that same folder until the user says to stop.

### 2. Maintain `history.md`

- Append every user prompt verbatim in chronological order.
- If you ask the user a question, append the question and the answer verbatim
  too.
- Preserve the raw history even when later prompts overwrite or refine earlier
  instructions.

### 3. Maintain `plan.md`

- Keep one authoritative plan for the current task.
- Update the plan after each relevant prompt so the current document reflects
  the latest authoritative instructions.
- Preserve superseded details in `history.md`, not in the main plan body.
- Keep the plan detailed enough that a later implementation pass can follow it
  directly.

### 4. Gather planning context

- Inspect the relevant code paths, route structure, state flow, and existing UI
  behavior locally before writing the plan.
- Trace the mechanisms that actually drive the requested behavior, such as
  routing, server/client boundaries, fetched data, mutations, Zustand or React
  state, derived UI gating, auth conditions, translation resolution, and any
  persistence layer involved.
- Read enough of the surrounding code to understand ownership, dependencies,
  and adjacent behaviors that could regress from the planned change.
- Identify the smallest plausible edit surface before writing the plan. Note
  what should stay untouched unless later evidence shows it must change.
- If the user provided a Figma URL or design fidelity matters, use `figma-mcp`
  to normalize the Figma target and fetch the needed metadata, screenshots, or
  design context.
- If the task is UI-facing, also use `ui-live-iteration` so the plan includes
  the future edit and verification loop for desktop and mobile, but stop before
  any implementation.
- If the plan likely requires new or changed translation keys, consult
  `tolgee-api-upsert` specifically to map namespace, locale, and copy
  implications, but do not write to Tolgee during the planning phase.

### 5. Write a plan that is implementation-ready

- Include concrete route, component, store, API, and translation touchpoints
  when you can identify them.
- Include a mechanism-level summary of how the current behavior works today,
  not just where the visible UI lives.
- Describe the intended behavior changes and state gating in terms of user
  flows and edge cases.
- Call out any Figma node targets, design dependencies, or missing inputs.
- Distinguish required edits from optional follow-up cleanup. Default to the
  smallest correct change set that satisfies the request.
- Call out regression-sensitive areas and why they are sensitive.
- Name the files, modules, or behaviors that should remain unchanged so the
  eventual implementation stays tightly scoped.
- Include the future verification strategy, especially the targeted visual
  checks the implementation pass should run.
- Separate confirmed work from open questions, assumptions, and risks.

### 6. Enforce plan-only guardrails

- Do not implement the plan while this skill is active.
- Do not claim that something was implemented, verified, or visually matched if
  you only planned it.
- Limit file writes to the chat’s `.tmp/` workspace unless the user explicitly
  asks you to create or update the skill itself.

## Suggested `plan.md` Structure

- Task summary
- Current authoritative instructions
- Relevant inputs
- Existing implementation snapshot
- Target behavior and UX states
- File and code-path impact
- Existing mechanism audit
- Step-by-step implementation plan
- Explicit in-scope and out-of-scope changes
- Translation and copy considerations
- Verification plan
- Risks, assumptions, and open questions
- Status note stating that no implementation has been started

## Suggested `history.md` Structure

- Chat metadata
- User prompt log in chronological order
- Question and answer log when applicable
- Optional per-prompt planning summary

## Output Expectations

- State the `.tmp/` folder path the first time it is created.
- Mention the `plan.md` and `history.md` paths when relevant.
- Make it explicit that the work remains planning-only.
- Make it explicit when the plan relied on `figma-mcp`, `ui-live-iteration`,
  and `tolgee-api-upsert`.
- Make it explicit which mechanisms were inspected so the user can see the plan
  is grounded in the real implementation.
- Make it explicit which changes are intentionally out of scope so the future
  implementation only touches what is needed.
- If Figma inspection was required but blocked, say the planning work is blocked
  on Figma access rather than pretending the design was reviewed.

## References

- Initializer script:
  [scripts/init_tmp_plan_chat.mjs](scripts/init_tmp_plan_chat.mjs)
- Figma-side inspection workflow:
  `agents/skills/figma-mcp/SKILL.md`
- UI implementation and verification workflow to mirror in the plan:
  `agents/skills/ui-live-iteration/SKILL.md`
- Translation planning workflow when copy or keys are affected, using
  `tolgee-api-upsert` specifically:
  `agents/skills/tolgee-api-upsert/SKILL.md`
