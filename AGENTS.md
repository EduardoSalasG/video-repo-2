# AGENTS.md

## Proyecto

`dance-platform` es un monorepo pnpm con:

- `apps/backend`: NestJS 11, TypeScript, Prisma 6, PostgreSQL, arquitectura hexagonal.
- `apps/web`: React 19, Vite 6, TypeScript, MUI, PWA, diseño atómico.
- `apps/backend/prisma/`: esquema y migraciones Prisma.

## Comandos verificados

- Instalar: `pnpm install`
- Levantar dev: `pnpm dev` (backend + web)
- Build backend: `pnpm --filter @dance-platform/backend build`
- Build web: `pnpm --filter @dance-platform/web build`
- Verificar: `pnpm --filter <workspace> build`

## Base de datos local

```bash
pnpm stack:up
pnpm db:deploy
pnpm db:seed
```

## Reglas

- Mantener arquitectura hexagonal en backend.
- No usar `any` ni `@ts-ignore`.
- Cualquier cambio de esquema requiere `prisma migrate dev`.
- UI mobile-first y accesible; reutilizar átomos/moléculas en `apps/web/src/ui`.
- No exponer secrets, JWTs ni hashes en logs o respuestas.
- Flujo Git: `main` solo recibe versiones estables. Toda feature/hotfix se hace en `feature/*`, se mergea a `dev` y se acumula ahí. Solo se promueve `dev` a `main` cuando se acuerde una versión estable.
