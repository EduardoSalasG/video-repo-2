# syntax=docker/dockerfile:1
FROM node:22-slim AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @dance-platform/backend db:generate
RUN pnpm --filter @dance-platform/backend build

FROM node:22-slim AS runtime

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

WORKDIR /app
ENV NODE_ENV=production
ENV VIDEO_STORAGE_LOCAL_PATH=/data/video-repo

COPY pnpm-workspace.yaml package.json ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "apps/backend/dist/src/main.js"]
