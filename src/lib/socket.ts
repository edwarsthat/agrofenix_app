import { invoke } from "@tauri-apps/api/core"
import { toast } from "../store/useTosterStore"
import { loading } from "../store/useLoadingStore"

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

export function isSocketErr(e: unknown): e is SocketErr {
    return typeof e === "object" && e !== null && "kind" in e
}

// TEMPORAL: retardo artificial para poder ver el loading. Poner a 0 (o borrar
// junto con su uso en socketRequest) antes de subir a producción.
const DEBUG_DELAY_MS = 1000
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function socketRequest<T>({
    action,
    payload,
    isSuccess = false,
    showLoading = true,
    loadingLabel,
}: SocketRequest): Promise<ServerResponse<T>> {
    if (showLoading) loading.start(loadingLabel)
    try {
        const request = {
            action, payload
        }
        await sleep(DEBUG_DELAY_MS) // TEMPORAL: borrar
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
        // Los errores de Rust (TimeOut, NotConnected...) llegan como string, no como Error.
        const message = err instanceof Error ? err.message : String(err)
        toast.error("Error", message)
        throw err
    } finally {
        if (showLoading) loading.stop()
    }
}

