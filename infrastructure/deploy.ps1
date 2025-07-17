# FoodXchange Infrastructure Deployment Script
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$false)]
    [switch]$WhatIf,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Yellow "==========================================="
Write-ColorOutput Yellow "FoodXchange Infrastructure Deployment"
Write-ColorOutput Yellow "Environment: $Environment"
Write-ColorOutput Yellow "==========================================="

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-ColorOutput Green "✓ Azure CLI version: $($azVersion.'azure-cli')"
} catch {
    Write-ColorOutput Red "✗ Azure CLI is not installed. Please install it from https://aka.ms/installazurecli"
    exit 1
}

# Check if Bicep is installed
try {
    $bicepVersion = bicep --version
    Write-ColorOutput Green "✓ Bicep installed: $bicepVersion"
} catch {
    Write-ColorOutput Red "✗ Bicep is not installed. Installing now..."
    az bicep install
}

# Login to Azure if needed
$currentContext = az account show --output json 2>$null | ConvertFrom-Json
if (-not $currentContext) {
    Write-ColorOutput Yellow "→ Please login to Azure..."
    az login
}

# Set subscription if provided
if ($SubscriptionId) {
    Write-ColorOutput Yellow "→ Setting subscription to: $SubscriptionId"
    az account set --subscription $SubscriptionId
}

# Get current subscription
$currentSub = az account show --output json | ConvertFrom-Json
Write-ColorOutput Green "✓ Using subscription: $($currentSub.name) ($($currentSub.id))"

# Validate Bicep files
Write-ColorOutput Yellow "→ Validating Bicep files..."
$bicepFiles = @("main.bicep", "modules/frontend.bicep", "modules/backend.bicep")
foreach ($file in $bicepFiles) {
    $filePath = Join-Path $PSScriptRoot $file
    bicep build $filePath
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "  ✓ $file is valid"
    } else {
        Write-ColorOutput Red "  ✗ $file has errors"
        exit 1
    }
}

# Set deployment parameters
$templateFile = Join-Path $PSScriptRoot "main.bicep"
$parametersFile = Join-Path $PSScriptRoot "parameters/$Environment.parameters.json"

if (-not (Test-Path $parametersFile)) {
    Write-ColorOutput Red "✗ Parameter file not found: $parametersFile"
    exit 1
}

# Generate deployment name
$deploymentName = "fdx-$Environment-$(Get-Date -Format 'yyyyMMddHHmmss')"

# Perform What-If analysis if requested
if ($WhatIf) {
    Write-ColorOutput Yellow "→ Running What-If analysis..."
    az deployment sub what-if `
        --name $deploymentName `
        --location eastus2 `
        --template-file $templateFile `
        --parameters $parametersFile `
        --output table
    exit 0
}

# Validate deployment
Write-ColorOutput Yellow "→ Validating deployment..."
$validation = az deployment sub validate `
    --name $deploymentName `
    --location eastus2 `
    --template-file $templateFile `
    --parameters $parametersFile `
    --output json | ConvertFrom-Json

if ($validation.error) {
    Write-ColorOutput Red "✗ Validation failed:"
    Write-ColorOutput Red $validation.error.message
    exit 1
} else {
    Write-ColorOutput Green "✓ Validation passed"
}

if ($ValidateOnly) {
    Write-ColorOutput Green "✓ Validation completed successfully"
    exit 0
}

# Confirm deployment
Write-ColorOutput Yellow ""
Write-ColorOutput Yellow "Ready to deploy to $Environment environment"
Write-ColorOutput Yellow "Deployment name: $deploymentName"
Write-ColorOutput Yellow ""
$confirmation = Read-Host "Do you want to proceed? (yes/no)"

if ($confirmation -ne "yes") {
    Write-ColorOutput Red "Deployment cancelled"
    exit 0
}

# Deploy infrastructure
Write-ColorOutput Yellow "→ Starting deployment..."
$deployment = az deployment sub create `
    --name $deploymentName `
    --location eastus2 `
    --template-file $templateFile `
    --parameters $parametersFile `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput Green "✓ Deployment completed successfully!"
    Write-ColorOutput Green ""
    Write-ColorOutput Green "Outputs:"
    Write-ColorOutput Green "  Resource Group: $($deployment.properties.outputs.resourceGroupName.value)"
    Write-ColorOutput Green "  Backend URL: $($deployment.properties.outputs.backendUrl.value)"
    Write-ColorOutput Green "  Frontend URL: $($deployment.properties.outputs.frontendUrl.value)"
    Write-ColorOutput Green "  CDN URL: $($deployment.properties.outputs.cdnUrl.value)"
    
    # Save deployment token for GitHub Actions
    $tokenFile = "deployment-token-$Environment.txt"
    $deployment.properties.outputs.staticWebAppDeploymentToken.value | Out-File $tokenFile
    Write-ColorOutput Yellow ""
    Write-ColorOutput Yellow "→ Static Web App deployment token saved to: $tokenFile"
    Write-ColorOutput Yellow "  Add this token to GitHub Secrets as AZURE_STATIC_WEB_APPS_API_TOKEN"
} else {
    Write-ColorOutput Red "✗ Deployment failed"
    exit 1
}

Write-ColorOutput Yellow ""
Write-ColorOutput Yellow "==========================================="
Write-ColorOutput Green "✓ Deployment completed!"
Write-ColorOutput Yellow "==========================================="