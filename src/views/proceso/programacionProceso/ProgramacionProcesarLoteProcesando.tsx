import { useMemo } from "react"
import { Check, Factory, StickyNote } from "lucide-react"
import { InventarioMateriaPrima } from "../../../types/inventarios/materias_primas/lotesInventario"
import { ProgramacionProceso } from "../../../types/proceso/programacionProceso"
import { formatearFecha, formatearPeso } from "../../../helpers/formatos"
import styles from "./ProgramacionProcesarLoteProcesando.module.css"

type propsType = {
    programacion: ProgramacionProceso | null
    lote?: InventarioMateriaPrima | null
}

export default function ProgramacionProcesarLoteProcesando({ programacion, lote }: propsType) {
    const avance = useMemo(() => {
        if (!lote) return null

        const porcentaje = (lote.consumido / lote.peso_ingreso) * 100
        return {
            ancho: Math.min(100, Math.max(0, porcentaje)),
            excedido: lote.consumido > lote.peso_ingreso,
        }
    }, [lote])

    const handleFinalizarProceso = async () => {}

    if (!programacion) {
        return (
            <section className={styles.empty} aria-label="Lote en proceso">
                <div className={styles.emptyIcon}>
                    <Factory size={22} aria-hidden="true" />
                </div>
                <div>
                    <div className={styles.emptyTitle}>Ningún lote en proceso</div>
                    <div className={styles.emptyText}>
                        Elige un lote del inventario y presiona Procesar para abrir la línea.
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className={styles.card} aria-label="Lote en proceso">
            <div className={styles.main}>
                <div className={styles.header}>
                    <span className={styles.badge}>
                        <span className={styles.badgeDot} aria-hidden="true" />
                        En proceso
                    </span>
                    <span className={styles.orden}>Línea {programacion.linea}</span>
                </div>

                <div className={styles.titleRow}>
                    {lote
                        ? <>
                            <span className={styles.codigo}>{lote.codigo}</span>
                            <span className={styles.materia}>{lote.materia_prima}</span>
                        </>
                        // Sin el lote no hay código que mostrar: se dice eso, en vez
                        // de pintar un hueco que parezca un error de carga.
                        : <span className={styles.materia}>El lote ya no está en el inventario</span>
                    }
                </div>

                <div className={styles.fields}>
                    <div>
                        <div className={styles.label}>Inicio</div>
                        <div className={styles.value}>{formatearFecha(programacion.inicio_en)}</div>
                    </div>
                    {lote && (
                        <>
                            <div>
                                <div className={styles.label}>Predio</div>
                                <div className={styles.value}>{lote.predio}</div>
                            </div>
                            <div>
                                <div className={styles.label}>Proveedor</div>
                                <div className={styles.value}>{lote.proveedor}</div>
                            </div>
                            <div>
                                <div className={styles.label}>Peso de ingreso</div>
                                <div className={styles.valueStrong}>{formatearPeso(lote.peso_ingreso)}</div>
                            </div>
                        </>
                    )}
                </div>

                {lote && avance && (
                    <div className={styles.progress}>
                        <div className={styles.progressHead}>
                            <span className={styles.label}>Avance</span>
                            <span className={`${styles.restante} ${avance.excedido ? styles.restanteExcedido : ""}`}>
                                {avance.excedido
                                    ? `Excedido en ${formatearPeso(lote.consumido - lote.peso_ingreso)}`
                                    : `Restan ${formatearPeso(lote.saldo)}`}
                            </span>
                        </div>

                        {/* role="progressbar" y no un div a secas: el ancho del
                            relleno es puro CSS y un lector de pantalla no lo ve.
                            Los valores van sobre el consumido real, sin recortar,
                            para no mentir en el caso excedido. */}
                        <div
                            className={styles.track}
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={lote.peso_ingreso}
                            aria-valuenow={lote.consumido}
                            aria-valuetext={`${formatearPeso(lote.consumido)} de ${formatearPeso(lote.peso_ingreso)}`}
                        >
                            <div
                                className={`${styles.fill} ${avance.excedido ? styles.fillExcedido : ""}`}
                                style={{ width: `${avance.ancho}%` }}
                            />
                        </div>

                        <div className={styles.progressFoot}>
                            {formatearPeso(lote.consumido)} procesados de {formatearPeso(lote.peso_ingreso)}
                        </div>
                    </div>
                )}

                {programacion.observaciones && (
                    <div className={styles.observaciones}>
                        <StickyNote size={16} className={styles.observacionesIcon} aria-hidden="true" />
                        <div className={styles.observacionesText}>{programacion.observaciones}</div>
                    </div>
                )}
            </div>


            <>
                <div className={styles.divider} aria-hidden="true" />
                <div className={styles.aside}>
                    <button type="button" className={styles.finalizar} onClick={handleFinalizarProceso}>
                        <Check size={17} aria-hidden="true" />
                        Finalizar proceso
                    </button>
                    <p className={styles.asideNote}>
                        Al finalizar, la programación se cierra y la línea queda libre
                        para el siguiente lote.
                    </p>
                </div>
            </>

        </section>
    )
}
