// Enhanced security module with best practices
@description('Key Vault name')
param keyVaultName string

@description('Location for resources')
param location string = resourceGroup().location

@description('Environment name')
@allowed(['development', 'staging', 'production'])
param environmentName string

@description('Principal IDs that need access to Key Vault')
param principalIds array = []

@description('Enable private endpoints')
param enablePrivateEndpoints bool = false

@description('Private endpoint subnet ID')
param privateEndpointSubnetId string = ''

@description('Virtual network ID for private endpoint')
param vnetId string = ''

@description('Tags to apply to resources')
param tags object = {}

// Security configuration based on environment
var securityConfig = {
  development: {
    enablePurgeProtection: false
    softDeleteRetentionDays: 7
    enableRbacAuthorization: true
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
      ipRules: []
      virtualNetworkRules: []
    }
  }
  staging: {
    enablePurgeProtection: true
    softDeleteRetentionDays: 30
    enableRbacAuthorization: true
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
      ipRules: []
      virtualNetworkRules: []
    }
  }
  production: {
    enablePurgeProtection: true
    softDeleteRetentionDays: 90
    enableRbacAuthorization: true
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'None'
      ipRules: []
      virtualNetworkRules: []
    }
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: environmentName == 'production' ? 'premium' : 'standard'
    }
    tenantId: subscription().tenantId
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    enableRbacAuthorization: securityConfig[environmentName].enableRbacAuthorization
    enableSoftDelete: true
    softDeleteRetentionInDays: securityConfig[environmentName].softDeleteRetentionDays
    enablePurgeProtection: securityConfig[environmentName].enablePurgeProtection
    networkAcls: securityConfig[environmentName].networkAcls
    publicNetworkAccess: enablePrivateEndpoints ? 'Disabled' : 'Enabled'
  }
}

// Diagnostic settings for Key Vault
resource keyVaultDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'diag-${keyVaultName}'
  scope: keyVault
  properties: {
    logs: [
      {
        categoryGroup: 'audit'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: securityConfig[environmentName].softDeleteRetentionDays
        }
      }
      {
        categoryGroup: 'allLogs'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: securityConfig[environmentName].softDeleteRetentionDays
        }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: securityConfig[environmentName].softDeleteRetentionDays
        }
      }
    ]
    workspaceId: logAnalyticsWorkspace.id
  }
}

// Log Analytics Workspace for security monitoring
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${keyVaultName}-logs'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: securityConfig[environmentName].softDeleteRetentionDays
    features: {
      enableDataExport: true
      immediatePurgeDataOn30Days: environmentName == 'development'
    }
  }
}

// Private endpoint for Key Vault (if enabled)
resource keyVaultPrivateEndpoint 'Microsoft.Network/privateEndpoints@2023-09-01' = if (enablePrivateEndpoints && !empty(privateEndpointSubnetId)) {
  name: '${keyVaultName}-pe'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: privateEndpointSubnetId
    }
    privateLinkServiceConnections: [
      {
        name: '${keyVaultName}-pe-connection'
        properties: {
          privateLinkServiceId: keyVault.id
          groupIds: ['vault']
        }
      }
    ]
  }
}

// Private DNS zone for Key Vault
resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = if (enablePrivateEndpoints) {
  name: 'privatelink.vaultcore.azure.net'
  location: 'global'
  tags: tags
}

// Link private DNS zone to VNet
resource privateDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = if (enablePrivateEndpoints && !empty(vnetId)) {
  parent: privateDnsZone
  name: '${keyVaultName}-dns-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnetId
    }
  }
}

// Role assignments for Key Vault
resource keyVaultSecretsUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = [for principalId in principalIds: {
  name: guid(keyVault.id, principalId, 'Key Vault Secrets User')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}]

// Azure Policy assignments for compliance
resource policyAssignment 'Microsoft.Authorization/policyAssignments@2022-06-01' = if (environmentName == 'production') {
  name: '${keyVaultName}-policy'
  properties: {
    policyDefinitionId: '/providers/Microsoft.Authorization/policyDefinitions/1e66c121-a66a-4b1f-9b83-0fd99bf0fc2d' // Key Vault should use a virtual network service endpoint
    parameters: {}
    enforcementMode: 'Default'
  }
}

// Outputs
output keyVaultId string = keyVault.id
output keyVaultUri string = keyVault.properties.vaultUri
output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id