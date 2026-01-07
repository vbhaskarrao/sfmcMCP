# Service Fabric Managed Clusters MCP Server

An MCP (Model Context Protocol) server for managing Azure Service Fabric Managed Clusters through the Azure REST API.

## Features

This MCP server provides tools to:

- **Create** Service Fabric managed clusters
- **Read** cluster information (get by name, list by resource group or subscription)
- **Update** existing clusters (tags, configuration, version upgrades)
- **Delete** managed clusters
- **Azure Authentication**: Supports multiple Azure authentication methods (CLI, Service Principal, Managed Identity)
- **Type Safety**: Full TypeScript support with Zod validation

## Prerequisites

- Node.js 18 or later
- An Azure subscription
- Azure authentication credentials (one of the following):
  - Azure CLI logged in (`az login`)
  - Service Principal credentials (tenant ID, client ID, client secret)
  - Managed Identity (when running on Azure)

## Installation

```bash
cd mcp-server-template
npm install
npm run build
```

## Authentication

This server uses Azure Identity libraries and supports multiple authentication methods:

### Option 1: Azure CLI (Easiest for local development)
```bash
az login
```

### Option 2: Service Principal
```bash
# Set environment variables
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Or pass them as command-line arguments (see Usage below).

### Option 3: Managed Identity
When running on Azure (VM, App Service, etc.), the server will automatically use the managed identity.

## Usage

### Basic Usage with Azure CLI Authentication

```bash
node dist/index.js --subscription-id "your-subscription-id"
```

### Usage with Service Principal

```bash
node dist/index.js \
  --subscription-id "your-subscription-id" \
  --tenant-id "your-tenant-id" \
  --client-id "your-client-id" \
  --client-secret "your-client-secret"
