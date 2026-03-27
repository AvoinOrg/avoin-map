# Credentials And URL Workflow

Use this reference when you need exact commands for Figma MCP credentials,
connectivity checks, or URL normalization.

## Credential sources

- Remote Figma MCP credentials live in `.codex/.credentials.json`.
- The local fallback endpoint usually comes from `FIGMA_MCP_URL`.
- The remote MCP endpoint is fixed at `https://mcp.figma.com/mcp`.
- There is no design-specific MCP URL. The shared Figma URL is converted into
  MCP tool arguments such as `fileKey` and `nodeId`.

## Safe `jq` checks

List configured remote Figma MCP entries without printing the token:

```bash
jq 'to_entries[]
  | select(.value.server_name == "figma_remote")
  | {
      credential_key: .key,
      server_name: .value.server_name,
      server_url: .value.server_url,
      expires_at: .value.expires_at,
      has_access_token: (.value.access_token != null)
    }' .codex/.credentials.json
```

Read the local fallback endpoint:

```bash
printf '%s\n' "$FIGMA_MCP_URL"
```

Load the remote access token into a shell variable without echoing it:

```bash
TOKEN=$(jq -r 'to_entries[]
  | select(.value.server_name == "figma_remote")
  | .value.access_token' .codex/.credentials.json)
```

## Quick connectivity checks

Local fallback MCP:

```bash
curl -i "$FIGMA_MCP_URL"
```

If the response mentions `Invalid sessionId`, the local server is reachable.

Remote MCP initialize example:

```bash
curl -sS https://mcp.figma.com/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "codex-manual-probe",
        "version": "1.0.0"
      }
    }
  }'
```

## Turn a public Figma URL into MCP inputs

Example public URL:

```text
https://www.figma.com/design/shihE6C7JKJTwhfLlnkhIU/Hiilikartta-Webapp?node-id=3277-5180&m=dev
```

Normalized MCP values:

```text
endpoint: https://mcp.figma.com/mcp
fileKey: shihE6C7JKJTwhfLlnkhIU
nodeId: 3277:5180
```

Use the bundled helper for deterministic parsing:

```bash
node agents/skills/figma-mcp/scripts/figma-url-to-mcp-target.js \
  'https://www.figma.com/design/shihE6C7JKJTwhfLlnkhIU/Hiilikartta-Webapp?node-id=3277-5180&m=dev'
```

The script prints the normalized `fileKey`, raw `node-id`, MCP `nodeId`,
available endpoints, and ready-to-use tool arguments.

## Example MCP tool calls

Fetch metadata:

```bash
curl -sS https://mcp.figma.com/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_metadata",
      "arguments": {
        "fileKey": "shihE6C7JKJTwhfLlnkhIU",
        "nodeId": "3277:5180"
      }
    }
  }'
```

Fetch a screenshot:

```bash
curl -sS https://mcp.figma.com/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_screenshot",
      "arguments": {
        "fileKey": "shihE6C7JKJTwhfLlnkhIU",
        "nodeId": "3277:5180"
      }
    }
  }'
```

## Notes on response shape

- The remote MCP endpoint responds as `text/event-stream`.
- When probing it manually, inspect the `data: ...` lines to read the JSON-RPC
  result.
- If the task is inside Codex and MCP tools are available directly, prefer the
  tools over manual `curl`.
