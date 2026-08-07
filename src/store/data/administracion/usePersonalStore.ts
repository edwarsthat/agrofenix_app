import { create } from "zustand";
import { Empleado, empleadoSchema } from "../../../types/administracion/personal";
import { PersonalFormType, PersonalReadPayload } from "../../../views/administracion/personal/validations";
import { socketRequest } from "../../../lib/socket";
import z from "zod";

interface PersonalStore {
    persoonal: Empleado[]
    eliminados: string[]
    addPersonal: (form: PersonalFormType) => Promise<Empleado | null>
    getPersonal: (filtros?: PersonalReadPayload) => Promise<void>
    updatePersonal: (empleado_id: string, version: number, form: PersonalFormType) => Promise<boolean>
    eventAddPersonal: (empleado: Empleado) => void
    eventUpdatePersonal: (empleado: Empleado) => void
}

const usePersonalStore = create<PersonalStore>((set, get) => ({
    persoonal: [],
    eliminados: [],
    addPersonal: async (form: PersonalFormType) => {
        try {
            const request = {
                action: "administracion:personal:add",
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
                action: "administracion:personal:read",
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
            // `version` es la que tenía el empleado cuando se abrió el formulario:
            // si otro usuario ya guardó cambios sobre él, el servidor rechaza esta
            // petición en vez de pisar lo suyo.
            const request = {
                action: "administracion:personal:update",
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
    }

}));

export default usePersonalStore;