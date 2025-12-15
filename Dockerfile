# Dockerfile for production deployment
# Support Zeabur, VPS, and other container platforms

FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package and tsconfig files
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build frontend and compile backend
RUN npm run build && npm run build:server

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Create data directory
RUN mkdir -p /app/data

# Set port environment variable
ENV PORT=80

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:80/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run compiled JavaScript
CMD ["node", "dist-server/index.js"]
