import type { MCPClient } from "@ai-sdk/mcp";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { generateText } from "ai";
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
  mcpClient?: MCPClient | null;
};

export const registerChatRoute = (
  app: OpenAPIHono,
  {
    generateTextFn = generateText,
    modelProvider = ollamaProvider,
    fallbackModel = defaultModel,
    mcpClient = null,
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
        // Get MCP tools if client is available
        // biome-ignore lint/suspicious/noExplicitAny: Tools are dynamically typed by MCP server
        let tools: Record<string, any> | undefined;
        if (mcpClient) {
          try {
            // @ai-sdk/mcp automatically converts MCP tools to AI SDK format
            tools = await mcpClient.tools();
            console.log(`Loaded ${Object.keys(tools).length} MCP tools`);
          } catch (error) {
            console.warn(
              "Failed to load MCP tools, continuing without:",
              error,
            );
          }
        }

        const { text } = await generateTextFn({
          model: modelProvider(model ?? fallbackModel),
          prompt,
          ...(tools && { tools }),
        });

        return c.json({ text }, 200);
      } catch (error) {
        console.error("Failed to generate text with Ollama", error);
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
