# Despliegue

## Backend (Oracle Cloud)

El backend se empaqueta en una imagen Docker y se despliega mediante GitHub Actions cuando `main` cambia.

### Pipeline

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @dance-platform/backend test`
3. `pnpm --filter @dance-platform/backend build`
4. `docker build -f apps/backend/Dockerfile`
5. Push a `ghcr.io/eduardosalasg/dance-platform-backend`
6. Conexión SSH a la VM de Oracle
7. `docker compose pull backend` y `docker compose up -d --force-recreate --remove-orphans backend`
8. Health check en `http://127.0.0.1:3000/health` y validación anónima de `/auth/me` (401).
9. Recarga de Nginx y validación HTTPS.

### Base de datos

El backend ejecuta `prisma migrate deploy` y, si la base de datos está vacía, `prisma db seed` cada vez que arranca. No es necesario correr migraciones manualmente en la VM.

### Variables críticas

```env
DATABASE_URL=postgresql://...:5432/dance_platform
JWT_SECRET=<seguro>
CORS_ORIGIN=https://app.dance-platform.eduardosalasg.dev
VIDEO_STORAGE=local
VIDEO_STORAGE_LOCAL_PATH=/app/uploads
PORT=3000
```

## Frontend (Netlify)

El frontend se compila con `pnpm --filter @dance-platform/web build` y el directorio `apps/web/dist` se publica en Netlify.

### Configuración

El archivo `netlify.toml` en raíz define:

```toml
[build]
  command = "pnpm --filter @dance-platform/web build"
  publish = "apps/web/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Variables en Netlify

- `NODE_VERSION=22`
- `PNPM_VERSION=10.12.1`
- `VITE_API_URL=https://api.dance-platform.eduardosalasg.dev`

## Infraestructura local

Para desarrollo levanta PostgreSQL y MinIO:

```bash
pnpm stack:up
```

El backend se puede iniciar con `pnpm dev:backend` o `pnpm --filter @dance-platform/backend start:dev`.
