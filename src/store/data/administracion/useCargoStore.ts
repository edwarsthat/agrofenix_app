import { create } from "zustand";
import { Cargo } from "../../../types/administracion/cargos";
import { socketRequest } from "../../../lib/socket";
import { confirm } from "../../../helpers/Confirmacion";

interface CargoStore {
    cargos: Cargo[]
    eliminando: string[]
    getCargos: () => Promise<void>
    eliminarCargo: (cargo_id: string) => Promise<void>
}

const useCargoStore = create<CargoStore>((set, get) => ({
    cargos: [],
    eliminando: [],
    getCargos: async (): Promise<void> => {
        try {
            const response = await socketRequest<Cargo[]>({ action: "administracion:cargos:read" })
            if (response.status === 200) {
                set({ cargos: response.data ?? [] })
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
            set((state) => ({ cargos: state.cargos.filter((c) => c.id !== cargo_id) }))
        } catch (err) {
            console.error("[cargos] error:", err)
        } finally {
            set((state) => ({ eliminando: state.eliminando.filter((id) => id !== cargo_id) }))
        }
    }

}))

export default useCargoStore