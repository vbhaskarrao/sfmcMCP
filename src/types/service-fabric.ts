// Copyright (c) Your Organization.
// Licensed under the MIT License.

/**
 * Type definitions for Azure Service Fabric Managed Clusters API
 * Based on: https://learn.microsoft.com/en-us/rest/api/servicefabric/managedclusters/managed-clusters
 */

export interface ManagedCluster {
  id?: string;
  name?: string;
  type?: string;
  location: string;
  tags?: Record<string, string>;
  sku?: ClusterSku;
  properties?: ManagedClusterProperties;
}

export interface ClusterSku {
  name: "Basic" | "Standard";
}

export interface ManagedClusterProperties {
  clusterCodeVersion?: string;
  clusterId?: string;
  clusterState?: "BaselineUpgrade" | "Deploying" | "Ready" | "UpgradeFailed" | "WaitingForNodes";
  dnsName: string;
  fqdn?: string;
  clientConnectionPort?: number;
  httpGatewayConnectionPort?: number;
  adminUserName?: string;
  adminPassword?: string;
  loadBalancingRules?: LoadBalancingRule[];
  allowRdpAccess?: boolean;
  networkSecurityRules?: NetworkSecurityRule[];
  clients?: ClientCertificate[];
  azureActiveDirectory?: AzureActiveDirectory;
  fabricSettings?: SettingsSectionDescription[];
  provisioningState?: "Canceled" | "Failed" | "Succeeded" | "Updating";
  clusterUpgradeMode?: "Automatic" | "Manual";
  clusterUpgradeCadence?: "Wave0" | "Wave1" | "Wave2";
  addonFeatures?: string[];
  enableAutoOSUpgrade?: boolean;
  applicationTypeVersionsCleanupPolicy?: ApplicationTypeVersionsCleanupPolicy;
  enableIpv6?: boolean;
  ipTags?: IpTag[];
  auxiliarySubnets?: Subnet[];
  serviceEndpoints?: ServiceEndpoint[];
  ddosProtectionPlanId?: string;
  upgradeDescription?: ClusterUpgradePolicy;
  httpGatewayTokenAuthConnectionPort?: number;
  enableHttpGatewayExclusiveAuthMode?: boolean;
  zonalResiliency?: boolean;
  zonalUpdateMode?: "Fast" | "Standard";
}

export interface LoadBalancingRule {
  frontendPort: number;
  backendPort: number;
  protocol: "tcp" | "udp" | "http" | "https";
  probeProtocol?: "tcp" | "http" | "https";
  probeRequestPath?: string;
  loadDistribution?: "Default" | "SourceIP" | "SourceIPProtocol";
}

export interface NetworkSecurityRule {
  name: string;
  description?: string;
  protocol: "tcp" | "udp" | "ah" | "esp" | "http" | "https" | "*";
  sourceAddressPrefixes?: string[];
  destinationAddressPrefixes?: string[];
  sourcePortRanges?: string[];
  destinationPortRanges?: string[];
  access: "allow" | "deny";
  priority: number;
  direction: "inbound" | "outbound";
}

export interface ClientCertificate {
  isAdmin: boolean;
  thumbprint?: string;
  commonName?: string;
  issuerThumbprint?: string;
}

export interface AzureActiveDirectory {
  tenantId: string;
  clusterApplication: string;
  clientApplication: string;
}

export interface SettingsSectionDescription {
  name: string;
  parameters: SettingsParameterDescription[];
}

export interface SettingsParameterDescription {
  name: string;
  value: string;
}

export interface ApplicationTypeVersionsCleanupPolicy {
  maxUnusedVersionsToKeep: number;
}

export interface IpTag {
  ipTagType: string;
  tag: string;
}

export interface Subnet {
  name: string;
  enableIpv6?: boolean;
  privateEndpointNetworkPolicies?: "enabled" | "disabled";
  privateLinkServiceNetworkPolicies?: "enabled" | "disabled";
  networkSecurityGroupId?: string;
}

export interface ServiceEndpoint {
  service: string;
  locations?: string[];
}

export interface ClusterUpgradePolicy {
  forceRestart?: boolean;
  upgradeReplicaSetCheckTimeout?: string;
  healthCheckWaitDuration?: string;
  healthCheckStableDuration?: string;
  healthCheckRetryTimeout?: string;
  upgradeTimeout?: string;
  upgradeDomainTimeout?: string;
  healthPolicy?: ClusterHealthPolicy;
  deltaHealthPolicy?: ClusterUpgradeDeltaHealthPolicy;
}

export interface ClusterHealthPolicy {
  maxPercentUnhealthyNodes?: number;
  maxPercentUnhealthyApplications?: number;
  applicationHealthPolicies?: Record<string, ApplicationHealthPolicy>;
}

export interface ApplicationHealthPolicy {
  defaultServiceTypeHealthPolicy?: ServiceTypeHealthPolicy;
  serviceTypeHealthPolicies?: Record<string, ServiceTypeHealthPolicy>;
}

export interface ServiceTypeHealthPolicy {
  maxPercentUnhealthyServices?: number;
  maxPercentUnhealthyPartitionsPerService?: number;
  maxPercentUnhealthyReplicasPerPartition?: number;
}

export interface ClusterUpgradeDeltaHealthPolicy {
  maxPercentDeltaUnhealthyNodes?: number;
  maxPercentUpgradeDomainDeltaUnhealthyNodes?: number;
  maxPercentDeltaUnhealthyApplications?: number;
  applicationDeltaHealthPolicies?: Record<string, ApplicationDeltaHealthPolicy>;
}

export interface ApplicationDeltaHealthPolicy {
  defaultServiceTypeDeltaHealthPolicy?: ServiceTypeDeltaHealthPolicy;
  serviceTypeDeltaHealthPolicies?: Record<string, ServiceTypeDeltaHealthPolicy>;
}

export interface ServiceTypeDeltaHealthPolicy {
  maxPercentDeltaUnhealthyServices?: number;
}

export interface ManagedClusterListResult {
  value?: ManagedCluster[];
  nextLink?: string;
}

export interface CreateManagedClusterRequest {
  location: string;
  tags?: Record<string, string>;
  sku?: ClusterSku;
  properties: ManagedClusterProperties;
}

export interface UpdateManagedClusterRequest {
  tags?: Record<string, string>;
  sku?: ClusterSku;
  properties?: Partial<ManagedClusterProperties>;
}
