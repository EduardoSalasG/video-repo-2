# Diseño — rediseño de páginas de la app

## Decisiones

### 1. Stream de video por cookie HttpOnly (sin query param)

**Contexto:** `getVideoStreamUrl` concatena `?access_token=<jwt>` porque un
`<video src>` no puede enviar headers. La investigación mostró que el
backend ya acepta la cookie `access_token` (HttpOnly, `sameSite=none`+
`secure` en prod, `lax` en local) vía `cookieExtractor`, y que
`streamQueryExtractor` existe únicamente como fallback para ese path.

**Decisión:** el front usa la URL limpia + `crossorigin="use-credentials"`
(ya presente); el backend elimina `streamQueryExtractor`.

**Por qué es seguro:** front y API comparten eTLD+1
(`video-repo.eduardosalasg.dev` / `api.video-repo.eduardosalasg.dev`) →
requests same-site, la cookie fluye sin bloqueo de terceros. En local
(`localhost:5173` → `localhost:3000`) también es same-site (el puerto no
importa) y la cookie `lax` se envía en subresource GETs.

**Alternativas rechazadas:**
- Tickets firmados de un solo uso: correcto pero añade endpoint + estado;
  overkill dado que la cookie ya funciona.
- Fetch → blob URL con header Authorization: rompe streaming progresivo y
  buffer nativo del reproductor.
- Mantener el query extractor "por compatibilidad": deja abierta la vía de
  leak; el único consumidor es nuestra web.

### 2. NotFound por nivel de layout

`path: '*'` como hijo de `/app` renderiza NotFound dentro de `MainLayout`
(conserva shell y contexto); el `*` global renderiza NotFound standalone
(con links a `/` y `/app` según auth). `/admin/*` conserva redirect a
`/admin` (menos grave; el panel tiene índice claro).

**Alternativa rechazada:** `errorElement` del router — es para errores de
render/loaders, no para rutas inexistentes; las rutas hijas `*` son el
mecanismo idiomático.

### 3. Evento on-401 del cliente API

`handleResponse` ya hace `clearToken()` en 401. Se añade un callback
registrable (`api.onUnauthorized(cb)`) que `AuthProvider` usa para
`setUser(null)`. Así cualquier 401 — en cualquier página — deslogea de
verdad, y se elimina el manejo ad-hoc de `Library` (redirect manual) y los
errores genéricos de Course/Section.

**Alternativa rechazada:** evento `window.dispatchEvent` — funciona pero el
callback directo es más simple y testeable.

### 4. `useApiResource` con guarda de unmount/race

El hook actual no protege contra setState tras unmount ni carreras entre
`reload()`. Se añade flag `alive` + id de request antes de adoptarlo en 5
páginas (requisito previo — si no, se propagaría el defecto).

### 5. Settings con contenido real; More eliminado

Mover "Cambiar contraseña" y "Sesión/Cerrar sesión" de Profile a Settings.
Profile queda como identidad (avatar, datos, rol, miembro desde). More se
elimina (sus 4 items son "Próximamente" sin funcionalidad) — se quita la
ruta y el MenuItem; el menú "Más" del bottom nav queda con Configuración +
Administración (si aplica). En desktop, el Header gana menú de avatar con
las mismas entradas + Cerrar sesión, haciendo Settings alcanzable.

**Alternativa rechazada:** mantener More con chips "Próximamente" — sigue
siendo ruido navegable sin valor; mejor no prometer lo que no existe.

### 6. N+1 de metadata vía `include` en el repositorio

`PrismaSectionRepository.findByModuleId` pasa a
`include: { videoMetadata: true }`; la entidad `Section` expone
`videoMetadata` opcional. El tipo `Section` del front gana
`videoMetadata?: VideoMetadata | null`. Course.tsx consume
`section.videoMetadata` directo y elimina el fan-out de
`getSectionMetadata`. El endpoint `GET /sections/:id/metadata` se mantiene
(otros flujos lo usan).

### 7. `MotionConfig reducedMotion="user"` en `main.tsx`

Una línea resuelve reduced-motion en las 6 páginas con `motion.div` sin
`useReducedMotion`. El override CSS global se mantiene (cubre CSS
animations como el marquee).

### 8. Search con `useSearchParams`

`q`, `style`, `courseId` viven en la URL → back-button correcto, estado
compartible, resultados persistentes al volver de una sección. El submit
hace `setSearchParams`; un efecto dispara la búsqueda cuando hay params.

### 9. Breadcrumbs → `PageHeader` compartido

`PageHeader` se mueve de `pages/admin/` a `ui/organisms/` (path público).
Course y Section reemplazan sus `Breadcrumbs` inline por `PageHeader
crumbs={...}` que ya emite `aria-current="page"` en el último ítem.

## Riesgos

- **Cookie en Safari/ITP:** same-site por eTLD+1 la mitiga; si el front se
  desplegara en `*.netlify.app` se rompería (cross-site real) — el deploy
  actual usa dominio propio. Verificar en el smoke test post-deploy.
- **Logout de usuarios con sesión Bearer-only:** sin cookie (cliente que
  nunca hizo login por el endpoint con cookie) el stream daría 401; la web
  siempre pasa por `login` que setea cookie — aceptable.
- **Tipo Section cambia:** aditivo (`videoMetadata?`), no breaking.
- **Eliminar `/app/more`:** cualquier bookmark muere → la 404 dentro de
  `/app` lo absorbe con link a biblioteca.

## Plan de migración

1. Fundaciones: guarda en `useApiResource`, `apiErrorMessage`, on-401,
   `MotionConfig`, tokens de tema (input border, accentText en usos),
   mover `PageHeader`.
2. Backend: `streamQueryExtractor` out, `include` de metadata.
3. Front por página: auth pages → layout/nav → Library → Course → Section
   → Search → Profile/Settings → NotFound → limpieza (More, barrel, dead
   code).
4. Verificación: `pnpm verify`, build, impeccable detect, smoke manual.
