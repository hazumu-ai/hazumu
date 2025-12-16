import type { LanguageModelV2 } from "@ai-sdk/provider";
import { generateText } from "ai";
import { type OpenAPIHono } from "@hono/zod-openapi";
import { defaultModel, ollamaProvider } from "../ollama.js";
import {
  chatRequestSchema,
  chatResponseSchema,
  errorResponseSchema,
} from "../schemas/chat.js";

type Dependencies = {
  generateTextFn?: typeof generateText;
  modelProvider?: (modelId: string) => LanguageModelV2;
  fallbackModel?: string;
};

export const registerChatRoute = (
  app: OpenAPIHono,
  {
    generateTextFn = generateText,
    modelProvider = ollamaProvider,
    fallbackModel = defaultModel,
  }: Dependencies = {},
) => {
  app.openapi(
    {
      method: "post",
      path: "/api/chat",
      request: {
        body: {
          content: {
            "application/json": {
              schema: chatRequestSchema,
            },
          },
          required: true,
        },
      },
      responses: {
        200: {
          description: "Generated chat response",
          content: {
            "application/json": {
              schema: chatResponseSchema,
            },
          },
        },
        400: {
          description: "Invalid request",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
        500: {
          description: "Internal error",
          content: {
            "application/json": {
              schema: errorResponseSchema,
            },
          },
        },
      },
    },
    async (c) => {
      const { prompt, model } = c.req.valid("json");

      try {
        const { text } = await generateTextFn({
          model: modelProvider(model ?? fallbackModel),
          prompt,
        });

        return c.json({ text }, 200);
      } catch (error) {
        console.error("Failed to generate text with Ollama", error);
        return c.json({ error: "internal_error", message: String(error) }, 500);
      }
    },
  );
};
