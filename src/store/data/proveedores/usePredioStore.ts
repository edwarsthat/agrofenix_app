import { create } from "zustand";
import { Predio, predioSchema } from "../../../types/proveedores/predios";
import { PredioFormType } from "../../../views/proveedores/predios/validations";
import { socketRequest } from "../../../lib/socket";
import { avisarDesincronizado } from "../../../helpers/desincronizado";

interface PredioStore {
    predios: Predio[],
    eliminados: string[],
    addPredio: (form: PredioFormType) => Promise<Predio | null>

    eventAddPredios: (predio: Predio) => void
}

// Reemplaza el proveedor en la lista, o lo agrega arriba si no estaba.
const upsert = (predios: Predio[], predio: Predio): Predio[] => {
    const index = predios.findIndex((p) => p.id === predio.id)
    if (index === -1) return [predio, ...predios]

    const copia = [...predios]
    copia[index] = predio
    return copia
}

const usePredioStore = create<PredioStore>((set) => ({
    predios: [],
    eliminados: [],
    addPredio: async (form: PredioFormType) => {
        try {
            const request = {
                action: "proveedores:predios:add",
                payload: form,
                isSuccess: true,
            }
            const response = await socketRequest<Predio>(request)

            const parsed = predioSchema.safeParse(response.data)
            if (!parsed.success) {
                avisarDesincronizado("los predios", parsed.error)
                return null
            }

            set((state) => ({ predios: upsert(state.predios, parsed.data) }))
            return parsed.data
        } catch (err) {
            console.error("[predios] error:", err)
            return null
        }
    },
        eventAddPredios: (predio: Predio) => {
            set((state) =>
                state.predios.some((p) => p.id === predio.id)
                    ? state
                    : { predios: [predio, ...state.predios] }
            )
        },
}))

export default usePredioStore;