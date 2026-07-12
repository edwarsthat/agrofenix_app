import { invoke } from "@tauri-apps/api/core"

export interface SocketRequest {
    action: string
    data?: unknown
}

export interface SocketErr {
    kind: "NotConnected" | "TimeOut" | "SendFailed" | "InvalidResponse" | "Disconnected"
    message: string
}

export function isSocketErr(e: unknown): e is SocketErr {
    return typeof e === "object" && e !== null && "kind" in e
}

export async function socketRequest<T>(info: SocketRequest): Promise<T> {
    return await invoke<T>("send_socket_message", { info })
}
