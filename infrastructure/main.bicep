targetScope = 'subscription'

@description('The name of the resource group')
param resourceGroupName string

@description('The location for all resources')
param location string = 'eastus2'

@description('Environment name')
@allowed(['development', 'staging', 'production'])
param environmentName string

@description('The base name for all resources')
param baseName string = 'fdx'

@description('Custom domain name (optional)')
param customDomain string = ''

@description('Cost center for billing')
param costCenter string

@description('Owner email')
param ownerEmail string

@description('GitHub repository URL')
param githubRepoUrl string = 'https://github.com/yourusername/FDX-frontend'

// Generate unique names for resources
var uniqueSuffix = uniqueString(subscription().id, resourceGroupName, environmentName)
var appName = '${baseName}-${environmentName}'
var backendWebAppName = '${appName}-api-${uniqueSuffix}'
var staticWebAppName = '${appName}-web-${uniqueSuffix}'
var appServicePlanName = '${appName}-plan-${uniqueSuffix}'
var cosmosDbAccountName = '${baseName}${environmentName}cosmos${uniqueSuffix}'
var storageAccountName = '${baseName}${environmentName}st${uniqueSuffix}'
var keyVaultName = '${appName}-kv-${uniqueSuffix}'
var serviceBusNamespaceName = '${appName}-sb-${uniqueSuffix}'
var appInsightsName = '${appName}-insights'
var logAnalyticsWorkspaceName = '${appName}-logs'
var cdnProfileName = '${appName}-cdn'
var cdnEndpointName = '${appName}-endpoint'

// SKU configurations per environment
var skuConfig = {
  development: {
    appServicePlanSku: 'B1'
    minInstances: 1
    maxInstances: 3
    staticWebAppSku: 'Free'
  }
  staging: {
    appServicePlanSku: 'S1'
    minInstances: 1
    maxInstances: 5
    staticWebAppSku: 'Standard'
  }
  production: {
    appServicePlanSku: 'P1v3'
    minInstances: 2
    maxInstances: 10
    staticWebAppSku: 'Standard'
  }
}

// Tags for all resources
var tags = {
  Environment: environmentName
  Application: 'FoodXchange'
  Component: 'Platform'
  CostCenter: costCenter
  Owner: ownerEmail
  ManagedBy: 'Bicep'
  CreatedDate: utcNow('yyyy-MM-dd')
}

// Create resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

// Deploy backend infrastructure
module backend './modules/backend.bicep' = {
  scope: resourceGroup
  name: 'backend-deployment'
  params: {
    location: location
    appServicePlanName: appServicePlanName
    webAppName: backendWebAppName
    appServicePlanSku: skuConfig[environmentName].appServicePlanSku
    cosmosDbAccountName: cosmosDbAccountName
    cosmosDbDatabaseName: 'foodxchange'
    storageAccountName: storageAccountName
    keyVaultName: keyVaultName
    serviceBusNamespaceName: serviceBusNamespaceName
    appInsightsName: appInsightsName
    logAnalyticsWorkspaceName: logAnalyticsWorkspaceName
    environmentName: environmentName
    minInstances: skuConfig[environmentName].minInstances
    maxInstances: skuConfig[environmentName].maxInstances
    tags: tags
  }
}

// Deploy frontend infrastructure
module frontend './modules/frontend.bicep' = {
  scope: resourceGroup
  name: 'frontend-deployment'
  params: {
    location: location
    staticWebAppName: staticWebAppName
    sku: skuConfig[environmentName].staticWebAppSku
    cdnProfileName: cdnProfileName
    cdnEndpointName: cdnEndpointName
    customDomain: customDomain
    appInsightsInstrumentationKey: backend.outputs.appInsightsInstrumentationKey
    appInsightsConnectionString: backend.outputs.appInsightsConnectionString
    backendApiUrl: backend.outputs.webAppUrl
    environmentName: environmentName
    tags: tags
  }
}

// Deploy monitoring dashboard
module monitoringDashboard './modules/monitoring-dashboard.bicep' = {
  scope: resourceGroup
  name: 'monitoring-dashboard-deployment'
  params: {
    dashboardName: '${appName}-dashboard'
    location: location
    appInsightsResourceId: '${resourceGroup.id}/providers/Microsoft.Insights/components/${appInsightsName}'
    staticWebAppResourceId: frontend.outputs.staticWebAppId
    webAppResourceId: backend.outputs.webAppId
    cosmosDbResourceId: '${resourceGroup.id}/providers/Microsoft.DocumentDB/databaseAccounts/${cosmosDbAccountName}'
    tags: tags
  }
}

// Outputs
output resourceGroupName string = resourceGroup.name
output backendUrl string = backend.outputs.webAppUrl
output frontendUrl string = frontend.outputs.staticWebAppUrl
output cdnUrl string = frontend.outputs.cdnEndpointUrl
output staticWebAppDeploymentToken string = frontend.outputs.staticWebAppDeploymentToken
output appInsightsInstrumentationKey string = backend.outputs.appInsightsInstrumentationKey
output keyVaultUri string = backend.outputs.keyVaultUri
output cosmosDbEndpoint string = backend.outputs.cosmosDbEndpoint
output monitoringDashboardId string = monitoringDashboard.outputs.dashboardId