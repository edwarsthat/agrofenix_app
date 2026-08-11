import { create } from "zustand";
import { Sesion, sesionSchema } from "../../../types/administracion/sesiones";
import { socketRequest } from "../../../lib/socket";
import z from "zod";
import { confirm } from "../../../helpers/Confirmacion";

interface SesionesStore {
    sesiones: Sesion[]
    eliminados: string[]
    getSessiones: () => Promise<void>
    deleteSesiones: (usuario_id: string) => Promise<void>
    eventDeleteSesiones: (usuario_id: string) => void
}

const useSesionesStore = create<SesionesStore>((set, get) => ({
    sesiones: [],
    eliminados: [],
    getSessiones: async () => {
        try {
            const request = {
                action: "administracion:sesiones:read",
            }
            const response = await socketRequest(request)
            if (response.status === 200) {
                const parsed = z.array(sesionSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    console.error("[sesion] respuesta inválida:", parsed.error)
                    return
                }
                set({ sesiones: parsed.data })
            }
        } catch (err) {
            console.error("[sesion] error:", err)
        }
    },
    deleteSesiones: async (usuario_id: string) => {
        if (get().eliminados.includes(usuario_id)) return

        if (!(await confirm({ mensaje: "¿Cerrar las sesiones de este usuario?", danger: true }))) return

        set((state) => ({ eliminados: [...state.eliminados, usuario_id] }))

        try {
            const request = {
                action: "administracion:sesiones:delete",
                payload: { usuario_id },
                isSuccess: true,
            }
            await socketRequest(request)
            // La sesión revocada deja de existir, así que sale de la lista.
            set((state) => ({
                sesiones: state.sesiones.filter((s) => s.usuario_id !== usuario_id),
            }))
        } catch (err) {
            console.error("[sesiones] error:", err)
        } finally {
            set((state) => ({ eliminados: state.eliminados.filter((id) => id !== usuario_id) }))
        }
    },
    eventDeleteSesiones: (usuario_id: string) => {
        set((state) => ({
            sesiones: state.sesiones.filter((s) => s.usuario_id !== usuario_id),
        }))
    }
}))

export default useSesionesStore;