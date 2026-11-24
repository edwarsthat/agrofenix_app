# Agrofenix App — convenciones del front

Tauri 2 + React 19 + TypeScript + Zustand + Zod 4. Arquitectura general y NFC en
[README.md](../README.md). El backend (Rust) es otro repo: `../oxid_fenix` respecto
a la raíz de este; ahí se confirma qué endpoints, campos y permisos existen.

## Estructura

Cada dominio (`administracion`, `catalogos`, `inventarios`, `proceso`, `proveedores`,
`talento_humano`) se repite, donde aplique, en estas carpetas:

| Carpeta | Qué va |
|---|---|
| `src/types/<dominio>/` | Schemas Zod de lo que manda el backend y sus tipos (`z.infer`) |
| `src/store/data/<dominio>/` | Stores de Zustand; aquí se piden los datos |
| `src/lib/socketRouter/<dominio>/` | Eventos en vivo del servidor → store |
| `src/views/<dominio>/<modulo>/` | Vista, formularios, filtros, modales y `validations.ts` |

Compartido: `components/funcionalidad` (Tabla, MobileList, Paginacion, Form, modal,
acciones), `components/UI`, `hooks`, `helpers`, `config/menu.ts`, `styles` (tokens).

Módulos de referencia:
- CRUD completo: `views/proveedores/predios` + `usePredioStore`.
- Lista con buscador y paginación: `views/proceso/programacionProceso`.

## Cómo se piden los datos

Todo, menos el login, va por el socket. Las vistas no llaman al socket: usan el store.

`vista → store → socketRequest → Zod → set`

- Acción: `"<area>:<modulo>:<accion>"`, ej. `inventarios:inventario_materia_prima:read`.
- `payload` se manda como objeto; `socketRequest` lo aplana.
- `isSuccess: true` muestra el toast de éxito: solo en acciones que guardan.
- `showLoading: false` en recargas de fondo, para no tapar la pantalla.
- `socketRequest` ya muestra el toast de error y relanza. El store atrapa, hace
  `console.error` y devuelve `null`/`false`; no pone otro toast.
- La respuesta se valida siempre con `safeParse`. Si falla: `avisarDesincronizado`
  y no se toca el estado.

```ts
getPredios: async (filtros?: PrediosReadPayload) => {
    try {
        const request = { action: "proveedores:predios:read", payload: filtros }
        const response = await socketRequest(request)
        if (response.status === 200) {
            const parsed = z.array(predioSchema).safeParse(response.data ?? [])
            if (!parsed.success) {
                avisarDesincronizado("los predios", parsed.error)
                return
            }
            set({ predios: parsed.data })
        }
    } catch (err) {
        console.error("[predios] error:", err)
    }
}
```

### Nombres en el store
- Peticiones: `getX`, `addX`, `updateX`, `deleteX`. Eventos del servidor: `eventAddX`,
  `eventUpdateX`...
- `add` devuelve el registro o `null`; `update` devuelve `boolean`. La vista cierra el
  modal solo si salió bien.
- `update` manda la `version` del registro.
- Los borrados piden confirmación con `confirm` (`helpers/Confirmacion`).
- Registros que no se pueden duplicar mandan una clave de idempotencia, generada al
  abrir el formulario y reusada en cada reintento.

### Desde la vista

```ts
const { getPredios, predios } = usePredioStore()

useEffect(() => {
    getPredios()
}, [getPredios])
```

Catálogos y listas de apoyo se piden solo si faltan:

```ts
useEffect(() => {
    if (useMateriaPrima.getState().materiaPrima.length === 0) getMateriaPrima()
}, [getMateriaPrima])
```

- Filtros, totales y agrupaciones se derivan con `useMemo`; no se guardan en el store.
- Opciones de filtro y de select salen del catálogo, no de los registros cargados:
  deben aparecer aunque no haya registros. Se filtra por id, nunca por nombre.

### Eventos en vivo
Llegan como `{ event, action, data }`. `event` elige el router en `lib/socketRouter.ts`;
cada router hace `switch` por `action`, valida con Zod y llama al `eventX` del store. Si
el evento no trae todo lo que pinta la lista, se vuelve a pedir con `showLoading: false`.

### Paginación
- Lista completa en el store: `usePaginacion` + `<Paginacion {...paginacion} />`.
- Lista que crece sin límite: pagina el servidor por cursor. El store guarda el cursor y
  lo reenvía sin modificar; `getX` trae la primera página y `getMasX` agrega la siguiente
  (ver `usePesajeStore`).

### Permisos
El permiso es `<modulo>:<accion>` (`predios:read`). Los datos los protege el backend; el
front solo oculta el menú (`config/menu.ts`). Un evento llega a quien tenga
`<event>:read`. Antes de reusar un store en otra vista, revisar que quien la abre tenga
el permiso de ese endpoint.

## Tipos
- Las claves del schema replican al backend (`snake_case`); lo demás va en `camelCase` o
  `SCREAMING_SNAKE`.
- Lo que en el backend es `Option` va `.nullable()` en el schema.
- Los schemas no deben ser más estrictos que el backend: con `z.array`, un solo registro
  inválido deja la lista entera sin cargar. Las reglas de captura van en `validations.ts`.
- `validations.ts`: tipo del formulario, valores iniciales, schema, `buildXFormArr` y
  `toXPayload`.

## Vistas
- `export default function`, props en `type propsType`, sangría de 4 espacios.
- Escritorio y móvil con `useIsMobile`: `<Tabla>` o `<MobileList>`, cada una con sus
  columnas en `useMemo`.
- Acciones de fila: las de `components/funcionalidad/acciones.ts`.
- Formularios: `<Form>` dentro de `modal.show({ ... })`.
- Fechas y pesos: `formatearFecha` y `formatearPeso` (`helpers/formatos`).
- Íconos: `lucide-react`.
- Al agregar una vista: ruta en `App.tsx`, entrada en `config/menu.ts` con su permiso.

## Estilos
- CSS Modules junto a la vista o en su carpeta `styles/`. La vista se envuelve en `.page`
  de `views/modulos.module.css`.
- Colores, espacios, radios y fuentes con los tokens de `src/styles`. Preferir
  `--color-*`, que ya cambian en modo oscuro, sobre `--fenix-*`.
- Móvil: `@media (max-width: 767px)`, igual que `useIsMobile`.
- No hay `box-sizing` global: ponerlo donde haya `width: 100%` con padding o borde.

## Código y comentarios
En español. Los comentarios explican el porqué, no lo que ya dice el código. Lo que queda
sin hacer se marca con `PENDIENTE:`.

## Verificar

```
npx tsc --noEmit
npm run test:run
```
