// Copyright (c) Your Organization.
// Licensed under the MIT License.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeAzureRequest, buildManagedClusterUrl } from "../azure-auth.js";
import type {
  ManagedCluster,
  ManagedClusterListResult,
  CreateManagedClusterRequest,
  UpdateManagedClusterRequest,
} from "../types/service-fabric.js";

export interface AzureConfig {
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  subscriptionId: string;
}

/**
 * Tool names for Service Fabric Managed Clusters
 */
const SFMC_TOOLS = {
  create_cluster: "sfmc_create_cluster",
  get_cluster: "sfmc_get_cluster",
  update_cluster: "sfmc_update_cluster",
  delete_cluster: "sfmc_delete_cluster",
  list_clusters: "sfmc_list_clusters",
  list_clusters_by_subscription: "sfmc_list_clusters_by_subscription",
};

/**
 * Configures Service Fabric Managed Clusters tools for the MCP server
 */
export function configureServiceFabricClusterTools(server: McpServer, config: AzureConfig) {
  // Tool 1: Create or Update Managed Cluster
  server.tool(
    SFMC_TOOLS.create_cluster,
    "Creates or updates a Service Fabric managed cluster in Azure. This operation can take several minutes to complete.",
    {
      resourceGroupName: z.string().describe("The name of the resource group"),
      clusterName: z.string().describe("The name of the cluster resource"),
      location: z.string().describe("Azure region for the cluster (e.g., 'eastus', 'westeurope')"),
      dnsName: z.string().describe("The cluster's DNS name. Must be unique within the region"),
      adminUserName: z.string().optional().describe("VM admin user name for the cluster"),
      adminPassword: z.string().optional().describe("VM admin password for the cluster"),
      sku: z.enum(["Basic", "Standard"]).default("Basic").describe("The SKU of the cluster"),
      clientConnectionPort: z.number().int().default(19000).describe("The port for client connections"),
      httpGatewayConnectionPort: z.number().int().default(19080).describe("The port for HTTP gateway"),
      clusterCodeVersion: z.string().optional().describe("The Service Fabric runtime version"),
      tags: z.record(z.string()).optional().describe("Resource tags as key-value pairs"),
      apiVersion: z.string().default("2024-11-01-preview").describe("API version to use"),
    },
    async (args) => {
      try {
        const url = buildManagedClusterUrl(
          config.subscriptionId,
          args.resourceGroupName,
          args.clusterName,
          args.apiVersion
        );

        const clusterRequest: CreateManagedClusterRequest = {
          location: args.location,
          tags: args.tags,
          sku: {
            name: args.sku,
          },
          properties: {
            dnsName: args.dnsName,
            clientConnectionPort: args.clientConnectionPort,
            httpGatewayConnectionPort: args.httpGatewayConnectionPort,
            adminUserName: args.adminUserName,
            adminPassword: args.adminPassword,
            clusterCodeVersion: args.clusterCodeVersion,
          },
        };

        const cluster = await makeAzureRequest<ManagedCluster>(
          url,
          config,
          {
            method: "PUT",
            body: JSON.stringify(clusterRequest),
          }
        );

        return {
          content: [
            {
              type: "text",
              text: `Successfully initiated creation/update of managed cluster '${args.clusterName}':\n${JSON.stringify(cluster, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating/updating managed cluster: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 2: Get Managed Cluster
  server.tool(
    SFMC_TOOLS.get_cluster,
    "Gets a Service Fabric managed cluster by name from a resource group",
    {
      resourceGroupName: z.string().describe("The name of the resource group"),
      clusterName: z.string().describe("The name of the cluster resource"),
      apiVersion: z.string().default("2024-11-01-preview").describe("API version to use"),
    },
    async (args) => {
      try {
        const url = buildManagedClusterUrl(
          config.subscriptionId,
          args.resourceGroupName,
          args.clusterName,
          args.apiVersion
        );

        const cluster = await makeAzureRequest<ManagedCluster>(url, config);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(cluster, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving managed cluster: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 3: Update Managed Cluster
  server.tool(
    SFMC_TOOLS.update_cluster,
    "Updates tags or properties of a Service Fabric managed cluster. Use this for partial updates.",
    {
      resourceGroupName: z.string().describe("The name of the resource group"),
      clusterName: z.string().describe("The name of the cluster resource"),
      tags: z.record(z.string()).optional().describe("Resource tags to update"),
      clusterCodeVersion: z.string().optional().describe("The Service Fabric runtime version to upgrade to"),
      clientConnectionPort: z.number().int().optional().describe("The port for client connections"),
      httpGatewayConnectionPort: z.number().int().optional().describe("The port for HTTP gateway"),
      apiVersion: z.string().default("2024-11-01-preview").describe("API version to use"),
    },
    async (args) => {
      try {
        // First, get the existing cluster
        const getUrl = buildManagedClusterUrl(
          config.subscriptionId,
          args.resourceGroupName,
          args.clusterName,
          args.apiVersion
        );

        const existingCluster = await makeAzureRequest<ManagedCluster>(getUrl, config);

        if (!existingCluster.properties?.dnsName) {
          throw new Error("Existing cluster missing required dnsName property");
        }

        // Prepare update request
        const updateRequest: ManagedCluster = {
          ...existingCluster,
          tags: args.tags || existingCluster.tags,
          properties: {
            ...existingCluster.properties,
            dnsName: existingCluster.properties.dnsName, // Ensure required property is set
            clusterCodeVersion: args.clusterCodeVersion || existingCluster.properties.clusterCodeVersion,
            clientConnectionPort: args.clientConnectionPort || existingCluster.properties.clientConnectionPort,
            httpGatewayConnectionPort: args.httpGatewayConnectionPort || existingCluster.properties.httpGatewayConnectionPort,
          },
        };

        const updatedCluster = await makeAzureRequest<ManagedCluster>(
          getUrl,
          config,
          {
            method: "PUT",
            body: JSON.stringify(updateRequest),
          }
        );

        return {
          content: [
            {
              type: "text",
              text: `Successfully updated managed cluster '${args.clusterName}':\n${JSON.stringify(updatedCluster, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error updating managed cluster: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 4: Delete Managed Cluster
  server.tool(
    SFMC_TOOLS.delete_cluster,
    "Deletes a Service Fabric managed cluster from a resource group. This is a long-running operation.",
    {
      resourceGroupName: z.string().describe("The name of the resource group"),
      clusterName: z.string().describe("The name of the cluster resource to delete"),
      apiVersion: z.string().default("2024-11-01-preview").describe("API version to use"),
    },
    async (args) => {
      try {
        const url = buildManagedClusterUrl(
          config.subscriptionId,
          args.resourceGroupName,
          args.clusterName,
          args.apiVersion
        );

        await makeAzureRequest<void>(url, config, {
          method: "DELETE",
        });

        return {
          content: [
            {
              type: "text",
              text: `Successfully initiated deletion of managed cluster '${args.clusterName}' from resource group '${args.resourceGroupName}'.\nThe deletion is a long-running operation and may take several minutes to complete.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting managed cluster: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 5: List Managed Clusters by Resource Group
  server.tool(
    SFMC_TOOLS.list_clusters,
    "Lists all Service Fabric managed clusters in a resource group",
    {
      resourceGroupName: z.string().describe("The name of the resource group"),
      apiVersion: z.string().default("2024-11-01-preview").describe("API version to use"),
    },
    async (args) => {
      try {
        const url = buildManagedClusterUrl(
          config.subscriptionId,
          args.resourceGroupName,
          undefined,
          args.apiVersion
        );

        const result = await makeAzureRequest<ManagedClusterListResult>(url, config);

        const clusterCount = result.value?.length || 0;
        const clusterNames = result.value?.map(c => c.name).join(", ") || "none";

        return {
          content: [
            {
              type: "text",
              text: `Found ${clusterCount} managed cluster(s) in resource group '${args.resourceGroupName}':\n${clusterNames}\n\nDetails:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing managed clusters: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool 6: List Managed Clusters by Subscription
  server.tool(
    SFMC_TOOLS.list_clusters_by_subscription,
    "Lists all Service Fabric managed clusters in the entire subscription",
    {
      apiVersion: z.string().default("2024-11-01-preview").describe("API version to use"),
    },
    async (args) => {
      try {
        const url = `https://management.azure.com/subscriptions/${config.subscriptionId}/providers/Microsoft.ServiceFabric/managedClusters?api-version=${args.apiVersion}`;

        const result = await makeAzureRequest<ManagedClusterListResult>(url, config);

        const clusterCount = result.value?.length || 0;
        const clusterSummary = result.value?.map(c => ({
          name: c.name,
          resourceGroup: c.id?.split("/resourceGroups/")[1]?.split("/")[0],
          location: c.location,
          state: c.properties?.clusterState,
        })) || [];

        return {
          content: [
            {
              type: "text",
              text: `Found ${clusterCount} managed cluster(s) in subscription:\n\nSummary:\n${JSON.stringify(clusterSummary, null, 2)}\n\nFull details:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing managed clusters: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
