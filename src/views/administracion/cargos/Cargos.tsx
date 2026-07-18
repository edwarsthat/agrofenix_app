import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import styles from "../../modulos.module.css"
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { socketRequest } from "../../../lib/socket"
import { Cargo } from "../../../types/administracion/cargos"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import { confirm } from "../../../helpers/Confirmacion"

const columns: TablaColumn<Cargo>[] = [
    { key: "nombre", header: "Nombre", width: "1fr" },
    {
        key: "descripcion",
        header: "Descripción",
        width: "2fr",
        render: (cargo) => cargo.descripcion ?? "—",
    },
]

export default function Cargos() {
    const [cargos, setCargos] = useState<Cargo[]>([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        let cancelado = false
        const handleRequest = async (): Promise<void> => {
            try {
                // El loading global y el toast de error los pone socketRequest.
                const response = await socketRequest<Cargo[]>({ action: "administracion:cargos:read" })
                if (!cancelado) setCargos(response.data ?? [])
            } catch (err) {
                console.error("[cargos] error:", err)
            }
        }
        handleRequest()

        return () => { cancelado = true }
    }, [])

    const handleAgregar = () => navigate("/administracion/cargos/crear")

    const handleEditar = (cargo: Cargo) =>
        navigate(`/administracion/cargos/editar/${cargo.id}`, { state: { cargo } })

    // TODO: agregar confirmación + acción "administracion:cargos:delete" cuando exista en el server.
    const handleEliminar = async (cargo: Cargo) => {
        if (loading) return
        if (await confirm({ mensaje: "¿Eliminar este cargo?", danger: true })) {
            try {
                setLoading(true)
                const request = {
                    action: "administracion:cargos:delete",
                    payload: cargo.id,
                    isSuccess: true,
                }
                await socketRequest(request)

            } catch (err) {
                console.error("[cargos] error:", err)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <div>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Cargos</h2>
                <button type="button" className={tableStyles.addButton} onClick={handleAgregar}>
                    <Plus size={16} />
                    Agregar cargo
                </button>
            </div>

            <Tabla
                columns={columns}
                data={cargos}
                rowKey={(cargo) => cargo.id}
                acciones={{ onEditar: handleEditar, onEliminar: handleEliminar }}
                emptyTitle="Sin cargos"
                emptyMessage="Todavía no hay cargos registrados."
            />
        </div>
    )
}
