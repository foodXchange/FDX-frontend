// Shared configuration module for environment-specific settings
@description('Environment name')
@allowed(['development', 'staging', 'production'])
param environmentName string

// SKU configurations with cost optimization
var skuConfigurations = {
  development: {
    appService: {
      name: 'B1'
      tier: 'Basic'
      size: 'B1'
      family: 'B'
      capacity: 1
    }
    cosmosDb: {
      enableServerless: true
      enableFreeTier: true
      backupType: 'Periodic'
      consistencyLevel: 'Session'
    }
    serviceBus: {
      sku: 'Basic'
      tier: 'Basic'
    }
    staticWebApp: {
      sku: 'Free'
      tier: 'Free'
    }
    storage: {
      sku: 'Standard_LRS'
      tier: 'Standard'
    }
    redis: {
      sku: 'Basic'
      family: 'C'
      capacity: 0
    }
  }
  staging: {
    appService: {
      name: 'S1'
      tier: 'Standard'
      size: 'S1'
      family: 'S'
      capacity: 1
    }
    cosmosDb: {
      enableServerless: true
      enableFreeTier: false
      backupType: 'Periodic'
      consistencyLevel: 'Session'
    }
    serviceBus: {
      sku: 'Standard'
      tier: 'Standard'
    }
    staticWebApp: {
      sku: 'Standard'
      tier: 'Standard'
    }
    storage: {
      sku: 'Standard_GRS'
      tier: 'Standard'
    }
    redis: {
      sku: 'Standard'
      family: 'C'
      capacity: 1
    }
  }
  production: {
    appService: {
      name: 'P1v3'
      tier: 'PremiumV3'
      size: 'P1v3'
      family: 'Pv3'
      capacity: 2
    }
    cosmosDb: {
      enableServerless: false
      enableFreeTier: false
      backupType: 'Continuous'
      consistencyLevel: 'BoundedStaleness'
    }
    serviceBus: {
      sku: 'Premium'
      tier: 'Premium'
    }
    staticWebApp: {
      sku: 'Standard'
      tier: 'Standard'
    }
    storage: {
      sku: 'Standard_RAGRS'
      tier: 'Standard'
    }
    redis: {
      sku: 'Premium'
      family: 'P'
      capacity: 1
    }
  }
}

// Scaling configurations
var scalingConfigurations = {
  development: {
    minInstances: 1
    maxInstances: 2
    scaleOutCpuThreshold: 80
    scaleInCpuThreshold: 20
  }
  staging: {
    minInstances: 1
    maxInstances: 5
    scaleOutCpuThreshold: 70
    scaleInCpuThreshold: 30
  }
  production: {
    minInstances: 2
    maxInstances: 10
    scaleOutCpuThreshold: 65
    scaleInCpuThreshold: 35
  }
}

// Security configurations
var securityConfigurations = {
  development: {
    enableHttps: true
    minTlsVersion: '1.2'
    enablePrivateEndpoints: false
    enableFirewall: false
    enableAdvancedThreatProtection: false
  }
  staging: {
    enableHttps: true
    minTlsVersion: '1.2'
    enablePrivateEndpoints: false
    enableFirewall: true
    enableAdvancedThreatProtection: true
  }
  production: {
    enableHttps: true
    minTlsVersion: '1.2'
    enablePrivateEndpoints: true
    enableFirewall: true
    enableAdvancedThreatProtection: true
  }
}

// Backup and retention configurations
var backupConfigurations = {
  development: {
    retentionDays: 7
    backupEnabled: false
    geoRedundantBackup: false
  }
  staging: {
    retentionDays: 30
    backupEnabled: true
    geoRedundantBackup: false
  }
  production: {
    retentionDays: 90
    backupEnabled: true
    geoRedundantBackup: true
  }
}

// Cost optimization features
var costOptimizations = {
  development: {
    enableAutoShutdown: true
    shutdownTime: '19:00'
    startupTime: '07:00'
    enableSpotInstances: true
    enableBurstableCompute: true
  }
  staging: {
    enableAutoShutdown: false
    shutdownTime: ''
    startupTime: ''
    enableSpotInstances: false
    enableBurstableCompute: true
  }
  production: {
    enableAutoShutdown: false
    shutdownTime: ''
    startupTime: ''
    enableSpotInstances: false
    enableBurstableCompute: false
  }
}

// Outputs
output skuConfig object = skuConfigurations[environmentName]
output scalingConfig object = scalingConfigurations[environmentName]
output securityConfig object = securityConfigurations[environmentName]
output backupConfig object = backupConfigurations[environmentName]
output costConfig object = costOptimizations[environmentName]