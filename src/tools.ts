// Copyright (c) Your Organization.
// Licensed under the MIT License.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { configureCoreTools } from "./tools/core.js";
import { configureServiceFabricClusterTools } from "./tools/service-fabric-clusters.js";

export interface ServerConfig {
  apiKey?: string;
  baseUrl: string;
  enabledDomains: Set<string>;
  // Azure-specific configuration
  subscriptionId?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
}

export function configureAllTools(server: McpServer, config: ServerConfig) {
  const configureIfDomainEnabled = (domain: string, configureFn: () => void) => {
    if (config.enabledDomains.has("all") || config.enabledDomains.has(domain)) {
      configureFn();
    }
  };

  // Register domain-specific tools
  configureIfDomainEnabled("core", () => configureCoreTools(server, config));

  // Register Service Fabric Managed Clusters tools
  configureIfDomainEnabled("sfmc", () => {
    if (!config.subscriptionId) {
      console.error("Warning: subscriptionId is required for Service Fabric Managed Clusters tools");
      return;
    }

    configureServiceFabricClusterTools(server, {
      subscriptionId: config.subscriptionId,
      tenantId: config.tenantId,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
  });
}
