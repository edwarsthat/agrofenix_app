import { ReactNode } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import styles from './Table.module.css'
import { AccionFila, VarianteAccion } from '../acciones'

export interface TablaColumn<T> {
    key: string
    header: string
    width?: string // valor de grid-template-columns, ej: '2.2fr', '110px'
    type?: 'boolean' // si el dato es booleano, renderiza un ícono en vez del valor crudo
    render?: (row: T) => ReactNode
}

const CLASE_VARIANTE: Record<VarianteAccion, string> = {
    normal: '',
    danger: styles.actionBtnDelete,
    success: styles.actionBtnReactivar
}

function renderBooleano(valor: unknown): ReactNode {
    return (
        <span className={styles.boolCell}>
            {valor ? (
                <CheckCircle2 size={18} className={styles.boolTrue} aria-label="Sí" />
            ) : (
                <XCircle size={18} className={styles.boolFalse} aria-label="No" />
            )}
        </span>
    )
}

interface TablaProps<T> {
    columns: TablaColumn<T>[]
    data: T[]
    rowKey: (row: T) => string | number
    acciones?: AccionFila<T>[]
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
    const accionesFila = acciones ?? []
    const mostrarAcciones = accionesFila.length > 0
    // 32px de botón + 6px de gap por acción, con un mínimo para que quepa el encabezado
    const anchoAcciones = `${Math.max(110, accionesFila.length * 38)}px`
    const gridTemplateColumns = [
        ...columns.map(col => col.width ?? '1fr'),
        ...(mostrarAcciones ? [anchoAcciones] : [])
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
                        {columns.map(col => {
                            const valor = (row as Record<string, unknown>)[col.key]
                            return (
                                <span key={col.key}>
                                    {col.render
                                        ? col.render(row)
                                        : col.type === 'boolean'
                                            ? renderBooleano(valor)
                                            : String(valor ?? '')}
                                </span>
                            )
                        })}

                        {mostrarAcciones && (
                            <div className={styles.actions}>
                                {accionesFila
                                    .filter(a => a.visible?.(row) ?? true)
                                    .map(a => (
                                        <button
                                            key={a.id}
                                            type="button"
                                            className={`${styles.actionBtn} ${CLASE_VARIANTE[a.variante ?? 'normal']}`}
                                            onClick={() => a.onClick(row)}
                                            aria-label={a.titulo}
                                            title={a.titulo}
                                        >
                                            <a.icono size={16} />
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}
