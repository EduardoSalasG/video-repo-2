## Purpose

Superficie pública y de alumno de la plataforma: landing, autenticación
(login/registro), biblioteca de cursos, detalle de curso/sección con video,
búsqueda, perfil, configuración y manejo de rutas inexistentes — con
navegación accesible, estados de datos completos (cargando/vacío/error/
éxito con reintento), autenticación robusta y streaming de video sin
exponer el JWT en URLs.

## Requirements

### Requirement: Página 404 y manejo de rutas inexistentes

Toda URL que no corresponda a una ruta declarada MUST mostrar una página de
"No encontrado" explícita — nunca una redirección silenciosa. La página 404
MUST tener `h1`, `document.title` y enlaces de recuperación hacia `/app`
(usuarios autenticados) y `/`.

#### Scenario: URL inválida dentro de /app

WHEN un usuario autenticado visita `/app/ruta-inexistente`
THEN ve la página 404 dentro del layout de la app, con enlace a la
biblioteca — no es expulsado a la landing pública

#### Scenario: URL inválida fuera de la app

WHEN cualquier visitante accede a una URL no declarada
THEN ve la página 404 con opciones de navegación

### Requirement: Landmarks y navegación por teclado en la app

El layout de la app MUST exponer landmark `main` con skip link funcional
(destino enfocable con `tabIndex={-1}`) y el foco MUST moverse al contenido
tras cada navegación SPA. La navegación inferior MUST ser landmark `nav`
con `aria-label`, marcar el tab activo con `aria-current` y el disparador
de menú MUST exponer `aria-haspopup="menu"` y `aria-expanded`. Todas las
rutas `/app/*` MUST ser alcanzables desde la navegación en cualquier
viewport.

#### Scenario: Navegación por teclado en mobile

WHEN un usuario de teclado activa el tab "Más"
THEN el disparador anuncia que abre un menú y su estado expandido

#### Scenario: Ruta de detalle marca su tab

WHEN el usuario navega a `/app/courses/:id` o `/app/sections/:id`
THEN el tab "Cursos" aparece como actual (`aria-current`), no "Más"

### Requirement: Streaming de video sin token en URL

La reproducción de video MUST autenticarse mediante la cookie HttpOnly de
sesión, nunca mediante el JWT en query string. El backend MUST rechazar
`?access_token=` en endpoints de stream.

#### Scenario: Reproducción autenticada

WHEN un usuario con sesión válida reproduce un video
THEN la petición de stream autentica por cookie `access_token` (HttpOnly) y
la URL no contiene credenciales

#### Scenario: Stream sin sesión

WHEN una petición de stream llega sin credenciales o con `?access_token=`
como única credencial
THEN el backend responde 401

### Requirement: Autenticación coherente y recuperable

El sistema MUST mantener el estado de auth sincronizado: un 401 en
cualquier llamada MUST deslogear al usuario en la UI (no solo limpiar el
token); un error de red NO debe deslogear. El logout MUST completar el
estado local aunque la petición falle. Tras login, el usuario MUST volver a
la ruta que intentaba visitar (`location.state.from`).

#### Scenario: Deep link tras login

WHEN un usuario no autenticado intenta abrir `/app/sections/xyz`, es
redirigido a `/login` y se autentica
THEN es devuelto a `/app/sections/xyz`, no a `/app`

#### Scenario: Logout con red caída

WHEN el usuario cierra sesión y la petición de logout falla
THEN el estado local se limpia igualmente y el usuario queda deslogueado

#### Scenario: Register exitoso, login fallido

WHEN el registro crea la cuenta pero el login automático falla
THEN el usuario ve "Cuenta creada, inicia sesión" y es dirigido a login —
no un error de registro que induzca a reintentar (409)

### Requirement: Progreso de secciones completable

Toda sección MUST poder marcarse como vista independientemente de si tiene
video embebido, mediante una acción explícita del usuario además del
`onEnded` automático del reproductor.

#### Scenario: Sección sin video

WHEN una sección solo tiene contenido markdown o video enlazado
THEN el usuario puede marcarla como vista con un botón, y el estado
persiste vía `POST /sections/:id/progress`

### Requirement: Estados de datos en todas las vistas

Cada vista que cargue datos MUST distinguir cargando (skeleton o spinner),
vacío, error con reintento, y éxito. Los errores de formulario MUST usar
`FormError` (`role="alert"`); los errores de campo MUST asociarse al
control. Un fallo MUST ser distinguible de un resultado vacío.

#### Scenario: Error cargando secciones de un módulo

WHEN `GET /modules/:id/sections` falla al expandir un módulo
THEN el módulo muestra "No se pudieron cargar las secciones" con Reintentar
— no una lista vacía indistinguible

#### Scenario: Resultados de búsqueda accesibles

WHEN la búsqueda devuelve resultados
THEN cada resultado es un enlace real (enfocable, abrible en nueva pestaña,
anunciado como link)

#### Scenario: Búsqueda persistente en URL

WHEN el usuario busca con filtros y navega a un resultado y vuelve
THEN la query y filtros se conservan (search params) y los resultados
siguen visibles

### Requirement: Eficiencia de carga de la jerarquía

`GET /modules/:id/sections` MUST incluir los metadatos de video de cada
sección (`videoMetadata`), eliminando el N+1 de peticiones por sección al
expandir un módulo.

#### Scenario: Expandir módulo con 5 secciones

WHEN el usuario expande un módulo
THEN se realiza una sola petición que devuelve secciones con metadatos, no
1 + N

### Requirement: Configuración con contenido real

La vista de configuración SHALL contener funcionalidad real: cambio de
contraseña (formulario validado por campo) y cierre de sesión. Las páginas
stub sin funcionalidad MUST eliminarse de rutas y menús.

#### Scenario: Cambiar contraseña con Enter

WHEN el usuario completa el formulario de contraseña y pulsa Enter
THEN el formulario se envía (es un `<form>` real con submit), valida por
campo y anuncia éxito o error

### Requirement: Respeto de prefers-reduced-motion

Las animaciones de la app MUST respetar `prefers-reduced-motion`
globalmente mediante `MotionConfig reducedMotion="user"` — ninguna página
puede animar transforms/opacidad cuando el usuario pidió reducir movimiento.

#### Scenario: Usuario con reduced-motion

WHEN el sistema operativo reporta prefers-reduced-motion
THEN las transiciones de página, reveals y animaciones de login/register se
desactivan

### Requirement: Accesibilidad de la app

La app MUST cumplir WCAG 2.2 AA: `document.title` por página; errores con
`role="alert"`; contraste de texto ≥4.5:1 (el color de acento como texto
MUST usar `accentText`, no `accent`); bordes de input identificables ≥3:1;
`autocomplete` correcto en todos los campos de auth; `aria-expanded` en
toggles de acordeón; todo contenido interactivo operable por teclado.

#### Scenario: Título dinámico por página

WHEN el usuario navega entre biblioteca, búsqueda, curso y sección
THEN `document.title` refleja la vista actual (p. ej. nombre del curso)

#### Scenario: Toggle de módulo anunciado

WHEN un usuario de lector de pantalla enfoca el toggle de un módulo
THEN escucha su nombre y su estado expandido/colapsado
