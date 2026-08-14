import { ReactNode } from 'react'
import { Pencil, Trash2, KeyRound, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import styles from './CardRow.module.css'

export interface CardColumn<T> {
    key: string
    header: string
    type?: 'boolean' // si el dato es booleano, renderiza un ícono en vez del valor crudo
    mono?: boolean // valor en tipografía monoespaciada (ids, ips, códigos)
    fullWidth?: boolean // ocupa las dos columnas del grid de metadatos
    render?: (row: T) => ReactNode
}

export interface CardAcciones<T> {
    onEditar?: (row: T) => void
    onEliminar?: (row: T) => void
    onResetPassword?: (row: T) => void
    onReactivar?: (row: T) => void
}

export interface CardBadge {
    texto: string
    activo?: boolean
}

export interface CardRowProps<T> {
    row: T
    columns: CardColumn<T>[]
    titulo: (row: T) => string
    subtitulo?: (row: T) => ReactNode
    avatar?: (row: T) => string // iniciales; por defecto se derivan del título
    badge?: (row: T) => CardBadge | null
    estaActivo?: (row: T) => boolean
    acciones?: CardAcciones<T>
}

function renderBooleano(valor: unknown): ReactNode {
    return (
        <span className={styles.boolCell}>
            {valor ? (
                <CheckCircle2 size={16} className={styles.boolTrue} aria-label="Sí" />
            ) : (
                <XCircle size={16} className={styles.boolFalse} aria-label="No" />
            )}
        </span>
    )
}

function iniciales(texto: string): string {
    return texto
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(palabra => palabra.charAt(0).toUpperCase())
        .join('')
}

export default function CardRow<T>({
    row,
    columns,
    titulo,
    subtitulo,
    avatar,
    badge,
    estaActivo,
    acciones
}: CardRowProps<T>) {
    const mostrarAcciones = Boolean(
        acciones && (acciones.onEditar || acciones.onEliminar || acciones.onReactivar || acciones.onResetPassword)
    )
    // sin estaActivo asumimos activo (mismo criterio que Tabla)
    const activo = estaActivo ? estaActivo(row) : true
    const texto = titulo(row)
    const insignia = badge
        ? badge(row)
        : estaActivo
            ? { texto: activo ? 'Activo' : 'Inactivo', activo }
            : null

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.avatar}>{avatar ? avatar(row) : iniciales(texto)}</div>

                <div className={styles.headerText}>
                    <div className={styles.title}>{texto}</div>
                    {subtitulo && <div className={styles.subtitle}>{subtitulo(row)}</div>}
                </div>

                {insignia && (
                    <span
                        className={`${styles.badge} ${insignia.activo === false ? styles.badgeInactive : styles.badgeActive}`}
                    >
                        {insignia.texto}
                    </span>
                )}
            </div>

            {columns.length > 0 && (
                <div className={styles.meta}>
                    {columns.map(col => {
                        const valor = (row as Record<string, unknown>)[col.key]
                        return (
                            <div
                                key={col.key}
                                className={`${styles.metaItem} ${col.fullWidth ? styles.metaItemFull : ''}`}
                            >
                                <span className={styles.metaLabel}>{col.header}</span>
                                <span className={col.mono ? styles.metaValueMono : styles.metaValue}>
                                    {col.render
                                        ? col.render(row)
                                        : col.type === 'boolean'
                                            ? renderBooleano(valor)
                                            : String(valor ?? '')}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}

            {mostrarAcciones && (
                <div className={styles.actions}>
                    {acciones?.onEditar && (
                        <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => acciones.onEditar!(row)}
                            aria-label="Editar"
                            title="Editar"
                        >
                            <Pencil size={16} />
                        </button>
                    )}
                    {acciones?.onResetPassword && (
                        <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => acciones.onResetPassword!(row)}
                            aria-label="Cambiar contraseña"
                            title="Cambiar contraseña"
                        >
                            <KeyRound size={16} />
                        </button>
                    )}
                    {activo
                        ? acciones?.onEliminar && (
                            <button
                                type="button"
                                className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                                onClick={() => acciones.onEliminar!(row)}
                                aria-label="Eliminar"
                                title="Eliminar"
                            >
                                <Trash2 size={16} />
                            </button>
                        )
                        : acciones?.onReactivar && (
                            <button
                                type="button"
                                className={`${styles.actionBtn} ${styles.actionBtnReactivar}`}
                                onClick={() => acciones.onReactivar!(row)}
                                aria-label="Reactivar"
                                title="Reactivar"
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}
                </div>
            )}
        </div>
    )
}
