import { describe, expect, it, vi } from "vitest";
import type { MCPClientConfig } from "./mcp-client.js";

// Mock the @ai-sdk/mcp module
vi.mock("@ai-sdk/mcp", () => ({
  createMCPClient: vi.fn(),
}));

describe("createMCPClient", () => {
  it("creates an MCP client with default name and version", async () => {
    const { createMCPClient: createAiSdkMCPClient } = await import(
      "@ai-sdk/mcp"
    );
    const { createMCPClient } = await import("./mcp-client.js");

    const mockClient = { tools: vi.fn() };
    // biome-ignore lint/suspicious/noExplicitAny: Mock type needs any for flexibility in tests
    vi.mocked(createAiSdkMCPClient).mockResolvedValue(mockClient as any);

    const config: MCPClientConfig = {
      url: "http://localhost:8000/mcp",
    };

    const client = await createMCPClient(config);

    expect(createAiSdkMCPClient).toHaveBeenCalledWith({
      name: "ml-gateway",
      version: "1.0.0",
      transport: {
        type: "sse",
        url: "http://localhost:8000/mcp",
      },
    });
    expect(client).toBe(mockClient);
  });

  it("creates an MCP client with custom name and version", async () => {
    const { createMCPClient: createAiSdkMCPClient } = await import(
      "@ai-sdk/mcp"
    );
    const { createMCPClient } = await import("./mcp-client.js");

    const mockClient = { tools: vi.fn() };
    // biome-ignore lint/suspicious/noExplicitAny: Mock type needs any for flexibility in tests
    vi.mocked(createAiSdkMCPClient).mockResolvedValue(mockClient as any);

    const config: MCPClientConfig = {
      url: "http://localhost:8000/mcp",
      name: "custom-gateway",
      version: "2.0.0",
    };

    const client = await createMCPClient(config);

    expect(createAiSdkMCPClient).toHaveBeenCalledWith({
      name: "custom-gateway",
      version: "2.0.0",
      transport: {
        type: "sse",
        url: "http://localhost:8000/mcp",
      },
    });
    expect(client).toBe(mockClient);
  });

  it("propagates errors from the underlying client creation", async () => {
    const { createMCPClient: createAiSdkMCPClient } = await import(
      "@ai-sdk/mcp"
    );
    const { createMCPClient } = await import("./mcp-client.js");

    const error = new Error("Connection failed");
    vi.mocked(createAiSdkMCPClient).mockRejectedValue(error);

    const config: MCPClientConfig = {
      url: "http://localhost:8000/mcp",
    };

    await expect(createMCPClient(config)).rejects.toThrow("Connection failed");
  });
});
