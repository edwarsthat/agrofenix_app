// Fecha y hora en horario local. Todo lo que el backend manda como TIMESTAMPTZ
// llega en ISO y se pinta con este formato, para que una misma marca de tiempo
// no se vea distinta según la vista. Devuelve "—" si el ISO no parsea: la celda
// dice que no hay dato en vez de mostrar "Invalid Date".
export function formatearFecha(iso: string): string {
    const fecha = new Date(iso)
    if (Number.isNaN(fecha.getTime())) return "—"
    return fecha.toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
    })
}

// Los pesos son NUMERIC(12,2) en la base y llegan como number solo para mostrar.
// Se fijan los dos decimales para que la columna quede alineada y no parezca que
// un lote pesa distinto de otro por tener menos dígitos.
export const formatoPeso = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

export const formatearPeso = (kg: number) => `${formatoPeso.format(kg)} kg`
