# CanAI Platform Backend Dockerfile
# Root Dockerfile for Render deployment compatibility

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy backend package files first for better Docker layer caching
COPY backend/package-backend.json ./package.json

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy backend source code (only files that actually exist)
COPY backend/server.js ./

# Set correct permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port 10000 (Render compatible)
EXPOSE 10000

# Environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the server
CMD ["node", "server.js"] 