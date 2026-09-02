# API REST

La API del backend está documentada automáticamente con Swagger en `/api/docs` cuando el servidor está corriendo. Esta página ofrece un resumen por dominio. Para ejemplos completos importa la colección Postman: [`postman/dance-platform.postman_collection.json`](./postman/dance-platform.postman_collection.json).

## Convenciones

- **Base URL**: `{{apiUrl}}` (variable de entorno Postman), por defecto `http://localhost:3000/api` en desarrollo.
- **Autenticación**: cookie `httpOnly` llamada `access_token` emitida tras `POST /api/auth/login`.
- **Content-Type**: `application/json` para la mayoría de requests; `multipart/form-data` para subida de video.
- **Prefijo global**: `/api`.

## Índice de endpoints

### Auth

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario | No |
| `POST` | `/api/auth/login` | Iniciar sesión y recibir cookie JWT | No |
| `POST` | `/api/auth/logout` | Cerrar sesión, limpiar cookie | Sí |
| `GET` | `/api/auth/me` | Devolver usuario autenticado | Sí |

#### Ejemplo login

**Request:**

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "userId": "...",
  "email": "student@example.com",
  "role": "STUDENT"
}
```

> La cookie `access_token` se envía con `httpOnly`, `secure` en producción y `sameSite` configurable (`lax` local, `none` entre orígenes distintos).

### Users

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/api/users/:id` | Obtener usuario por ID | ADMIN o el propio usuario |
| `GET` | `/api/users/:id/accesses` | Listar accesos de un usuario | ADMIN / INSTRUCTOR |
| `DELETE` | `/api/users/:id/accesses/:courseId` | Revocar acceso a un curso | ADMIN / INSTRUCTOR |
| `PATCH` | `/api/users/:id/role` | Cambiar rol de un usuario | ADMIN |

### Courses

| Método | Ruta | Descripción | Permiso requerido |
|--------|------|-------------|-------------------|
| `GET` | `/api/courses` | Listar cursos accesibles | Autenticado |
| `GET` | `/api/courses/:courseId` | Detalle de un curso | READ en el curso |
| `POST` | `/api/courses` | Crear curso | ADMIN / INSTRUCTOR |
| `PATCH` | `/api/courses/:courseId` | Actualizar curso | MAINTAIN en el curso |
| `DELETE` | `/api/courses/:courseId` | Eliminar curso | MAINTAIN en el curso |
| `POST` | `/api/courses/:courseId/access` | Conceder acceso a usuario | MAINTAIN en el curso + ADMIN/INSTRUCTOR |
| `GET` | `/api/courses/:courseId/progress` | Secciones completadas por el usuario | READ en el curso |

#### Ejemplo crear curso

```json
{
  "name": "Salsa On2 Avanzada",
  "description": "Figuras y timing avanzado de mambo on2."
}
```

### Modules

| Método | Ruta | Descripción | Permiso requerido |
|--------|------|-------------|-------------------|
| `GET` | `/api/courses/:courseId/modules` | Listar módulos del curso | READ en el curso |
| `POST` | `/api/courses/:courseId/modules` | Crear módulo en curso | MAINTAIN en el curso |
| `GET` | `/api/modules/:moduleId` | Detalle de módulo | READ en el curso |
| `PATCH` | `/api/modules/:moduleId` | Actualizar módulo | MAINTAIN en el curso |
| `DELETE` | `/api/modules/:moduleId` | Eliminar módulo | MAINTAIN en el curso |

#### Ejemplo crear módulo

```json
{
  "title": "Timing y contratiempo",
  "description": "Ejercicios de escucha musical.",
  "orderIndex": 1,
  "courseId": "..."
}
```

### Sections

