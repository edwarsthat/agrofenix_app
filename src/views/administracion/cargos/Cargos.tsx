import { useEffect, useState } from "react"
import styles from "../../modulos.module.css"
import { socketRequest } from "../../../lib/socket"
import { Cargo } from "../../../types/administracion/cargos";


export default function Cargos() {
    const [cargos, setCargos] = useState<Cargo[]>([])

    useEffect(() => {
        let cancelado = false
        const handleRequest = async (): Promise<void> => {
            try {
                const request = {
                    action: "administracion:cargos:read"
                }
                // El loading global y el toast de error los pone socketRequest.
                const response = await socketRequest<Cargo[]>(request)
                if(!cancelado) setCargos(response.data ?? [])
            } catch (err) {
                console.error("[cargos] error:", err)
            }
        }
        handleRequest()

        return () => { cancelado = true }

    }, [])

    return (
        <div className={styles.toolbar}>
            <h2 className={styles.toolbarTitle}>Cargos</h2>
        </div>
    )
}