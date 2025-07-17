// Optimized networking module with security best practices
@description('Virtual network name')
param vnetName string

@description('Location for resources')
param location string = resourceGroup().location

@description('Address space for the virtual network')
param addressSpace string = '10.0.0.0/16'

@description('Environment name')
@allowed(['development', 'staging', 'production'])
param environmentName string

@description('Enable private endpoints')
param enablePrivateEndpoints bool = false

@description('Tags to apply to resources')
param tags object = {}

// Subnet configurations
var subnetConfigs = {
  webApp: {
    name: 'snet-webapp'
    addressPrefix: '10.0.1.0/24'
    delegations: [
      {
        name: 'webapp-delegation'
        properties: {
          serviceName: 'Microsoft.Web/serverFarms'
        }
      }
    ]
  }
  privateEndpoints: {
    name: 'snet-privateendpoints'
    addressPrefix: '10.0.2.0/24'
    privateEndpointNetworkPolicies: 'Disabled'
  }
  serviceBus: {
    name: 'snet-servicebus'
    addressPrefix: '10.0.3.0/24'
  }
  storage: {
    name: 'snet-storage'
    addressPrefix: '10.0.4.0/24'
  }
  cosmosDb: {
    name: 'snet-cosmosdb'
    addressPrefix: '10.0.5.0/24'
  }
}

// Network Security Group rules
var nsgRules = {
  allowHttps: {
    name: 'AllowHttpsInbound'
    properties: {
      protocol: 'Tcp'
      sourcePortRange: '*'
      destinationPortRange: '443'
      sourceAddressPrefix: 'Internet'
      destinationAddressPrefix: '*'
      access: 'Allow'
      priority: 100
      direction: 'Inbound'
    }
  }
  allowHealthProbes: {
    name: 'AllowAzureLoadBalancerInbound'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: '*'
      sourceAddressPrefix: 'AzureLoadBalancer'
      destinationAddressPrefix: '*'
      access: 'Allow'
      priority: 110
      direction: 'Inbound'
    }
  }
  denyAllInbound: {
    name: 'DenyAllInbound'
    properties: {
      protocol: '*'
      sourcePortRange: '*'
      destinationPortRange: '*'
      sourceAddressPrefix: '*'
      destinationAddressPrefix: '*'
      access: 'Deny'
      priority: 4096
      direction: 'Inbound'
    }
  }
}

// Create Network Security Group
resource nsg 'Microsoft.Network/networkSecurityGroups@2023-09-01' = {
  name: '${vnetName}-nsg'
  location: location
  tags: tags
  properties: {
    securityRules: enablePrivateEndpoints ? [
      nsgRules.allowHealthProbes
      nsgRules.denyAllInbound
    ] : [
      nsgRules.allowHttps
      nsgRules.allowHealthProbes
    ]
  }
}

// Create Virtual Network
resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' = {
  name: vnetName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [addressSpace]
    }
    subnets: enablePrivateEndpoints ? [
      {
        name: subnetConfigs.webApp.name
        properties: {
          addressPrefix: subnetConfigs.webApp.addressPrefix
          networkSecurityGroup: {
            id: nsg.id
          }
          delegations: subnetConfigs.webApp.delegations
          serviceEndpoints: [
            {
              service: 'Microsoft.Storage'
              locations: [location]
            }
            {
              service: 'Microsoft.KeyVault'
              locations: [location]
            }
            {
              service: 'Microsoft.ServiceBus'
              locations: [location]
            }
            {
              service: 'Microsoft.AzureCosmosDB'
              locations: [location]
            }
          ]
        }
      }
      {
        name: subnetConfigs.privateEndpoints.name
        properties: {
          addressPrefix: subnetConfigs.privateEndpoints.addressPrefix
          privateEndpointNetworkPolicies: 'Disabled'
          privateLinkServiceNetworkPolicies: 'Enabled'
        }
      }
      {
        name: subnetConfigs.storage.name
        properties: {
          addressPrefix: subnetConfigs.storage.addressPrefix
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
      {
        name: subnetConfigs.cosmosDb.name
        properties: {
          addressPrefix: subnetConfigs.cosmosDb.addressPrefix
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
      {
        name: subnetConfigs.serviceBus.name
        properties: {
          addressPrefix: subnetConfigs.serviceBus.addressPrefix
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
    ] : [
      {
        name: subnetConfigs.webApp.name
        properties: {
          addressPrefix: subnetConfigs.webApp.addressPrefix
          networkSecurityGroup: {
            id: nsg.id
          }
          delegations: subnetConfigs.webApp.delegations
        }
      }
    ]
    enableDdosProtection: environmentName == 'production'
  }
}

// DDoS Protection Plan for production
resource ddosProtectionPlan 'Microsoft.Network/ddosProtectionPlans@2023-09-01' = if (environmentName == 'production') {
  name: '${vnetName}-ddos'
  location: location
  tags: tags
  properties: {}
}

// Outputs
output vnetId string = vnet.id
output vnetName string = vnet.name
output webAppSubnetId string = vnet.properties.subnets[0].id
output privateEndpointSubnetId string = enablePrivateEndpoints ? vnet.properties.subnets[1].id : ''
output nsgId string = nsg.id