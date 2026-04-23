---
name: figma-mcp
description: Inspect Figma files and nodes through remote Figma MCP. Use when the user shares a Figma URL, asks whether Figma MCP is reachable, wants node metadata, screenshots, design context, or exact asset URLs, or needs help converting a public Figma URL into MCP fileKey and nodeId inputs.
---

# Figma MCP

## Overview

Use this skill for Figma access checks, node inspection, and asset retrieval.

Keep this skill focused on the MCP workflow. If the task turns into app UI
implementation, continue with `ui-iteration`.

## Use This Skill

Use this skill when the user asks for any of the following:

- Check whether remote Figma MCP is reachable
- Inspect a public Figma design URL or pasted node link
- Extract `fileKey` and `nodeId` from a shared Figma URL
- Fetch node metadata, screenshots, or design context
- Find exact child image or vector assets for implementation

## Workflow

### 1. Use the remote MCP endpoint

- Use the remote Figma MCP server at `https://mcp.figma.com/mcp`.
- If the user explicitly needs Figma inspection or comparison and the remote
  Figma MCP path is unavailable, stop immediately and report that the task is
  blocked on Figma access. Do not quietly continue from stale notes or earlier
  screenshots unless the user explicitly approves that fallback.

### 2. Normalize the shared URL

- Do not pass the full public Figma URL directly when the MCP tool accepts
  separate `fileKey` and `nodeId` arguments.
- Extract the `fileKey` from the URL path.
- If the URL is a branch URL of the form
  `/design/<fileKey>/branch/<branchKey>/...`, use the branch key as the MCP
  `fileKey`.
- Extract `node-id` from the query string and convert `3277-5180` into
  `3277:5180`.
- Use [scripts/figma-url-to-mcp-target.js](scripts/figma-url-to-mcp-target.js)
  when you want deterministic parsing and a ready-to-use MCP target summary.

### 3. Handle credentials safely

- Remote Figma MCP credentials live in `.codex/.credentials.json`.
- Treat that file as sensitive. Read only the fields you need, and do not print
  access tokens in user-facing output.
- Use `jq` or a short Node script to inspect non-secret fields such as
  `server_name`, `server_url`, and `expires_at`.

### 4. Pick the right MCP tool

- `whoami` or `tools/list`: quick reachability checks for the remote server
- `get_metadata`: inspect the shared node tree and child IDs
- `get_design_context`: fetch code-oriented context, screenshot, and asset URLs
- `get_screenshot`: capture a visual reference of the selected node
- `get_variable_defs`: inspect variables when the design depends on them

### 5. Fetch exact assets when fidelity matters

- Start with `get_metadata` on the shared frame or component.
- Identify the exact child image or vector node instead of exporting the whole
  frame blindly.
- Call `get_design_context` on that child node to retrieve the asset URLs.
- Download the returned asset into repo assets rather than recreating it by
  hand.
- Use screenshots as reference or fallback, not as substitutes for exact
  exported assets.

## Output Expectations

- Report the normalized `fileKey` and `nodeId`.
- State that you used the remote MCP server.
- Call out any access limitation clearly, such as a refused local port, missing
  credentials, or an invalid node ID.
- If Figma access was required but unavailable, say that you stopped because of
  the Figma access block.
- If the task becomes UI implementation work, switch to `ui-iteration` for
  the edit and verification loop.

## References

- [references/credentials-and-url-workflow.md](references/credentials-and-url-workflow.md)
- [scripts/figma-url-to-mcp-target.js](scripts/figma-url-to-mcp-target.js)
