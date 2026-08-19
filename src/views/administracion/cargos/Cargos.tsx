import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import styles from "../../modulos.module.css"
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { Cargo } from "../../../types/administracion/cargos"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import useCargoStore from "../../../store/data/administracion/useCargoStore"
import MobileList from "../../../components/funcionalidad/listasMobile/MobileList"
import { CardColumn } from "../../../components/funcionalidad/listasMobile/CardRow"
import useIsMobile from "../../../hooks/useIsMobile"
import { AccionFila, accionEditar, accionEliminar } from "../../../components/funcionalidad/acciones"

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

// En móvil el nombre va en el título de la tarjeta y el estado en la insignia.
const columnsMobile: CardColumn<Cargo>[] = [
    {
        key: "descripcion",
        header: "Descripción",
        fullWidth: true,
        render: (cargo) => cargo.descripcion ?? "—",
    },
]

export default function Cargos() {
    const { cargos, getCargos, eliminarCargo } = useCargoStore()
    const navigate = useNavigate()
    const [busqueda, setBusqueda] = useState("")
    const isMobile = useIsMobile()

    useEffect(() => {
        getCargos()
    }, [])

    // Filtra por nombre del cargo (ignora mayúsculas y espacios sobrantes).
    const cargosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        if (!q) return cargos
        return cargos.filter((c) => c.nombre.toLowerCase().includes(q))
    }, [cargos, busqueda])

    const handleAgregar = () => navigate("/administracion/cargos/crear")

    const handleEditar = (cargo: Cargo) =>
        navigate(`/administracion/cargos/editar/${cargo.id}`, { state: { cargo } })

    const handleEliminar = async (cargo: Cargo) => {
        await eliminarCargo(cargo.id)
    }

    // Mismas acciones para escritorio (Tabla) y móvil (MobileList).
    const acciones: AccionFila<Cargo>[] = [
        accionEditar(handleEditar),
        accionEliminar(handleEliminar),
    ]

    return (
        <div>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Cargos</h2>
                <label className={tableStyles.searchInput}>
                    <Search size={15} />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre..."
                    />
                </label>
                <button type="button" className={tableStyles.addButton} onClick={handleAgregar}>
                    <Plus size={16} />
                    Agregar cargo
                </button>
            </div>

            {isMobile ? (
                <MobileList
                    columns={columnsMobile}
                    data={cargosFiltrados}
                    rowKey={(cargo) => cargo.id}
                    titulo={(cargo) => cargo.nombre}
                    badge={(cargo) => ({ texto: cargo.activo ? "Activo" : "Inactivo", activo: cargo.activo })}
                    acciones={acciones}
                    emptyMessage="Todavía no hay cargos registrados."
                />
            ) : (
                <Tabla
                    columns={columns}
                    data={cargosFiltrados}
                    rowKey={(cargo) => cargo.id}
                    acciones={acciones}
                    emptyTitle="Sin cargos"
                    emptyMessage="Todavía no hay cargos registrados."
                />
            )}
        </div>
    )
}
