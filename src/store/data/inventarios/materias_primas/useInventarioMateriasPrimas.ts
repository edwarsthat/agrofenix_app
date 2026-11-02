
import { create } from "zustand";
import { InventarioMateriaPrima, inventarioMateriaPrimaSchema } from "../../../../types/inventarios/materias_primas/lotesInventario";
import { socketRequest } from "../../../../lib/socket";
import z from "zod";
import { avisarDesincronizado } from "../../../../helpers/desincronizado";


interface InventarioMateriasPrimasStore {
    lotesActualMateriasPrimas: InventarioMateriaPrima[],
    getInventarioMateriaPrima: () => Promise<void>
    eventConsumoLote: (lote_id: string, peso: number) => void
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
    // El consumido puede pasarse del peso de ingreso (la tarjeta lo muestra
    // como excedido), pero el saldo no baja de cero porque el schema no lo admite.
    eventConsumoLote: (lote_id: string, peso: number) => {
        set((state) => ({
            lotesActualMateriasPrimas: state.lotesActualMateriasPrimas.map((l) =>
                l.lote_id === lote_id
                    ? { ...l, consumido: l.consumido + peso, saldo: Math.max(0, l.saldo - peso) }
                    : l
            ),
        }))
    },

}))

export default useInventarioMateriasPrimasStore;