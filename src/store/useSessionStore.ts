import { fetch } from "@tauri-apps/plugin-http"
import { create } from "zustand"
import config from "../config"

interface SessionType {
    token: string | null
    usuario: string | null
    login: (usuario: string, password: string) => Promise<void>
    logout: (token: string) => Promise<void>
}

const useSessionStore = create<SessionType>((set) => ({
    token: null,
    usuario: null,
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

        set({ token: data.token, usuario: data.usuario })
    },
    logout: async () => {
        console.log("logout")
    }
}))

export default useSessionStore;