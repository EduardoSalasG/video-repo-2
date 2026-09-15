# Changelog

Todos los cambios notables de este proyecto se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el versionado sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added

- Versión de la app visible al pie de la vista de Configuración.

### Changed

- Build del frontend con `manualChunks` (react/mui/framer-motion separados del bundle principal para mejor caching y carga paralela).
- Configuración de Prisma migrada de `package.json#prisma` (deprecado) a `prisma.config.ts`.

## [1.1.0] - 2026-09-15

### Added

- Reordenamiento de módulos y secciones con drag-and-drop (dnd-kit), con handle visible y soporte de teclado.
- Endpoints `PATCH /courses/:courseId/modules/reorder` y `PATCH /modules/:moduleId/sections/reorder` con validación de pertenencia exacta.
- `orderIndex` auto-append al crear módulos y secciones.
- Feedback de error visible en el diálogo de confirmación al fallar una acción.
- Fallback humanizado en `getLabel` para nunca mostrar valores crudos `SNAKE_CASE`.
- Seeds separados por entorno: `seed.ts` (dev, con usuarios de prueba y contenido demo) y `seed.prod.ts` (solo base), compartiendo `seed.common.ts`.
- Contenido demo de desarrollo: 3 cursos, 10 secciones, 9 videos externos (lorem.video), accesos y progreso de prueba.

### Changed

- Selects de cursos ordenados alfabéticamente (`localeCompare` español) en todos los formularios.
- Listas de módulos y secciones ordenadas por `orderIndex` en lugar de alfabéticamente por título.
- Eliminado el campo numérico "Orden" de los formularios de módulos y secciones.

### Fixed

- Las eliminaciones fallaban en el cliente al recibir respuestas HTTP con body vacío, aunque el borrado sí ocurría (afectaba a todos los deletes).
- Labels de parámetros crudos en la base de datos corregidos por migración (incluye typo legacy `BEGGINNER`).

### Security

- El seed de producción ya no crea usuarios de prueba (`instructor`/`student`); solo la base de plataforma y el admin.
