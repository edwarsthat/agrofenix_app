import { useState } from "react";
import FenixButton from "../../../components/UI/Button/FenixButton";
import useEscaneoNfcc, { esMovilNativo } from "../../../hooks/useEscaneoNfc"
// Mismos estilos que el escaneo de inventarios: es la misma UI de lectura.
import styles from "../../inventarios/llaves_nfc/EscanearLlaveForm.module.css"
import { Nfc, CheckCircle2, AlertCircle } from "lucide-react"

type propsType = {
    onCancel: () => void
    onGuardar: (tarjeta_uid: string) => Promise<void>
}

export default function EscanearLlaveNfc({ onCancel, onGuardar }: propsType) {
    const { estado, error, reiniciar, escanearMovil, tarjeta } = useEscaneoNfcc(true);
    const [guardando, setGuardando] = useState(false)

    const handleGuardar = async () => {
        if (!tarjeta) return
        setGuardando(true)
        try {
            await onGuardar(tarjeta.uid)
        } finally {
            setGuardando(false)
        }
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

                        <FenixButton onClick={handleGuardar} loading={guardando}>
                            Guardar
                        </FenixButton>

                    </>
                )}
            </div>
        </div>
    )
}