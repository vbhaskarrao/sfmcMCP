# VS Code Integration Setup

This guide explains how to integrate the Service Fabric Managed Clusters MCP Server with VS Code.

## Prerequisites

1. **VS Code** with MCP support (ensure you have the latest version)
2. **Node.js** 18 or later installed
3. **Azure credentials** configured (Azure CLI or Service Principal)
4. The MCP server built and ready (`npm run build`)

## Installation Steps

### Step 1: Build the MCP Server

```bash
cd mcp-server-template
npm install
npm run build
```

### Step 2: Configure VS Code

VS Code uses workspace or user settings to configure MCP servers. You have two options:

#### Option A: Workspace Settings (Recommended)

Create or edit `.vscode/settings.json` in your project root:

```json
{
  "mcp.servers": {
    "service-fabric": {
      "command": "node",
      "args": [
        "C:/opt/caludeCode/mcp-server-template/dist/index.js",
        "--subscription-id",
        "your-subscription-id"
      ]
    }
  }
}
```

**With Service Principal Authentication:**

```json
{
  "mcp.servers": {
    "service-fabric": {
      "command": "node",
      "args": [
        "C:/opt/caludeCode/mcp-server-template/dist/index.js",
        "--subscription-id",
        "your-subscription-id",
        "--tenant-id",
        "your-tenant-id",
        "--client-id",
        "your-client-id",
        "--client-secret",
        "your-client-secret"
      ]
    }
  }
}
```

**Using Environment Variables (More Secure):**

```json
{
  "mcp.servers": {
    "service-fabric": {
      "command": "node",
      "args": [
        "C:/opt/caludeCode/mcp-server-template/dist/index.js",
        "--subscription-id",
        "${env:AZURE_SUBSCRIPTION_ID}"
      ],
      "env": {
        "AZURE_TENANT_ID": "${env:AZURE_TENANT_ID}",
        "AZURE_CLIENT_ID": "${env:AZURE_CLIENT_ID}",
        "AZURE_CLIENT_SECRET": "${env:AZURE_CLIENT_SECRET}"
      }
    }
  }
}
```

#### Option B: User Settings (Global)

1. Open VS Code Settings (Ctrl+, or Cmd+,)
2. Search for "MCP"
3. Edit `settings.json` directly
4. Add the same configuration as above

### Step 3: Set Environment Variables (If Using Env Vars)

**Windows (PowerShell):**
```powershell
$env:AZURE_SUBSCRIPTION_ID="your-subscription-id"
$env:AZURE_TENANT_ID="your-tenant-id"
$env:AZURE_CLIENT_ID="your-client-id"
$env:AZURE_CLIENT_SECRET="your-client-secret"
```

**Windows (CMD):**
```cmd
set AZURE_SUBSCRIPTION_ID=your-subscription-id
set AZURE_TENANT_ID=your-tenant-id
set AZURE_CLIENT_ID=your-client-id
set AZURE_CLIENT_SECRET=your-client-secret
```

