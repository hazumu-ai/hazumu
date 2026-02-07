import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export interface MCPClientConfig {
  url: string;
  name?: string;
  version?: string;
}

/**
 * Create and connect to an MCP server via SSE transport
 */
export async function createMCPClient(
  config: MCPClientConfig,
): Promise<Client> {
  const { url, name = "ml-gateway", version = "1.0.0" } = config;

  const transport = new SSEClientTransport(new URL(url));
  const client = new Client({ name, version }, { capabilities: {} });

  await client.connect(transport);

  return client;
}

/**
 * List all available tools from the MCP server
 */
export async function listMCPTools(client: Client) {
  const response = await client.listTools();
  return response.tools;
}
