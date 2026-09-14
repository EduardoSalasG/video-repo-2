## Purpose

Superficie de administración para usuarios ADMIN e INSTRUCTOR: gestión de
contenido (cursos, módulos, secciones, videos), usuarios y accesos, y
parámetros del catálogo, con confirmaciones en acciones destructivas,
feedback de errores visible y accesibilidad WCAG 2.2 AA.

## Requirements

### Requirement: Navegación y acceso por permisos

El panel SHALL mostrar en la navegación únicamente las secciones para las que
el usuario autenticado tiene permiso, y MUST bloquear el acceso directo por
URL a cualquier subvista sin el permiso correspondiente.

La navegación SHALL ser un landmark `nav` con etiqueta accesible, los items
MUST ser enlaces reales (href) y el item activo MUST exponer
`aria-current="page"`.

#### Scenario: Usuario sin permiso de panel

WHEN un usuario autenticado sin `admin.panel.access` visita `/admin`
THEN ve un mensaje explícito de falta de permiso (no una redirección
silenciosa)

#### Scenario: Usuario sin permiso de subvista

WHEN un usuario con `admin.panel.access` navega por URL a una subvista cuyo
permiso no posee
THEN la subvista muestra un mensaje de "sin permiso" y no ejecuta llamadas de
datos de esa sección

#### Scenario: Item activo anunciado

WHEN un usuario de lector de pantalla navega el menú del panel
THEN el item de la ruta actual se anuncia como página actual
(`aria-current="page"`) y cada enlace tiene nombre accesible

### Requirement: Confirmación de acciones destructivas

Toda acción que elimine o revoque datos (curso, módulo, sección, paso,
parámetro, acceso de usuario) MUST requerir confirmación explícita mediante
un diálogo que nombre la entidad afectada y, cuando aplique, el impacto en
cascada.

#### Scenario: Borrar curso

WHEN el usuario pulsa "Eliminar" en un curso
THEN se abre un diálogo que nombra el curso y advierte el borrado en cascada
de sus módulos, secciones y videos; el borrado solo ocurre al confirmar

#### Scenario: Revocar acceso

WHEN el usuario pulsa revocar el acceso de un usuario a un curso
THEN un diálogo confirma usuario y curso antes de ejecutar la revocación

### Requirement: Concesión de acceso con nivel seleccionable

El formulario de acceso a cursos MUST permitir elegir el nivel de acceso
entre los niveles activos del catálogo (`accessLevels`), y SHALL enviar el
nivel elegido al backend.

#### Scenario: Conceder acceso READ

WHEN el usuario selecciona un usuario, un curso y el nivel READ y confirma
THEN el sistema registra el acceso con nivel READ y el acceso aparece en la
lista del usuario

#### Scenario: Error de concesión visible

WHEN la concesión falla (duplicado, permiso insuficiente, error de red)
THEN se muestra un mensaje de error visible anunciado a lectores de pantalla

### Requirement: Feedback de validación de formularios

Todo campo inválido MUST mostrar su error junto al campo, marcado
visualmente (`error`) y asociado programáticamente (`aria-invalid` +
`aria-describedby` o `helperText`). Los errores no ligados a un campo MUST
mostrarse en una región de error del formulario anunciada con `role="alert"`.
Los campos obligatorios MUST declararse (`required`).

#### Scenario: Submit con campo faltante

WHEN el usuario envía un formulario sin un campo obligatorio
THEN el campo se marca en error, el mensaje aparece junto a él y es leído al
enfocarlo

#### Scenario: Error de servidor

WHEN el backend rechaza un submit
THEN el mensaje aparece en la región de error del formulario, nunca
atribuido a un campo sin relación

### Requirement: Conservación de contexto en altas jerárquicas

Tras crear una entidad hija (módulo, sección, video), el sistema MUST
conservar la selección de sus entidades padre para que el usuario vea lo
creado y pueda encadenar altas sin re-seleccionar.

#### Scenario: Crear dos módulos seguidos

WHEN el usuario crea un módulo dentro de un curso seleccionado
THEN el curso permanece seleccionado, el módulo nuevo aparece en la lista y
el formulario queda listo para otro alta

### Requirement: Estados de datos por vista

Cada vista que cargue datos MUST distinguir los estados cargando, vacío,
error y éxito; el estado de error MUST ofrecer reintento. Un fallo de carga
NUNCA debe ser indistinguible de una lista vacía.

#### Scenario: Error de carga

WHEN la carga de una lista falla
THEN la vista muestra un estado de error con acción de reintento, distinto
del estado vacío

#### Scenario: Doble submit

WHEN el usuario envía un formulario
THEN el botón de submit queda deshabilitado con indicador de progreso hasta
que la operación termina

### Requirement: Accesibilidad del panel

El panel MUST cumplir WCAG 2.2 AA: cada subvista SHALL tener un `h1` y un
`document.title` descriptivo; todo control solo-ícono MUST tener nombre
accesible; los inputs de archivo MUST tener etiqueta programática; el texto
MUST mantener contraste ≥4.5:1 (≥3:1 para texto grande e indicadores); todo
flujo MUST ser operable solo con teclado, incluidos estados deshabilitados
reales (no solo visuales).

#### Scenario: Operación por teclado en lista de parámetros

WHEN un usuario navega por teclado una lista de parámetros
THEN puede activar editar y eliminar y escuchar el nombre de cada acción y
del elemento afectado

#### Scenario: Control deshabilitado

WHEN una sección se presenta como deshabilitada (rol superusuario)
THEN sus controles están realmente deshabilitados (`disabled`), no solo
atenuados

### Requirement: Gestión de usuarios

La vista de usuarios SHALL listar usuarios (búsqueda con resultados
iniciales), mostrar sus accesos a cursos y permitir las mutaciones solo a
quien tenga el permiso que el backend exige: cambio de rol con
`admin.users.manage`; concesión/revocación de acceso con
`content.access.manage`.

#### Scenario: Instructor sin permiso de gestión

WHEN un usuario con `admin.users.view` pero sin `admin.users.manage` abre la
vista de usuarios
THEN ve la lista y los accesos, pero los controles de cambio de rol no se
muestran o están deshabilitados

#### Scenario: Acceso por curso del usuario

WHEN se selecciona un usuario
THEN se listan sus accesos con curso y nivel, y cada revocación pasa por
confirmación

### Requirement: Gestión de la jerarquía de contenido

El panel SHALL permitir crear, editar y eliminar cursos, módulos y secciones,
y subir o enlazar videos con sus metadatos (dificultad, estilo, tipo, pasos,
influencias, etiquetas). Las vistas hijas MUST mostrar el contexto de la
entidad padre seleccionada.

#### Scenario: Upload con progreso y cancelación

WHEN el usuario sube un archivo de video
THEN ve progreso real determinado, puede cancelar la subida, y el resultado
(éxito o error) se anuncia

#### Scenario: Contexto del padre visible

WHEN el usuario está en la vista de secciones con un módulo seleccionado
THEN la vista indica el curso y módulo padres del contexto actual
