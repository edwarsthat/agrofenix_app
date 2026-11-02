import { useEffect, useMemo, useState } from "react";

// Paginación en el front para listas que ya están completas en el store. Lo
// que devuelve, menos `filas`, se pasa tal cual a <Paginacion {...} />.
export default function usePaginacion<T>(data: T[], tamano: number) {
    const [pagina, setPagina] = useState(0)
    const totalPaginas = Math.max(1, Math.ceil(data.length / tamano))

    // Si un filtro achica la lista, no quedarse en una página que ya no existe.
    useEffect(() => {
        if (pagina > totalPaginas - 1) setPagina(totalPaginas - 1)
    }, [pagina, totalPaginas])

    const filas = useMemo(
        () => data.slice(pagina * tamano, (pagina + 1) * tamano),
        [data, pagina, tamano]
    )

    return {
        filas,
        pagina: pagina + 1,
        totalPaginas,
        totalItems: data.length,
        tamano,
        hayAnterior: pagina > 0,
        haySiguiente: pagina < totalPaginas - 1,
        onAnterior: () => setPagina((p) => Math.max(0, p - 1)),
        onSiguiente: () => setPagina((p) => Math.min(totalPaginas - 1, p + 1)),
        onIrA: (p: number) => setPagina(Math.min(totalPaginas - 1, Math.max(0, p - 1))),
    }
}
