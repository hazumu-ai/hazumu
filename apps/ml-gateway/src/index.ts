import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createMCPClient } from "./mcp-client.js";
import { registerChatRoute } from "./routes/chat.js";

export const createApp = async () => {
  const app = new OpenAPIHono();

  // OpenAPI ドキュメント
  app.doc("/doc", {
    openapi: "3.1.0",
    info: {
      title: "ML Gateway API",
      version: "1.0.0",
    },
  });

  app.get("/", (c) => {
    return c.text("Hello Hono!");
  });

  // Initialize MCP client if URL is configured
  let mcpClient: Client | null = null;
  const mcpUrl = process.env.MCP_SERVER_URL;
  if (mcpUrl) {
    try {
      console.log(`Connecting to MCP server at ${mcpUrl}`);
      mcpClient = await createMCPClient({ url: mcpUrl });
      console.log("MCP client connected successfully");
    } catch (error) {
      console.error("Failed to connect to MCP server:", error);
      console.log("Continuing without MCP support");
    }
  } else {
    console.log("MCP_SERVER_URL not configured, skipping MCP integration");
  }

  registerChatRoute(app, { mcpClient });

  return app;
};

export const app = await createApp();

if (process.env.NODE_ENV !== "test") {
  serve(
    {
      fetch: app.fetch,
      port: Number(process.env.PORT) || 3000,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    },
  );
}
