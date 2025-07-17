# FoodXchange Infrastructure

This directory contains the Azure Bicep templates and deployment scripts for the FoodXchange platform infrastructure.

## Architecture Overview

The infrastructure consists of:

### Frontend
- **Azure Static Web Apps** - Hosts the React application with global CDN
- **Azure CDN** - Additional CDN layer for optimized content delivery
- **Application Insights** - Frontend performance monitoring and analytics

### Backend
- **Azure App Service** - Hosts the Node.js API server
- **Azure Cosmos DB** - NoSQL database for application data
- **Azure Storage Account** - File storage for uploads
- **Azure Service Bus** - Message queue for async operations
- **Azure Key Vault** - Secure storage for secrets and certificates
- **Application Insights** - Backend monitoring and logging

## Prerequisites

1. **Azure CLI** - [Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
2. **Bicep** - Installed automatically with Azure CLI or [install separately](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/install)
3. **PowerShell** - For running deployment scripts (Windows) or use bash equivalent
4. **Azure Subscription** - With appropriate permissions to create resources

## Directory Structure

```
infrastructure/
├── main.bicep              # Main orchestrator template
├── deploy.ps1              # Deployment script
├── modules/
│   ├── frontend.bicep      # Frontend infrastructure module
│   └── backend.bicep       # Backend infrastructure module
└── parameters/
    ├── development.parameters.json
    ├── staging.parameters.json
    └── production.parameters.json
```

## Deployment

### 1. Quick Deploy

Deploy to development environment:
```powershell
./deploy.ps1 -Environment development
```

Deploy to staging:
```powershell
./deploy.ps1 -Environment staging
```

Deploy to production:
```powershell
./deploy.ps1 -Environment production
```

### 2. What-If Analysis

Preview changes before deployment:
```powershell
./deploy.ps1 -Environment staging -WhatIf
```

### 3. Validation Only

Validate templates without deploying:
```powershell
./deploy.ps1 -Environment production -ValidateOnly
```

### 4. Manual Deployment with Azure CLI

```bash
# Set variables
ENVIRONMENT=development
DEPLOYMENT_NAME=fdx-$ENVIRONMENT-$(date +%Y%m%d%H%M%S)

# Validate
az deployment sub validate \
  --name $DEPLOYMENT_NAME \
  --location eastus2 \
  --template-file main.bicep \
  --parameters parameters/$ENVIRONMENT.parameters.json

# Deploy
az deployment sub create \
  --name $DEPLOYMENT_NAME \
  --location eastus2 \
  --template-file main.bicep \
  --parameters parameters/$ENVIRONMENT.parameters.json
```

## Environment Configuration

### Development
- Cost-optimized SKUs
- Single region deployment
- Minimal redundancy
- Estimated cost: ~$80/month

### Staging
- Production-like configuration
- Single region deployment
- Standard SKUs
- Estimated cost: ~$129/month

### Production
- High availability configuration
- Zone redundancy where available
- Premium SKUs for critical services
- Continuous backups
- Estimated cost: ~$1,129/month

## Post-Deployment Configuration

### 1. Configure GitHub Secrets

After deployment, add these secrets to your GitHub repository:

```
AZURE_STATIC_WEB_APPS_API_TOKEN    # From deployment output
AZURE_CREDENTIALS                   # Service principal credentials
AZURE_RESOURCE_GROUP_[ENV]          # Resource group name
CDN_PROFILE_NAME_[ENV]              # CDN profile name
CDN_ENDPOINT_NAME_[ENV]             # CDN endpoint name
REACT_APP_API_URL_[ENV]             # Backend API URL
REACT_APP_WS_URL_[ENV]              # WebSocket URL
APP_INSIGHTS_KEY                    # Application Insights key
```

### 2. Configure Custom Domains

For staging and production environments:

1. Add CNAME record pointing to the Static Web App URL
2. Verify domain ownership in Azure Portal
3. Configure SSL certificate (automatic with Static Web Apps)

### 3. Set Up Monitoring

1. Access Application Insights in Azure Portal
2. Configure alerts for:
   - High error rates
   - Slow response times
   - Failed dependencies
   - Custom business metrics

### 4. Configure Backup Policy

For production:
1. Cosmos DB continuous backup is enabled automatically
2. Configure Storage Account lifecycle policies
3. Set up database export automation

## Troubleshooting

### Common Issues

1. **Deployment fails with "InvalidTemplate"**
   - Run validation to identify the specific error
   - Check parameter file syntax
   - Ensure all required parameters are provided

2. **"ResourceGroupNotFound" error**
   - The script creates the resource group automatically
   - Ensure you have subscription-level permissions

3. **"QuotaExceeded" error**
   - Check your subscription quotas
   - Consider using smaller SKUs for development

4. **Static Web App deployment token not found**
   - Check deployment outputs
   - Token is saved to `deployment-token-[env].txt`

### Getting Help

1. Check deployment logs:
   ```bash
   az deployment sub show \
     --name [deployment-name] \
     --query properties.error
   ```

2. View resource group activity log:
   ```bash
   az monitor activity-log list \
     --resource-group [rg-name] \
     --start-time [date]
   ```

## Security Considerations

1. **Managed Identities** - All services use managed identities where possible
2. **Network Security** - Private endpoints for production databases
3. **Encryption** - All data encrypted at rest and in transit
4. **Access Control** - RBAC configured with least privilege principle
5. **Secrets Management** - All secrets stored in Key Vault

## Cost Optimization

1. **Auto-scaling** - Configured for all environments
2. **Reserved Instances** - Consider for production workloads
3. **Dev/Test Pricing** - Available for non-production subscriptions
4. **Monitoring** - Set up cost alerts and budgets
5. **Resource Cleanup** - Delete unused preview environments

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   az bicep upgrade
   az extension update
   ```

2. **Review Security Center Recommendations**
3. **Monitor Cost Trends**
4. **Update SSL Certificates** (if using custom domains)
5. **Review and Rotate Access Keys**

### Disaster Recovery

1. **Backup Verification** - Test restore procedures monthly
2. **Failover Testing** - Validate geo-redundancy quarterly
3. **Runbook Updates** - Keep DR procedures current
4. **Contact Lists** - Maintain emergency contacts

## Contributing

When modifying infrastructure:

1. Always test in development first
2. Run validation and what-if analysis
3. Update documentation
4. Follow naming conventions
5. Add appropriate tags to new resources
6. Consider cost implications
7. Ensure security best practices

## Support

For issues or questions:
- Create an issue in the repository
- Contact the platform team
- Check Azure Service Health