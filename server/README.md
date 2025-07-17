# FDX Agent Server

## Deployment Guide

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Environment variables configured

### Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Run in production**
   ```bash
   npm start
   ```

### Deployment Options

#### 1. Azure App Service
```bash
# Using the deployment script
chmod +x deploy-azure.sh
./deploy-azure.sh
```

#### 2. Docker
```bash
# Build image
docker build -t fdx-agent-server .

# Run container
docker run -p 3001:3001 --env-file .env fdx-agent-server
```

#### 3. Heroku
```bash
# Create Heroku app
heroku create fdx-agent-server

# Deploy
git push heroku main
```

#### 4. Manual Deployment
1. Run `npm run build` to compile TypeScript
2. Upload these files/folders to your server:
   - `dist/` (compiled code)
   - `package.json`
   - `package-lock.json`
   - `uploads/` (create if missing)
   - `data/` (create if missing)
3. Run `npm ci --only=production` on the server
4. Set environment variables
5. Start with `node dist/index.js`

### Environment Variables

Create a `.env` file with:
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
# Add other required variables
```

### Post-Deployment

1. Verify the server is running at `/api/health`
2. Check logs for any errors
3. Configure your frontend to use the new server URL
4. Set up monitoring and alerts