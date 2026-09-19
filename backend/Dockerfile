FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Install all deps (copies package files first for cache efficiency)
COPY package.json ./
COPY prisma ./prisma

RUN npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-retries 5 \
    && npm install --network-timeout=100000

COPY . .

# Generate Prisma client then build TypeScript
RUN npx prisma generate && npm run build

# ── Stage 2: Runner ───────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for Prisma client on Alpine
RUN apk add --no-cache openssl curl

ENV NODE_ENV=production
ENV PORT=4000

# Create persistent database folder
RUN mkdir -p /data

# Copy only what's needed at runtime
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json .

# Expose API + WebSocket port
EXPOSE 4000

# Entrypoint: run migrations then start
CMD sh -c "npx prisma db push --accept-data-loss && node dist/server.js"