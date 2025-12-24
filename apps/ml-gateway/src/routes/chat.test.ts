import { OpenAPIHono } from "@hono/zod-openapi";
import { MockLanguageModelV2 } from "ai/test";
import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "../generated/prisma/index.js";
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

const createMockDbClient = () => {
  return {
    chatLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  } as unknown as PrismaClient;
};

describe("POST /api/chat", () => {
  it("returns generated text using mocked model", async () => {
    const mockModel = createTestModel("mocked response");
    const mockDb = createMockDbClient();
    const app = new OpenAPIHono();

    registerChatRoute(app, {
      modelProvider: () => mockModel,
      fallbackModel: "mock-model",
      dbClient: mockDb,
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
    expect(mockDb.chatLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        prompt: "hello",
        model: "mock-model",
        response: "mocked response",
        duration: expect.any(Number),
      }),
    });
  });

  it("returns validation error on invalid payload", async () => {
    const mockDb = createMockDbClient();
    const app = new OpenAPIHono();

    registerChatRoute(app, {
      modelProvider: () => createTestModel("unused"),
      fallbackModel: "mock-model",
      dbClient: mockDb,
    });

    const res = await app.request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "" }),
    });

    expect(res.status).toBe(400);
    // OpenAPI validation fails before hitting handler
    expect(mockDb.chatLog.create).not.toHaveBeenCalled();
  });

  it("returns 500 when provider throws", async () => {
    const mockDb = createMockDbClient();
    const app = new OpenAPIHono();

    registerChatRoute(app, {
      // Force an error after model selection
      generateTextFn: async () => {
        throw new Error("boom");
      },
      modelProvider: () => createTestModel("unused"),
      fallbackModel: "mock-model",
      dbClient: mockDb,
    });

    const res = await app.request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("internal_error");
    expect(mockDb.chatLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        prompt: "hello",
        model: "mock-model",
        response: null,
        duration: expect.any(Number),
        error: "boom",
      }),
    });
  });

  it("continues to work even if database logging fails", async () => {
    const mockModel = createTestModel("mocked response");
    const mockDb = createMockDbClient();
    mockDb.chatLog.create = vi
      .fn()
      .mockRejectedValue(new Error("database error"));
    const app = new OpenAPIHono();

    registerChatRoute(app, {
      modelProvider: () => mockModel,
      fallbackModel: "mock-model",
      dbClient: mockDb,
    });

    const res = await app.request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ text: "mocked response" });
    expect(mockDb.chatLog.create).toHaveBeenCalled();
  });
});
