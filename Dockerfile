# ==========================================
# Multi-Stage Dockerfile for SmartPark System
# ==========================================

# Stage 1: Build Frontend Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Stage 2: Production Server Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install server production dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server application source
COPY server/ ./server/

# Copy compiled frontend assets from client-builder
COPY --from=client-builder /app/client/dist ./client/dist

# Expose backend service port
EXPOSE 5000

# Start unified production server
CMD ["node", "server/src/server.js"]
