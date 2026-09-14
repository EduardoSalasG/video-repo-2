# Diseño — rediseño del panel de administración

## Context

`apps/web/src/ui/pages/Admin.tsx` (1844 líneas) renderiza ~14 subvistas con
`activeTab` por índice mágico bajo una única ruta comodín
(`router.tsx: { path: '*', element: <Admin /> }`). El estado de
`modules`/`sections` es compartido por tres vistas → contaminación cruzada.
Verificado contra el grafo de código y la fuente (ver proposal.md).

Hechos técnicos confirmados que condicionan el diseño:

- Backend ya acepta `accessLevel` opcional en `POST /courses/:id/access`
  (`GrantCourseAccessDto`) — el fix es frontend-only.
- `GET /users?q=` con q vacío devuelve los 20 usuarios recientes —
  listado sin cambios de backend.
- `GET /users/:id/accesses` existe y filtra por cursos gestionados —
  el stub `api.getAccesses` es dead code; se consume `getUserAccesses`.
- `VideosController` solo expone `upload`+`link` — sin update/delete/list;
  `GET /sections/:id` incluye video+metadatos para lectura.
- `PATCH /users/:id/role` exige `admin.users.manage`; grant/revoke exigen
  `content.access.manage`.
- Tema MUI dark centralizado en `theme.ts`; decisión aprobada: mantener
  identidad visual, sin nueva paleta ni tipografía.

## Goals / Non-Goals

**Goals:**

- Una página por ruta hija con estado aislado (elimina contaminación y
  arrays paralelos).
- Patrones CRUD/loader/form/snackbar extraídos a hooks y componentes
  reutilizables, medidos contra el mapa de duplicación de la auditoría.
- WCAG 2.2 AA como requisito de aceptación por componente.
- Confirmaciones destructivas y feedback de error uniformes.

**Non-Goals:**

- Cambio de identidad visual (paleta, tipografía, branding).
- Nuevos endpoints de backend (video update/delete queda documentado como
  gap; users search con `take: 20` es suficiente por ahora).
- i18n framework; los textos siguen en español hardcodeado.
- Paginación server-side de listados (catálogo pequeño asumido).

## Decisions

### 1. Rutas hijas reales en vez de `path: '*'` + `activeTab`

`router.tsx` declara children explícitos; cada página se envuelve en
`RequirePerm` (componente nuevo que lee `hasPerm` y renderiza mensaje de
sin-permiso o children). Reemplaza `TABS`/`TAB_PERMISSIONS`, los índices
mágicos y el fallback silencioso de `parametros/*`.

*Alternativa:* mantener el monolito y solo arreglar bugs. Rechazada: los
bugs P1-4/5 son consecuencia del estado compartido; parchearlos dentro del
monolito deja la deuda estructural intacta.

### 2. Extracción por hooks, no por componentes gigantes

La duplicación real está en lógica (loaders, safeParse→fieldErrors, cascade
effects, snackbar tri-state), no en markup. Se extraen hooks
(`useApiResource`, `useParamCrud`, `useZodForm`, `useStatusSnackbar`,
`useCourseModules`, `useModuleSections`, `useDocumentTitle`) y solo los
componentes con markup repetido real (`EntitySelect`, `FileUploadField`,
`ConfirmDialog`, `FormError`, `SubmitButton`, `IconButton`).

*Alternativa:* un `EntityCrudPage` mega-genérico para todo. Rechazada: los
forms difieren demasiado (imagen, cascada, metadatos); forzar un solo
componente reintroduce condicionales. `ParamMaintainer` ya cubre el caso
verdaderamente homogéneo (parámetros).

### 3. `ConfirmDialog` como organismo + `useConfirm`

Dialog MUI (focus trap y `aria-labelledby` de fábrica) con props
`{title, description, impact?, confirmLabel}` y hook `useConfirm()` para no
repetir estado open/pending en 6 call sites.

### 4. `IconButton` átomo con `aria-label` requerida

Wrapper fino sobre MUI `IconButton` que declara `aria-label: string`
requerido — convierte la regla "todo icon-button se nombra" en un error de
TypeScript, no en una convención.

### 5. Accesibilidad cableada en los componentes base

El fix se hace una vez en `FormField` (`error`+`helperText`+`required`),
`FileUploadField` (label programática), drawer (`nav`+`Link`+`aria-current`),
`StatusSnackbar` (info → `polite` + cerrable). ~15 instancias se resuelven
por herencia del componente, no por edits dispersos.

### 6. Selects en cascada como hooks por nivel

`useCourseModules(courseId)` / `useModuleSections(moduleId)` aíslan el fetch
por vista y conservan la selección padre tras altas (req. de spec). La
contaminación cruzada desaparece porque cada página monta sus propios hooks.

### 7. Tono de acento para texto

`#6e4dff` sobre `#08070d` ≈ 3.9:1 falla AA como texto pequeño. Se añade
`brand.accentText` (`#9d86ff`, ≈7:1) en `theme.ts` para usos textuales
(nav activo, chips); el acento original queda para superficies/indicadores.

## Risks / Trade-offs

- [Refactor grande en un solo change] → Las páginas se extraen en orden
  (hooks → componentes → páginas → router) manteniendo `pnpm build` verde en
  cada paso; el diff se revisa por página.
- [`useApiResource` cambia contratos de loading/error] → Las páginas nuevas
  nacen sobre el hook; no se refactoriza código fuera del panel admin.
- [Listado de usuarios limitado a 20 por `take` del backend] → Se muestra
  como "recientes" + búsqueda; si se necesita más, es change de backend.
- [Edición de video imposible sin endpoints] → Vista de solo lectura ahora;
  gap documentado para un change backend posterior.
- [`RequireAuth` redirect → mensaje] cambia comportamiento para usuarios sin
  permiso → es el comportamiento deseado por spec (anuncio explícito).

## Migration Plan

Sin migración de datos. Despliegue frontend normal (Netlify) — el contrato
de API no cambia (`accessLevel` ya era aceptado). Rollback = revert del
merge a `main`.

## Open Questions

- ¿Breadcrumbs completos (`/admin/cursos/:id/modulos`) o contexto de padre
  en el encabezado? Se decide en implementación; el spec solo exige que el
  contexto sea visible.
- `driver.js` (onboarding) no se toca; si se introduce en admin en el
  futuro, auditar sus popovers.
