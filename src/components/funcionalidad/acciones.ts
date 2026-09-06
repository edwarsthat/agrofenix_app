import type { LucideIcon } from 'lucide-react'
import { Eye, Pencil, Play, RotateCcw, Trash2 } from 'lucide-react'

export type VarianteAccion = 'normal' | 'danger' | 'success'

export interface AccionFila<T> {
    id: string                                    // key de React; único dentro del array
    icono: LucideIcon
    titulo: string                                // sirve para title y aria-label a la vez
    onClick: (row: T) => void
    visible?: (row: T) => boolean                 // sin esto, siempre visible
    variante?: VarianteAccion                     // default 'normal'
}

export const accionVer = <T>(onClick: (row: T) => void): AccionFila<T> => ({
    id: 'ver',
    icono: Eye,
    titulo: 'Ver detalle',
    onClick,
})

export const accionEditar = <T>(onClick: (row: T) => void): AccionFila<T> => ({
    id: 'editar',
    icono: Pencil,
    titulo: 'Editar',
    onClick,
})

export const accionEliminar = <T extends { activo: boolean }>(
    onClick: (row: T) => void
): AccionFila<T> => ({
    id: 'eliminar',
    icono: Trash2,
    titulo: 'Eliminar',
    onClick,
    variante: 'danger',
    visible: (row) => row.activo,
})

export const accionReactivar = <T extends { activo: boolean }>(
    onClick: (row: T) => void
): AccionFila<T> => ({
    id: 'reactivar',
    icono: RotateCcw,
    titulo: 'Reactivar',
    onClick,
    variante: 'success',
    visible: (row) => !row.activo,
})

// Play y no un ícono de fábrica o engranaje: la acción no abre la
// configuración del lote, arranca su proceso, y el triángulo de 'reproducir' es
// lo único que se lee sin ambigüedad a 16px. Va en variante normal —no
// success— porque no confirma nada: abre el paso siguiente.
export const accionProcesar = <T>(onClick: (row: T) => void): AccionFila<T> => ({
    id: 'procesar',
    icono: Play,
    titulo: 'Procesar lote',
    onClick,
})
