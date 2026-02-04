# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install build tools for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Compile knexfile to JS
RUN npx tsc knexfile.ts --outDir dist-knex --esModuleInterop --module commonjs --resolveJsonModule --skipLibCheck

# Compile migrations to JS (--rootDir ensures flat output without nested directories)
RUN npx tsc --outDir dist-migrations --rootDir migrations --esModuleInterop --module commonjs --resolveJsonModule --skipLibCheck migrations/*.ts

# Production dependencies stage
FROM node:18-alpine AS deps

WORKDIR /app

# Install build tools for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user with specific UID/GID for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Create directories needed at runtime
RUN mkdir -p /app/logs /app/uploads && chown -R nodejs:nodejs /app

# Copy production dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Copy compiled knexfile and migrations (JS, not TS)
COPY --from=builder --chown=nodejs:nodejs /app/dist-knex/knexfile.js ./knexfile.js
COPY --from=builder --chown=nodejs:nodejs /app/dist-migrations/ ./migrations/

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run migrations then start server
CMD ["sh", "-c", "npx knex migrate:latest --knexfile knexfile.js --env production && node dist/index.js"]
