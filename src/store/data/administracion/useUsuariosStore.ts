import { create } from "zustand";
import { Usuario, usuarioSchema } from "../../../types/administracion/usuarios";
import { ServerResponse, socketRequest } from "../../../lib/socket";
import z from "zod";
import { UsuarioFormType } from "../../../views/administracion/usuarios/validation";

export interface UsuarioCreado {
    id: string
    password_temporal: string
}
type AddUsuarioResponse = ServerResponse<Usuario> & { password_temporal: string }

interface UsuariosStore {
    usuarios: Usuario[]
    eliminados: string[]
    getUsuarios: () => Promise<void>
    addUsuario: (form: UsuarioFormType) => Promise<UsuarioCreado | null>
    updateUsuario: (usuario_id: string, form: UsuarioFormType) => Promise<boolean>
    eventAddUsuario: (usuario: Usuario) => void
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
    },
    addUsuario: async (form: UsuarioFormType) => {
        try {
            const request = {
                action: "administracion:usuarios:add",
                payload: { ...form },
                isSuccess: true,
            }
            const response = await socketRequest<Usuario>(request) as AddUsuarioResponse

            return {
                id: response.id,
                password_temporal: response.password_temporal,
            }
        } catch (err) {
            console.error("[usuarios] error:", err)
            return null
        }
    },
    updateUsuario: async (usuario_id: string, formState: UsuarioFormType ) => {
        try {
            const request = {
                action: "administracion:usuarios:update",
                payload: { usuario_id: usuario_id, ...formState },
                isSuccess: true,
            }
            await socketRequest<Usuario>(request)
            return true
        } catch (err) {
            console.error("[cargos] error:", err)
            return false
        }
    },
    eventAddUsuario: (usuario: Usuario) => {
        set((state) =>
            state.usuarios.some((c) => c.id === usuario.id)
                ? state
                : { usuarios: [...state.usuarios, usuario] }
        )
    },
}))

export default useUsuarioStore