import { CargoPersonal, cargoPersonalSchema } from "../../../types/administracion/cargoPersonal";
import { create } from "zustand"
import { socketRequest } from "../../../lib/socket";
import z from "zod";
import { CargoPersonalForm } from "../../../views/administracion/cargosPersonal/validations";
import { confirm } from "../../../helpers/Confirmacion";

interface CargoPersonalStore {
    cargosPersonal: CargoPersonal[]
    eliminados: string[]
    getCargoPersonal: () => Promise<void>
    addCargoPersonal: (form: CargoPersonalForm) => Promise<CargoPersonal | null>
    updateCargoPersonal: (cargo_id: string, form: CargoPersonalForm) => Promise<boolean>
    eliminarCargoPersonal: (cargo_id: string) => Promise<void>
    activarCargoPersonal: (cargo_id: string) => Promise<boolean>
    eventAddCargoPersonal: (cargo: CargoPersonal) => void
    eventUpdateCargoPersonal: (cargo: CargoPersonal) => void
    eventDeleteCargoPersonal: (cargo_id: string) => void
}

const useCargoPersonalStore = create<CargoPersonalStore>((set, get) => ({
    cargosPersonal: [],
    eliminados: [],
    getCargoPersonal: async () => {
        try {
            const request = {
                action: "administracion:cargos_personal:read"
            }
            const response = await socketRequest(request)
            if (response.status === 200) {
                const parsed = z.array(cargoPersonalSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    console.error("[cargosPersonal] respuesta inválida:", parsed.error)
                    return
                }
                set({ cargosPersonal: parsed.data })
            }
        } catch (err) {
            console.error("[cargosPersonal] error:", err)
        }
    },
    addCargoPersonal: async (form: CargoPersonalForm) => {
        try {
            const request = {
                action: "administracion:cargos_personal:add",
                payload: { ...form },
                isSuccess: true,
            }
            const response = await socketRequest<CargoPersonal>(request)

            const parsed = cargoPersonalSchema.safeParse(response.data)
            if (!parsed.success) {
                console.error("[cargosPersonal] respuesta inválida:", parsed.error)
                return null
            }
            return parsed.data
        } catch (err) {
            console.error("[cargosPersonal] error:", err)
            return null
        }
    },
    updateCargoPersonal: async (cargo_id: string, form: CargoPersonalForm) => {
        try {
            const request = {
                action: "administracion:cargos_personal:update",
                payload: { cargo_id: cargo_id, ...form },
                isSuccess: true,
            }
            await socketRequest<CargoPersonal>(request)
            return true
        } catch (err) {
            console.error("[cargosPersonal] error:", err)
            return false
        }
    },
    eliminarCargoPersonal: async (cargo_id: string) => {
        if (get().eliminados.includes(cargo_id)) return

        if (!(await confirm({ mensaje: "¿Eliminar el cargo?", danger: true }))) return

        set((state) => ({ eliminados: [...state.eliminados, cargo_id] }))

        try {
            const request = {
                action: "administracion:cargos_personal:delete",
                payload: { cargo_id },
                isSuccess: true,
            }
            await socketRequest(request)
            set((state) => ({
                cargosPersonal: state.cargosPersonal.map((c) =>
                    c.id === cargo_id ? { ...c, activo: false } : c
                ),
            }))
        } catch (err) {
            console.error("[cargosPersonal] error:", err)
        } finally {
            set((state) => ({ eliminados: state.eliminados.filter((id) => id !== cargo_id) }))
        }
    },
    activarCargoPersonal: async (cargo_id: string) => {
        if (!(await confirm({ mensaje: "¿Activar el cargo?", danger: true }))) return false

        try {
            const request = {
                action: "administracion:cargos_personal:reactivar",
                payload: { cargo_id },
                isSuccess: true,
            }
            await socketRequest<CargoPersonal>(request)
            set((state) => ({
                cargosPersonal: state.cargosPersonal.map((c) =>
                    c.id === cargo_id ? { ...c, activo: true } : c
                ),
            }))
            return true
        } catch (err) {
            console.error("[cargos_personal] error:", err)
            return false
        }
    },
    eventAddCargoPersonal: (cargo: CargoPersonal) => {
        set((state) =>
            state.cargosPersonal.some((c) => c.id === cargo.id)
                ? state
                : { cargosPersonal: [...state.cargosPersonal, cargo] }
        )
    },
    eventUpdateCargoPersonal: (cargo: CargoPersonal) => {
        set((state) =>
            state.cargosPersonal.some((c) => c.id === cargo.id)
                ? { cargosPersonal: state.cargosPersonal.map((c) => (c.id === cargo.id ? cargo : c)) }
                : { cargosPersonal: [...state.cargosPersonal, cargo] }
        )
    },
    eventDeleteCargoPersonal: (cargo_id: string) => {
        set((state) => ({
            cargosPersonal: state.cargosPersonal.map((c) =>
                c.id === cargo_id ? { ...c, activo: false } : c
            ),
        }))
    }
}))

export default useCargoPersonalStore;