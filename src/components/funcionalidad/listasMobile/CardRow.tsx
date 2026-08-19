import { ReactNode } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import styles from './CardRow.module.css'
import { AccionFila, VarianteAccion } from '../acciones'

export interface CardColumn<T> {
    key: string
    header: string
    type?: 'boolean' // si el dato es booleano, renderiza un ícono en vez del valor crudo
    mono?: boolean // valor en tipografía monoespaciada (ids, ips, códigos)
    fullWidth?: boolean // ocupa las dos columnas del grid de metadatos
    render?: (row: T) => ReactNode
}

export interface CardBadge {
    texto: string
    activo?: boolean
}

const CLASE_VARIANTE: Record<VarianteAccion, string> = {
    normal: '',
    danger: styles.actionBtnDelete,
    success: styles.actionBtnReactivar
}

export interface CardRowProps<T> {
    row: T
    columns: CardColumn<T>[]
    titulo: (row: T) => string
    subtitulo?: (row: T) => ReactNode
    avatar?: (row: T) => string // iniciales; por defecto se derivan del título
    badge?: (row: T) => CardBadge | null
    estaActivo?: (row: T) => boolean // solo alimenta la insignia por defecto
    acciones?: AccionFila<T>[]
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
    const accionesVisibles = (acciones ?? []).filter(a => a.visible?.(row) ?? true)
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

            {accionesVisibles.length > 0 && (
                <div className={styles.actions}>
                    {accionesVisibles.map(a => (
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
    )
}
