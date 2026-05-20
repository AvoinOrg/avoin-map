#!/usr/bin/env node

const usage = [
  "Usage:",
  "  node agents/skills/figma-mcp/scripts/figma-url-to-mcp-target.js '<figma-url>'",
].join("\n");

const normalizeNodeId = (rawNodeId) => {
  if (!rawNodeId) {
    return null;
  }

  const decodedNodeId = decodeURIComponent(rawNodeId).trim();
  const match = decodedNodeId.match(/^(-?\d+)[:-](-?\d+)$/);

  if (!match) {
    throw new Error(`Unsupported node-id format: ${rawNodeId}`);
  }

  return `${match[1]}:${match[2]}`;
};

const parseFigmaUrl = (input) => {
  const url = new URL(input);
  const hostname = url.hostname.replace(/^www\./, "");

  if (hostname !== "figma.com") {
    throw new Error(`Unsupported Figma host: ${url.hostname}`);
  }

  const pathParts = url.pathname.split("/").filter(Boolean);
  const route = pathParts[0];

  if (!route) {
    throw new Error(`Unsupported Figma path: ${url.pathname}`);
  }

  let fileKey = null;

  if (route === "design" && pathParts[2] === "branch" && pathParts[3]) {
    fileKey = pathParts[3];
  } else if (["design", "file", "proto", "slides", "board", "make"].includes(route)) {
    fileKey = pathParts[1] ?? null;
  }

  if (!fileKey) {
    throw new Error(`Could not extract file key from URL: ${input}`);
  }

  const rawNodeId = url.searchParams.get("node-id");
  const nodeId = normalizeNodeId(rawNodeId);
  const remoteMcpUrl = "https://mcp.figma.com/mcp";
  const toolArguments = nodeId ? { fileKey, nodeId } : { fileKey };

  return {
    sourceUrl: input,
    route,
    fileKey,
    rawNodeId,
    nodeId,
    endpoint: remoteMcpUrl,
    toolArguments,
    tools: nodeId
      ? {
          get_metadata: toolArguments,
          get_design_context: toolArguments,
          get_screenshot: toolArguments,
        }
      : {},
    note: "Figma MCP uses a fixed endpoint. Convert the public URL into tool arguments rather than a design-specific MCP URL.",
  };
};

const input = process.argv[2];

if (!input) {
  console.error(usage);
  process.exit(1);
}

try {
  const normalized = parseFigmaUrl(input);
  console.log(JSON.stringify(normalized, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
