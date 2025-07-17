@description('The name of the Static Web App')
param staticWebAppName string

@description('The location for the Static Web App')
param location string = 'eastus2'

@description('The SKU for the Static Web App')
@allowed(['Free', 'Standard'])
param sku string = 'Standard'

@description('The name of the CDN profile')
param cdnProfileName string

@description('The name of the CDN endpoint')
param cdnEndpointName string

@description('Custom domain name (optional)')
param customDomain string = ''

@description('Application Insights Instrumentation Key')
param appInsightsInstrumentationKey string

@description('Application Insights Connection String')
param appInsightsConnectionString string

@description('Backend API URL')
param backendApiUrl string

@description('Environment name')
@allowed(['development', 'staging', 'production'])
param environmentName string

@description('Tags to apply to all resources')
param tags object = {}

// Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  tags: tags
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    repositoryUrl: 'https://github.com/yourusername/FDX-frontend'
    branch: environmentName == 'production' ? 'main' : environmentName
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    provider: 'GitHub'
    buildProperties: {
      appLocation: '/'
      apiLocation: ''
      outputLocation: 'build'
      appBuildCommand: 'npm run build'
      apiBuildCommand: ''
      skipGithubActionWorkflowGeneration: true
    }
  }
}

// Application settings for Static Web App
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    REACT_APP_API_URL: backendApiUrl
    REACT_APP_ENVIRONMENT: environmentName
    REACT_APP_APP_INSIGHTS_KEY: appInsightsInstrumentationKey
    REACT_APP_APP_INSIGHTS_CONNECTION_STRING: appInsightsConnectionString
  }
}

// CDN Profile
resource cdnProfile 'Microsoft.Cdn/profiles@2023-05-01' = {
  name: cdnProfileName
  location: 'global'
  tags: tags
  sku: {
    name: 'Standard_Microsoft'
  }
  properties: {}
}

// CDN Endpoint
resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2023-05-01' = {
  parent: cdnProfile
  name: cdnEndpointName
  location: 'global'
  tags: tags
  properties: {
    originHostHeader: staticWebApp.properties.defaultHostname
    origins: [
      {
        name: 'static-web-app-origin'
        properties: {
          hostName: staticWebApp.properties.defaultHostname
          httpPort: 80
          httpsPort: 443
          priority: 1
          weight: 1000
          enabled: true
        }
      }
    ]
    isCompressionEnabled: true
    contentTypesToCompress: [
      'application/javascript'
      'application/json'
      'application/x-javascript'
      'application/xml'
      'text/css'
      'text/html'
      'text/javascript'
      'text/plain'
      'text/xml'
    ]
    optimizationType: 'GeneralWebDelivery'
    queryStringCachingBehavior: 'IgnoreQueryString'
    deliveryPolicy: {
      rules: [
        {
          name: 'CacheStaticAssets'
          order: 1
          conditions: [
            {
              name: 'UrlFileExtension'
              parameters: {
                typeName: 'UrlFileExtensionMatchCondition'
                operator: 'In'
                matchValues: [
                  'js'
                  'css'
                  'jpg'
                  'jpeg'
                  'png'
                  'gif'
                  'ico'
                  'woff'
                  'woff2'
                ]
              }
            }
          ]
          actions: [
            {
              name: 'CacheExpiration'
              parameters: {
                typeName: 'CacheExpirationAction'
                cacheBehavior: 'Override'
                cacheType: 'All'
                cacheDuration: '30.00:00:00'
              }
            }
          ]
        }
        {
          name: 'CacheBustingRule'
          order: 2
          conditions: [
            {
              name: 'UrlPath'
              parameters: {
                typeName: 'UrlPathMatchCondition'
                operator: 'Contains'
                matchValues: [
                  'static/'
                ]
              }
            }
          ]
          actions: [
            {
              name: 'CacheExpiration'
              parameters: {
                typeName: 'CacheExpirationAction'
                cacheBehavior: 'Override'
                cacheType: 'All'
                cacheDuration: '365.00:00:00'
              }
            }
          ]
        }
        {
          name: 'SecurityHeaders'
          order: 3
          conditions: []
          actions: [
            {
              name: 'ModifyResponseHeader'
              parameters: {
                typeName: 'ModifyResponseHeaderAction'
                headerAction: 'Overwrite'
                headerName: 'X-Content-Type-Options'
                value: 'nosniff'
              }
            }
          ]
        }
      ]
    }
  }
}

// Custom domain for CDN (if provided)
resource cdnCustomDomain 'Microsoft.Cdn/profiles/endpoints/customDomains@2023-05-01' = if (!empty(customDomain)) {
  parent: cdnEndpoint
  name: replace(customDomain, '.', '-')
  properties: {
    hostName: customDomain
  }
}

// Static Web App custom domain (if provided)
resource staticWebAppCustomDomain 'Microsoft.Web/staticSites/customDomains@2023-01-01' = if (!empty(customDomain)) {
  parent: staticWebApp
  name: customDomain
  properties: {
    domainName: customDomain
    validationMethod: 'cname-delegation'
  }
}

// Outputs
output staticWebAppUrl string = staticWebApp.properties.defaultHostname
output staticWebAppId string = staticWebApp.id
output cdnEndpointUrl string = cdnEndpoint.properties.hostName
output cdnEndpointId string = cdnEndpoint.id
output staticWebAppDeploymentToken string = listSecrets(staticWebApp.id, '2023-01-01').properties.apiKey