// Copyright (c) Your Organization.
// Licensed under the MIT License.

/**
 * Azure authentication module for Service Fabric Managed Clusters API
 */

import { DefaultAzureCredential, ClientSecretCredential } from "@azure/identity";

export interface AzureAuthConfig {
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  subscriptionId: string;
}

/**
 * Gets an access token for Azure Resource Manager API
 */
export async function getAzureAccessToken(config: AzureAuthConfig): Promise<string> {
  let credential;

  // Use ClientSecretCredential if all required parameters are provided
  if (config.tenantId && config.clientId && config.clientSecret) {
    credential = new ClientSecretCredential(
      config.tenantId,
      config.clientId,
      config.clientSecret
    );
  } else {
    // Fall back to DefaultAzureCredential (supports multiple auth methods)
    credential = new DefaultAzureCredential();
  }

  const tokenResponse = await credential.getToken("https://management.azure.com/.default");
  return tokenResponse.token;
}

/**
 * Creates headers for Azure ARM API requests with authentication
 */
export async function createAzureAuthHeaders(config: AzureAuthConfig): Promise<Record<string, string>> {
  const token = await getAzureAccessToken(config);

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

/**
 * Makes an authenticated Azure ARM API request
 */
export async function makeAzureRequest<T>(
  url: string,
  config: AzureAuthConfig,
  options: RequestInit = {}
): Promise<T> {
  const headers = await createAzureAuthHeaders(config);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Azure API request failed: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody.error) {
        errorMessage += `\nError: ${JSON.stringify(errorBody.error, null, 2)}`;
      }
    } catch {
      // If parsing error body fails, use the default error message
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Builds the base URL for Service Fabric Managed Clusters API
 */
export function buildSfmcBaseUrl(subscriptionId: string, apiVersion: string = "2024-11-01-preview"): string {
  return `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.ServiceFabric`;
}

/**
 * Builds URL for managed cluster operations
 */
export function buildManagedClusterUrl(
  subscriptionId: string,
  resourceGroupName: string,
  clusterName?: string,
  apiVersion: string = "2024-11-01-preview"
): string {
  const baseUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ServiceFabric/managedClusters`;

  if (clusterName) {
    return `${baseUrl}/${clusterName}?api-version=${apiVersion}`;
  }

  return `${baseUrl}?api-version=${apiVersion}`;
}
