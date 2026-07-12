import { invoke } from "@tauri-apps/api/core"
import { toast } from "../store/useTosterStore"

export interface SocketRequest {
    action: string
    payload?: unknown
    isSuccess?: boolean
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

export async function socketRequest<T>({
    action,
    payload,
    isSuccess = false
}: SocketRequest): Promise<ServerResponse<T>> {
    try {
        const request = {
            action, payload
        }
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
    }
}

