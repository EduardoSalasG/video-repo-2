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

## Versionamiento y releases

- SemVer `MAJOR.MINOR.PATCH`: MAJOR = cambio incompatible de API, datos, autenticación o comportamiento público (requiere migración); MINOR = funcionalidad nueva compatible hacia atrás; PATCH = corrección, seguridad, mantenimiento o documentación compatible. Prereleases deliberados: `-alpha.N`, `-beta.N`, `-rc.N`.
- Compuerta de release (antes de `dev → main`):
  1. Definir el incremento SemVer según el cambio acumulado en `dev`.
  2. Actualizar conjuntamente: versión en manifiestos, `CHANGELOG.md`, notas de release, documentación/Swagger/diagramas si cambian contratos, y versión visible del frontend.
  3. Ejecutar pruebas, build, QA y revisión de documentación.
  4. Tag Git anotado `vMAJOR.MINOR.PATCH` en el commit exacto de `main` que se despliega.
  5. Notas de release con: versión, tag, SHA, fecha, migraciones, riesgos y resultado de validaciones.
  6. Tras el push a `main`: supervisar CI/CD/deploy/health checks y sincronizar `main` de vuelta a `dev`.
- `CHANGELOG.md` en raíz siguiendo Keep a Changelog (`Unreleased`, `Added`, `Changed`, `Fixed`, `Security`, `Deprecated`, `Removed`). Al publicar, mover lo relevante a `## [X.Y.Z] - YYYY-MM-DD`. El changelog no reemplaza specs ni commits.
- OpenSpec: cada cambio no trivial comienza con propuesta, specs, diseño y tareas OpenSpec; al implementar, marcar checkboxes solo cuando comportamiento, pruebas y docs estén completos; al cerrar una release, archivar los cambios OpenSpec y sincronizar las specs base.
- Rollback: nunca re-desplegar un SHA informal ni mover tags publicados. Re-desplegar el artefacto inmutable del último tag sano, ejecutar health checks y QA mínima, documentar motivo/tag origen-destino/impacto/hora. Migraciones no reversibles → corrección hacia adelante o restauración documentada.
- Calidad: usar Codebase Memory antes de explorar estructura o impacto; Superpowers para discovery, diseño, TDD, debugging, plan y verificación; OpenSpec después de aprobar el plan y antes de implementar; frontend con Impeccable + Apple Design, mobile-first y accesible; mantener la documentación viva con cada cambio.
