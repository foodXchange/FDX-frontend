# GitHub Actions Workflows

This directory contains all GitHub Actions workflows for the FDX Frontend project.

## Workflows Overview

### 1. CI/CD Pipeline (`ci.yml`)
**Triggers:** Push to main/develop/feature branches, Pull Requests

**Jobs:**
- **Quality Checks**: ESLint, TypeScript checking, Prettier formatting
- **Build & Test**: Multi-version Node.js testing with coverage
- **Security Scanning**: npm audit, Snyk, OWASP dependency check
- **Performance Testing**: Bundle analysis, Lighthouse CI
- **Deploy Preview**: Automatic preview deployments for PRs
- **Semantic Release**: Automated versioning and changelog
- **Notifications**: Slack notifications and issue creation on failure

### 2. PR Automation (`pr-automation.yml`)
**Triggers:** Pull request events, comments

**Features:**
- Auto-labeling based on file changes
- PR size labeling
- PR quality checks (description, linked issues)
- Auto-assign reviewers
- Generate PR summary
- Dependency review
- Command handling (/rebase, /update-snapshots, /deploy-preview)

### 3. CodeQL Analysis (`codeql-analysis.yml`)
**Triggers:** Push to main/develop, PRs, Weekly schedule

**Features:**
- JavaScript/TypeScript security analysis
- Extended security queries
- Automated security alerts

### 4. Deploy to Production (`deploy.yml`)
**Triggers:** Push to main, Manual dispatch

**Features:**
- Pre-deployment validation
- Multi-environment support
- Azure Web App deployment
- AWS S3/CloudFront deployment (optional)
- Smoke tests
- Deployment notifications
- Automatic tagging

### 5. Release Management (`release.yml`)
**Triggers:** Version tags (v*), Manual dispatch

**Features:**
- Automated changelog generation
- GitHub release creation
- Docker image building and pushing
- Documentation updates
- Multi-platform notifications

## Required Secrets

Configure these secrets in your repository settings:

### General
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `SLACK_WEBHOOK`: Slack webhook URL for notifications

### Security Scanning
- `SNYK_TOKEN`: Snyk authentication token
- `CODECOV_TOKEN`: Codecov upload token

### Deployment - Azure
- `AZURE_WEBAPP_NAME`: Azure Web App name
- `AZURE_WEBAPP_PUBLISH_PROFILE`: Azure publish profile
- `AZURE_RESOURCE_GROUP`: Azure resource group name
- `AZURE_CDN_PROFILE`: Azure CDN profile name
- `AZURE_CDN_ENDPOINT`: Azure CDN endpoint name
- `AZURE_AI_ENDPOINT`: Azure AI service endpoint

### Deployment - AWS (Optional)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `S3_BUCKET_NAME`: S3 bucket name
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID

### Docker Registry
- `DOCKER_USERNAME`: DockerHub username
- `DOCKER_PASSWORD`: DockerHub password

### API URLs
- `PROD_API_URL`: Production API URL
- `PROD_URL`: Production frontend URL
- `PREVIEW_API_URL`: Preview environment API URL

### Vercel (Optional)
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### NPM (Optional)
- `NPM_TOKEN`: NPM authentication token for package publishing

### Social Media (Optional)
- `TWITTER_CONSUMER_KEY`: Twitter API consumer key
- `TWITTER_CONSUMER_SECRET`: Twitter API consumer secret
- `TWITTER_ACCESS_TOKEN`: Twitter access token
- `TWITTER_ACCESS_TOKEN_SECRET`: Twitter access token secret

## Configuration Files

### `.github/labeler.yml`
Configures automatic PR labeling based on file paths.

### `.github/auto-assign.yml`
Configures automatic reviewer assignment for PRs.

### `.github/dependabot.yml`
Configures Dependabot for dependency updates.

### `.github/PULL_REQUEST_TEMPLATE.md`
Template for pull request descriptions.

### `.github/ISSUE_TEMPLATE/`
Templates for bug reports and feature requests.

## Best Practices

1. **Branch Protection**: Enable branch protection rules for main/develop
2. **Required Checks**: Make CI checks required before merging
3. **Secrets Rotation**: Regularly rotate sensitive secrets
4. **Monitoring**: Set up alerts for workflow failures
5. **Cost Management**: Monitor Actions usage to control costs

## Workflow Commands

### PR Commands (for collaborators)
- `/rebase` - Rebase PR with main branch
- `/update-snapshots` - Update test snapshots
- `/deploy-preview` - Deploy preview environment

### Manual Workflow Triggers
```bash
# Trigger deployment
gh workflow run deploy.yml -f environment=staging

# Create release
gh workflow run release.yml -f version=v1.2.3
```

## Troubleshooting

### Common Issues

1. **Workflow not triggering**
   - Check branch names match workflow triggers
   - Verify YAML syntax
   - Check repository permissions

2. **Build failures**
   - Review Node.js version compatibility
   - Check for missing environment variables
   - Verify dependencies are installed

3. **Deployment failures**
   - Verify secrets are correctly set
   - Check deployment service status
   - Review deployment logs

### Debug Mode

Enable debug logging by setting these secrets:
- `ACTIONS_STEP_DEBUG`: true
- `ACTIONS_RUNNER_DEBUG`: true

## Contributing

When adding new workflows:
1. Follow existing naming conventions
2. Document all required secrets
3. Add workflow to this README
4. Test in a fork before merging
5. Monitor initial runs after deployment