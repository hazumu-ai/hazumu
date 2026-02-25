import type { MCPClient } from "@ai-sdk/mcp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@hono/node-server", () => ({
  serve: vi.fn(),
}));

vi.mock("./mcp-client.js", () => ({
  createMCPClient: vi.fn(),
}));

vi.mock("./routes/chat.js", () => ({
  registerChatRoute: vi.fn(),
}));

describe("createApp", () => {
  let originalEnv: NodeJS.ProcessEnv;
  // biome-ignore lint/suspicious/noExplicitAny: Spy type is complex and not worth typing in tests
  let consoleLogSpy: any;
  // biome-ignore lint/suspicious/noExplicitAny: Spy type is complex and not worth typing in tests
  let consoleErrorSpy: any;

  beforeEach(() => {
    originalEnv = { ...process.env };
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("creates app without MCP client when MCP_SERVER_URL is not set", async () => {
    delete process.env.MCP_SERVER_URL;

    const { createMCPClient } = await import("./mcp-client.js");
    const { registerChatRoute } = await import("./routes/chat.js");

    // Import createApp after mocks are set up
    const { createApp } = await import("./index.js");

    const app = await createApp();

    expect(app).toBeDefined();
    expect(createMCPClient).not.toHaveBeenCalled();
    expect(registerChatRoute).toHaveBeenCalledWith(expect.anything(), {
      mcpClient: null,
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "MCP_SERVER_URL not configured, skipping MCP integration",
    );
  });

  it("creates app with MCP client when MCP_SERVER_URL is set", async () => {
    process.env.MCP_SERVER_URL = "http://localhost:8000/mcp";

    const mockMCPClient = { tools: vi.fn() } as unknown as MCPClient;

    const { createMCPClient } = await import("./mcp-client.js");
    const { registerChatRoute } = await import("./routes/chat.js");

    vi.mocked(createMCPClient).mockResolvedValue(mockMCPClient);

    // Import createApp after mocks are set up
    const { createApp } = await import("./index.js");

    const app = await createApp();

    expect(app).toBeDefined();
    expect(createMCPClient).toHaveBeenCalledWith({
      url: "http://localhost:8000/mcp",
    });
    expect(registerChatRoute).toHaveBeenCalledWith(expect.anything(), {
      mcpClient: mockMCPClient,
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Connecting to MCP server at http://localhost:8000/mcp",
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "MCP client connected successfully",
    );
  });

  it("continues without MCP client when connection fails", async () => {
    process.env.MCP_SERVER_URL = "http://localhost:8000/mcp";

    const connectionError = new Error("Connection refused");

    const { createMCPClient } = await import("./mcp-client.js");
    const { registerChatRoute } = await import("./routes/chat.js");

    vi.mocked(createMCPClient).mockRejectedValue(connectionError);

    // Import createApp after mocks are set up
    const { createApp } = await import("./index.js");

    const app = await createApp();

    expect(app).toBeDefined();
    expect(createMCPClient).toHaveBeenCalledWith({
      url: "http://localhost:8000/mcp",
    });
    expect(registerChatRoute).toHaveBeenCalledWith(expect.anything(), {
      mcpClient: null,
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Connecting to MCP server at http://localhost:8000/mcp",
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to connect to MCP server:",
      connectionError,
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Continuing without MCP support",
    );
  });

  it("creates OpenAPI documentation", async () => {
    delete process.env.MCP_SERVER_URL;

    // Import createApp after mocks are set up
    const { createApp } = await import("./index.js");

    const app = await createApp();

    // Test that the app has the doc endpoint
    const docRes = await app.request("http://localhost/doc");
    expect(docRes.status).toBe(200);

    const doc = await docRes.json();
    expect(doc).toHaveProperty("openapi", "3.1.0");
    expect(doc).toHaveProperty("info");
    expect(doc.info).toHaveProperty("title", "ML Gateway API");
    expect(doc.info).toHaveProperty("version", "1.0.0");
  });

  it("responds to root endpoint", async () => {
    delete process.env.MCP_SERVER_URL;

    // Import createApp after mocks are set up
    const { createApp } = await import("./index.js");

    const app = await createApp();

    const res = await app.request("http://localhost/");
    expect(res.status).toBe(200);

    const text = await res.text();
    expect(text).toBe("Hello Hono!");
  });
});
