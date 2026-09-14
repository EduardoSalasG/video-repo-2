# Propuesta: rediseño del panel de administración

## Why

La auditoría UX/UI + accesibilidad del panel `/admin` (3 subagentes +
detector) encontró: 3 P0 (borrados sin confirmación, nivel de acceso no
seleccionable al conceder acceso, errores de formulario que nunca se
renderizan), ~15 P1 (estado compartido entre vistas que cruza datos,
violaciones WCAG 2.2 AA) y deuda estructural: `Admin.tsx` es un monolito de
1844 líneas con ~14 subvistas por índice mágico y duplicación masiva de
patrones CRUD/loader/snackbar. El panel es la herramienta de trabajo diaria
de admins e instructores; hoy permite errores irreversibles en un click y
falla accesibilidad básica.

## What Changes

- Descomponer `Admin.tsx` en páginas por ruta hija real con guard
  `RequirePerm` por ruta (elimina arrays paralelos `TABS`/`TAB_PERMISSIONS`).
- Extraer hooks compartidos: `useApiResource`, `useParamCrud`, `useZodForm`,
  `useStatusSnackbar`, `useCourseModules`, `useModuleSections`,
  `useDocumentTitle`.
- Nuevos componentes: `EntitySelect`, `FileUploadField`, `ConfirmDialog`,
  `FormError`, `SubmitButton`, `IconButton` con `aria-label` obligatorio.
- Confirmación obligatoria en las 6 rutas destructivas (delete curso/módulo/
  sección/paso/parámetro, revocar acceso).
- Selector de nivel de acceso (READ/WRITE/MAINTAIN desde `accessLevels`) al
  conceder acceso — el backend ya acepta `accessLevel` opcional.
- Errores de formulario visibles y asociados a su control
  (`error`/`helperText`/`aria-describedby`, `role="alert"` a nivel de form).
- Conservar contexto de selección padre tras altas en cascada.
- Lote de accesibilidad WCAG 2.2 AA: landmarks, `aria-current`, `h1` por
  vista, `document.title`, `disabled` real, snackbar `polite` cerrable.
- Listados: usuarios (`GET /users?q=` vacío → recientes) y video por sección
  (solo lectura; edición/borrado de video es gap de backend fuera de scope).
- Empty/error states uniformes con retry; progreso real + cancelar en uploads.
- Eliminar código muerto: `SectionForm`, stub `api.getAccesses`.
- Mutaciones del tab Usuarios condicionadas a `admin.users.manage` /
  `content.access.manage` (lo que el backend realmente exige).

## Capabilities

### New Capabilities

- `admin-panel`: superficie de gestión para ADMIN/INSTRUCTOR — navegación por
  permisos, CRUD de contenido (curso→módulo→sección→video), gestión de
  usuarios y accesos a cursos, maintainers de parámetros/roles, con garantías
  de confirmación destructiva, feedback de errores y accesibilidad AA.

### Modified Capabilities

(ninguna — no existen specs previas en `openspec/specs/`)

## Impact

- **Código**: `apps/web/src/ui/pages/Admin.tsx` (eliminado, → `pages/admin/*`),
  `ui/templates/AdminLayout.tsx`, `router.tsx`, `ui/{atoms,molecules,organisms}`,
  `hooks/*`, `lib/api.ts` (grantAccess payload, borrar stub), `theme.ts`
  (tono de acento para texto, snackbar contrast).
- **APIs**: sin cambios de contrato — `POST /courses/:id/access` ya acepta
  `accessLevel`; `GET /users` y `GET /users/:id/accesses` ya existen.
- **Backend**: ningún cambio requerido en esta fase. Gap documentado:
  update/delete/list de videos (futuro change backend).
- **Docs**: diseño detallado en `docs/specs/2026-09-14-admin-panel-redesign-design.md`.
