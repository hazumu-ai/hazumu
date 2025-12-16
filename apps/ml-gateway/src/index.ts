import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { registerChatRoute } from "./routes/chat.js";

export const createApp = () => {
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

  registerChatRoute(app);

  return app;
};

export const app = createApp();

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
