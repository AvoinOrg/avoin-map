# Credentials And URL Workflow

Use this reference when you need exact commands for Figma MCP credentials,
connectivity checks, or URL normalization.

## Credential sources

- Global HTTP Figma MCP credentials live in `.codex/.credentials.json`.
- The global HTTP MCP endpoint is fixed at `https://mcp.figma.com/mcp`.
- The default Codex MCP server name is `figma`. When Codex exposes tool-style
  MCP aliases, use `mcp__figma__*` first.
- `figma_remote` is a legacy alias from earlier runs. Use it only to recover
  existing credentials or when the session exposes only `mcp__figma_remote__*`.
- There is no design-specific MCP URL. The shared Figma URL is converted into
  MCP tool arguments such as `fileKey` and `nodeId`.

## Codex MCP config

Use this Codex config shape for the default tool-style Figma MCP endpoint:

```toml
[mcp_servers.figma]
url = "https://mcp.figma.com/mcp"
```

That server name is what produces `mcp__figma__*` aliases when Codex makes the
MCP tools available to the agent. Do not configure a localhost or desktop Figma
MCP server unless a task explicitly asks for a local transport.

## Safe `jq` checks

List configured global Figma MCP entries without printing the token:

```bash
jq 'to_entries[]
  | select(.value.server_name == "figma" and .value.server_url == "https://mcp.figma.com/mcp")
  | {
      credential_key: .key,
      server_name: .value.server_name,
      server_url: .value.server_url,
      expires_at: .value.expires_at,
      has_access_token: (.value.access_token != null)
    }' .codex/.credentials.json
```

If only the legacy `figma_remote` credential exists, duplicate or re-login it as
`figma` before expecting `mcp__figma__*` tool aliases to authenticate.

Load the global access token into a shell variable without echoing it:

```bash
TOKEN=$(jq -r 'to_entries[]
  | select(.value.server_name == "figma" and .value.server_url == "https://mcp.figma.com/mcp")
  | .value.access_token' .codex/.credentials.json)
```

## Quick connectivity checks

Global HTTP MCP initialize example:

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
the fixed global HTTP MCP endpoint, and ready-to-use tool arguments.

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

- The global HTTP MCP endpoint responds as `text/event-stream`.
- When probing it manually, inspect the `data: ...` lines to read the JSON-RPC
  result.
- If the task is inside Codex and `mcp__figma__*` tools are available directly,
  prefer those tool-style aliases over manual `curl`.
- If the aliases are not exposed but credentials exist, manual JSON-RPC calls to
  the same global HTTP endpoint are the expected fallback.
