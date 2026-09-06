
import { create } from "zustand";
import { InventarioMateriaPrima, inventarioMateriaPrimaSchema } from "../../../../types/inventarios/materias_primas/lotesInventario";
import { socketRequest } from "../../../../lib/socket";
import z from "zod";
import { avisarDesincronizado } from "../../../../helpers/desincronizado";


interface InventarioMateriasPrimasStore {
    lotesActualMateriasPrimas: InventarioMateriaPrima[],
    getInventarioMateriaPrima: () => Promise<void>
}

const useInventarioMateriasPrimasStore = create<InventarioMateriasPrimasStore>((set) => ({
    lotesActualMateriasPrimas: [],
    getInventarioMateriaPrima: async () => {
        try {
            const request = {
                action: "inventarios:inventario_materia_prima:read",
            }
            const response = await socketRequest(request)
            console.log(response)
            if (response.status === 200) {
                const parsed = z.array(inventarioMateriaPrimaSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    avisarDesincronizado("Inventario materia prima", parsed.error)
                    return
                }
                set({ lotesActualMateriasPrimas: parsed.data })
            }
        } catch (err) {
            console.error("[Llaves NFC] error:", err)
        }
    },
}))

export default useInventarioMateriasPrimasStore;