**macOS/Linux:**
```bash
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Or add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):
```bash
echo 'export AZURE_SUBSCRIPTION_ID="your-subscription-id"' >> ~/.bashrc
source ~/.bashrc
```

### Step 4: Reload VS Code

After updating settings:
1. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Run: "Reload Window"

## Using the MCP Server in VS Code

### Via Chat/Copilot

Once configured, you can interact with the MCP server through VS Code's chat interface:

1. Open the chat panel
2. Use commands like:
   - "List all Service Fabric managed clusters in my subscription"
   - "Show me details of cluster 'my-cluster' in resource group 'my-rg'"
   - "Create a new Service Fabric cluster called 'test-cluster' in eastus"

### Via Command Palette

You can also invoke MCP tools directly:
1. Open Command Palette (Ctrl+Shift+P)
2. Type "MCP: Run Tool"
3. Select the Service Fabric tool you want to use
4. Provide the required parameters

## Configuration Examples

### Example 1: Development with Azure CLI

```json
{
  "mcp.servers": {
    "service-fabric-dev": {
      "command": "node",
      "args": [
        "${workspaceFolder}/dist/index.js",
        "--subscription-id",
        "12345678-1234-1234-1234-123456789abc"
      ]
    }
  }
}
```

This uses Azure CLI authentication (requires `az login`).

### Example 2: Multiple Environments

```json
{
  "mcp.servers": {
    "service-fabric-dev": {
      "command": "node",
      "args": [
        "${workspaceFolder}/dist/index.js",
        "--subscription-id",
        "dev-subscription-id"
      ]
    },
    "service-fabric-prod": {
      "command": "node",
      "args": [
        "${workspaceFolder}/dist/index.js",
        "--subscription-id",
        "prod-subscription-id"
      ]
    }
  }
}
```

This allows you to switch between dev and production environments.

### Example 3: Using NPM Package (After Publishing)

If you publish this to npm, you can reference it directly:

```json
{
  "mcp.servers": {
    "service-fabric": {
      "command": "npx",
      "args": [
        "@your-org/mcp-server-sfmc",
        "--subscription-id",
        "your-subscription-id"
      ]
    }
  }
}
```

## Verification

To verify the MCP server is working:

1. Open VS Code Output panel
2. Select "MCP" from the dropdown
3. Look for connection messages
4. Try running a simple command: "List Service Fabric clusters"

## Troubleshooting

### Server Not Connecting

**Check the output panel:**
1. View → Output
2. Select "MCP" from dropdown
3. Look for error messages

**Common issues:**
- **Path incorrect**: Verify the path to `dist/index.js` is correct
- **Not built**: Run `npm run build` first
- **Node not found**: Ensure Node.js is in your PATH

### Authentication Errors

**Azure CLI not logged in:**
```bash
az login
az account show
```

**Service Principal issues:**
- Verify credentials are correct
- Check the service principal has appropriate permissions
- Ensure subscription ID is correct

### Permission Errors

**403 Forbidden:**
- Your Azure account/service principal needs appropriate RBAC permissions
- Minimum required: "Reader" role to list, "Contributor" to manage clusters
- Contact your Azure administrator

### Server Crashes

**Check logs:**
```bash
# Enable debug mode
node dist/index.js --subscription-id "your-id" --help
```

**Common causes:**
- Invalid subscription ID
- Network connectivity issues
- Azure service outage

## Advanced Configuration

### Custom Domains

Enable only specific tool domains:

```json
{
  "mcp.servers": {
    "service-fabric": {
      "command": "node",
      "args": [
        "${workspaceFolder}/dist/index.js",
        "--subscription-id",
        "your-subscription-id",
        "--domains",
        "sfmc"
      ]
    }
  }
}
```

Available domains:
- `sfmc` - Service Fabric Managed Clusters tools (default)
- `core` - Core example tools
- `all` - All available tools

### Debug Mode

For debugging, you can use Node.js inspector:

```json
{
  "mcp.servers": {
    "service-fabric-debug": {
      "command": "node",
      "args": [
        "--inspect",
        "${workspaceFolder}/dist/index.js",
        "--subscription-id",
        "your-subscription-id"
      ]
    }
  }
}
```

Then attach VS Code debugger to the Node process.

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for sensitive data
3. **Prefer Azure CLI** authentication for local development
4. **Use Managed Identity** when running in Azure
5. **Rotate secrets regularly** if using Service Principal
6. **Use Key Vault** for production secrets

## Template Files

A template settings file is provided at:
`.vscode/settings.json.example`

Copy and customize it:
```bash
cp .vscode/settings.json.example .vscode/settings.json
# Edit .vscode/settings.json with your values
```

## Getting Help

If you encounter issues:

1. Check the [README.md](README.md) for general documentation
2. Review [TROUBLESHOOTING](README.md#troubleshooting) section
3. Enable debug logging and check output
4. Verify Azure credentials and permissions
5. Open an issue on GitHub: https://github.com/vbhaskarrao/sfmcMCP

## Additional Resources

- [VS Code MCP Documentation](https://code.visualstudio.com/docs/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Azure Service Fabric Documentation](https://learn.microsoft.com/en-us/azure/service-fabric/)
- [Azure CLI Documentation](https://learn.microsoft.com/en-us/cli/azure/)
