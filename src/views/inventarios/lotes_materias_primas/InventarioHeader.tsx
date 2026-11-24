import type { ReactNode } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import { formatearPeso } from '../../../helpers/formatos'
import styles from './InventarioHeader.module.css'

export type TotalesInventario = {
    lotes: number
    ingresadoKg: number
    disponibleKg: number
}

export type MateriaPrimaResumen = TotalesInventario & {
    id: string
    nombre: string
}

type propsType = {
    materias: MateriaPrimaResumen[]
    totales: TotalesInventario
    // Id de la materia prima; null = "Todas"
    materiaSeleccionada: string | null
    onMateriaChange: (materiaPrimaId: string | null) => void
    onIngresarLote: () => void
    breadcrumb?: ReactNode
}

export default function InventarioHeader({
    materias,
    totales,
    materiaSeleccionada,
    onMateriaChange,
    onIngresarLote,
    breadcrumb
}: propsType) {
    const resumen = materiaSeleccionada === null
        ? { nombre: "Todas", ...totales }
        : materias.find(m => m.id === materiaSeleccionada) ?? null

    const chips: { key: string | null; label: string; count: number }[] = [
        { key: null, label: "Todas", count: totales.lotes },
        ...materias.map(m => ({ key: m.id, label: m.nombre, count: m.lotes })),
    ]

    return (
        <header className={styles.root}>
            <div className={styles.top}>
                <div>
                    {breadcrumb ?? (
                        <p className={styles.breadcrumb}>
                            Inventario
                            <ChevronRight className={styles.icon} aria-hidden="true" />
                            <strong>Materia prima</strong>
                        </p>
                    )}
                    <h2 className={styles.title}>Inventario</h2>
                </div>

                <button type="button" className={styles.primaryBtn} onClick={onIngresarLote}>
                    <Plus className={styles.icon} aria-hidden="true" />
                    Ingresar lote
                </button>
            </div>

            <div className={styles.filters}>
                <span className={styles.filtersLabel} id="filtro-materia">Materia prima</span>
                <ul className={styles.chips} aria-labelledby="filtro-materia">
                    {chips.map(chip => (
                        <li key={chip.key ?? "__todas"}>
                            <button
                                type="button"
                                className={styles.chip}
                                aria-pressed={materiaSeleccionada === chip.key}
                                onClick={() => onMateriaChange(chip.key)}
                            >
                                {chip.label}
                                <span className={styles.chipCount}>{chip.count}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {resumen && (
                <div className={styles.summary} aria-live="polite">
                    <div className={styles.summaryMain}>
                        <span className={styles.avatar} aria-hidden="true">
                            {resumen.nombre.charAt(0)}
                        </span>
                        <div>
                            <div className={styles.statLabel}>Materia prima</div>
                            <div className={styles.statValue}>{resumen.nombre}</div>
                        </div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statLabel}>Disponible</div>
                        <div className={`${styles.statValue} ${styles.highlight}`}>
                            {formatearPeso(resumen.disponibleKg)}
                        </div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statLabel}>Ingresado</div>
                        <div className={styles.statValue}>{formatearPeso(resumen.ingresadoKg)}</div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statLabel}>Lotes</div>
                        <div className={styles.statValue}>{resumen.lotes}</div>
                    </div>
                </div>
            )}
        </header>
    )
}
