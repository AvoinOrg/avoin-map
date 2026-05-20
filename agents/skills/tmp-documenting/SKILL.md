---
name: tmp-documenting
description: Maintain a per-chat markdown note in .tmp. Use when the user asks for temporary chat documentation, wants prompts or question-and-answer exchanges recorded verbatim, or wants a running summary of changes after each prompt.
---

# Tmp Documenting

## Overview

Use this skill when the user wants a temporary markdown document that tracks the
current chat inside `.tmp/`.

Keep the skill focused on the workflow. The tracked skill lives under
`agents/skills/`, but the chat note itself belongs in the gitignored `.tmp/`
folder.

## Workflow

### 1. Start or reuse the chat note

- Create one markdown file for the current chat inside `.tmp/`.
- Reuse the same file for the rest of that chat.
- Prefer a timestamped filename so concurrent chats do not collide.

### 2. Record user instructions verbatim

- After each user prompt, append the user's instruction text verbatim.
- Keep a `Current instructions` section that reflects the latest authoritative
  instruction set for the chat.
- If a later prompt clarifies or overwrites an earlier instruction, update the
  `Current instructions` section so superseded guidance is corrected there while
  preserving the raw prompt log.

### 3. Record questions and answers

- If you ask the user a question, append the question verbatim.
- When the user answers, append the answer verbatim.
- Keep question and answer pairs easy to scan.

### 4. Summarize each completed prompt

- After finishing the work for each prompt, append a short summary of the
  changes made because of that prompt.
- Keep the summary brief and factual.

## Suggested note structure

- Chat metadata
- Current instructions
- Prompt log
- Questions and answers
- Per-prompt change summaries

## Output expectations

- Maintain the `.tmp/` note as part of the task, not as a separate optional
  step.
- Update the note during the chat whenever the user adds, corrects, or answers
  something relevant to the running instructions.
