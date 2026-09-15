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
pnpm db:seed        # dev: base + usuarios de prueba + contenido demo
pnpm db:seed:prod   # prod: solo base (roles, params, permisos, steps, admin)
```

Los seeds comparten `prisma/seed.common.ts`. `prisma/seed.ts` es el entry de dev (incluye `seed.demo.ts` con cursos/videos de prueba); `prisma/seed.prod.ts` es el que corre el deploy en producción.

## Reglas

- Mantener arquitectura hexagonal en backend.
- No usar `any` ni `@ts-ignore`.
- Cualquier cambio de esquema requiere `prisma migrate dev`.
- UI mobile-first y accesible; reutilizar átomos/moléculas en `apps/web/src/ui`.
- No exponer secrets, JWTs ni hashes en logs o respuestas.
- Flujo Git: `main` solo recibe versiones estables. Toda feature/hotfix se hace en `feature/*`, se mergea a `dev` y se acumula ahí. Solo se promueve `dev` a `main` cuando se acuerde una versión estable.
- Siempre volver a `dev` después de mergear/promover a `main` (no quedarse parado en `main`).
- Paralelizar trabajos con subagentes cuando sea posible (tareas independientes, sin estado compartido ni dependencias secuenciales).
- Después de cada push a `main`, lanzar un subagente en background con el perfil `deploy-monitor` (`.devin/agents/deploy-monitor.md`, modelo `swe-1-7-medium`) para supervisar el deploy (GitHub Actions → imagen Docker → VM Oracle → health check de `https://api.video-repo.eduardosalasg.dev/api/health`).
- NUNCA incluir a Devin como coautor ni firma en los commits (sin `Co-Authored-By` ni `Generated with`). Los mensajes de commit llevan solo el mensaje descriptivo.
