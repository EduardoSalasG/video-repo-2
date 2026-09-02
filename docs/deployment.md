# Despliegue

## Backend (Oracle Cloud)

El backend se empaqueta en una imagen Docker y se despliega mediante GitHub Actions cuando `main` cambia.

### Pipeline

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @dance-platform/backend db:generate`
3. `pnpm --filter @dance-platform/backend test`
4. `pnpm --filter @dance-platform/backend build`
5. `docker build -f apps/backend/Dockerfile`
6. Push a `ghcr.io/eduardosalasg/dance-platform-backend`
7. Conexión SSH a la VM de Oracle
8. Se copia `apps/backend/docker-compose.yml` a `/opt/apps/video-repo/docker-compose.yml`
9. `cd /opt/apps/video-repo` y `docker compose pull backend`
10. `docker compose up -d --force-recreate --remove-orphans backend`
11. Health check en `http://127.0.0.1:3001/api/health` y validación anónima de `/api/auth/me` (401).
12. Recarga de Nginx y validación HTTPS.

### Base de datos

El backend ejecuta `prisma migrate deploy` y, si la base de datos está vacía, `prisma db seed` cada vez que arranca. No es necesario correr migraciones manualmente en la VM.

### Variables críticas

```env
DATABASE_URL=postgresql://...:5432/dance_platform
JWT_SECRET=<seguro>
CORS_ORIGIN=https://<frontend-domain>
VIDEO_STORAGE=local
VIDEO_STORAGE_LOCAL_PATH=/data/video-repo
PORT=3000
NODE_ENV=production
COOKIE_SAMESITE=none
COOKIE_SECURE=true
```

### Volumen de videos

El `docker-compose.yml` monta el host en el contenedor:

```yaml
volumes:
  - /mnt/video-repo:/data/video-repo
```

Los archivos se guardan con `storageKey` relativo, por ejemplo `videos/<uuid>.mp4`.

### Nginx (sugerencia)

```nginx
server {
    listen 443 ssl http2;
    server_name api.video-repo.eduardosalasg.dev;

    # SSL config...

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_protected_videos/ {
        internal;
        alias /mnt/video-repo/;
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
    }
}
```

El endpoint `GET /api/videos/:id/stream` devuelve `X-Accel-Redirect: /_protected_videos/videos/<uuid>.mp4` y Nginx sirve el archivo directamente.

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
- `VITE_API_URL=https://api.video-repo.eduardosalasg.dev/api`

## Infraestructura local

Para desarrollo levanta PostgreSQL y MinIO:

```bash
pnpm stack:up
```

El backend se puede iniciar con `pnpm dev:backend` o `pnpm --filter @dance-platform/backend start:dev`.

La URL de la API local es `http://localhost:3000/api`.
