# Quick Start Guide

This guide will help you get started with the Service Fabric Managed Clusters MCP Server quickly.

## 5-Minute Setup

### Step 1: Install Dependencies

```bash
cd mcp-server-template
npm install
```

### Step 2: Build the Server

```bash
npm run build
```

### Step 3: Authenticate with Azure

Choose one of these methods:

**Option A: Azure CLI (Recommended for development)**
```bash
az login
```

**Option B: Service Principal**
```bash
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

### Step 4: Test the Server

```bash
# Replace with your subscription ID
node dist/index.js --subscription-id "12345678-1234-1234-1234-123456789abc"
```

The server will start and wait for MCP protocol messages via stdin/stdout.

## Testing with MCP Inspector

For interactive testing:

```bash
npm run inspect
```

Then open http://localhost:5173 in your browser.

## Example Usage

### Create a Cluster

```json
{
  "resourceGroupName": "my-rg",
  "clusterName": "test-cluster",
  "location": "eastus",
  "dnsName": "testcluster",
  "sku": "Basic",
  "adminUserName": "adminuser",
  "adminPassword": "SecureP@ssw0rd123!"
}
```

### Get Cluster Information

```json
{
  "resourceGroupName": "my-rg",
  "clusterName": "test-cluster"
}
```

### List All Clusters in a Resource Group

```json
{
  "resourceGroupName": "my-rg"
}
```

### Update Cluster Tags

```json
{
  "resourceGroupName": "my-rg",
  "clusterName": "test-cluster",
  "tags": {
    "environment": "development",
    "cost-center": "engineering"
  }
}
```

### Delete a Cluster

```json
{
  "resourceGroupName": "my-rg",
  "clusterName": "test-cluster"
}
```

## Using with Claude Desktop

1. Find your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add this configuration:

```json
{
  "mcpServers": {
    "service-fabric": {
      "command": "node",
      "args": [
        "C:/opt/caludeCode/mcp-server-template/dist/index.js",
        "--subscription-id",
        "YOUR-SUBSCRIPTION-ID"
      ]
    }
  }
}
```

3. Restart Claude Desktop

4. Look for the 🔌 icon to confirm the server is connected

5. Try asking Claude:
   - "List all Service Fabric managed clusters in my subscription"
   - "Create a new Service Fabric cluster called 'my-cluster' in resource group 'my-rg' in eastus"
   - "Show me details of the cluster named 'my-cluster'"

## Troubleshooting

### "subscriptionId is required"
Make sure you're passing the `--subscription-id` parameter when starting the server.

### "401 Unauthorized"
Your Azure credentials are not valid. Try:
```bash
az login
az account show
```

### "403 Forbidden"
You don't have permissions to manage Service Fabric clusters. Ask your Azure administrator to grant you the appropriate RBAC role (e.g., "Contributor" or "Owner").

### Server won't start
Make sure you've built the project:
```bash
npm run build
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check the [Azure Service Fabric documentation](https://learn.microsoft.com/en-us/azure/service-fabric/)
- Explore the API reference: https://learn.microsoft.com/en-us/rest/api/servicefabric/managedclusters/managed-clusters

## Need Help?

- Check the [Troubleshooting section](README.md#troubleshooting) in the README
- Review the MCP documentation: https://modelcontextprotocol.io
- Open an issue in your repository
