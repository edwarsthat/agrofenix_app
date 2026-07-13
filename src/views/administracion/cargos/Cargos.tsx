import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import styles from "../../modulos.module.css"
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { socketRequest } from "../../../lib/socket"
import { Cargo } from "../../../types/administracion/cargos"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"

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

    useEffect(() => {
        let cancelado = false
        const handleRequest = async (): Promise<void> => {
            try {
                const request = {
                    action: "administracion:cargos:read"
                }
                // El loading global y el toast de error los pone socketRequest.
                const response = await socketRequest<Cargo[]>(request)
                if (!cancelado) setCargos(response.data ?? [])
            } catch (err) {
                console.error("[cargos] error:", err)
            }
        }
        handleRequest()

        return () => { cancelado = true }

    }, [])

    // TODO: reemplazar por el modal de creación cuando exista.
    const handleAgregar = () => {
        console.log("[cargos] agregar cargo — pendiente de modal")
    }

    // TODO: reemplazar por el modal de edición cuando exista.
    const handleEditar = (cargo: Cargo) => {
        console.log("[cargos] editar cargo", cargo)
    }

    // TODO: agregar confirmación + acción "administracion:cargos:delete" cuando exista en el server.
    const handleEliminar = (cargo: Cargo) => {
        console.log("[cargos] eliminar cargo", cargo)
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
