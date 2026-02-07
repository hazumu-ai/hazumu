import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Tool as MCPTool } from "@modelcontextprotocol/sdk/types.js";
import { tool as aiTool } from "ai";
import { z } from "zod";

/**
 * Convert a JSON Schema to a Zod schema (simplified version)
 * This handles basic types used by the robot-mcp server
 */
// biome-ignore lint/suspicious/noExplicitAny: JSON Schema is untyped
function jsonSchemaToZod(schema: any): z.ZodType {
  if (!schema || !schema.type) {
    return z.any();
  }

  switch (schema.type) {
    case "object": {
      if (!schema.properties) {
        return z.object({});
      }
      const shape: Record<string, z.ZodType> = {};
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        shape[key] = jsonSchemaToZod(propSchema);
        // Make optional if not in required array
        if (!schema.required?.includes(key)) {
          shape[key] = shape[key].optional();
        }
      }
      return z.object(shape);
    }
    case "string":
      return z.string();
    case "number":
      return z.number();
    case "integer":
      return z.number().int();
    case "boolean":
      return z.boolean();
    case "array":
      return z.array(jsonSchemaToZod(schema.items || {}));
    default:
      return z.any();
  }
}

/**
 * Convert MCP tool to AI SDK tool format
 */
export function convertMCPToolToAITool(mcpTool: MCPTool, mcpClient: Client) {
  // Convert the input schema from JSON Schema to Zod
  const inputSchema = mcpTool.inputSchema
    ? jsonSchemaToZod(mcpTool.inputSchema)
    : z.object({});

  // biome-ignore lint/suspicious/noExplicitAny: Tool definition requires dynamic typing
  const toolDefinition: any = {
    description: mcpTool.description || `MCP tool: ${mcpTool.name}`,
    parameters: inputSchema,
    // biome-ignore lint/suspicious/noExplicitAny: Tool input and options are dynamically typed
    execute: async (input: any, _options: any): Promise<string> => {
      // Call the MCP server's tool
      const response = await mcpClient.callTool({
        name: mcpTool.name,
        arguments: input as Record<string, unknown>,
      });

      // Return the content from the tool call
      const content = response.content;
      if (Array.isArray(content) && content.length > 0) {
        const firstContent = content[0];
        if (
          firstContent &&
          typeof firstContent === "object" &&
          "type" in firstContent
        ) {
          if (firstContent.type === "text" && "text" in firstContent) {
            return firstContent.text as string;
          }
        }
      }

      return JSON.stringify(content);
    },
  };

  return aiTool(toolDefinition);
}

/**
 * Convert all MCP tools to AI SDK tools
 */
export function convertMCPTools(mcpTools: MCPTool[], mcpClient: Client) {
  // biome-ignore lint/suspicious/noExplicitAny: Tools are dynamically typed
  const tools: Record<string, any> = {};

  for (const mcpTool of mcpTools) {
    tools[mcpTool.name] = convertMCPToolToAITool(mcpTool, mcpClient);
  }

  return tools;
}
