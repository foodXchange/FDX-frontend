#!/bin/bash

# Azure deployment script for FDX Agent Server

echo "🚀 Starting Azure deployment..."

# Configuration
RESOURCE_GROUP="fdx-resources"
APP_SERVICE_PLAN="fdx-plan"
APP_NAME="fdx-agent-server"
LOCATION="eastus"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

# Login to Azure
echo "📝 Logging into Azure..."
az login

# Create resource group if it doesn't exist
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan
echo "📋 Creating App Service plan..."
az appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux

# Create Web App
echo "🌐 Creating Web App..."
az webapp create --resource-group $RESOURCE_GROUP --plan $APP_SERVICE_PLAN --name $APP_NAME --runtime "NODE:18-lts"

# Configure app settings
echo "⚙️  Configuring app settings..."
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name $APP_NAME --settings \
    NODE_ENV=production \
    PORT=8080

# Deploy using ZIP deploy
echo "📤 Deploying application..."
npm run build
zip -r deploy.zip dist package*.json uploads data -x "*.log" -x ".env"
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src deploy.zip

# Clean up
rm deploy.zip

echo "✅ Deployment complete!"
echo "🌐 Your app is available at: https://$APP_NAME.azurewebsites.net"