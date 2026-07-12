import { useEffect, useState } from "react"
import styles from "../../modulos.module.css"
import { socketRequest } from "../../../lib/socket"
import { Cargo } from "../../../types/administracion/cargos";


export default function Cargos() {
    const [loading, setLoading] = useState<boolean>(false)
    const [cargos, setCargos] = useState<Cargo[]>([])
    
    useEffect(() => {
        let cancelado = false
        const handleRequest = async (): Promise<void> => {
            try {
                setLoading(true)
                const request = {
                    action: "administracion:cargos:read"
                }
                const response = await socketRequest<Cargo[]>(request)
                if(!cancelado) setCargos(response.data ?? [])
            } catch (err) {
                // El toast ya lo mostró socketRequest.
                console.error("[cargos] error:", err)
            } finally {
                if(!cancelado) setLoading(false)
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