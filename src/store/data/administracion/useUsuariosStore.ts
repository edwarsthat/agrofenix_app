import { create } from "zustand";
import { Usuario, usuarioSchema } from "../../../types/administracion/usuarios";
import { ServerResponse, socketRequest } from "../../../lib/socket";
import z from "zod";
import { avisarDesincronizado } from "../../../helpers/desincronizado";
import { UsuarioFormType } from "../../../views/administracion/usuarios/validation";
import { confirm } from "../../../helpers/Confirmacion";

export interface UsuarioCreado {
    id: string
    password_temporal: string
}
type AddUsuarioResponse = ServerResponse<Usuario> & { password_temporal: string }

interface UsuariosStore {
    usuarios: Usuario[]
    eliminado: string[]
    getUsuarios: () => Promise<void>
    addUsuario: (form: UsuarioFormType) => Promise<UsuarioCreado | null>
    updateUsuario: (usuario_id: string, form: UsuarioFormType) => Promise<boolean>
    newPassword: (usuario_id: string) => Promise<UsuarioCreado | null>
    reActivarUsuario: (usuario_id: string) => Promise<UsuarioCreado | null>
    eliminarUsuario: (usuario_id: string) => Promise<void>
    eventAddUsuario: (usuario: Usuario) => void
    eventUpdateUsuario: (usuario: Usuario) => void
    eventDeleteUsuario: (usuario_id: string) => void
}

const useUsuarioStore = create<UsuariosStore>((set, get) => ({
    usuarios: [],
    eliminado: [],
    getUsuarios: async () => {
        try {
            const request = {
                action: "administracion:usuarios:read"
            }
            const response = await socketRequest(request)
            if (response.status === 200) {
                const parsed = z.array(usuarioSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    avisarDesincronizado("los usuarios", parsed.error)
                    return
                }
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
    updateUsuario: async (usuario_id: string, formState: UsuarioFormType) => {
        try {
            const request = {
                action: "administracion:usuarios:update",
                payload: { usuario_id: usuario_id, ...formState },
                isSuccess: true,
            }
            console.log(request)
            await socketRequest<Usuario>(request)
            return true
        } catch (err) {
            console.error("[cargos] error:", err)
            return false
        }
    },
    eliminarUsuario: async (usuario_id) => {
        if (get().eliminado.includes(usuario_id)) return

        if (!(await confirm({ mensaje: "¿Eliminar el usuario?", danger: true }))) return

        set((state) => ({ eliminado: [...state.eliminado, usuario_id] }))

        try {
            const request = {
                action: "administracion:usuarios:delete",
                payload: { usuario_id },
                isSuccess: true,
            }
            await socketRequest(request)
            set((state) => ({
                usuarios: state.usuarios.map((u) =>
                    u.id === usuario_id ? { ...u, activo: false } : u
                ),
            }))
        } catch (err) {
            console.error("[usuarios] error:", err)
        } finally {
            set((state) => ({ eliminado: state.eliminado.filter((id) => id !== usuario_id) }))
        }
    },
    newPassword: async (usuario_id: string) => {
        try {

            const request = {
                action: "administracion:usuarios:newpassword",
                payload: { usuario_id },
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
    reActivarUsuario: async (usuario_id: string) => {
        if (!(await confirm({ mensaje: "¿Activar el usuario?", danger: true }))) return null

        try {
            const request = {
                action: "administracion:usuarios:reactivar",
                payload: { usuario_id },
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
    eventAddUsuario: (usuario: Usuario) => {
        set((state) =>
            state.usuarios.some((c) => c.id === usuario.id)
                ? state
                : { usuarios: [...state.usuarios, usuario] }
        )
    },
    eventUpdateUsuario: (usuario: Usuario) => {
        set((state) =>
            state.usuarios.some((c) => c.id === usuario.id)
                ? { usuarios: state.usuarios.map((c) => (c.id === usuario.id ? usuario : c)) }
                : { usuarios: [...state.usuarios, usuario] }
        )
    },
    eventDeleteUsuario: (usuario_id: string) => {
        set((state) => ({
            usuarios: state.usuarios.map((u) =>
                u.id === usuario_id ? { ...u, activo: false } : u
            ),
        }))
    }
}))

export default useUsuarioStore