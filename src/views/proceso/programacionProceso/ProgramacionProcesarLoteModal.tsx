import { useId, useState } from "react"
import { AlertTriangle } from "lucide-react"
import FenixButton from "../../../components/UI/Button/FenixButton"
import { InventarioMateriaPrima } from "../../../types/inventarios/materias_primas/lotesInventario"
import { formatearFecha, formatearPeso } from "../../../helpers/formatos"
import styles from "./ProgramacionProcesarLoteModal.module.css"
import useProgramacionProcesoStore from "../../../store/data/proceso/useProgramacionProceso"

const OBSERVACIONES_MAXIMO = 500

type propsType = {
    lote: InventarioMateriaPrima
    codigoLoteEnProceso?: string | null
    onProcesado: () => void
    onCancel: () => void
}

export default function ProgramacionProcesarLoteModal({
    lote,
    codigoLoteEnProceso,
    onProcesado,
    onCancel,
}: propsType) {
    const { addProgramacionLote } = useProgramacionProcesoStore();
    const [observaciones, setObservaciones] = useState("")
    const [procesando, setProcesando] = useState(false)
    const observacionesId = useId()

    const handleProcesar = async () => {

        if (procesando) return
        setProcesando(true)
        try {
            const programacion = await addProgramacionLote(lote.lote_id, observaciones)
            // null significa que falló: el store ya puso el toast, así que aquí
            // solo queda dejar el modal abierto para poder reintentar sin volver a
            // buscar el lote en la tabla. El store ya dejó la programación nueva en
            // memoria, no hace falta recargar nada al cerrar.
            if (!programacion) return
            onProcesado()
        } finally {
            setProcesando(false)
        }
    }

    return (
        <div className={styles["pl-contenido"]}>
            <div className={styles["pl-lote"]}>
                <div className={styles["pl-lote__id"]}>
                    <div className={styles["pl-lote__codigo"]}>{lote.codigo}</div>
                    <div className={styles["pl-lote__materia"]}>{lote.materia_prima}</div>
                </div>

                {/* El saldo va primero y en la tipografía numérica: es la
                    cantidad que realmente entra a proceso, no el peso de
                    ingreso, que a esta altura ya puede tener consumos. */}
                <div className={styles["pl-lote__grid"]}>
                    <div>
                        <div className={styles["pl-dato__label"]}>Saldo disponible</div>
                        <div className={`${styles["pl-dato__valor"]} ${styles["pl-dato__valor--num"]}`}>
                            {formatearPeso(lote.saldo)}
                        </div>
                    </div>
                    <div>
                        <div className={styles["pl-dato__label"]}>Peso de ingreso</div>
                        <div className={`${styles["pl-dato__valor"]} ${styles["pl-dato__valor--num"]}`}>
                            {formatearPeso(lote.peso_ingreso)}
                        </div>
                    </div>
                    <div>
                        <div className={styles["pl-dato__label"]}>Proveedor</div>
                        <div className={styles["pl-dato__valor"]}>{lote.proveedor}</div>
                    </div>
                    <div>
                        <div className={styles["pl-dato__label"]}>Predio</div>
                        <div className={styles["pl-dato__valor"]}>{lote.predio}</div>
                    </div>
                    <div>
                        <div className={styles["pl-dato__label"]}>Ingreso a bodega</div>
                        <div className={styles["pl-dato__valor"]}>{formatearFecha(lote.llegada_en)}</div>
                    </div>
                </div>
            </div>

            <div className={styles["pl-campo"]}>
                <label className={styles["pl-campo__label"]} htmlFor={observacionesId}>
                    Observaciones{" "}
                    <span className={styles["pl-campo__opcional"]}>(opcional)</span>
                </label>
                <textarea
                    id={observacionesId}
                    className={styles["pl-textarea"]}
                    rows={3}
                    maxLength={OBSERVACIONES_MAXIMO}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    disabled={procesando}
                    placeholder="Estado de la materia prima, novedades del lote, indicaciones para planta…"
                />
                <span className={styles["pl-campo__contador"]}>
                    {observaciones.length}/{OBSERVACIONES_MAXIMO}
                </span>
            </div>

            {codigoLoteEnProceso && (
                <div className={styles["pl-aviso"]}>
                    <AlertTriangle size={18} className={styles["pl-aviso__icono"]} aria-hidden="true" />
                    <div className={styles["pl-aviso__texto"]}>
                        La programación del lote <strong>{codigoLoteEnProceso}</strong> se
                        cerrará como finalizada.
                    </div>
                </div>
            )}

            <div className={styles["pl-acciones"]}>
                <FenixButton variant="ghost" onClick={onCancel} disabled={procesando}>
                    Cancelar
                </FenixButton>
                <FenixButton onClick={handleProcesar} loading={procesando}>
                    Procesar lote
                </FenixButton>
            </div>
        </div>
    )
}
