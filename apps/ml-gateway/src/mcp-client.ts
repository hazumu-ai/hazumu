import { createMCPClient as createAiSdkMCPClient } from "@ai-sdk/mcp";

export interface MCPClientConfig {
  url: string;
  name?: string;
  version?: string;
}

/**
 * Create and connect to an MCP server via SSE transport
 * Uses @ai-sdk/mcp for automatic tool conversion
 */
export async function createMCPClient(config: MCPClientConfig) {
  const { url, name = "ml-gateway", version = "1.0.0" } = config;

  const client = await createAiSdkMCPClient({
    name,
    version,
    transport: {
      type: "sse",
      url,
    },
  });

  return client;
}
