# Agrofenix App

Aplicación de escritorio y móvil para la gestión interna de **Agrofenix**: administración de
usuarios y permisos, talento humano e inventario de llaves NFC.

Está construida con **Tauri 2** (núcleo en Rust) y **React 19 + TypeScript** en la interfaz.
Toda la operación con el servidor viaja por un **WebSocket persistente** gestionado desde Rust,
y la lectura de tarjetas NFC funciona tanto con **lectores USB PC/SC** en escritorio como con
el **NFC nativo del teléfono** en Android/iOS.

> ⚠️ **Software propietario.** El uso de esta aplicación requiere una licencia comercial vigente.
> Ver [LICENSE](LICENSE).

---

## Tabla de contenido

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Módulos](#módulos)
- [NFC](#nfc)
- [Pruebas](#pruebas)
- [Compilación y distribución](#compilación-y-distribución)
- [Licencia](#licencia)

---

## Características

- **Sesión y permisos.** Login por HTTP contra el backend; el token de sesión abre el WebSocket.
  El menú lateral y las vistas se filtran por permisos (`usuarios:read`, `cargos:read`, …).
- **Comunicación en tiempo real.** Un único socket multiplexado: las peticiones se resuelven por
  `id` y los eventos del servidor (`socket://message`) se reparten a los *stores* mediante un router.
- **Interfaz adaptativa.** Tablas en escritorio y listas optimizadas en móvil, con tema claro/oscuro
  tomado del sistema operativo.
- **Componentes propios.** Toasts, loading global, modales por *host* central y formularios con
  validación mediante Zod.
- **Lectura NFC multiplataforma.** Vigilante de lector USB en escritorio y escaneo bajo demanda en móvil.

## Arquitectura

```
┌───────────────────── Frontend (React 19 + TypeScript) ─────────────────────┐
│  views/            pantallas por dominio                                   │
│  store/            estado con Zustand (sesión, UI y datos por dominio)      │
│  lib/socket.ts     socketRequest(): petición -> invoke() -> respuesta       │
│  lib/socketRouter  eventos push del servidor -> store correspondiente       │
└────────────────────────────────┬───────────────────────────────────────────┘
                                 │ Tauri IPC (invoke / listen)
┌────────────────────────────────┴───────────────────────────────────────────┐
│                          Núcleo Tauri 2 (Rust)                             │
│  socket/   actor asíncrono sobre tokio-tungstenite: conexión, envoltura     │
│            {id, token, payload}, correlación de respuestas pendientes y     │
│            emisión de eventos socket://*                                    │
│  nfc/      escritorio: PC/SC (crate `pcsc`) + vigilante de lector           │
│            móvil: tauri-plugin-nfc                                          │
│  command/  comandos expuestos al frontend                                   │
└────────────────────────────────┬───────────────────────────────────────────┘
                                 │ WebSocket (ws/wss) + HTTP para el login
                          Servidor Agrofenix
```

**Comandos Rust disponibles desde el frontend**

| Comando | Descripción |
|---|---|
| `connect_socket` | Abre el WebSocket con el token de sesión en la cabecera `Authorization`. |
| `send_socket_message` | Envía una petición y espera la respuesta correlacionada por `id`. |
| `disconect_socket` | Cierra la conexión y limpia el estado. |
| `listar_lectores` | Lista los lectores PC/SC conectados (escritorio). |
| `leer_tarjeta_ahora` | Lee de inmediato la tarjeta presente en el lector (escritorio). |
| `registrar_tarjeta_movil` | Registra la tarjeta escaneada con el NFC del teléfono. |

**Eventos hacia el frontend:** `socket://message`, `socket://closed`, `nfc://tag`, `nfc://error`.

## Requisitos

- **Node.js** 18 o superior y **pnpm** (el proyecto usa `pnpm-lock.yaml`).
- **Rust** estable con el *toolchain* de Tauri 2 — ver
  [prerequisitos de Tauri](https://tauri.app/start/prerequisites/).
- **Escritorio:** servicio PC/SC activo y un lector NFC USB compatible
  (en Windows viene incluido; en Linux se requieren `pcscd` y `libpcsclite-dev`).
- **Android (opcional):** Android SDK/NDK y JDK 17 configurados para `tauri android`.
- Acceso de red al servidor Agrofenix.

## Instalación

```bash
pnpm install
cp .env.example .env      # ajusta VITE_API_URL
pnpm tauri dev
```

`pnpm dev` levanta solo la interfaz web en `http://localhost:1420`, pero **la app necesita el
núcleo Rust** para el socket y el NFC: para desarrollo usa siempre `pnpm tauri dev`.

## Variables de entorno

| Variable | Ejemplo | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://192.168.0.200:3000` | URL base del servidor. El login va a `${VITE_API_URL}/login` y el socket se deriva a `ws(s)://…/ws`. |

El archivo `.env` se versiona porque solo contiene la URL del servidor; **no guardes secretos en
él**. Para configuraciones personales usa `.env.local`, que está ignorado por git.

> Al cambiar el host o el puerto del servidor hay que actualizar también la lista de URLs
> permitidas del plugin HTTP en [src-tauri/capabilities/default.json](src-tauri/capabilities/default.json),
> o el login será bloqueado por la capa de permisos de Tauri.

## Scripts

| Script | Acción |
|---|---|
| `pnpm dev` | Servidor de desarrollo de Vite (solo frontend). |
| `pnpm build` | Verificación de tipos con `tsc` + build de producción del frontend. |
| `pnpm preview` | Sirve el build de producción del frontend. |
| `pnpm tauri dev` | App completa en modo desarrollo (Rust + frontend). |
| `pnpm tauri build` | Genera los instaladores de escritorio. |
| `pnpm test` | Vitest en modo watch. |
| `pnpm test:run` | Vitest en una sola pasada (CI). |

## Estructura del proyecto

```
src/
  components/
    funcionalidad/     formularios, tablas, listas móviles y modales
    UI/                Button, FormInput, NavBar, Sidebar, Toast, Loading
  config/              configuración global y definición del menú con permisos
  helpers/             utilidades compartidas
  hooks/               useForm, useIsMobile, useEscaneoNfc
  lib/
    socket.ts          cliente de peticiones sobre el socket
    socketRouter/      routers de eventos push por dominio
  store/
    data/              stores de datos por dominio
    useSessionStore    sesión, login/logout y ciclo de vida del socket
    useSystemStore     tema del sistema operativo
    useModalStore · useTosterStore · useLoadingStore
  types/               tipos y esquemas Zod por dominio
  views/               login, home, administración, talento humano, inventarios

src-tauri/
  src/
    command/           comandos expuestos por IPC
    socket/            actor, estado, protocolo, pendientes y eventos
    nfc/               lector PC/SC, vigilante, tipos y errores
  capabilities/        permisos de Tauri (escritorio y móvil)
```

## Módulos

| Dominio | Pantallas |
|---|---|
| **Administración** | Usuarios · Cargos (crear/editar) · Sesiones activas |
| **Talento Humano** | Personal (incluye asignación de llave NFC) · Cargos de personal |
| **Inventarios** | Llaves NFC |

Cada entrada del menú declara su permiso en [src/config/menu.ts](src/config/menu.ts); el usuario
solo ve aquello para lo que el servidor le otorgó permisos al iniciar sesión.

## NFC

**Escritorio.** Al arrancar la app se inicia un vigilante que observa los lectores PC/SC. Cuando
se acerca una tarjeta se lee el UID con el APDU `FF CA 00 00 00`, se captura el ATR y se emite el
evento `nfc://tag`; los errores llegan por `nfc://error`.

**Móvil.** No hay vigilante: el escaneo lo solicita el usuario y lo resuelve `tauri-plugin-nfc`
con el hardware del teléfono. El hook [useEscaneoNfc.ts](src/hooks/useEscaneoNfc.ts) detecta la
plataforma y unifica ambos caminos tras la misma interfaz (`estado`, `tarjeta`, `error`, `reiniciar`).

## Pruebas

```bash
pnpm test:run                  # frontend (Vitest)
cd src-tauri && cargo test     # núcleo Rust
```

Vitest corre en entorno `node` sobre los archivos `src/**/*.test.ts`: esquemas de validación,
routers de socket y stores.

## Compilación y distribución

```bash
pnpm tauri build                 # instaladores en src-tauri/target/release/bundle
pnpm tauri android init          # solo la primera vez
pnpm tauri android dev           # desarrollo en dispositivo o emulador
pnpm tauri android build         # APK / AAB
```

Antes de publicar una versión, sube el número en `package.json`, `src-tauri/Cargo.toml` y
`src-tauri/tauri.conf.json` para que los tres coincidan.

## Licencia

Software **propietario y de uso exclusivo bajo licencia comercial de pago**. No es software libre
ni de código abierto: no se permite su uso, copia, modificación ni distribución sin una licencia
vigente por escrito. Los términos completos están en [LICENSE](LICENSE).

Para adquirir o renovar una licencia, contacta al titular de los derechos indicado en ese archivo.
