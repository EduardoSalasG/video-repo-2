# Documentación de Dance Platform

Bienvenido a la documentación del monorepo `dance-platform`, una plataforma de aprendizaje de baile con video bajo demanda.

## Estructura de la documentación

| Documento | Descripción |
|-----------|-------------|
| [`product.md`](./product.md) | Visión de producto, usuarios, propuestas de valor y flujos principales. |
| [`architecture.md`](./architecture.md) | Arquitectura hexagonal del backend, capas, adaptadores y decisiones técnicas. |
| [`processes.md`](./processes.md) | Diagramas Mermaid de flujos clave: auth, creación de contenido, subida de video, estudiante y CI/CD. |
| [`api.md`](./api.md) | Resumen de endpoints REST con métodos, rutas y ejemplos de request/response. |
| [`git-workflow.md`](./git-workflow.md) | Flujo de trabajo Git, convención de commits y merge a `main`. |
| [`deployment.md`](./deployment.md) | Despliegue backend (Docker + OCI), frontend (Netlify) y local. |
| [`postman/dance-platform.postman_collection.json`](./postman/dance-platform.postman_collection.json) | Colección Postman lista para importar, organizada por dominio. |

## Repositorio

- `apps/backend`: NestJS, Prisma, PostgreSQL, arquitectura hexagonal.
- `apps/web`: React, Vite, MUI, PWA.

## Cómo usar la colección Postman

1. Abre Postman.
2. Importa `postman/dance-platform.postman_collection.json`.
3. Crea un entorno con la variable `apiUrl`, por ejemplo `http://localhost:3000`.
4. Ejecuta `POST /auth/login` primero; la cookie `access_token` se gestiona automáticamente si activas el interceptor de cookies o Postman 10+.
