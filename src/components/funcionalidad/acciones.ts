import type { LucideIcon } from 'lucide-react'
import { Pencil, RotateCcw, Trash2 } from 'lucide-react'

export type VarianteAccion = 'normal' | 'danger' | 'success'

export interface AccionFila<T> {
    id: string                                    // key de React; único dentro del array
    icono: LucideIcon
    titulo: string                                // sirve para title y aria-label a la vez
    onClick: (row: T) => void
    visible?: (row: T) => boolean                 // sin esto, siempre visible
    variante?: VarianteAccion                     // default 'normal'
}

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



