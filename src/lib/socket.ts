import { invoke } from "@tauri-apps/api/core"
import { toast } from "../store/useTosterStore"
import { loading } from "../store/useLoadingStore"
import useSessionStore from "../store/useSessionStore"

export interface SocketRequest {
    action: string
    payload?: unknown
    isSuccess?: boolean
    /** Poner en false para peticiones de fondo que no deben tapar la pantalla. */
    showLoading?: boolean
    /** Texto del loading global mientras dura la petición. */
    loadingLabel?: string
}

export interface SocketErr {
    kind: "NotConnected" | "TimeOut" | "SendFailed" | "InvalidResponse" | "Disconnected"
    message: string
}

export interface ServerResponse<T> {
    id: string,
    message: string,
    status: number,
    data?: T | null
}

/** Errores que significan que ya no hay socket: la sesión no sirve. */
const KINDS_SIN_SESION: SocketErr["kind"][] = ["NotConnected", "Disconnected"]

export function isSocketErr(e: unknown): e is SocketErr {
    return typeof e === "object" && e !== null && "kind" in e
}

/**
 * Si el error implica que la sesión murió, la cierra y devuelve true para que
 * quien llama no ponga además el toast genérico de error.
 *
 * Cubre el hueco que deja `socket://closed`: cuando el socket nunca llegó a
 * conectarse no hay loop que se cierre, así que nadie emite ese evento.
 */
function manejarSesionCaida(err: unknown): boolean {
    if (!isSocketErr(err) || !KINDS_SIN_SESION.includes(err.kind)) return false

    const { isAuth, cerrarSesion } = useSessionStore.getState()
    // Guard para que N peticiones en paralelo no disparen N toasts.
    if (isAuth) {
        cerrarSesion()                                   // isAuth = false -> <Navigate to="/login" />
        invoke("disconect_socket").catch(() => { })      // limpia el estado del socket en Rust
        toast.error("Sesión finalizada", "Se perdió la conexión con el servidor. Vuelve a iniciar sesión.")
    }
    return true
}

// TEMPORAL: retardo artificial para poder ver el loading. Poner a 0 (o borrar
// junto con su uso en socketRequest) antes de subir a producción.
// const DEBUG_DELAY_MS = 0
// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function socketRequest<T>({
    action,
    payload,
    isSuccess = false,
    showLoading = true,
    loadingLabel,
}: SocketRequest): Promise<ServerResponse<T>> {
    if (showLoading) loading.start(loadingLabel)
    try {
        // El servidor espera el payload aplanado: { action, ...data }. Si lo
        // dejáramos como { action, payload }, al envolverlo en Rust ({ id, token,
        // payload }) quedaría doblemente anidado.
        const request = {
            action,
            ...(payload as Record<string, unknown> | undefined),
        }
        // await sleep(DEBUG_DELAY_MS) // TEMPORAL: borrar
        const response = await invoke<ServerResponse<T>>("send_socket_message", { info: request })

        // El servidor respondió, pero con un error de negocio. El toast lo pone el
        // catch, para que haya un único sitio donde se muestran los errores.
        if (response.status >= 400) {
            throw new Error(response.message)
        }

        if (isSuccess) {
            toast.success("Success", response.message)
        }
        return response
    } catch (err) {
        // Los errores de Rust (TimeOut, NotConnected...) llegan como { kind, message },
        // no como Error: hay que sacarles el mensaje a mano.
        if (!manejarSesionCaida(err)) {
            const message = isSocketErr(err)
                ? err.message
                : err instanceof Error ? err.message : String(err)
            toast.error("Error", message)
        }
        throw err
    } finally {
        if (showLoading) loading.stop()
    }
}

