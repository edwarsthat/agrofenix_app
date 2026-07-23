import { create } from "zustand";
import { Usuario, usuarioSchema } from "../../../types/administracion/usuarios";
import { socketRequest } from "../../../lib/socket";
import z from "zod";

interface UsuariosStore {
    usuarios: Usuario[]
    eliminados: string[]
    getUsuarios: () => Promise<void>
}

const useUsuarioStore = create<UsuariosStore>((set) => ({
    usuarios: [],
    eliminados: [],
    getUsuarios: async () => {
        try {
            const request = {
                action: "administracion:usuarios:read"
            }
            const response = await socketRequest(request)
            if (response.status === 200) {
                const parsed = z.array(usuarioSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    console.error("[cargos] respuesta inválida:", parsed.error)
                    return
                }
                console.log(parsed.data)
                set({ usuarios: parsed.data })
            }
        } catch (err) {
            console.error("[usuarioStore]: ", err)
        }
    }
}))

export default useUsuarioStore