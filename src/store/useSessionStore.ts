import { fetch } from "@tauri-apps/plugin-http"
import { create } from "zustand"
import config from "../config"
import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { socketRequest } from "../lib/socket"
import { toast } from "./useTosterStore"

interface SessionType {
    isAuth: boolean
    token: string | null
    usuario: string | null
    permisos: string[]
    debe_cambiar_password: boolean
    login: (usuario: string, password: string) => Promise<void>
    logout: (token: string) => Promise<void>
    changePassword: (password: string, newPassword: string) => Promise<void>
    cerrarSesion: () => void
}

const useSessionStore = create<SessionType>((set, get) => ({
    isAuth: false,
    token: null,
    usuario: null,
    debe_cambiar_password: false,
    permisos: [],
    login: async (usuario, password): Promise<void> => {
        let response: Response
        try {
            response = await fetch(`${config.API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, password }),
            })
        } catch (err) {
            console.error("[useSessionStore] login:", err)
            throw new Error("No se pudo conectar con el servidor")
        }

        if (!response.ok) {
            // Solo el 401 es culpa de las credenciales; el resto es un fallo del
            // servidor y no tiene sentido decirle al usuario que se equivocó.
            throw new Error(
                response.status === 401
                    ? "Usuario o contraseña incorrectos"
                    : "No se pudo iniciar sesión, intenta más tarde"
            )
        }

        const data = await response.json()

        console.log("session store", data)
        if (data.usuario.debe_cambiar_password) {

            set({
                debe_cambiar_password: true,
                usuario: data.usuario.usuario,
                token: data.session_id,
            })

        } else {

            set({
                token: data.session_id,
                usuario: data.usuario.usuario,
                permisos: data.permisos,
                debe_cambiar_password: data.debe_cambiar_password,
                isAuth: true
            })

            // Sin socket la app no sirve para nada, y como el loop nunca arranca
            // tampoco llegaría un socket://closed que nos saque de aquí después.
            try {
                await invoke("connect_socket", { token: data.session_id })
                console.log("✅ socket conectado")
            } catch (e) {
                console.error("❌ fallo al conectar socket:", e)
                set({ token: null, usuario: null, permisos: [], isAuth: false })
                throw new Error("No se pudo establecer la conexión con el servidor")
            }
        }

    },
    logout: async () => {
        try {
            const token = get().token
            await socketRequest({
                action: "sistema:auth:logout",
                payload: { token }
            })
        } catch (err) {
            console.error("[useSessionStore]:", err)
        } finally {
            // Apagamos la sesión ANTES de cerrar el socket: el disconnect provoca
            // un socket://closed, y el listener debe verlo con isAuth ya en false
            // para no confundir un logout voluntario con una caída.
            set({ token: null, usuario: null, permisos: [], isAuth: false })
            await invoke("disconect_socket").catch((err) => { console.error(err) })
        }
    },
    changePassword: async (password: string, new_password: string): Promise<void> => {
        const usuario = get().usuario
        const token = get().token

        const response = await fetch(`${config.API_URL}/cambiar-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ usuario, new_password, password }),
        })

        if (!response.ok) {
            throw new Error("No se pudo actualizar la contraseña")
        }

        set({
            token: null,
            usuario: null,
            permisos: [],
            debe_cambiar_password: false,
            isAuth: false
        })
    },
    cerrarSesion: () => {
        set({
            token: null,
            usuario: null,
            permisos: [],
            isAuth: false
        })
    }
}))

export function initSessionListeners() {
    // Listeners de los eventos que emite el backend de Rust. Se registran una sola
    // vez al cargar el módulo para no duplicarlos en cada login.
    listen("socket://error", (e) => console.error("[socket] error:", e.payload))

    listen("socket://closed", () => {
        console.warn("[socket] conexión cerrada")

        // El cierre voluntario (logout) también pasa por aquí: si ya no hay sesión,
        // no hay nada que cerrar ni que avisar.
        const { isAuth, cerrarSesion } = useSessionStore.getState()
        if (!isAuth) return

        cerrarSesion()   // isAuth = false -> App.tsx redirige a /login
        toast.error("Sesión finalizada", "Se perdió la conexión con el servidor. Vuelve a iniciar sesión.")
    })
}



export default useSessionStore;