import type { LanguageModelV2 } from "@ai-sdk/provider";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { generateText } from "ai";
import { prisma } from "../db.js";
import type { PrismaClient } from "../generated/prisma/index.js";
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
  dbClient?: PrismaClient;
};

export const registerChatRoute = (
  app: OpenAPIHono,
  {
    generateTextFn = generateText,
    modelProvider = ollamaProvider,
    fallbackModel = defaultModel,
    dbClient = prisma,
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
      const modelName = model ?? fallbackModel;
      const startTime = Date.now();
      let errorMessage: string | undefined;

      try {
        const { text } = await generateTextFn({
          model: modelProvider(modelName),
          prompt,
        });

        const duration = Date.now() - startTime;

        // Log to database
        try {
          await dbClient.chatLog.create({
            data: {
              prompt,
              model: modelName,
              response: text,
              duration,
            },
          });
        } catch (dbError) {
          // Log database error but don't fail the request
          console.error("Failed to log to database", dbError);
        }

        return c.json({ text }, 200);
      } catch (error) {
        console.error("Failed to generate text with Ollama", error);
        errorMessage = error instanceof Error ? error.message : "Unknown error";
        const duration = Date.now() - startTime;

        // Log error to database
        try {
          await dbClient.chatLog.create({
            data: {
              prompt,
              model: modelName,
              response: null,
              duration,
              error: errorMessage,
            },
          });
        } catch (dbError) {
          // Log database error but don't fail the request
          console.error("Failed to log error to database", dbError);
        }

        return c.json(
          {
            error: "internal_error",
            message: "An internal error has occurred.",
          },
          500,
        );
      }
    },
  );
};
