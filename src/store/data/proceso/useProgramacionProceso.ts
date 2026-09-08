import { create } from "zustand";
import { ProgramacionProceso, programacionProcesoSchema } from "../../../types/proceso/programacionProceso";
import { socketRequest } from "../../../lib/socket";
import { avisarDesincronizado } from "../../../helpers/desincronizado";
import z from "zod";

// Mismo texto en los dos avisos de desincronización a propósito: `avisarDesincronizado`
// agrupa por contexto, así que un add y un read que fallan seguidos dejan un solo toast.
const CONTEXTO = "la programación de proceso"

interface ProgramacionProcesoStore {
    loteProcesando: ProgramacionProceso[],
    addProgramacionLote: (lote_id: string, observaciones: string) => Promise<ProgramacionProceso | null>
    getLotesProcesando: () => Promise<void>
    finalizarProceso: (lote_id: string) => Promise<boolean>
}

const useProgramacionProcesoStore = create<ProgramacionProcesoStore>((set) => ({
    loteProcesando: [],
    addProgramacionLote: async (lote_id: string, observaciones: string) => {
        try {
            const texto = observaciones.trim()
            const request = {
                action: "proceso:programacion_proceso:add",
                payload: { lote_id, observaciones: texto === "" ? null : texto },
                isSuccess: true,
            }
            const response = await socketRequest<ProgramacionProceso>(request)

            const parsed = programacionProcesoSchema.safeParse(response.data)
            if (!parsed.success) {
                avisarDesincronizado(CONTEXTO, parsed.error)
                return null
            }

            set((state) => ({
                loteProcesando: [
                    parsed.data,
                    ...state.loteProcesando.filter((p) => p.id !== parsed.data.id),
                ],
            }))
            return parsed.data
        } catch (err) {
            console.error("[Programación proceso] error:", err)
            return null
        }
    },
    getLotesProcesando: async () => {
        try {
            const request = {
                action: "proceso:lotes_materia_prima_procesando:read",
            }
            const response = await socketRequest(request)
            if (response.status === 200) {
                const parsed = z.array(programacionProcesoSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    avisarDesincronizado(CONTEXTO, parsed.error)
                    return
                }
                set({ loteProcesando: parsed.data })
            }
        } catch (err) {
            console.error("[Programación proceso] error:", err)
        }
    },
    finalizarProceso: async (lote_id: string) => {
        try {
            const request = {
                action: "proceso:lotes_materia_prima_procesando:finalizar",
                payload: { lote_id },
                isSuccess: true,
            }

            await socketRequest(request)

            set((state) => ({
                loteProcesando: state.loteProcesando.filter((p) => p.lote_id !== lote_id),
            }))
            return true
        } catch (err) {
            console.error("[Programación proceso] error:", err)
            return false
        }
    }
}))

export default useProgramacionProcesoStore;
