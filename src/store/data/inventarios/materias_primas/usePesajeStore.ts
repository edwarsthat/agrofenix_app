import { create } from "zustand";
import { socketRequest } from "../../../../lib/socket";
import { avisarDesincronizado } from "../../../../helpers/desincronizado";
import {
    CursorPesajes,
    FiltrosPesajesBascula,
    PesajeBascula,
    PesajesBasculaRespuesta,
    TotalPesajesOperario,
    pesajesBasculaRespuestaSchema,
} from "../../../../types/inventarios/materias_primas/pesajesBascula";

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
    eventNewPesaje: (registro: PesajeBascula) => void
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
    eventNewPesaje: (registro: PesajeBascula) => {
        set((state) => {
            if (state.registroPesaje.some((p) => p.id === registro.id)) return state

            // El pesaje no trae operario_id, así que el total se busca por código.
            // Si el operario aún no tiene total en la lista, se deja como está
            // hasta la próxima lectura.
            const totalesPesaje = state.totalesPesaje.map((t) =>
                t.operario_codigo === registro.operario_codigo
                    ? { ...t, cantidad: t.cantidad + 1, kg: t.kg + registro.peso }
                    : t
            )

            return {
                registroPesaje: [registro, ...state.registroPesaje],
                totalesPesaje,
            }
        })
    },
}))

export default useMovimientoMateriaPrimaStore;
