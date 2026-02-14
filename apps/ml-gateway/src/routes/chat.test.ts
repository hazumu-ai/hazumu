import { OpenAPIHono } from "@hono/zod-openapi";
import { MockLanguageModelV2 } from "ai/test";
import { describe, expect, it, vi } from "vitest";
import { registerChatRoute } from "./chat.js";

const createTestModel = (text: string) =>
  new MockLanguageModelV2({
    doGenerate: {
      content: [{ type: "text", text }],
      finishReason: "stop",
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      warnings: [],
    },
  });

describe("POST /api/chat", () => {
  it("returns generated text using mocked model", async () => {
    const mockModel = createTestModel("mocked response");
    const app = new OpenAPIHono();

    registerChatRoute(app, {
      modelProvider: () => mockModel,
      fallbackModel: "mock-model",
    });

    const res = await app.request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ text: "mocked response" });
    expect(mockModel.doGenerateCalls.length).toBe(1);
  });

  it("returns validation error on invalid payload", async () => {
    const app = new OpenAPIHono();

    registerChatRoute(app, {
      modelProvider: () => createTestModel("unused"),
      fallbackModel: "mock-model",
    });

    const res = await app.request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "" }),
    });

    expect(res.status).toBe(400);
    // OpenAPI validation fails before hitting handler
  });

  it("returns 500 when provider throws", async () => {
    const app = new OpenAPIHono();

    registerChatRoute(app, {
      // Force an error after model selection
      generateTextFn: async () => {
        throw new Error("boom");
      },
      modelProvider: () => createTestModel("unused"),
      fallbackModel: "mock-model",
    });

    const res = await app.request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("internal_error");
  });

  it("loads and uses MCP tools when mcpClient is provided", async () => {
    const mockModel = createTestModel("tool response");
    const app = new OpenAPIHono();

    const mockTools = {
      blink: {
        description: "Blink LED",
        parameters: {},
        execute: vi.fn(),
      },
    };

    const mockMCPClient = {
      tools: vi.fn().mockResolvedValue(mockTools),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Capturing args for assertions in test
    let capturedGenerateTextArgs: any;
    const mockGenerateText = vi.fn(async (args) => {
      capturedGenerateTextArgs = args;
      return { text: "tool response" };
    });

    registerChatRoute(app, {
      generateTextFn: mockGenerateText,
      modelProvider: () => mockModel,
      fallbackModel: "mock-model",
      // biome-ignore lint/suspicious/noExplicitAny: Mock client type in test
      mcpClient: mockMCPClient as any,
    });

    const res = await app.request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "blink the LED" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ text: "tool response" });

    // Verify that tools were loaded from MCP client
    expect(mockMCPClient.tools).toHaveBeenCalled();

    // Verify that tools were passed to generateText
    expect(capturedGenerateTextArgs).toBeDefined();
    expect(capturedGenerateTextArgs.tools).toBe(mockTools);
  });

  it("continues without MCP tools if client.tools() fails", async () => {
    const mockModel = createTestModel("response without tools");
    const app = new OpenAPIHono();

    const mockMCPClient = {
      tools: vi.fn().mockRejectedValue(new Error("MCP server unavailable")),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Capturing args for assertions in test
    let capturedGenerateTextArgs: any;
    const mockGenerateText = vi.fn(async (args) => {
      capturedGenerateTextArgs = args;
      return { text: "response without tools" };
    });

    // Spy on console.warn to verify error handling
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    registerChatRoute(app, {
      generateTextFn: mockGenerateText,
      modelProvider: () => mockModel,
      fallbackModel: "mock-model",
      // biome-ignore lint/suspicious/noExplicitAny: Mock client type in test
      mcpClient: mockMCPClient as any,
    });

    const res = await app.request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ text: "response without tools" });

    // Verify that tools were attempted to be loaded
    expect(mockMCPClient.tools).toHaveBeenCalled();

    // Verify that error was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to load MCP tools, continuing without:",
      expect.any(Error),
    );

    // Verify that tools were NOT passed to generateText
    expect(capturedGenerateTextArgs).toBeDefined();
    expect(capturedGenerateTextArgs.tools).toBeUndefined();

    consoleWarnSpy.mockRestore();
  });

  it("works without mcpClient when not provided", async () => {
    const mockModel = createTestModel("response without mcp");
    const app = new OpenAPIHono();

    // biome-ignore lint/suspicious/noExplicitAny: Capturing args for assertions in test
    let capturedGenerateTextArgs: any;
    const mockGenerateText = vi.fn(async (args) => {
      capturedGenerateTextArgs = args;
      return { text: "response without mcp" };
    });

    registerChatRoute(app, {
      generateTextFn: mockGenerateText,
      modelProvider: () => mockModel,
      fallbackModel: "mock-model",
      mcpClient: null,
    });

    const res = await app.request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ text: "response without mcp" });

    // Verify that tools were NOT passed to generateText
    expect(capturedGenerateTextArgs).toBeDefined();
    expect(capturedGenerateTextArgs.tools).toBeUndefined();
  });
});
