# Arquitectura

## Visión general

El backend de `dance-platform` sigue una arquitectura hexagonal (ports & adapters) dentro de un monorepo pnpm. El objetivo es desacoplar la lógica de negocio de frameworks, bases de datos y servicios externos, facilitando pruebas, cambios de infraestructura y evolución del producto.

## Capas

```
┌─────────────────────────────────────────────────────────────┐
│                        Interfaces                           │
│  HTTP Controllers  │  Auth Guards  │  Swagger/OpenAPI       │
├─────────────────────────────────────────────────────────────┤
│                      Infrastructure                         │
│  Prisma Adapter  │  Storage Adapter  │  JWT/Cookie Adapter  │
├─────────────────────────────────────────────────────────────┤
│                       Application                           │
│  Services de aplicación (casos de uso)                      │
├─────────────────────────────────────────────────────────────┤
│                         Domain                              │
│  Entities  │  Enums  │  Value Objects  │  Domain Services   │
└─────────────────────────────────────────────────────────────┘
```

### 1. Domain

Contiene las reglas puras del negocio.

- **Entities**: `User`, `Course`, `Module`, `Section`, `VideoFile`, `VideoMetadata`, `CourseAccess`.
- **Enums**: `Role`, `AccessLevel`, `Difficulty`, `PrimaryStyle`, `VideoType`.
- **Ubicación**: `apps/backend/src/domain`.

No depende de frameworks ni librerías de infraestructura.

### 2. Application

Orquesta los casos de uso.

- **Services**: `AuthService`, `CourseService`, `CourseAccessService`, `ModuleService`, `SectionService`, `UserService`, `VideoService`.
- **Ports**: interfaces que definen los contratos de salida hacia la infraestructura.
- **Tokens**: inyección de dependencias simbólicas para mantener el desacoplamiento.
- **Ubicación**: `apps/backend/src/application`.

### 3. Infrastructure

Implementa los puertos definidos por la capa de aplicación.

- **HTTP controllers**: adaptadores REST (`apps/backend/src/infrastructure/http/controllers.ts`).
- **Auth**: guards JWT, roles, acceso a cursos (`JwtAuthGuard`, `RolesGuard`, `CourseAccessGuard`) y decorators (`CurrentUser`, `Roles`, `RequiredAccess`).
- **Prisma**: adaptador de persistencia contra PostgreSQL.
- **Storage**: abstracción para almacenamiento local o S3, usada por `VideoService`.

## Flujo de una request

1. El cliente envía una petición HTTP al NestJS controller.
2. Los guards validan JWT, roles y permisos de acceso al curso.
3. El controller convierte la request en DTOs y delega al `Application Service`.
4. El service aplica la lógica de negocio y usa los puertos de infraestructura.
5. Los adaptadores (Prisma, Storage) ejecutan operaciones de persistencia.
6. La respuesta regresa al controller y se serializa hacia el cliente.

## Adaptadores clave

### Prisma

- Provee acceso a datos PostgreSQL.
- Modelos principales: `User`, `Course`, `Module`, `Section`, `VideoFile`, `VideoMetadata`, `CourseAccess`.
- Relaciones cascada: eliminar un `Course` elimina sus `Module`, y eliminar un `Module` elimina sus `Section` y metadatos.

### Storage de video

- Soporta almacenamiento local en desarrollo y S3 en producción.
- El servicio de video almacena el archivo y crea un `VideoFile` junto con `VideoMetadata` asociado a una `Section`.

### Auth

- Autenticación con JWT guardado en cookie `httpOnly` llamada `access_token`.
- Validación de roles (`ADMIN`, `INSTRUCTOR`, `STUDENT`) mediante `RolesGuard`.
- Control de acceso a cursos con `CourseAccess` y niveles `READ`, `WRITE`, `MAINTAIN`.

## Decisiones técnicas

| Decisión | Motivación |
|----------|-----------|
| NestJS + TypeScript | Tipado estricto, inyección de dependencias y ecosistema maduro. |
| Arquitectura hexagonal | Aislar lógica de negocio de frameworks y facilitar tests. |
| Prisma | Mapeo tipo-seguro, migraciones y desarrollo rápido. |
| JWT en cookie httpOnly | Seguridad contra XSS; el frontend no accede al token. |
| PostgreSQL | Base de datos relacional robusta y gratuita. |
| React + Vite + MUI | Frontend rápido, componentes accesibles y PWA. |
| pnpm workspaces | Disco eficiente y scripts centralizados para el monorepo. |

## Stack de despliegue

- **Backend**: Oracle Cloud vía GitHub Actions y Docker.
- **Frontend**: Netlify.
- **Documentación API**: Swagger UI disponible en `/api/docs` cuando el backend está corriendo.
