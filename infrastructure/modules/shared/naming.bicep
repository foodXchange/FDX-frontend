// Naming convention module for consistent resource naming
@description('Base name for resources')
param baseName string

@description('Environment name')
@allowed(['dev', 'stg', 'prod'])
param environmentShortName string

@description('Azure region short name')
param locationShortName string = 'eus2'

@description('Resource type abbreviations')
var resourceAbbreviations = {
  appServicePlan: 'asp'
  webApp: 'app'
  staticWebApp: 'stapp'
  storageAccount: 'st'
  cosmosDb: 'cosmos'
  keyVault: 'kv'
  serviceBus: 'sb'
  appInsights: 'appi'
  logAnalytics: 'log'
  cdnProfile: 'cdn'
  cdnEndpoint: 'cdne'
  dashboard: 'dash'
  resourceGroup: 'rg'
}

// Generate unique suffix
var uniqueSuffix = substring(uniqueString(subscription().id, baseName, environmentShortName), 0, 6)

// Naming functions
var names = {
  appServicePlan: '${resourceAbbreviations.appServicePlan}-${baseName}-${environmentShortName}-${locationShortName}'
  webApp: '${resourceAbbreviations.webApp}-${baseName}-${environmentShortName}-${locationShortName}-${uniqueSuffix}'
  staticWebApp: '${resourceAbbreviations.staticWebApp}-${baseName}-${environmentShortName}-${uniqueSuffix}'
  storageAccount: toLower('${resourceAbbreviations.storageAccount}${baseName}${environmentShortName}${uniqueSuffix}')
  cosmosDb: '${resourceAbbreviations.cosmosDb}-${baseName}-${environmentShortName}-${uniqueSuffix}'
  keyVault: '${resourceAbbreviations.keyVault}-${baseName}-${environmentShortName}-${uniqueSuffix}'
  serviceBus: '${resourceAbbreviations.serviceBus}-${baseName}-${environmentShortName}-${uniqueSuffix}'
  appInsights: '${resourceAbbreviations.appInsights}-${baseName}-${environmentShortName}'
  logAnalytics: '${resourceAbbreviations.logAnalytics}-${baseName}-${environmentShortName}'
  cdnProfile: '${resourceAbbreviations.cdnProfile}-${baseName}-${environmentShortName}'
  cdnEndpoint: '${resourceAbbreviations.cdnEndpoint}-${baseName}-${environmentShortName}'
  dashboard: '${resourceAbbreviations.dashboard}-${baseName}-${environmentShortName}'
  resourceGroup: '${resourceAbbreviations.resourceGroup}-${baseName}-${environmentShortName}'
}

// Outputs
output appServicePlanName string = names.appServicePlan
output webAppName string = names.webApp
output staticWebAppName string = names.staticWebApp
output storageAccountName string = names.storageAccount
output cosmosDbName string = names.cosmosDb
output keyVaultName string = names.keyVault
output serviceBusName string = names.serviceBus
output appInsightsName string = names.appInsights
output logAnalyticsName string = names.logAnalytics
output cdnProfileName string = names.cdnProfile
output cdnEndpointName string = names.cdnEndpoint
output dashboardName string = names.dashboard
output resourceGroupName string = names.resourceGroup
output uniqueSuffix string = uniqueSuffix