# Service Fabric Managed Clusters - Usage Examples

This file contains practical examples of using the MCP server tools.

## Prerequisites

Before running these examples:

1. Ensure you have an Azure subscription
2. You're authenticated (via `az login` or service principal)
3. You have appropriate RBAC permissions
4. The MCP server is running

## Example 1: Create a Basic Cluster

This creates a basic Service Fabric managed cluster suitable for development/testing.

**Tool:** `sfmc_create_cluster`

```json
{
  "resourceGroupName": "rg-servicefabric-dev",
  "clusterName": "sfmc-dev-cluster",
  "location": "eastus",
  "dnsName": "sfmcdevcluster",
  "sku": "Basic",
  "adminUserName": "sfadmin",
  "adminPassword": "MySecurePassword123!",
  "clientConnectionPort": 19000,
  "httpGatewayConnectionPort": 19080,
  "tags": {
    "environment": "development",
    "project": "my-app",
    "owner": "dev-team"
  }
}
```

**Expected Result:**
- Creates a new cluster in "Deploying" state
- Takes 10-20 minutes to fully provision
- Returns cluster details with cluster ID and FQDN

## Example 2: Create a Production Cluster

This creates a production-ready cluster with Standard SKU.

**Tool:** `sfmc_create_cluster`

```json
{
  "resourceGroupName": "rg-servicefabric-prod",
  "clusterName": "sfmc-prod-cluster",
  "location": "eastus2",
  "dnsName": "sfmcprodcluster",
  "sku": "Standard",
  "adminUserName": "prodadmin",
  "adminPassword": "V3rySecureP@ssw0rd!",
  "clientConnectionPort": 19000,
  "httpGatewayConnectionPort": 19080,
  "clusterCodeVersion": "9.1.1583.9590",
  "tags": {
    "environment": "production",
    "project": "enterprise-app",
    "cost-center": "engineering",
    "compliance": "sox"
  }
}
```

**Key Differences from Basic:**
- Standard SKU provides better SLA and features
- Specific Service Fabric runtime version pinned
- Additional tags for production governance

## Example 3: Get Cluster Details

Retrieve detailed information about a specific cluster.

**Tool:** `sfmc_get_cluster`

```json
{
  "resourceGroupName": "rg-servicefabric-dev",
  "clusterName": "sfmc-dev-cluster"
}
```

**Response includes:**
- Cluster state (Deploying, Ready, UpgradeFailed, etc.)
- FQDN for connecting to the cluster
- Node types and configurations
- Current Service Fabric version
- Network configuration
- Tags and metadata

## Example 4: Update Cluster Tags

Update resource tags without modifying the cluster itself.

**Tool:** `sfmc_update_cluster`

```json
{
  "resourceGroupName": "rg-servicefabric-dev",
  "clusterName": "sfmc-dev-cluster",
  "tags": {
    "environment": "staging",
    "last-updated": "2026-01-07",
    "updated-by": "automation"
  }
}
```

**Use Cases:**
- Cost tracking and allocation
- Compliance and governance
- Resource organization
- Automation metadata

## Example 5: Upgrade Service Fabric Version

Upgrade the cluster to a newer Service Fabric runtime version.

**Tool:** `sfmc_update_cluster`

```json
{
  "resourceGroupName": "rg-servicefabric-prod",
  "clusterName": "sfmc-prod-cluster",
  "clusterCodeVersion": "9.1.1675.9590"
}
```

**Important Notes:**
- Cluster will initiate a rolling upgrade
- Applications remain available during upgrade
- Monitor upgrade progress in Azure Portal
- Can take 30-60 minutes depending on cluster size

## Example 6: List All Clusters in a Resource Group

Find all Service Fabric clusters in a specific resource group.

**Tool:** `sfmc_list_clusters`

```json
{
  "resourceGroupName": "rg-servicefabric-dev"
}
```

**Use Cases:**
- Inventory management
- Finding clusters by resource group
- Bulk operations preparation
- Cost analysis by resource group

## Example 7: List All Clusters in Subscription

Get a complete inventory of all clusters across the subscription.

**Tool:** `sfmc_list_clusters_by_subscription`

```json
{
  "apiVersion": "2024-11-01-preview"
}
```

**Response includes summary of:**
- Cluster names
- Resource groups
- Locations
- Current states

**Use Cases:**
- Subscription-wide inventory
- Multi-region deployments overview
- Finding orphaned clusters
- Compliance auditing

## Example 8: Delete a Development Cluster

Remove a cluster that's no longer needed.

**Tool:** `sfmc_delete_cluster`

```json
{
  "resourceGroupName": "rg-servicefabric-dev",
  "clusterName": "sfmc-dev-cluster"
}
```

**Important:**
- This is a destructive operation - cannot be undone
- All applications and data in the cluster will be deleted
- Delete operation takes 5-10 minutes
- Ensure you have backups if needed

## Example 9: Update Connection Ports

