# Procesos

Este documento describe los principales flujos del sistema mediante diagramas Mermaid.

## Arquitectura general

```mermaid
flowchart TB
    subgraph Cliente
        Web[App Web React PWA]
    end

    subgraph Infraestructura
        Nginx[Reverse Proxy / CDN]
        Docker[Docker Backend]
    end

    subgraph Backend
        C[Controllers HTTP]
        G[Guards JWT / Roles / CourseAccess]
        S[Application Services]
        A[Prisma Adapter]
        ST[Storage Adapter]
        D[(PostgreSQL)]
    end

    Web -->|HTTPS / Cookie JWT| Nginx
    Nginx -->|Proxy Pass| Docker
    Docker --> C
    C --> G
    G --> S
    S --> A
    S --> ST
    A --> D
```

## Flujo de autenticación

```mermaid
sequenceDiagram
    participant C as Cliente
    participant Auth as AuthController
    participant S as AuthService
    participant DB as Prisma/PostgreSQL

    C->>Auth: POST /auth/register
    Auth->>S: register(dto)
    S->>DB: crear usuario con hash
    DB-->>S: usuario creado
    S-->>Auth: usuario sin password
    Auth-->>C: 201 Created

    C->>Auth: POST /auth/login {email, password}
    Auth->>S: login(email, password)
    S->>DB: buscar usuario
    DB-->>S: usuario + hash
    S->>S: verificar contraseña
    S->>S: generar JWT
    S-->>Auth: {user, token}
    Auth->>Auth: set cookie httpOnly access_token
    Auth-->>C: 200 OK + user

    C->>Auth: GET /auth/me
    Auth->>Auth: JwtAuthGuard lee cookie
    Auth-->>C: {userId, email, role}
```

## Creación de curso / módulo / sección

```mermaid
sequenceDiagram
    participant C as Cliente (admin/instructor)
    participant CC as CoursesController
    participant MC as ModulesController
    participant SC as SectionsController
    participant S as Service
    participant DB as PostgreSQL

    C->>CC: POST /courses {name, description}
    CC->>S: CourseService.create
    S->>DB: insert Course
    DB-->>S: Course creado
    S-->>CC: Course
    CC-->>C: 201 Created

    C->>MC: POST /courses/{courseId}/modules {title, orderIndex}
    MC->>S: ModuleService.create
    S->>DB: insert Module con courseId
    DB-->>S: Module creado
    S-->>MC: Module
    MC-->>C: 201 Created

    C->>SC: POST /modules/{moduleId}/sections {title, markdownContent}
    SC->>S: SectionService.create
    S->>DB: insert Section con moduleId
    DB-->>S: Section creada
    S-->>SC: Section
    SC-->>C: 201 Created
```

## Subida de video y metadatos

```mermaid
sequenceDiagram
    participant C as Cliente (admin/instructor)
    participant VC as VideosController
    participant VS as VideoService
    participant ST as Storage Adapter
    participant A as Prisma Adapter
    participant DB as PostgreSQL

    C->>VC: POST /sections/{sectionId}/videos multipart/form-data
    Note over C,VC: video file + dificultad + estilo + tipo + tags etc.
    VC->>VS: upload(sectionId, file, metadata)
    VS->>ST: guardar archivo (local/S3)
    ST-->>VS: storageKey
    VS->>A: crear VideoFile + VideoMetadata
    A->>DB: insert en video_files y video_metadata
    DB-->>A: registros creados
    A-->>VS: {VideoFile, VideoMetadata}
    VS-->>VC: 201 Created
    VC-->>C: respuesta
```

## Flujo de estudiante

```mermaid
sequenceDiagram
    participant C as Cliente (student)
    participant CC as CoursesController
    participant MC as ModulesController
    participant SC as SectionsController
    participant G as CourseAccessGuard
    participant DB as PostgreSQL

    C->>CC: GET /courses
    CC->>DB: listar cursos con acceso
    DB-->>CC: lista de cursos
    CC-->>C: Courses[]

    C->>CC: GET /courses/{courseId}
    CC->>G: verificar CourseAccess
    G->>DB: consultar accessLevel
    DB-->>G: READ / WRITE / MAINTAIN
    G-->>CC: permitir
    CC->>DB: detalle del curso
    DB-->>CC: Course
    CC-->>C: Course

    C->>MC: GET /courses/{courseId}/modules
    MC->>G: verificar READ
    G-->>MC: permitir
    MC->>DB: listar módulos
    DB-->>MC: Modules[]
    MC-->>C: Modules[]

    C->>SC: GET /modules/{moduleId}/sections
    SC->>G: verificar READ
    G-->>SC: permitir
    SC->>DB: listar secciones
    DB-->>SC: Sections[]
    SC-->>C: Sections[]
```

## Pipeline CI/CD y despliegue

```mermaid
flowchart LR
    A[Push a main] --> B[GitHub Actions]
    B --> C[Tests + Lint]
    C --> D[Build Docker]
    D --> E{Backend o Web?}
    E -->|Backend| F[Oracle Cloud Registry]
    E -->|Web| G[Netlify Build]
    F --> H[Oracle Cloud VM]
    G --> I[Netlify Deploy]
    H --> J[Backend en producción]
    I --> K[Frontend en producción]
    K --> L[Usuarios finales]
    J --> L
```
