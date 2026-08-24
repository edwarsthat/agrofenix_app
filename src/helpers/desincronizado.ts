import { toast } from "../store/useTosterStore"

/** Ventana en la que se agrupan los avisos del mismo contexto. */
const VENTANA_MS = 5000

const ultimoAviso = new Map<string, number>()


export function avisarDesincronizado(contexto: string, error: unknown, mensaje?: string) {
    console.error(`[${contexto}] no se pudo actualizar el estado local:`, error)

    const ahora = Date.now()
    const previo = ultimoAviso.get(contexto)
    if (previo !== undefined && ahora - previo < VENTANA_MS) return
    ultimoAviso.set(contexto, ahora)

    toast.warning(
        "Datos desactualizados",
        mensaje ?? `No se pudo actualizar ${contexto}. Vuelve a cargar la vista.`
    )
}
