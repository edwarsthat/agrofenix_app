import { ReactNode } from 'react'
import CardRow, { CardAcciones, CardBadge, CardColumn } from './CardRow'
import styles from './CardRow.module.css'

interface MobileListProps<T> {
    columns: CardColumn<T>[]
    data: T[]
    rowKey: (row: T) => string | number
    titulo: (row: T) => string
    subtitulo?: (row: T) => ReactNode
    avatar?: (row: T) => string
    badge?: (row: T) => CardBadge | null
    estaActivo?: (row: T) => boolean
    acciones?: CardAcciones<T>
    emptyMessage?: string
}

export default function MobileList<T>({
    columns,
    data,
    rowKey,
    titulo,
    subtitulo,
    avatar,
    badge,
    estaActivo,
    acciones,
    emptyMessage = 'No hay datos para mostrar.'
}: MobileListProps<T>) {
    if (data.length === 0) {
        return <div className={styles.empty}>{emptyMessage}</div>
    }

    return (
        <div className={styles.list}>
            {data.map(row => (
                <CardRow
                    key={rowKey(row)}
                    row={row}
                    columns={columns}
                    titulo={titulo}
                    subtitulo={subtitulo}
                    avatar={avatar}
                    badge={badge}
                    estaActivo={estaActivo}
                    acciones={acciones}
                />
            ))}
        </div>
    )
}
