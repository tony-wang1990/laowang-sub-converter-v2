# Multi-stage build for optimal image size
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Install only production dependencies for server
RUN npm install --only=production

# Production stage - Nginx for frontend + Node for backend
FROM node:20-alpine

# Install nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Copy built frontend files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy server files and production dependencies
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Create nginx directories
RUN mkdir -p /run/nginx

# Expose ports (80 for nginx, 3000 for API)
EXPOSE 80 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
  echo 'sed -i "s/backend:3000/127.0.0.1:3000/g" /etc/nginx/http.d/default.conf' >> /app/start.sh && \
  echo 'node --import tsx/esm server/index.ts &' >> /app/start.sh && \
  echo 'nginx -g "daemon off;"' >> /app/start.sh && \
  chmod +x /app/start.sh

CMD ["/app/start.sh"]
