# Multi-stage Dockerfile for FDX Frontend

# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG REACT_APP_API_URL
ARG REACT_APP_ENVIRONMENT=production
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# Stage 3: Production
FROM nginx:alpine AS production
# Install curl for healthcheck
RUN apk add --no-cache curl
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built application
COPY --from=build /app/build /usr/share/nginx/html
# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
# Set ownership
RUN chown -R nodejs:nodejs /usr/share/nginx/html && \
    chown -R nodejs:nodejs /var/cache/nginx && \
    chown -R nodejs:nodejs /var/log/nginx && \
    chown -R nodejs:nodejs /etc/nginx/conf.d
# Create pid directory
RUN mkdir -p /var/run && \
    chown -R nodejs:nodejs /var/run
# Switch to non-root user
USER nodejs
# Expose port
EXPOSE 8080
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
# Start nginx
CMD ["nginx", "-g", "daemon off;"]