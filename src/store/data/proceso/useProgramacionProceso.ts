import { create } from "zustand";
import { ProgramacionProceso, programacionProcesoSchema } from "../../../types/proceso/programacionProceso";
import { HistorialProcesado, historialProcesadoSchema } from "../../../types/proceso/historialProcesado";
import { socketRequest } from "../../../lib/socket";
import { avisarDesincronizado } from "../../../helpers/desincronizado";
import z from "zod";

// Mismo texto en los dos avisos de desincronización a propósito: `avisarDesincronizado`
// agrupa por contexto, así que un add y un read que fallan seguidos dejan un solo toast.
const CONTEXTO = "la programación de proceso"

const LIMITE_REGISTRO = 50

// El cursor se reenvía tal cual llegó: el servidor compara (inicio_en, id) y si
// cambia la precisión del timestamp se repiten o saltan filas.
const cursorRegistroSchema = z.object({
    inicio_en: z.string(),
    id: z.uuidv4(),
})

const registroRespuestaSchema = z.object({
    programaciones: z.array(historialProcesadoSchema),
    siguiente_cursor: cursorRegistroSchema.nullable(),
})

type CursorRegistro = z.infer<typeof cursorRegistroSchema>

interface ProgramacionProcesoStore {
    loteProcesando: ProgramacionProceso[],
    registroProgramacionProceso: HistorialProcesado[],
    siguienteCursorRegistro: CursorRegistro | null,
    addProgramacionLote: (lote_id: string, observaciones: string) => Promise<ProgramacionProceso | null>
    getLotesProcesando: () => Promise<void>
    finalizarProceso: (lote_id: string) => Promise<boolean>
    getRegistroProcesoLote: () => Promise<void>
    getMasRegistroProcesoLote: () => Promise<void>
}

async function pedirRegistro(cursor: CursorRegistro | null) {
    const request = {
        action: "proceso:programacion_proceso:read",
        payload: { limite: LIMITE_REGISTRO, cursor },
    }
    const response = await socketRequest(request)
    if (response.status !== 200) return null

    const parsed = registroRespuestaSchema.safeParse(response.data)
    if (!parsed.success) {
        avisarDesincronizado(CONTEXTO, parsed.error)
        return null
    }
    return parsed.data
}

const useProgramacionProcesoStore = create<ProgramacionProcesoStore>((set, get) => ({
    loteProcesando: [],
    registroProgramacionProceso: [],
    siguienteCursorRegistro: null,
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
    },
    // Primera página: reemplaza lo que hubiera. Se usa también al recargar.
    getRegistroProcesoLote: async () => {
        try {
            const data = await pedirRegistro(null)
            if (!data) return

            set({
                registroProgramacionProceso: data.programaciones,
                siguienteCursorRegistro: data.siguiente_cursor,
            })
        } catch (err) {
            console.error("[Programación proceso] error:", err)
        }
    },
    getMasRegistroProcesoLote: async () => {
        const { siguienteCursorRegistro } = get()
        // Sin cursor no hay más páginas.
        if (!siguienteCursorRegistro) return

        try {
            const data = await pedirRegistro(siguienteCursorRegistro)
            if (!data) return

            set((state) => ({
                registroProgramacionProceso: [...state.registroProgramacionProceso, ...data.programaciones],
                siguienteCursorRegistro: data.siguiente_cursor,
            }))
        } catch (err) {
            console.error("[Programación proceso] error:", err)
        }
    },
}))

export default useProgramacionProcesoStore;
