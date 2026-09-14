# Tasks — rediseño del panel de administración

## 1. Fundaciones (hooks y componentes base)

- [x] 1.1 Crear `useApiResource(fetcher, deps)` → `{data, loading, error, reload}` y verificar que compila y una página de prueba distingue error de vacío
- [x] 1.2 Crear `useZodForm(schema, initial)` → `{values, errors, submitting, submit, reset, setField}` y verificar que `safeParse` produce fieldErrors por campo
- [x] 1.3 Crear `useStatusSnackbar()` y verificar que devuelve props listas para `StatusSnackbar` + `showSuccess/showError/showInfo`
- [x] 1.4 Crear `useCourseModules(courseId)` / `useModuleSections(moduleId)` y verificar que cargan hijos solo con padre seleccionado y conservan selección tras alta
- [x] 1.5 Crear `useDocumentTitle(title)` y verificar que el título del documento cambia por vista
- [x] 1.6 Crear átomo `IconButton` con `aria-label` requerida (TS error sin ella) y `SubmitButton` con `loading`; verificar que tsc rechaza IconButton sin label
- [x] 1.7 Crear `organisms/ConfirmDialog` + `useConfirm()` y verificar focus trap, `aria-labelledby` y que solo ejecuta la acción al confirmar
- [x] 1.8 Crear `molecules/FormError` con `role="alert"` y verificar que renderiza y anuncia errores de formulario
- [x] 1.9 Crear `organisms/EntitySelect` (label, items, loading, fieldError) y verificar que reemplaza los tres renderXSelect
- [x] 1.10 Crear `organisms/FileUploadField` (label programática, preview imagen, validación MIME/tamaño, nombre de archivo, LinearProgress, cancelar vía AbortController) y verificar que `requestFormData` acepta signal/abort

## 2. Componentes base existentes (a11y)

- [x] 2.1 `FormField`: pasar `error`/`helperText`/`required` al Input y verificar borde rojo + `aria-describedby` en DOM
- [x] 2.2 `StatusSnackbar`: info → `aria-live="polite"`, cierre manual, `closeText="Cerrar"`; verificar contraste del Alert (ajustar variant u override si <4.5:1)
- [x] 2.3 `theme.ts`: añadir `brand.accentText` (#9d86ff) para texto de acento y verificar contraste ≥4.5:1 calculado
- [x] 2.4 `VideoCard`: `alt=""` en imagen decorativa dentro de link nombrado
- [x] 2.5 Hacer scrollbars visibles (delgados) en `main` y drawer; verificar en desktop y mobile

## 3. AdminLayout (navegación accesible)

- [x] 3.1 Drawer: `component="nav"` + `aria-label="Administración"`; items con `component={Link}` + `aria-current="page"`; verificar que son anchors reales (abrir en nueva pestaña funciona)
- [x] 3.2 `aria-label` en `AccordionSummary` colapsado, `aria-label` dinámico + `aria-expanded` en toggle, tooltips en items icon-only; verificar nombres accesibles con inspector
- [x] 3.3 Iconos distintos por item de Parámetros; verificar diferenciación en drawer colapsado
- [x] 3.4 Título de sección actual en AppBar mobile; `main` con `maxWidth` para forms en desktop

## 4. Descomposición en páginas

- [x] 4.1 Crear `RequirePerm` y rutas hijas explícitas en `router.tsx` por cada subvista; verificar que URL desconocida bajo /admin da 404/redirect explícito, no fallback silencioso
- [x] 4.2 `DashboardPage` con useApiResource + retry; verificar carga, error y reintento
- [x] 4.3 `CoursesPage` (CRUD + imagen con FileUploadField + ConfirmDialog); verificar crear/editar/borrar con confirmación y preview de imagen
- [x] 4.4 `ModulesPage` y `SectionsPage` con selects en cascada vía hooks; verificar que el contexto padre se conserva tras alta y se muestra en encabezado
- [x] 4.5 `VideosPage`: upload/enlace + metadatos + vista solo-lectura del video por sección; verificar progreso cancelable y validación `z.url()` en enlace
- [x] 4.6 `StepsPage` (mantenedor de pasos) sobre `useParamCrud`; verificar CRUD con ConfirmDialog
- [x] 4.7 `UsersPage`: lista de usuarios (`GET /users?q=`), autocomplete, accesos por usuario, cambio de rol; mutaciones gated por `admin.users.manage`/`content.access.manage`; verificar que instructor sin manage no ve controles de rol
- [x] 4.8 `ParamsPage` factory (config {path,title,description,api} → ParamMaintainer) para las 6 rutas de parámetros + RolesPage con RolePermissionsMaintainer; verificar las 8 rutas
- [x] 4.9 Eliminar `Admin.tsx`, `SectionForm` y stub `api.getAccesses`; verificar que no quedan imports ni referencias

## 5. Correctivas transversales

- [x] 5.1 Selector de nivel de acceso (desde `accessLevels`) + `accessLevel` en `api.grantAccess` y `accessSchema`; verificar que el backend registra el nivel elegido
- [x] 5.2 `useAuth.refresh`: solo `setUser(null)` ante 401; verificar que un error de red no deslogea
- [x] 5.3 Migrar `ChipProps`/`InputLabelProps` → `slotProps`; verificar que no quedan warnings de deprecación MUI
- [x] 5.4 Consumir `useParamLabels` en páginas con selects de metadatos; verificar que desaparecen los fallbacks `Object.entries` inline
- [x] 5.5 `RolePermissionsMaintainer`: `disabled` real en checkboxes de superuser; verificar que no son togglables por teclado

## 6. Verificación final

- [x] 6.1 `pnpm --filter @dance-platform/web build` verde (tsc + vite)
- [x] 6.2 `impeccable detect` sobre todos los archivos tocados, sin findings nuevos
- [ ] 6.3 Smoke manual en dev: login instructor → recorrer subvistas → crear jerarquía completa → conceder acceso con nivel → confirmar diálogos, errores visibles y navegación por teclado — *(verificación visual pendiente; API-level ya verificado: grant con `accessLevel` registra el nivel correcto)*
