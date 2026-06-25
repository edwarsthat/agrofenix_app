import { fetch } from "@tauri-apps/plugin-http"
import { create } from "zustand"
import config from "../config"

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
        console.log("useSession", data)
        set({ 
            token: data.session_id, 
            usuario: data.usuario, 
            permisos: data.permisos,
            isAuth: true
        })
    },
    logout: async () => {
        console.log("logout")
    }
}))

export default useSessionStore;