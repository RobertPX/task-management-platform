FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]