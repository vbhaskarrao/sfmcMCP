#!/usr/bin/env node

// Copyright (c) Your Organization.
// Licensed under the MIT License.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { configureAllTools } from "./tools.js";
import { packageVersion } from "./version.js";

// Parse command line arguments using yargs
const argv = yargs(hideBin(process.argv))
  .scriptName("mcp-server-sfmc")
  .usage("Usage: $0 [options]")
  .version(packageVersion)
  .option("subscription-id", {
    alias: "s",
    describe: "Azure subscription ID (required for SFMC operations)",
    type: "string",
    demandOption: false,
  })
  .option("tenant-id", {
    alias: "t",
    describe: "Azure tenant ID (optional, uses DefaultAzureCredential if not provided)",
    type: "string",
    demandOption: false,
  })
  .option("client-id", {
    alias: "c",
    describe: "Azure service principal client ID (optional)",
    type: "string",
    demandOption: false,
  })
  .option("client-secret", {
    describe: "Azure service principal client secret (optional)",
    type: "string",
    demandOption: false,
  })
  .option("api-key", {
    alias: "k",
    describe: "API key for authentication (for non-Azure tools)",
    type: "string",
    demandOption: false,
  })
  .option("base-url", {
    alias: "u",
    describe: "Base URL for the API (for non-Azure tools)",
    type: "string",
    default: "https://api.example.com",
  })
  .option("domains", {
    alias: "d",
    describe: "Domain(s) to enable: 'all', 'core', 'sfmc' (Service Fabric Managed Clusters), or multiple space-separated",
    type: "string",
    array: true,
    default: ["sfmc"],
  })
  .help()
  .parseSync();

async function main() {
  const server = new McpServer({
    name: "Service Fabric Managed Clusters MCP Server",
    version: packageVersion,
    icons: [
      {
        src: "https://azure.microsoft.com/svghandler/service-fabric",
      },
    ],
  });

  // Configure all tools with the provided options
  configureAllTools(server, {
    apiKey: argv["api-key"],
    baseUrl: argv["base-url"],
    enabledDomains: new Set(argv.domains),
    subscriptionId: argv["subscription-id"],
    tenantId: argv["tenant-id"],
    clientId: argv["client-id"],
    clientSecret: argv["client-secret"],
  });

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
