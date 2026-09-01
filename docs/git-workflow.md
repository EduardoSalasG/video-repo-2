# Flujo de trabajo Git (Gitflow simplificado)

Este repositorio sigue un flujo de integración basado en `main` y `dev` para mantener producción estable.

## Ramas

| Rama | Propósito | CI/CD |
|------|-----------|-------|
| `main` | Código estable listo para producción. Únicamente se promueve mediante merge desde `dev` o una release. | Sí: deploy backend en OCI y frontend en Netlify. |
| `dev` | Integración continua de features. Puede recibir merge directos de `feature/*`. | No: se ejecutan builds/verificaciones manuales o CI opcional. |
| `feature/*` | Desarrollo de una mejora concreta. Se crean desde `dev` y se mergean de vuelta a `dev`. | No. |
| `hotfix/*` | Correcciones urgentes sobre `main`; se mergean a `main` y `dev`. | Depende de la urgencia. |

## Convención de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` documentación
- `chore:` tareas de mantenimiento
- `refactor:` refactor sin cambio de comportamiento
- `test:` tests

## Proceso para añadir un cambio

1. Crea `feature/nombre` desde `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/nombre
   ```
2. Trabaja y commitea siguiendo Conventional Commits.
3. Asegura que el build y typecheck pasan:
   ```bash
   pnpm --filter @dance-platform/backend build
   pnpm --filter @dance-platform/web build
   ```
4. Mergea a `dev`:
   ```bash
   git checkout dev
   git merge --no-ff feature/nombre
   git push origin dev
   ```
5. Cuando `dev` esté estable, abre un PR o mergea directo a `main` para release:
   ```bash
   git checkout main
   git merge --no-ff dev
   git push origin main
   ```

## Notas

- `main` es la única rama con deploy automático.
- No se permite `prisma db push` en producción; todas las migraciones son versionadas y se aplican con `prisma migrate deploy`.
- Con cada cambio de API o arquitectura se actualiza `docs/api.md`, `docs/postman/` y los diagramas afectados.