Change the client connection and HTTP gateway ports.

**Tool:** `sfmc_update_cluster`

```json
{
  "resourceGroupName": "rg-servicefabric-dev",
  "clusterName": "sfmc-dev-cluster",
  "clientConnectionPort": 19001,
  "httpGatewayConnectionPort": 19081
}
```

**When to use:**
- Avoiding port conflicts
- Compliance requirements
- Network security policies

## Example 10: Create Cluster with Specific API Version

Use a specific API version for compatibility.

**Tool:** `sfmc_create_cluster`

```json
{
  "resourceGroupName": "rg-servicefabric-test",
  "clusterName": "sfmc-test-cluster",
  "location": "westus2",
  "dnsName": "sfmctestcluster",
  "sku": "Basic",
  "adminUserName": "testadmin",
  "adminPassword": "TestP@ssw0rd123!",
  "apiVersion": "2024-11-01-preview"
}
```

## Common Workflows

### Workflow 1: Create and Monitor New Cluster

```
1. Create cluster using sfmc_create_cluster
2. Wait a few minutes
3. Check status with sfmc_get_cluster
4. Repeat step 3 until clusterState = "Ready"
5. Note the FQDN for connecting applications
```

### Workflow 2: Cluster Upgrade Process

```
1. Get current version: sfmc_get_cluster
2. Check available versions in Azure docs
3. Update version: sfmc_update_cluster with new clusterCodeVersion
4. Monitor upgrade: sfmc_get_cluster (check clusterState)
5. Verify applications after upgrade completes
```

### Workflow 3: Environment Cleanup

```
1. List all clusters: sfmc_list_clusters_by_subscription
2. Identify development/test clusters
3. For each cluster to remove:
   - Backup any needed data
   - Delete cluster: sfmc_delete_cluster
   - Verify deletion completed
```

### Workflow 4: Cost Optimization

```
1. List all clusters: sfmc_list_clusters_by_subscription
2. Check each cluster state: sfmc_get_cluster
3. Identify unused clusters (no applications)
4. Update tags for cost tracking: sfmc_update_cluster
5. Delete unused clusters: sfmc_delete_cluster
```

## Error Handling Examples

### Handling 404 - Cluster Not Found

```json
{
  "resourceGroupName": "rg-servicefabric-dev",
  "clusterName": "non-existent-cluster"
}
```

**Response:**
```
Error retrieving managed cluster: Azure API request failed: 404 Not Found
Error: {
  "code": "ResourceNotFound",
  "message": "The Resource 'Microsoft.ServiceFabric/managedClusters/non-existent-cluster' under resource group 'rg-servicefabric-dev' was not found."
}
```

### Handling 409 - Conflict (Cluster Being Modified)

If you try to update a cluster that's currently being modified:

**Response:**
```
Error updating managed cluster: Azure API request failed: 409 Conflict
Error: {
  "code": "AnotherOperationInProgress",
  "message": "Another operation is in progress on this cluster. Please wait for it to complete."
}
```

**Solution:** Wait for the current operation to complete, then retry.

### Handling 403 - Insufficient Permissions

**Response:**
```
Error creating managed cluster: Azure API request failed: 403 Forbidden
Error: {
  "code": "AuthorizationFailed",
  "message": "The client does not have authorization to perform action 'Microsoft.ServiceFabric/managedClusters/write'."
}
```

**Solution:** Contact your Azure administrator to grant appropriate RBAC permissions.

## Best Practices

1. **Naming Conventions**: Use consistent naming patterns (e.g., `sfmc-{env}-{app}-{region}`)
2. **Tagging Strategy**: Always include environment, owner, and cost-center tags
3. **SKU Selection**: Use Basic for dev/test, Standard for production
4. **Version Pinning**: In production, explicitly specify clusterCodeVersion
5. **Resource Groups**: Separate production and non-production clusters
6. **Monitoring**: Regularly check cluster state before operations
7. **Documentation**: Keep cluster inventories updated

## Security Considerations

1. **Admin Passwords**: Use strong passwords (16+ characters, mixed case, numbers, symbols)
2. **Network Security**: Configure network security rules appropriately
3. **Authentication**: Use Azure CLI or Managed Identity in production, not service principals with secrets in code
4. **Certificates**: For production, use client certificates instead of admin password
5. **RBAC**: Use least-privilege principle for Azure permissions
6. **Audit Logs**: Enable Azure Activity Logs for cluster operations

## Testing Checklist

Before using in production:

- [ ] Test cluster creation in a dev subscription
- [ ] Verify authentication works (Azure CLI or service principal)
- [ ] Test cluster retrieval and listing
- [ ] Test tag updates
- [ ] Test version upgrade on test cluster
- [ ] Verify delete operation works
- [ ] Check error handling (invalid cluster names, etc.)
- [ ] Validate RBAC permissions are appropriate
- [ ] Test in Claude Desktop integration
- [ ] Document any custom configurations
