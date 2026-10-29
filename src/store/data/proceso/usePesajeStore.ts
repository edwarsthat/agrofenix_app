import { create } from "zustand";
import { socketRequest } from "../../../lib/socket";
import { avisarDesincronizado } from "../../../helpers/desincronizado";
import {
    CursorPesajes,
    FiltrosPesajesBascula,
    PesajeBascula,
    PesajesBasculaRespuesta,
    TotalPesajesOperario,
    pesajesBasculaRespuestaSchema,
} from "../../../types/inventarios/materias_primas/pesajesBascula";

// PENDIENTE (2026-10-30): en el servidor, la función que registra el pesaje de
// báscula tiene que hacer un rebroadcast del pesaje nuevo por el socket. Con eso
// aquí se agrega un `eventAddPesaje` (como los `event*` de los otros stores) y la
// pestaña "Pesajes en curso" se actualiza en tiempo real sin volver a pedir.

// Mismo texto en todos los avisos para que `avisarDesincronizado` los agrupe
// en un solo toast si fallan varias páginas seguidas.
const CONTEXTO = "los pesajes de báscula"

interface MovimientoMateriaPrimaStore {
    registroPesaje: PesajeBascula[]
    totalesPesaje: TotalPesajesOperario[]
    // Se guardan los filtros de la primera página porque el backend exige que
    // las siguientes repitan la misma llamada, solo cambiando el cursor.
    filtrosPesaje: FiltrosPesajesBascula | null
    siguienteCursor: CursorPesajes | null
    getRegistroMovimientoMateriaPrima: (filtros: FiltrosPesajesBascula) => Promise<void>
    getMasRegistroMovimientoMateriaPrima: () => Promise<void>
}

async function pedirPesajes(
    filtros: FiltrosPesajesBascula,
    cursor: CursorPesajes | null
): Promise<PesajesBasculaRespuesta | null> {
    const request = {
        action: "inventarios:pesajes_bascula:read",
        payload: { ...filtros, cursor },
    }
    const response = await socketRequest(request)
    if (response.status !== 200) return null

    const parsed = pesajesBasculaRespuestaSchema.safeParse(response.data)
    if (!parsed.success) {
        avisarDesincronizado(CONTEXTO, parsed.error)
        return null
    }
    return parsed.data
}

const useMovimientoMateriaPrimaStore = create<MovimientoMateriaPrimaStore>((set, get) => ({
    registroPesaje: [],
    totalesPesaje: [],
    filtrosPesaje: null,
    siguienteCursor: null,
    getRegistroMovimientoMateriaPrima: async (filtros: FiltrosPesajesBascula) => {
        try {
            const data = await pedirPesajes(filtros, null)
            if (!data) return

            set({
                registroPesaje: data.pesajes,
                totalesPesaje: data.totales,
                filtrosPesaje: filtros,
                siguienteCursor: data.siguiente_cursor,
            })
        } catch (err) {
            console.error("[Pesajes báscula] error:", err)
        }
    },
    getMasRegistroMovimientoMateriaPrima: async () => {
        const { filtrosPesaje, siguienteCursor } = get()
        // Sin cursor no hay más páginas; sin filtros nunca se pidió la primera.
        if (!filtrosPesaje || !siguienteCursor) return

        try {
            const data = await pedirPesajes(filtrosPesaje, siguienteCursor)
            if (!data) return

            set((state) => ({
                registroPesaje: [...state.registroPesaje, ...data.pesajes],
                totalesPesaje: data.totales,
                siguienteCursor: data.siguiente_cursor,
            }))
        } catch (err) {
            console.error("[Pesajes báscula] error:", err)
        }
    },
}))

export default useMovimientoMateriaPrimaStore;
