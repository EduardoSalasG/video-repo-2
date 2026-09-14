# Propuesta: rediseño de las páginas de la app y página 404

## Why

La auditoría UX/UI + accesibilidad del resto de la app (3 subagentes +
detector) encontró que **ninguna** página fuera de `/admin` usa los patrones
convergidos del rediseño del panel (`useApiResource`, `useZodForm`,
`FormError`, `SubmitButton`, `useDocumentTitle`, `EntitySelect`,
`StatusSnackbar`, `PageHeader`). Además:

- 3 P0: JWT en la URL del stream de video (leak a historial/logs/Referer);
  `logout` deja sesión zombie si falla la red; auth desincronizada tras 401
  (el cliente limpia el token pero `AuthProvider` no se entera).
- ~15 P1: sin página 404 (wildcard silencioso a `/`, y `/app/*` inválido
  expulsa al usuario logueado a la landing); resultados de búsqueda no
  operables por teclado; `/app/settings` y `/app/more` inalcanzables en
  desktop y ambas son stubs; sin landmark `main` ni skip link en `/app`;
  `document.title` nunca cambia; errores de API sin `role="alert"`;
  secciones sin video no pueden marcarse como vistas; race en register→login
  y en `Section` al cambiar de sección; cambio de contraseña no es `<form>`;
  Framer Motion ignora `prefers-reduced-motion` en 6 páginas.

## What Changes

### Navegación y estructura

- Nueva `NotFoundPage` (h1, copy, links a `/app` o `/`); wildcard real en
  `/app/*`, `/admin/*` y raíz. Eliminar redirects silenciosos.
- `MainLayout`: `component="main"` + `id` + skip link + focus al contenido
  tras navegación; `MotionConfig reducedMotion="user"` global; bottom nav
  con landmark `nav`, `aria-current`, `aria-haspopup/expanded` en "Más";
  mapeo correcto de rutas hijas al tab activo.
- `Header`: landmark `nav` en acciones, `aria-current`, menú de avatar
  (Perfil, Configuración, Administración, Cerrar sesión) para alcanzar
  Settings en desktop; eliminar props muertas (`onMenu`, rama `!user`).
- Mover `PageHeader` de `pages/admin/` a `ui/organisms/` para reuso.

### Convergencia de patrones

- `useApiResource` (+ guarda unmount/race) en Library, Course, Section,
  Search, Profile → retry en todos los errores.
- `useZodForm` + `FormError` + `SubmitButton` en Login, Register, Profile.
- `useDocumentTitle` en las 10 páginas.
- `EntitySelect` en Search; `StatusSnackbar` para feedback en Profile y
  Section; helper `apiErrorMessage(err)` en `lib/error.ts`.

### Correctivas funcionales

- **Auth**: `api.ts` emite evento on-401 → `AuthProvider` deslogea;
  `logout` con `try/finally` (siempre `setUser(null)` + navigate); `Login`
  respeta `location.state.from`; Register distingue error de register vs
  login posterior.
- **Video stream sin token en URL**: front usa cookie HttpOnly (ya existe:
  `credentials: 'include'` + `crossorigin="use-credentials"`, mismo sitio
  eTLD+1); backend elimina `streamQueryExtractor` para cerrar el leak.
- **Section**: botón "Marcar como vista" siempre disponible (no solo
  `onEnded`); `playsInline`; reset de estado al cambiar `sectionId`;
  efectos con cancelación.
- **Course**: error por módulo con retry (no `[]` silencioso); reset al
  cambiar `courseId`; empty state sin módulos; `aria-expanded`/`controls`
  en toggles; backend `GET /modules/:id/sections` incluye `videoMetadata`
  (elimina N+1 de `getSectionMetadata`).
- **Search**: resultados como `Card component={Link}`; `useSearchParams`
  para `q/style/courseId`; `type="search"` + autoFocus; distinguir
  "sin buscar" de "0 resultados".
- **Library**: empty state con copy correcto (acceso lo otorga un
  instructor); onboarding solo tras carga exitosa; skeletons.
- **Settings con contenido real**: cambio de contraseña y cierre de sesión
  se mueven de Profile a Settings (Profile queda como identidad).
- **Eliminar `More`** (todos sus items son "Próximamente"): quitar ruta y
  MenuItem; el menú "Más" queda con Configuración y Administración.

### Accesibilidad restante

- `accentText` en texto de acento; borde de input ≥3:1; `autocomplete`
  completo en Register; `CheckCircle` con texto accesible; Markdown h1→h2;
  `aria-current` en breadcrumbs; `tabIndex={-1}` en targets de skip link.

## Capabilities

### New Capabilities

- `app-pages`: superficie pública (landing, auth, 404) y de alumno
  (biblioteca, curso, sección, búsqueda, perfil, configuración) con
  navegación accesible, estados de datos completos, progreso de secciones
  y streaming de video autenticado por cookie.

### Modified Capabilities

(ninguna — el spec `admin-panel` no se toca; `PageHeader` se mueve de
`pages/admin/` a `ui/organisms/` sin cambio funcional)

## Impact

- **Código**: `apps/web/src/ui/pages/*` (todas menos `admin/`),
  `ui/templates/MainLayout.tsx`, `ui/organisms/Header.tsx`,
  `ui/atoms/Markdown.tsx`, `router.tsx`, `main.tsx`, `theme.ts`,
  `lib/api.ts`, `lib/error.ts`, `hooks/useAuth.tsx`,
  `hooks/useApiResource.ts`, `hooks/useLibraryOnboarding.ts`,
  `ui/pages/admin/PageHeader.tsx` → `ui/organisms/PageHeader.tsx`.
- **Backend** (2 cambios pequeños): eliminar `streamQueryExtractor` en
  `infrastructure/auth/adapters.ts`; `include: { videoMetadata: true }` en
  `PrismaSectionRepository.findByModuleId` + tipo de respuesta.
- **APIs**: `GET /modules/:id/sections` pasa a incluir `videoMetadata`
  opcional por sección (aditivo, no breaking); `GET /videos/:id/stream`
  deja de aceptar `?access_token=` (breaking intencional, la única
  consumidora es nuestra web).
- **Docs**: diseño en `docs/specs/`, mismo flujo que el change anterior.
