import { create } from "zustand";
import { IngresoMateriaPrima, ingresoMateriaPrimaSchema } from "../../../../types/inventarios/materias_primas/ingresosMateriasPrimas";
import {
    LoteMateriaPrimaFormType,
    toLoteMateriaPrimaAddPayload,
} from "../../../../views/inventarios/lotes_materias_primas/validations";
import { socketRequest } from "../../../../lib/socket";
import { avisarDesincronizado } from "../../../../helpers/desincronizado";

interface IngresoLoteMateriasPrimasStore {
    lotesMateriasPrimas: IngresoMateriaPrima[],
    // La clave la trae quien llama, no se genera aquí: tiene que ser la MISMA en
    // cada reintento del mismo lote, y un store que la generara en cada llamada
    // le mandaría una nueva al backend, que crearía el lote gemelo que la clave
    // existe para evitar.
    addLotesMateriasPrimas: (
        form: LoteMateriaPrimaFormType,
        clave_idempotencia: string
    ) => Promise<IngresoMateriaPrima | null>
}

// Reemplaza el lote en la lista, o lo agrega arriba si no estaba.
const upsert = (lotes: IngresoMateriaPrima[], ingreso_nuevo: IngresoMateriaPrima): IngresoMateriaPrima[] => {
    const index = lotes.findIndex((p) => p.id === ingreso_nuevo.id)
    if (index === -1) return [ingreso_nuevo, ...lotes]

    const copia = [...lotes]
    copia[index] = ingreso_nuevo
    return copia
}

const useIngresoLoteMateriasPrimasStore = create<IngresoLoteMateriasPrimasStore>((set) => ({
    lotesMateriasPrimas: [],
    addLotesMateriasPrimas: async (form: LoteMateriaPrimaFormType, clave_idempotencia: string) => {
        try {
            const request = {
                action: "inventarios:ingresos_materias_primas:add",

                payload: toLoteMateriaPrimaAddPayload(form, clave_idempotencia),
                isSuccess: true,
            }
            const response = await socketRequest<IngresoMateriaPrima>(request)

            const parsed = ingresoMateriaPrimaSchema.safeParse(response.data)
            if (!parsed.success) {
                avisarDesincronizado("los lotes", parsed.error)
                return null
            }

            set((state) => ({ lotesMateriasPrimas: upsert(state.lotesMateriasPrimas, parsed.data) }))
            return parsed.data
        } catch (err) {
            console.error("[lotes materias primas] error:", err)
            return null
        }
    }
}))

export default useIngresoLoteMateriasPrimasStore;