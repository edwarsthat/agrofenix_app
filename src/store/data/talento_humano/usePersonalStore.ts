import { create } from "zustand";
import { Empleado, empleadoSchema } from "../../../types/talento_humano/personal";
import { PersonalFormType, PersonalReadPayload } from "../../../views/talento_humano/personal/validations";
import { socketRequest } from "../../../lib/socket";
import z from "zod";
import { confirm } from "../../../helpers/Confirmacion";

interface PersonalStore {
    persoonal: Empleado[]
    eliminados: string[]
    addPersonal: (form: PersonalFormType) => Promise<Empleado | null>
    getPersonal: (filtros?: PersonalReadPayload) => Promise<void>
    updatePersonal: (empleado_id: string, version: number, form: PersonalFormType) => Promise<boolean>
    deletePersonal: (empleado_id: string) => Promise<void>
    activarPersonal: (empleado_id: string) => Promise<boolean>
    eventAddPersonal: (empleado: Empleado) => void
    eventUpdatePersonal: (empleado: Empleado) => void
    eventDeletePersonal: (empelado: string) => void
}

const usePersonalStore = create<PersonalStore>((set, get) => ({
    persoonal: [],
    eliminados: [],
    addPersonal: async (form: PersonalFormType) => {
        try {
            const request = {
                action: "talento_humano:personal:add",
                payload: { ...form },
                isSuccess: true,
            }
            const response = await socketRequest<Empleado>(request)

            const parsed = empleadoSchema.safeParse(response.data)
            if (!parsed.success) {
                console.error("[Personal] respuesta inválida:", parsed.error)
                return null
            }
            return parsed.data
        } catch (err) {
            console.error("[Personal] error:", err)
            return null
        }
    },
    getPersonal: async (filtros?: PersonalReadPayload) => {
        try {
            const request = {
                action: "talento_humano:personal:read",
                payload: filtros
            }
            const response = await socketRequest(request)
            if (response.status === 200) {
                const parsed = z.array(empleadoSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    console.error("[personal] respuesta inválida:", parsed.error)
                    return
                }
                set({ persoonal: parsed.data })
            }
        } catch (err) {
            console.error("[personal] error:", err)
        }
    },
    updatePersonal: async (empleado_id: string, version: number, form: PersonalFormType) => {
        try {
            const request = {
                action: "talento_humano:personal:update",
                payload: { empleado_id: empleado_id, version, ...form },
                isSuccess: true,
            }
            await socketRequest<Empleado>(request)
            return true
        } catch (err) {
            console.error("[personal] error:", err)
            return false
        }
    },
    deletePersonal: async (empleado_id: string) => {
        if (get().eliminados.includes(empleado_id)) return

        if (!(await confirm({ mensaje: "¿Eliminar el empleado?", danger: true }))) return

        set((state) => ({ eliminados: [...state.eliminados, empleado_id] }))

        try {
            const request = {
                action: "talento_humano:personal:delete",
                payload: { empleado_id },
                isSuccess: true,
            }
            await socketRequest(request)
            set((state) => ({
                persoonal: state.persoonal.map((c) =>
                    c.id === empleado_id ? { ...c, activo: false } : c
                ),
            }))
        } catch (err) {
            console.error("[personal] error:", err)
        } finally {
            set((state) => ({ eliminados: state.eliminados.filter((id) => id !== empleado_id) }))
        }
    },
    activarPersonal: async (empleado_id: string) => {
        if (!(await confirm({ mensaje: "¿Activar el empleado?", danger: true }))) return false

        try {
            const request = {
                action: "talento_humano:personal:reactivar",
                payload: { empleado_id },
                isSuccess: true,
            }
            await socketRequest<Empleado>(request)
            set((state) => ({
                persoonal: state.persoonal.map((c) =>
                    c.id === empleado_id ? { ...c, activo: true } : c
                ),
            }))
            return true
        } catch (err) {
            console.error("[personal] error:", err)
            return false
        }
    },
    eventAddPersonal: (empleado: Empleado) => {
        set((state) =>
            state.persoonal.some((c) => c.id === empleado.id)
                ? state
                : { persoonal: [empleado, ...state.persoonal] }
        )
    },
    eventUpdatePersonal: (empleado: Empleado) => {
        set((state) => {
            const index = state.persoonal.findIndex((c) => c.id === empleado.id)

            if (index === -1) {
                return { persoonal: [empleado, ...state.persoonal] }
            }

            const persoonal = [...state.persoonal]
            persoonal[index] = empleado
            return { persoonal }
        })
    },
    eventDeletePersonal: (empleado_id: string) => {
        set((state) => ({
            persoonal: state.persoonal.map((c) =>
                c.id === empleado_id ? { ...c, activo: false } : c
            ),
        }))
    }

}));

export default usePersonalStore;