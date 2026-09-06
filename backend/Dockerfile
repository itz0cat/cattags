# Multi-stage Dockerfile for CatTags Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --workspace=shared --workspace=backend

# Copy source
COPY shared ./shared
COPY backend ./backend

# Build shared library and backend
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Run as non-root user
USER node

# Copy built artifacts and production dependencies
COPY --chown=node:node package*.json ./
COPY --chown=node:node shared/package*.json ./shared/
COPY --chown=node:node backend/package*.json ./backend/

COPY --from=builder --chown=node:node /app/shared/dist ./shared/dist
COPY --from=builder --chown=node:node /app/backend/dist ./backend/dist
COPY --from=builder --chown=node:node /app/backend/src/db/migrations ./backend/dist/db/migrations
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/backend/node_modules ./backend/node_modules

WORKDIR /app/backend

EXPOSE 8080

CMD ["node", "dist/index.js"]
