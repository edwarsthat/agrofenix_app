import { fetch } from "@tauri-apps/plugin-http"
import { create } from "zustand"
import config from "../config"
import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"

// Listeners de los eventos que emite el backend de Rust. Se registran una sola
// vez al cargar el módulo para no duplicarlos en cada login.
listen("socket://message", (e) => console.log("[socket] mensaje:", e.payload))
listen("socket://error", (e) => console.error("[socket] error:", e.payload))
listen("socket://closed", () => console.warn("[socket] conexión cerrada"))

interface SessionType {
    isAuth: boolean
    token: string | null
    usuario: string | null
    permisos: string[] 
    login: (usuario: string, password: string) => Promise<void>
    logout: (token: string) => Promise<void>
}

const useSessionStore = create<SessionType>((set) => ({
    isAuth: false,
    token: null,
    usuario: null,
    permisos: [],
    login: async (usuario, password): Promise<void> => {
        const response = await fetch(`${config.API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, password }),
        })
        
        if (!response.ok) {
            throw new Error("Usuario o contraseña incorrectos")
        }

        const data = await response.json() 
        set({ 
            token: data.session_id, 
            usuario: data.usuario, 
            permisos: data.permisos,
            isAuth: true
        })

        try {
            await invoke("connect_socket", { token: data.session_id })
            console.log("✅ socket conectado")
        } catch (e) {
            console.error("❌ fallo al conectar socket:", e)
        }
    },
    logout: async () => {
        console.log("logout")
    }
}))

export default useSessionStore;