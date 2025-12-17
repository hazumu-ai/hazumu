import { OpenAPIHono } from "@hono/zod-openapi";
import { MockLanguageModelV2 } from "ai/test";
import { describe, expect, it } from "vitest";
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
});
