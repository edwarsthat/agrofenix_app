
import { create } from "zustand";
import { InventarioMateriaPrima, inventarioMateriaPrimaSchema } from "../../../../types/inventarios/materias_primas/lotesInventario";
import { socketRequest } from "../../../../lib/socket";
import z from "zod";
import { avisarDesincronizado } from "../../../../helpers/desincronizado";


interface InventarioMateriasPrimasStore {
    lotesActualMateriasPrimas: InventarioMateriaPrima[],
    // showLoading en false cuando la recarga la dispara un evento del servidor:
    // no debe tapar la pantalla de quien está en otra cosa.
    getInventarioMateriaPrima: (showLoading?: boolean) => Promise<void>
    eventConsumoLote: (lote_id: string, peso: number) => void
}

const useInventarioMateriasPrimasStore = create<InventarioMateriasPrimasStore>((set) => ({
    lotesActualMateriasPrimas: [],
    getInventarioMateriaPrima: async (showLoading = true) => {
        try {
            const request = {
                action: "inventarios:inventario_materia_prima:read",
                showLoading,
            }
            const response = await socketRequest(request)
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