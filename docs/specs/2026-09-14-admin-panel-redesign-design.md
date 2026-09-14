# Rediseño del panel de administración — diseño

Fecha: 2026-09-14
Estado: aprobado por el usuario (alcance A+B+C+D, mantener identidad visual)
Modo de superficie: **Operate** (herramienta interna de gestión)

## Contexto

El panel `/admin` es un monolito de 1844 líneas (`Admin.tsx`) que renderiza ~14
subvistas según `activeTab`, mapeadas a rutas `/admin/*` mediante dos arrays
paralelos (`TABS`, `TAB_PERMISSIONS`). La auditoría (3 subagentes + detector)
encontró: 3 P0 (deletes sin confirmación, nivel de acceso no seleccionable,
errores de formulario invisibles), ~15 P1 (estado compartido entre tabs,
violaciones WCAG AA) y deuda estructural de duplicación masiva.

Decisión de dirección visual: **mantener identidad** (tema dark, acento
`#6e4dff`, Bodoni en títulos). El trabajo es estructural y de componentes, no
de piel. Ajuste puntual: tono claro del acento (`#9d86ff`) cuando se use como
texto pequeño para cumplir WCAG 1.4.3.

## A. Estructura — descomposición del monolito

`router.tsx`: reemplazar `{ path: '*', element: <Admin /> }` por rutas hijas
explícitas, cada una envuelta en un guard `RequirePerm` (elimina `TABS`,
`TAB_PERMISSIONS`, índices mágicos y el fallback silencioso de rutas
`parametros/*` desconocidas).

```
ui/pages/admin/
  DashboardPage.tsx        ← dashboard + retry (ya existe el patrón)
  CoursesPage.tsx          ← CRUD curso + imagen
  ModulesPage.tsx          ← CRUD módulo (select de curso)
  SectionsPage.tsx         ← CRUD sección (selects curso→módulo)
  VideosPage.tsx           ← upload + enlace + metadatos + NUEVO listado/edición
  StepsPage.tsx            ← mantenedor de pasos
  UsersPage.tsx            ← autocomplete + rol + accesos + NUEVO listado
  ParamsPage.tsx           ← factory: config {path,title,description,api}
  RolesPage.tsx            ← RolePermissionsMaintainer existente
```

`Admin.tsx` desaparece. Las 6 rutas `/admin/parametros/*` colapsan en
`ParamsPage` con tabla de configuración.

### Hooks compartidos (`apps/web/src/hooks/`)

- `useApiResource(fetcher, deps)` → `{ data, loading, error, reload }`.
  Elimina ~10 loaders con `catch(() => setX([]))` y distingue "vacío" de
  "error 500" en todas las vistas.
- `useParamCrud({ create, update, remove, noun })` → encapsula la triada CRUD
  repetida 18 veces (~200 líneas) para parámetros.
- `useZodForm(schema, initial)` → safeParse + fieldErrors + submitting,
  elimina 7 copias del patrón.
- `useStatusSnackbar()` → `{ snackbarProps, showSuccess, showError, showInfo }`,
  compartido entre páginas y `RolePermissionsMaintainer`.
- `useCourseModules(courseId)` / `useModuleSections(moduleId)` → selects en
  cascada sin contaminación cruzada.
- `useDocumentTitle(title)` → actualiza `document.title` por vista.

### Componentes nuevos

- `organisms/EntitySelect` — select con label, loading, fieldError (reemplaza
  `renderCourseSelect/ModuleSelect/SectionSelect`).
- `organisms/FileUploadField` — botón estilizado `component="label"`, nombre y
  tamaño del archivo, preview de imagen, validación MIME/tamaño,
  `LinearProgress` y botón cancelar (XHR abort; requiere que `requestFormData`
  exponga `AbortController`).
- `organisms/ConfirmDialog` — MUI Dialog: título, descripción con impacto
  ("Este curso contiene N módulos"), acciones Cancelar/Confirmar destructivo.
- `molecules/FormError` — `role="alert"` para errores a nivel de formulario.
- `atoms/SubmitButton` — Button con `loading` (CircularProgress + disabled).
- `atoms/IconButton` — wrapper que **exige** `aria-label` (prop requerida).

## B. Correctivas funcionales

1. `ConfirmDialog` en las 6 rutas destructivas: delete curso/módulo/sección/
   paso/parámetro + revocar acceso.
2. Selector de nivel de acceso en el form de accesos. **Verificado:** el
   backend ya acepta `accessLevel` opcional (`GrantCourseAccessDto`,
   `CoursesController.grant` → `courseAccess.grant(...)`). Las opciones se
   cargan de `api.getAccessLevels` (la lista ya existe en estado para el
   mantenedor de niveles). Fix 100% frontend: extender `accessSchema`,
   `api.grantAccess` y el form.
