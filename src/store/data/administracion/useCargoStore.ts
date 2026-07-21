import { create } from "zustand";
import z from "zod";
import { Cargo, cargoSchema } from "../../../types/administracion/cargos";
import { socketRequest } from "../../../lib/socket";
import { confirm } from "../../../helpers/Confirmacion";
import { CargosFormType } from "../../../views/administracion/cargos/validation";

interface CargoStore {
    cargos: Cargo[]
    eliminando: string[]
    getCargos: () => Promise<void>
    eliminarCargo: (cargo_id: string) => Promise<void>
    addCargo: (formState: CargosFormType, seleccionados: Set<string>) => Promise<boolean>
    updateCargo: (cargoId: string, formState: CargosFormType, seleccionados: Set<string>) => Promise<boolean>
    eventAddCargo: (cargo: Cargo) => void
    eventUpdateCargo: (cargo: Cargo) => void
    eventDeleteCargo: (cargo_id: string) => void
}


const useCargoStore = create<CargoStore>((set, get) => ({
    cargos: [],
    eliminando: [],
    getCargos: async (): Promise<void> => {
        try {
            const response = await socketRequest<Cargo[]>({ action: "administracion:cargos:read" })
            if (response.status === 200) {
                const parsed = z.array(cargoSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    console.error("[cargos] respuesta inválida:", parsed.error)
                    return
                }
                set({ cargos: parsed.data })
            }
        } catch (err) {
            console.error("[cargos] error:", err)
        }
    },
    eliminarCargo: async (cargo_id) => {
        if (get().eliminando.includes(cargo_id)) return

        if (!(await confirm({ mensaje: "¿Eliminar este cargo?", danger: true }))) return

        set((state) => ({ eliminando: [...state.eliminando, cargo_id] }))
        try {
            await socketRequest({ action: "administracion:cargos:delete", payload: { cargo_id }, isSuccess: true })
            set((state) => ({
                cargos: state.cargos.map((c) =>
                    c.id === cargo_id ? { ...c, activo: false } : c
                ),
            }))
        } catch (err) {
            console.error("[cargos] error:", err)
        } finally {
            set((state) => ({ eliminando: state.eliminando.filter((id) => id !== cargo_id) }))
        }
    },
    addCargo: async (formState: CargosFormType, seleccionados: Set<string>) => {
        try {
            const request = {
                action: "administracion:cargos:add",
                payload: { ...formState, permisos: [...seleccionados] },
                isSuccess: true,
            }
            await socketRequest<Cargo>(request)
            return true
        } catch (err) {
            console.error("[cargos] error:", err)
            return false
        }
    },
    updateCargo: async (cargoId: string, formState: CargosFormType, seleccionados: Set<string>) => {
        try {
            const request = {
                action: "administracion:cargos:update",
                payload: { cargo_id: cargoId, ...formState, permisos: [...seleccionados] },
                isSuccess: true,
            }
            await socketRequest<Cargo>(request)
            return true
        } catch (err) {
            console.error("[cargos] error:", err)
            return false
        }
    },
    eventAddCargo: (cargo: Cargo) => {
        set((state) =>
            state.cargos.some((c) => c.id === cargo.id)
                ? state
                : { cargos: [...state.cargos, cargo] }
        )
    },
    eventUpdateCargo: (cargo: Cargo) => {
        set((state) =>
            state.cargos.some((c) => c.id === cargo.id)
                ? { cargos: state.cargos.map((c) => (c.id === cargo.id ? cargo : c)) }
                : { cargos: [...state.cargos, cargo] }
        )
    },
    eventDeleteCargo: (cargoId: string) => {
        set((state) => ({
            cargos: state.cargos.map((c) =>
                c.id === cargoId ? { ...c, activo: false } : c
            ),
        }))
    }

}))

export default useCargoStore