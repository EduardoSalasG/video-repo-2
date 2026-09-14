# Tasks — rediseño de páginas de la app

## 1. Fundaciones

- [x] 1.1 `useApiResource`: guarda de unmount + race (flag alive + request id); verificar que un reload rápido no escribe estado stale
- [x] 1.2 `lib/error.ts`: exportar `apiErrorMessage(err)` (parsea `data.message` string|string[]); verificar uso en Register/Profile
- [x] 1.3 `lib/api.ts`: `onUnauthorized` callback + emitirlo en el 401 de `handleResponse` y `requestFormData`; `useAuth` lo registra → `setUser(null)`; verificar que un 401 deslogea y un error de red no
- [x] 1.4 `useAuth.logout`: `try { await api.logout() } finally { setUser(null) }`; verificar logout con red caída
- [x] 1.5 `main.tsx`: `<MotionConfig reducedMotion="user">`; verificar que las animaciones de Login se desactivan con reduced-motion
- [x] 1.6 `theme.ts`: borde de input a alpha ≥0.45 (ratio ≥3:1); revisar usos de `brand.accent` como texto → `brand.accentText` (Login:120, Register:186, Landing:545)
- [x] 1.7 Mover `ui/pages/admin/PageHeader.tsx` → `ui/organisms/PageHeader.tsx` y actualizar imports de las 9 páginas admin
- [x] 1.8 `Markdown`: `# ` → `h2` (evitar segundo h1 en Section)

## 2. Backend

- [x] 2.1 Eliminar `streamQueryExtractor` de `adapters.ts`; verificar que `GET /videos/:id/stream?access_token=x` da 401 y con cookie da 200
- [x] 2.2 `PrismaSectionRepository.findByModuleId`: `include: { videoMetadata: true }` y exponer en la entidad/tipo de respuesta; verificar una sola query con metadata
- [x] 2.3 `pnpm --filter @dance-platform/backend build` verde

## 3. Layout y navegación

- [x] 3.1 `MainLayout`: Container `component="main" id="main-content" tabIndex={-1}` + skip link + focus al main en cambio de ruta; pb 72px→64px; verificar landmark y salto
- [x] 3.2 BottomNavigation: `component="nav" aria-label`, `aria-current` en activo, `/app/sections/*` y `/app/courses/*` mapean a tab Cursos, `/app/settings` a "Más"; "Más" con `aria-haspopup="menu"` + `aria-expanded` + `aria-controls`; eliminar estado derivado por efecto (derivar de pathname directamente)
- [x] 3.3 `Header`: landmark `nav` en acciones + `aria-current`; eliminar `onMenu`/`title` muertos y rama `!user`; menú de avatar (Perfil, Configuración, Administración si aplica, Cerrar sesión); verificar Settings alcanzable en desktop
- [x] 3.4 `useDocumentTitle` en las 10 páginas + NotFound

## 4. Páginas

- [x] 4.1 `NotFoundPage` (h1, copy, links condicionales a `/app`/`/`); rutas `*` hijas de `/app` y global; `/admin/*` conserva redirect; verificar URL inválida autenticada muestra 404 dentro del shell
- [x] 4.2 `Login`: `useZodForm` + `FormError` + `SubmitButton`; respetar `state.from`; `accentText` en el enlace; verificar deep-link
- [x] 4.3 `Register`: `useZodForm` + `FormError` + `SubmitButton`; `autocomplete` completo (`username`, `given-name`, `family-name`); race register→login con mensaje de fase; `apiErrorMessage`
- [x] 4.4 `Library`: `useApiResource` + retry + skeletons; copy de empty state corregido; onboarding solo si carga exitosa (`!loading && !error`)
- [x] 4.5 `Course`: `useApiResource`; reset al cambiar `courseId`; error por módulo con retry; `aria-expanded`/`aria-controls`; empty state sin módulos; consumir `section.videoMetadata` (sin N+1); `CheckCircle` con texto accesible; `PageHeader` con crumbs
- [x] 4.6 `Section`: reset + cancelación al cambiar `sectionId`; botón "Marcar como vista" siempre visible con estado; `playsInline`; stream URL sin token; error con retry + link a biblioteca; `PageHeader` con crumbs; `document.title` con el título de la sección
- [x] 4.7 `Search`: `useSearchParams` (q/style/courseId); `Card component={Link}` en resultados; `type="search"` + autoFocus; `EntitySelect` para curso; distinguir "sin buscar" vs "0 resultados"; `FormError`
- [x] 4.8 `Profile` → solo identidad (avatar, datos, rol, miembro desde); `useApiResource` para getUser
- [x] 4.9 `Settings` con contenido real: form de cambio de contraseña (`useZodForm` + `<form>` + `SubmitButton` + errores por campo + `StatusSnackbar`) y sección Sesión con logout; verificar Enter envía
- [x] 4.10 Eliminar `More.tsx`, su ruta y su MenuItem; actualizar `pages/index.ts` barrel completo o eliminarlo si nada lo importa
- [x] 4.11 Login/Register: redirigir a `/app` si ya autenticado (o `from`); Landing `main#contenido` con `tabIndex={-1}`; tokens hardcodeados → `brand.*` (`#7f61ff`, `rgba(11,9,8,…)`, `#0e0c16`, `rgba(240,241,250,*)`, `rgba(244,238,228,0.55)`, `rgba(179,168,152,0.75)`)

## 5. Limpieza

- [x] 5.1 `api.getVideoStreamUrl` sin query param; verificar reproducción con cookie en dev y que `crossorigin` sigue
- [x] 5.2 `CourseList`: migrar `Grid item` → API nueva (`size`); verificar layout igual
- [x] 5.3 `Profile.tsx`: importar `IconButton` del átomo; eliminar `MainLayout` exit variants sin `AnimatePresence` (o añadir AnimatePresence)
- [x] 5.4 `useLibraryOnboarding`: no lanzar tour si hubo error de carga

## 6. Verificación final

- [x] 6.1 `pnpm verify` (web) + `pnpm build` verde
- [x] 6.2 `impeccable detect` sobre archivos tocados, sin findings nuevos
- [ ] 6.3 Smoke manual en dev: login→deep-link, 404 dentro/fuera de /app, búsqueda por teclado, marcar sección sin video, cambio de contraseña con Enter, video reproduce con cookie, reduced-motion
