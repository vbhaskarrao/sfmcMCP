// Copyright (c) Your Organization.
// Licensed under the MIT License.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeAuthenticatedRequest } from "../auth.js";
import type { ServerConfig } from "../tools.js";

/**
 * Tool names for core functionality
 */
const CORE_TOOLS = {
  hello_world: "core_hello_world",
  list_items: "core_list_items",
  get_item: "core_get_item",
  create_item: "core_create_item",
};

/**
 * Configures core tools for the MCP server
 */
export function configureCoreTools(server: McpServer, config: ServerConfig) {
  // Tool 1: Hello World - Simple example tool
  server.tool(
    CORE_TOOLS.hello_world,
    "Returns a hello world message with the provided name",
    {
      name: z.string().describe("Name to greet"),
    },
    async (args) => {
      return {
        content: [
          {
            type: "text",
            text: `Hello, ${args.name}! Welcome to the MCP Server Template.`,
          },
        ],
      };
    }
  );

  // Tool 2: List Items - Example of listing resources
  server.tool(
    CORE_TOOLS.list_items,
    "Lists items with optional filtering and pagination",
    {
      filter: z.string().optional().describe("Filter criteria for items"),
      limit: z
        .number()
        .int()
        .positive()
        .default(10)
        .describe("Maximum number of items to return (default: 10)"),
      offset: z
        .number()
        .int()
        .min(0)
        .default(0)
        .describe("Number of items to skip (default: 0)"),
    },
    async (args) => {
      try {
        // Example: Make API request to list items
        const url = new URL(`${config.baseUrl}/items`);
        url.searchParams.append("limit", args.limit.toString());
        url.searchParams.append("offset", args.offset.toString());
        if (args.filter) {
          url.searchParams.append("filter", args.filter);
        }

        // Uncomment when you have a real API
        // const items = await makeAuthenticatedRequest<any[]>(
        //   url.toString(),
        //   config.apiKey
        // );

        // Mock response for demonstration
        const items = [
          { id: 1, name: "Item 1", description: "First item" },
          { id: 2, name: "Item 2", description: "Second item" },
          { id: 3, name: "Item 3", description: "Third item" },
        ].slice(args.offset, args.offset + args.limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(items, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing items: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 3: Get Item - Example of fetching a single resource
  server.tool(
    CORE_TOOLS.get_item,
    "Retrieves a specific item by its ID",
    {
      id: z.number().int().positive().describe("ID of the item to retrieve"),
    },
    async (args) => {
      try {
        // Example: Make API request to get item
        const url = `${config.baseUrl}/items/${args.id}`;

        // Uncomment when you have a real API
        // const item = await makeAuthenticatedRequest<any>(url, config.apiKey);

        // Mock response for demonstration
        const item = {
          id: args.id,
          name: `Item ${args.id}`,
          description: `Details for item ${args.id}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(item, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving item: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 4: Create Item - Example of creating a resource
  server.tool(
    CORE_TOOLS.create_item,
    "Creates a new item with the provided details",
    {
      name: z.string().min(1).describe("Name of the item"),
      description: z.string().optional().describe("Description of the item"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Optional tags for categorization"),
    },
    async (args) => {
      try {
        // Example: Make API request to create item
        const url = `${config.baseUrl}/items`;

        // Uncomment when you have a real API
        // const newItem = await makeAuthenticatedRequest<any>(
        //   url,
        //   config.apiKey,
        //   {
        //     method: "POST",
        //     body: JSON.stringify(args),
        //   }
        // );

        // Mock response for demonstration
        const newItem = {
          id: Math.floor(Math.random() * 1000),
          name: args.name,
          description: args.description || "",
          tags: args.tags || [],
          createdAt: new Date().toISOString(),
        };

        return {
          content: [
            {
              type: "text",
              text: `Successfully created item:\n${JSON.stringify(newItem, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating item: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
