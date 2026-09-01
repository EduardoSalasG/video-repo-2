# Dance Platform

Monorepo de la plataforma de educación de baile.

## Workspaces

- `apps/backend` — API NestJS + PostgreSQL
- `apps/web` — React + Vite PWA con MUI

## Requisitos

- Node.js >= 22
- pnpm >= 10
- Docker (para Postgres/MinIO local)

## Comandos

```bash
# Instalar dependencias
pnpm install

# Levantar backend y web en desarrollo
pnpm dev

# Build
pnpm --filter @dance-platform/backend build
pnpm --filter @dance-platform/web build

# Base de datos local
pnpm stack:up
pnpm db:deploy
pnpm db:seed
```

## Arquitectura

- Backend hexagonal: `domain`, `application`, `infrastructure`.
- Frontend atómico: `ui/atoms`, `ui/molecules`, `ui/organisms`, `ui/templates`, `ui/pages`.
- Storage de video con puerto `IVideoStorage` (local o S3).
- OpenSpec en `.devin/` para especificaciones.
