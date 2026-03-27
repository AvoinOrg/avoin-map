# Figma UI Workflow

Use this reference when a UI task includes a Figma design, public Figma URL, or exact asset matching.

## Skill split

- Use `figma-mcp` for Figma-specific work:
  URL parsing, endpoint choice, credentials, reachability checks, node
  metadata, screenshots, design context, and exact asset lookup.
- Use `ui-live-iteration` for app-side implementation:
  adapting the design to this repo, editing components, and verifying desktop
  and mobile layouts.

## Tool choice

- Prefer the remote Figma MCP tools.
- Use the local or devcontainer Figma MCP only as a fallback if the remote
  tools are unavailable.
- For URL normalization and manual probes, follow the `figma-mcp` skill and its
  bundled helper script instead of duplicating that logic here.

## Exact asset workflow

Use this workflow when exact vectors or images matter:

1. Call `get_metadata` on the shared node to inspect child layers.
2. Find the actual image or vector child node instead of exporting the whole frame blindly.
3. Call `get_design_context` on that child node to get the exact asset URLs.
4. Download the returned asset and commit it into repo assets instead of recreating it by hand.
5. Use `get_screenshot` only as a visual reference or fallback.

## Design fidelity rules

- Prefer exact exported assets over approximations when the design depends on specific imagery or iconography.
- Preserve the established site design language unless the user asks for a broader visual change.
- If the design conflicts with the current implementation patterns, adapt carefully rather than pasting generated code verbatim.

## Project-specific note

- For the Energiakartta front-page sketch with file key `Vjf62EF7vUP3cbtSb0D09R`, ignore the bottom-right map scale widget `Group 9423` with node `2478:32264`. Do not implement that element.
