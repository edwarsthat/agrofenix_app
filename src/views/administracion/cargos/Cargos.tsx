import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import styles from "../../modulos.module.css"
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { Cargo } from "../../../types/administracion/cargos"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import useCargoStore from "../../../store/data/administracion/useCargoStore"

const columns: TablaColumn<Cargo>[] = [
    { key: "nombre", header: "Nombre", width: "1fr" },
    {
        key: "descripcion",
        header: "Descripción",
        width: "2fr",
        render: (cargo) => cargo.descripcion ?? "—",
    },
    { key: "activo", header: "Activo", width: "110px", type: "boolean" },
]

export default function Cargos() {
    const { cargos, getCargos, eliminarCargo } = useCargoStore()
    const navigate = useNavigate()

    useEffect(() => {
        getCargos()
    }, [])

    const handleAgregar = () => navigate("/administracion/cargos/crear")

    const handleEditar = (cargo: Cargo) =>
        navigate(`/administracion/cargos/editar/${cargo.id}`, { state: { cargo } })

    const handleEliminar = async (cargo: Cargo) => {
        await eliminarCargo(cargo.id)
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
