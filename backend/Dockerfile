# ── Stage 1: Builder ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps (copies package files only first for cache efficiency)
COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm ci --omit=dev && npm i --save-dev typescript tsx prisma

COPY . .

# Generate Prisma client then build TypeScript
RUN npx prisma generate && npm run build

# ── Stage 2: Runner ───────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy only what's needed at runtime
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json .

# Expose API + WebSocket port
EXPOSE 4000

# Entrypoint: run migrations then start
CMD sh -c "npx prisma db push --accept-data-loss && node dist/server.js"