| Método | Ruta | Descripción | Permiso requerido |
|--------|------|-------------|-------------------|
| `GET` | `/api/modules/:moduleId/sections` | Listar secciones del módulo | READ en el curso |
| `POST` | `/api/modules/:moduleId/sections` | Crear sección | MAINTAIN en el curso |
| `GET` | `/api/sections/:sectionId` | Detalle de sección | READ en el curso |
| `GET` | `/api/sections/:sectionId/progress` | Estado de visto del usuario | READ en el curso |
| `POST` | `/api/sections/:sectionId/progress` | Marcar sección como vista | READ en el curso |
| `PATCH` | `/api/sections/:sectionId` | Actualizar sección | MAINTAIN en el curso |
| `DELETE` | `/api/sections/:sectionId` | Eliminar sección | MAINTAIN en el curso |

#### Ejemplo crear sección

```json
{
  "title": "Ejercicio 1: pausa en 2",
  "description": "Practicar la pausa del 1 al 2.",
  "orderIndex": 0,
  "markdownContent": "## Instrucciones\n\n1. Escucha el clave.\n2. Pisa en 2...",
  "moduleId": "..."
}
```

### Videos

| Método | Ruta | Descripción | Permiso requerido |
|--------|------|-------------|-------------------|
| `POST` | `/api/sections/:sectionId/videos` | Subir video y metadatos | MAINTAIN en el curso |
| `POST` | `/api/sections/:sectionId/videos/link` | Vincular video por URL | MAINTAIN en el curso |
| `GET` | `/api/videos/:id/stream` | Stream protegido del video (X-Accel-Redirect / redirect) | READ en el curso |
| `GET` | `/api/videos/search?tags=salsa,on2` | Buscar videos cuyos metadatos contengan al menos uno de los tags (operador `hasSome`) | Autenticado (JWT) |

Este endpoint espera `multipart/form-data` con:

- Campo `video`: archivo de video (máximo 1 GB, `video/*`).
- Campos de metadatos: `difficulty`, `primaryStyle`, `videoType`, `durationCounts`, `steps`, `influences`, `tags`.

#### Ejemplo metadatos de video

```json
{
  "difficulty": "INTERMEDIATE",
  "primaryStyle": "MAMBO_ON2",
  "videoType": "STEP",
  "durationCounts": 8,
  "steps": ["pausa", "break", "giro"],
  "influences": ["Eddie Torres"],
  "tags": ["timing", "on2"]
}
```

#### Stream de video

**Request:**

```http
GET /api/videos/550e8400-e29b-41d4-a716-446655440000/stream
```

**Response (200 OK):**

En producción devuelve el header `X-Accel-Redirect`:

```http
X-Accel-Redirect: /_protected_videos/videos/550e8400-e29b-41d4-a716-446655440000.mp4
Content-Type: video/mp4
```

Nginx sirve el archivo internamente. En desarrollo redirige a `/uploads/videos/<uuid>.mp4`.

#### Ejemplo búsqueda por tags

**Request:**

```http
GET /api/videos/search?tags=salsa,on2
```

**Response (200 OK):**

```json
{
  "results": [
    {
      "course": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Salsa On2 Avanzada"
      },
      "module": {
        "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "title": "Timing y contratiempo"
      },
      "section": {
        "id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        "title": "Ejercicio 1: pausa en 2"
      },
      "metadata": {
        "difficulty": "INTERMEDIATE",
        "primaryStyle": "MAMBO_ON2",
        "videoType": "STEP",
        "tags": ["salsa", "on2"]
      }
    }
  ]
}
```

### Health

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/health` | Comprobar estado del servicio | No |

## Códigos de error comunes

| Código | Significado |
|--------|-------------|
| `400` | Validación fallida o campos incorrectos. |
| `401` | No autenticado o JWT inválido. |
| `403` | Sin rol o permisos suficientes. |
| `404` | Recurso no encontrado. |
| `409` | Conflicto, por ejemplo nombre de curso duplicado. |
| `413` | Archivo de video demasiado grande (> 1 GB). |

## Colección Postman

Para probar todos los endpoints con variables y ejemplos de body, importa [`postman/dance-platform.postman_collection.json`](./postman/dance-platform.postman_collection.json).
