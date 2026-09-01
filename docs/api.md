# API REST

La API del backend está documentada automáticamente con Swagger en `/api/docs` cuando el servidor está corriendo. Esta página ofrece un resumen por dominio. Para ejemplos completos importa la colección Postman: [`postman/dance-platform.postman_collection.json`](./postman/dance-platform.postman_collection.json).

## Convenciones

- **Base URL**: `{{apiUrl}}` (variable de entorno Postman), por defecto `http://localhost:3000` en desarrollo.
- **Autenticación**: cookie `httpOnly` llamada `access_token` emitida tras `POST /auth/login`.
- **Content-Type**: `application/json` para la mayoría de requests; `multipart/form-data` para subida de video.
- **Prefijo global**: ninguno; los controladores usan `@Controller` sin base global.

## Índice de endpoints

### Auth

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/register` | Registrar nuevo usuario | No |
| `POST` | `/auth/login` | Iniciar sesión y recibir cookie JWT | No |
| `POST` | `/auth/logout` | Cerrar sesión, limpiar cookie | Sí |
| `GET` | `/auth/me` | Devolver usuario autenticado | Sí |

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

> La cookie `access_token` se envía con `httpOnly`, `secure` en producción y `sameSite: lax`.

### Users

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| `GET` | `/users/:id` | Obtener usuario por ID | ADMIN o el propio usuario |
| `PATCH` | `/users/:id/role` | Cambiar rol de un usuario | ADMIN |

### Courses

| Método | Ruta | Descripción | Permiso requerido |
|--------|------|-------------|-------------------|
| `GET` | `/courses` | Listar todos los cursos | Autenticado |
| `GET` | `/courses/:courseId` | Detalle de un curso | READ en el curso |
| `POST` | `/courses` | Crear curso | ADMIN / INSTRUCTOR |
| `PATCH` | `/courses/:courseId` | Actualizar curso | MAINTAIN en el curso |
| `DELETE` | `/courses/:courseId` | Eliminar curso | MAINTAIN en el curso |
| `POST` | `/courses/:courseId/access` | Conceder acceso a usuario | MAINTAIN en el curso + ADMIN/INSTRUCTOR |

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
| `GET` | `/courses/:courseId/modules` | Listar módulos del curso | READ en el curso |
| `POST` | `/courses/:courseId/modules` | Crear módulo en curso | MAINTAIN en el curso |
| `GET` | `/modules/:moduleId` | Detalle de módulo | READ en el curso |
| `PATCH` | `/modules/:moduleId` | Actualizar módulo | MAINTAIN en el curso |
| `DELETE` | `/modules/:moduleId` | Eliminar módulo | MAINTAIN en el curso |

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
| `GET` | `/modules/:moduleId/sections` | Listar secciones del módulo | READ en el curso |
| `POST` | `/modules/:moduleId/sections` | Crear sección | MAINTAIN en el curso |
| `GET` | `/sections/:sectionId` | Detalle de sección | READ en el curso |
| `PATCH` | `/sections/:sectionId` | Actualizar sección | MAINTAIN en el curso |
| `DELETE` | `/sections/:sectionId` | Eliminar sección | MAINTAIN en el curso |

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
| `POST` | `/sections/:sectionId/videos` | Subir video y metadatos | MAINTAIN en el curso |

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
