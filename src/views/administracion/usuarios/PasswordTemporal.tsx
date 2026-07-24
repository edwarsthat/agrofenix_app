import { Check, Copy, ShieldAlert, UserCheck } from "lucide-react"
import { useState } from "react"
import styles from "./styles/FenixTempPasswordModal.module.css"


type propsType = {
    password: string,
    usuario: string,
    onClose: () => void
}

export default function PasswordTemporal({ password, usuario, onClose }: propsType) {
    const [copiado, setCopiado] = useState(false)

    const copiar = async () => {
        await navigator.clipboard.writeText(password)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
    }

    return (
        <div className={styles.content}>
            <div className={styles.iconWrap}>
                <UserCheck size={28} />
            </div>

            <div>
                <h2 className={styles.title}>Usuario creado</h2>
                <p className={styles.subtitle}>
                    Contraseña temporal para <strong>{usuario}</strong>
                </p>
            </div>

            <div className={styles.passwordRow}>
                <span className={styles.passwordText}>{password}</span>
                <button
                    type="button"
                    onClick={copiar}
                    className={copiado ? `${styles.copyBtn} ${styles.isCopied}` : styles.copyBtn}
                >
                    {copiado ? <Check size={16} /> : <Copy size={16} />}
                    {copiado ? "Copiado" : "Copiar"}
                </button>
            </div>

            <div className={styles.warning}>
                <ShieldAlert size={16} className={styles.warningIcon} />
                <span className={styles.warningText}>
                    Esta contraseña no se volverá a mostrar. Entrégasela al usuario
                    por un medio seguro; deberá cambiarla en su primer ingreso.
                </span>
            </div>

            <button type="button" onClick={onClose} className={styles.doneBtn}>
                Entendido
            </button>
        </div>
    )
}
