import { useState } from "react"
import { Nfc, CheckCircle2, AlertCircle } from "lucide-react"
import FenixButton from "../../../components/UI/Button/FenixButton"
import useEscaneoNfc, { esMovilNativo } from "../../../hooks/useEscaneoNfc"
import FormSelectInput, { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput"
import styles from "./EscanearLlaveForm.module.css"

// Por ahora solo hay un uso para las llaves; la lista crecerá con los módulos.
const DESCRIPCION_OPTIONS: FormSelectOption[] = [
    { value: "identificacion_pelador", label: "Identificación pelador" },
]

// `add` registra la llave (pide descripción y la guarda); `read` solo devuelve
// el UID leído a quien abrió el modal (ej: filtrar por llave).
export type TipoEscaneoLlave = "add" | "read"

type Props = { onCancel: () => void } & (
    | { type: "add"; onGuardar: (uid: string, descripcion: string) => Promise<void> }
    | { type: "read"; readData: (uid: string) => void }
)

export default function EscanearLlaveForm(props: Props) {
    const { type, onCancel } = props
    const { estado, tarjeta, error, reiniciar, escanearMovil } = useEscaneoNfc(true)
    const [descripcion, setDescripcion] = useState("")
    const [guardando, setGuardando] = useState(false)

    const handleGuardar = async () => {
        if (!tarjeta || props.type !== "add") return
        setGuardando(true)
        try {
            await props.onGuardar(tarjeta.uid, descripcion)
        } finally {
            setGuardando(false)
        }
    }

    const handleUsar = () => {
        if (!tarjeta || props.type !== "read") return
        props.readData(tarjeta.uid)
    }

    return (
        <div className={styles.form}>
            {estado === "esperando" && (
                <div className={styles.estado}>
                    <span className={`${styles.icono} ${styles.iconoEsperando}`}>
                        <Nfc size={32} />
                    </span>
                    <p className={styles.mensaje}>
                        {esMovilNativo
                            ? "Pulsa Escanear y acerca la llave a la parte trasera del teléfono"
                            : "Apoya la llave sobre el lector..."}
                    </p>
                </div>
            )}

            {estado === "error" && (
                <div className={styles.estado}>
                    <span className={`${styles.icono} ${styles.iconoError}`}>
                        <AlertCircle size={32} />
                    </span>
                    <p className={styles.mensaje}>No se pudo leer la llave</p>
                    <p className={styles.mensajeError}>{error}</p>
                </div>
            )}

            {estado === "leida" && tarjeta && (
                <>
                    <div className={styles.estado}>
                        <span className={`${styles.icono} ${styles.iconoExito}`}>
                            <CheckCircle2 size={32} />
                        </span>
                        <div className={styles.ficha}>
                            <span className={styles.etiqueta}>UID</span>
                            <span className={styles.uid}>{tarjeta.uid}</span>
                        </div>
                        <span className={styles.origen}>
                            {tarjeta.origen === "telefono" ? "Leída con el teléfono" : "Leída con el lector"}
                        </span>
                    </div>

                    {type === "add" && (
                        <FormSelectInput
                            name="descripcion"
                            label="Descripción"
                            options={DESCRIPCION_OPTIONS}
                            value={descripcion}
                            onChange={setDescripcion}
                            required
                        />
                    )}
                </>
            )}

            <div className={styles.acciones}>
                <div className={styles.accionesInicio}>
                    <FenixButton variant="ghost" onClick={onCancel} disabled={guardando}>
                        Cancelar
                    </FenixButton>
                </div>

                {estado === "esperando" && esMovilNativo && (
                    <FenixButton onClick={escanearMovil}>Escanear</FenixButton>
                )}

                {estado === "error" && (
                    <FenixButton variant="secondary" onClick={reiniciar}>
                        Reintentar
                    </FenixButton>
                )}

                {estado === "leida" && (
                    <>
                        <FenixButton variant="ghost" onClick={reiniciar} disabled={guardando}>
                            Leer otra
                        </FenixButton>
                        {type === "add" ? (
                            <FenixButton
                                onClick={handleGuardar}
                                loading={guardando}
                                disabled={!descripcion}
                            >
                                Guardar
                            </FenixButton>
                        ) : (
                            <FenixButton onClick={handleUsar}>
                                Usar llave
                            </FenixButton>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