3. Renderizar `accessErrors` y `roleErrors.userId`; errores de API y de
   "falta selector" van a `FormError` a nivel de formulario, nunca a un campo
   ajeno (corrige `:476, :522, :571, :586, :633`).
4. No resetear selects padre tras crear módulo/sección/video; solo limpiar
   los campos del form. `submitRole` resetea al rol guardado, no a STUDENT.
5. `useAuth.refresh`: solo `setUser(null)` ante `ApiError` 401; en error de
   red mantener sesión.
6. `SubmitButton` en todos los forms (hoy ~8 submits son duplicables).
7. `z.string().url()` en el schema de enlaces; `submitLink` no valida el
   schema del form de subida.
8. Videos: **gap de backend confirmado** — `VideosController` solo expone
   `upload` y `link`; no hay update/delete. En esta fase la vista muestra el
   video existente por sección (vía `GET /sections/:id`, que incluye video y
   metadatos) en modo solo-lectura; edición/borrado queda como sub-tarea de
   backend documentada, fuera de este change.
9. Usuarios: listado viable sin backend — `GET /users?q=` con q vacío
   devuelve los 20 usuarios más recientes (`UserRepository.search`,
   `take: 20`). Se muestra como lista inicial + búsqueda por autocomplete.
10. Tab Usuarios: condicionar mutaciones a los permisos reales del backend —
    `admin.users.manage` para `PATCH /users/:id/role` y
    `content.access.manage` para grant/revoke (`controllers.ts:55,69`). Hoy
    `admin.users.view` ofrece acciones que el servidor rechaza.
11. Eliminar `api.getAccesses` — stub muerto que devuelve `[]`; el endpoint
    real `GET /users/:id/accesses` ya se consume vía `api.getUserAccesses`.

## C. Accesibilidad (WCAG 2.2 AA)

- `FormField`: pasar `error={!!fieldError}` + `helperText={fieldError}` (MUI
  cablea `aria-describedby`); `required` donde aplique; mantener `role=alert`.
- File inputs con etiqueta programática (via `FileUploadField`).
- `aria-label` en todos los IconButton de acción (editar/eliminar/revocar).
- Drawer: `component="nav"` + `aria-label="Administración"`; items como
  `Link` + `aria-current="page"`; `aria-label` en `AccordionSummary`
  colapsado; toggle con `aria-label` dinámico + `aria-expanded`.
- `h1` por subvista (component="h1" en el título) + `useDocumentTitle`.
- `RolePermissionsMaintainer`: `disabled` real en checkboxes (no solo
  `pointerEvents`).
- `StatusSnackbar`: info → `aria-live="polite"`, cierre manual permitido,
  `closeText="Cerrar"`; `variant="standard"` u override de paleta para
  contraste ≥4.5 en texto de alert.
- `RequireAuth` sin permiso: mensaje visible en vez de redirect silencioso.
- Scrollbars visibles (al menos delgados) en `main` y drawer.
- `alt=""` en imagen decorativa de `VideoCard`.
- Focus al heading del form al entrar en modo edición.

## D. UX

- Empty/error states uniformes con retry vía `useApiResource` + componente
  compartido; `CircularProgress`/skeleton en vez de texto "Cargando…".
- `maxWidth` en contenedor de formularios desktop (~560-720px).
- Iconos distintos por parámetro + `Tooltip` en items colapsados del drawer.
- Breadcrumbs o contexto del padre en Módulos/Secciones/Videos
  ("Curso X › Módulo Y").
- Migrar `ChipProps`/`InputLabelProps` → `slotProps` (MUI 6).
- Eliminar `SectionForm` (código muerto; su lógica vive en SectionsPage) y
  `api.getAccesses` stub, o implementar vista "accesos por curso".
- `api.getAccesses` implementado si el backend expone endpoint; si no, gap.

## Fuera de scope

- Cambios de paleta/tipografía/tema (se mantiene identidad).
- i18n framework (los textos siguen hardcodeados en español).
- Paginación server-side de listados (las listas asumen catálogo pequeño;
  queda como deuda conocida si el volumen crece).
- `PermissionService` cache en backend (hardening aparte).

## Verificación

- `pnpm --filter @dance-platform/web build` (typecheck incluido).
- `impeccable detect` sobre archivos modificados al finalizar.
- Test manual en dev: login como instructor → recorrer cada subvista →
  crear curso/módulo/sección/video → conceder acceso con nivel → verificar
  confirmaciones, errores visibles, navegación con teclado.
- Sin `any`/`@ts-ignore`; sin coautor Devin en commits.