```

### Command-Line Options

| Option | Alias | Description | Required |
|--------|-------|-------------|----------|
| `--subscription-id` | `-s` | Azure subscription ID | Yes |
| `--tenant-id` | `-t` | Azure tenant ID | No* |
| `--client-id` | `-c` | Service principal client ID | No* |
| `--client-secret` | - | Service principal client secret | No* |
| `--domains` | `-d` | Domains to enable (default: `sfmc`) | No |
| `--help` | - | Show help | No |
| `--version` | - | Show version | No |

\* Required only if using Service Principal authentication

### Using with MCP Inspector

For testing and debugging, use the MCP Inspector:

```bash
npm run inspect
```

Then interact with the server at http://localhost:5173.

## Configuration for Claude Desktop

Add this configuration to your Claude Desktop config file:

### macOS
`~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows
`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "service-fabric": {
      "command": "node",
      "args": [
        "/path/to/mcp-server-template/dist/index.js",
        "--subscription-id",
        "your-subscription-id"
      ],
      "env": {
        "AZURE_TENANT_ID": "your-tenant-id",
        "AZURE_CLIENT_ID": "your-client-id",
        "AZURE_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

Or if using Azure CLI authentication:

```json
{
  "mcpServers": {
    "service-fabric": {
      "command": "node",
      "args": [
        "/path/to/mcp-server-template/dist/index.js",
        "--subscription-id",
        "your-subscription-id"
      ]
    }
  }
}
```

## Available Tools

### 1. `sfmc_create_cluster`
Creates or updates a Service Fabric managed cluster.

**Parameters:**
- `resourceGroupName` (string, required): The resource group name
- `clusterName` (string, required): The cluster name
- `location` (string, required): Azure region (e.g., "eastus", "westeurope")
- `dnsName` (string, required): The cluster's DNS name
- `adminUserName` (string, optional): VM admin username
- `adminPassword` (string, optional): VM admin password
- `sku` (string, optional): Cluster SKU - "Basic" or "Standard" (default: "Basic")
- `clientConnectionPort` (number, optional): Client connection port (default: 19000)
- `httpGatewayConnectionPort` (number, optional): HTTP gateway port (default: 19080)
- `clusterCodeVersion` (string, optional): Service Fabric runtime version
- `tags` (object, optional): Resource tags
- `apiVersion` (string, optional): API version (default: "2024-11-01-preview")

**Example:**
```json
{
  "resourceGroupName": "my-rg",
  "clusterName": "my-cluster",
  "location": "eastus",
  "dnsName": "mycluster",
  "sku": "Standard",
  "adminUserName": "adminuser",
  "adminPassword": "P@ssw0rd123!",
  "tags": {
    "environment": "production",
    "owner": "team-a"
  }
}
```

### 2. `sfmc_get_cluster`
Retrieves information about a specific managed cluster.

**Parameters:**
- `resourceGroupName` (string, required): The resource group name
- `clusterName` (string, required): The cluster name
- `apiVersion` (string, optional): API version (default: "2024-11-01-preview")

**Example:**
```json
{
  "resourceGroupName": "my-rg",
  "clusterName": "my-cluster"
}
```

### 3. `sfmc_update_cluster`
Updates an existing managed cluster (partial update).

**Parameters:**
- `resourceGroupName` (string, required): The resource group name
- `clusterName` (string, required): The cluster name
- `tags` (object, optional): Updated resource tags
- `clusterCodeVersion` (string, optional): Service Fabric version to upgrade to
- `clientConnectionPort` (number, optional): Updated client connection port
- `httpGatewayConnectionPort` (number, optional): Updated HTTP gateway port
- `apiVersion` (string, optional): API version (default: "2024-11-01-preview")

**Example:**
```json
{
  "resourceGroupName": "my-rg",
  "clusterName": "my-cluster",
  "clusterCodeVersion": "9.1.1583.9590",
  "tags": {
    "environment": "staging"
  }
}
```

### 4. `sfmc_delete_cluster`
Deletes a managed cluster (long-running operation).

**Parameters:**
- `resourceGroupName` (string, required): The resource group name
- `clusterName` (string, required): The cluster name to delete
- `apiVersion` (string, optional): API version (default: "2024-11-01-preview")

**Example:**
```json
{
  "resourceGroupName": "my-rg",
  "clusterName": "my-cluster"
}
```

### 5. `sfmc_list_clusters`
Lists all managed clusters in a resource group.

**Parameters:**
- `resourceGroupName` (string, required): The resource group name
- `apiVersion` (string, optional): API version (default: "2024-11-01-preview")

**Example:**
```json
{
  "resourceGroupName": "my-rg"
}
```

### 6. `sfmc_list_clusters_by_subscription`
Lists all managed clusters in the subscription.

**Parameters:**
- `apiVersion` (string, optional): API version (default: "2024-11-01-preview")

**Example:**
```json
{
  "apiVersion": "2024-11-01-preview"
}
```

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### Format Code
```bash
npm run format
```

### Lint
```bash
npm run lint
```

### Clean Build Artifacts
```bash
npm run clean
```

## API Reference

This MCP server is based on the Azure Service Fabric Managed Clusters REST API:

https://learn.microsoft.com/en-us/rest/api/servicefabric/managedclusters/managed-clusters?view=rest-servicefabric-managedclusters-2024-11-01-preview

## Troubleshooting

### Authentication Errors

If you see authentication errors:

1. **Check Azure CLI login:**
   ```bash
   az login
   az account show
   ```

2. **Verify service principal credentials:**
   ```bash
   az login --service-principal \
     --username $AZURE_CLIENT_ID \
     --password $AZURE_CLIENT_SECRET \
     --tenant $AZURE_TENANT_ID
   ```

3. **Check subscription access:**
   ```bash
   az account set --subscription "your-subscription-id"
   az account show
   ```

### Common Errors

- **"subscriptionId is required"**: Make sure to pass `--subscription-id` argument
- **"401 Unauthorized"**: Check your Azure credentials
- **"403 Forbidden"**: Verify you have appropriate RBAC permissions on the subscription/resource group
- **"404 Not Found"**: The cluster or resource group doesn't exist
- **"409 Conflict"**: The cluster is currently being modified by another operation

## License

MIT
