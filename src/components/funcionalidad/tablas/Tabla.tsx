import { ReactNode } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import styles from './Table.module.css'

export interface TablaColumn<T> {
    key: string
    header: string
    width?: string // valor de grid-template-columns, ej: '2.2fr', '110px'
    render?: (row: T) => ReactNode
}

interface TablaAcciones<T> {
    onEditar?: (row: T) => void
    onEliminar?: (row: T) => void
}

interface TablaProps<T> {
    columns: TablaColumn<T>[]
    data: T[]
    rowKey: (row: T) => string | number
    acciones?: TablaAcciones<T>
    emptyTitle?: string
    emptyMessage?: string
}

export default function Tabla<T>({
    columns,
    data,
    rowKey,
    acciones,
    emptyTitle = 'Sin resultados',
    emptyMessage = 'No hay datos para mostrar.'
}: TablaProps<T>) {
    const mostrarAcciones = Boolean(acciones && (acciones.onEditar || acciones.onEliminar))

    const gridTemplateColumns = [
        ...columns.map(col => col.width ?? '1fr'),
        ...(mostrarAcciones ? ['110px'] : [])
    ].join(' ')

    return (
        <div className={styles.card}>
            <div className={styles.headRow} style={{ gridTemplateColumns }}>
                {columns.map(col => (
                    <span key={col.key}>{col.header}</span>
                ))}
                {mostrarAcciones && <span>Acciones</span>}
            </div>

            {data.length === 0 ? (
                <div className={styles.empty}>
                    <span className={styles.emptyTitle}>{emptyTitle}</span>
                    <span>{emptyMessage}</span>
                </div>
            ) : (
                data.map(row => (
                    <div
                        key={rowKey(row)}
                        className={styles.row}
                        style={{ gridTemplateColumns }}
                    >
                        {columns.map(col => (
                            <span key={col.key}>
                                {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                            </span>
                        ))}

                        {mostrarAcciones && (
                            <div className={styles.actions}>
                                {acciones?.onEditar && (
                                    <button
                                        type="button"
                                        className={styles.actionBtn}
                                        onClick={() => acciones.onEditar!(row)}
                                        aria-label="Editar"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                )}
                                {acciones?.onEliminar && (
                                    <button
                                        type="button"
                                        className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                                        onClick={() => acciones.onEliminar!(row)}
                                        aria-label="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}
