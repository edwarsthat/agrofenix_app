import { create } from "zustand";
import { ProgramacionProceso, programacionProcesoSchema } from "../../../types/proceso/programacionProceso";
import { socketRequest } from "../../../lib/socket";
import { avisarDesincronizado } from "../../../helpers/desincronizado";


interface ProgramacionProcesoStore {
    loteProcesando: ProgramacionProceso | null,
    addProgramacionLote: (lote_id: string, observaciones: string) => Promise<ProgramacionProceso | null>
}

const useProgramacionProcesoStore = create<ProgramacionProcesoStore>((set) => ({
    loteProcesando: null,
    addProgramacionLote: async (lote_id: string, observaciones: string) => {
        try {
            const request = {
                action: "proceso:programacion_proceso:add",
                payload: { lote_id, observaciones },
                isSuccess: true,
            }
            const response = await socketRequest<ProgramacionProceso>(request)

            const parsed = programacionProcesoSchema.safeParse(response.data)
            if (!parsed.success) {
                avisarDesincronizado("procesar lote", parsed.error)
                return null
            }

            set({ loteProcesando: parsed.data })
            return parsed.data
        } catch (err) {
            console.error("[Programacion proceso] error:", err)
            return null
        }
    }
}))

export default useProgramacionProcesoStore;