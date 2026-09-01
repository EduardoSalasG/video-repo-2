# Producto

## Visión

`dance-platform` es una plataforma de aprendizaje de baile en línea que permite a instructores crear cursos estructurados en módulos y secciones, y a estudiantes acceder a lecciones de video clasificadas por estilo, dificultad y tipo de contenido.

## Propuesta de valor

- **Para estudiantes**: aprender salsa, bachata y estilos afines a su propio ritmo, con videos organizados, metadatos detallados y acceso personalizado a cursos.
- **Para instructores**: publicar contenido estructurado, controlar el acceso de alumnos y escalar su escuela digital.
- **Para administradores**: gestionar usuarios, roles y permisos de acceso a los cursos.

## Usuarios

### ADMIN

- Gestiona usuarios y sus roles.
- Puede crear, modificar y eliminar cualquier curso, módulo, sección o video.
- Concede acceso a cursos a otros usuarios.

### INSTRUCTOR

- Crea y mantiene cursos, módulos, secciones y videos.
- Concede acceso a los cursos que gestiona.
- No puede modificar roles de usuario ni eliminar usuarios.

### STUDENT

- Navega su biblioteca de cursos autorizados.
- Visualiza secciones y videos.
- Consulta metadatos del video (dificultad, estilo, pasos, influencias, tags).

## Flujos principales

1. **Registro e inicio de sesión**: el usuario crea una cuenta o inicia sesión; el backend emite una cookie JWT `httpOnly`.
2. **Gestión de contenido (admin/instructor)**:
   - Crear curso.
   - Añadir módulos al curso.
   - Añadir secciones a cada módulo.
   - Subir video y metadatos a una sección.
3. **Control de acceso**: el instructor/admin concede acceso a estudiantes con nivel `READ` para visualizar, `WRITE` para colaborar o `MAINTAIN` para editar.
4. **Consumo de contenido (estudiante)**:
   - Consulta lista de cursos autorizados.
   - Navega módulos y secciones.
   - Reproduce video y consulta metadatos.

## Modelo de contenido

```
Course
├── Module
│   ├── Section
│   │   ├── VideoFile
│   │   └── VideoMetadata
```

Cada curso se divide en módulos; cada módulo contiene secciones; cada sección puede tener un archivo de video y metadatos descriptivos.

## Metadatos de video

Los metadatos enriquecen la búsqueda y la experiencia de estudio:

- `difficulty`: BEGINNER, INTERMEDIATE, ADVANCED.
- `primaryStyle`: MAMBO_ON2, CASINO, SENSUAL_BACHATA, MODERN_BACHATA.
- `videoType`: STEP, SEQUENCE, CHOREOGRAPHY.
- `durationCounts`: duración en unidades de cuenta.
- `steps`: pasos incluidos.
- `influences`: influencias del estilo.
- `tags`: etiquetas libres.
