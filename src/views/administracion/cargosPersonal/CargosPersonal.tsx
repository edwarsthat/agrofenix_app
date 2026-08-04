import { useEffect, useState, useMemo } from "react"
import styles from "../../modulos.module.css"
import { Plus, Search } from "lucide-react"
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import useCargoPersonalStore from "../../../store/data/administracion/useCargoPersonalStore"
import { CargoPersonal, TIPO_CONTRATO_LABELS } from "../../../types/administracion/cargoPersonal"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import { CargoPersonalForm } from "./validations"
import { modal } from "../../../store/useModalStore"
import CargosPersonalForm from "./CargosPersonalForm"

export default function CargosPersonal() {
    const {
        cargosPersonal,
        getCargoPersonal,
        addCargoPersonal,
        updateCargoPersonal,
        eliminarCargoPersonal
    } = useCargoPersonalStore();
    const [busqueda, setBusqueda] = useState("")

    useEffect(() => {
        if (useCargoPersonalStore.getState().cargosPersonal.length === 0) getCargoPersonal()
    }, [getCargoPersonal])

    const columns: TablaColumn<CargoPersonal>[] = useMemo(() => [
        { key: "nombre", header: "Nombre", width: "1.4fr" },
        {
            key: "tipo_contrato",
            header: "Tipo de contrato",
            width: "1fr",
            render: (c) => TIPO_CONTRATO_LABELS[c.tipo_contrato],
        },
        { key: "activo", header: "Activo", width: "90px", type: "boolean" },
    ], [])

    // Filtra por nombre o por el nombre visible del tipo de contrato.
    const cargosPersonalFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        if (!q) return cargosPersonal
        return cargosPersonal.filter((c) => {
            return (
                c.nombre.toLowerCase().includes(q) ||
                TIPO_CONTRATO_LABELS[c.tipo_contrato].toLowerCase().includes(q)
            )
        })
    }, [cargosPersonal, busqueda])

    const abrirFormulario = (cargoPersonal?: CargoPersonal) => {
        const esEdicion = Boolean(cargoPersonal)

        const handleSubmit = async (values: CargoPersonalForm) => {
            if (esEdicion) {
                if (!cargoPersonal?.id) return

                const updated = await updateCargoPersonal(cargoPersonal.id, values)
                if (updated) {
                    modal.close()
                }
                return
            }

            const creado = await addCargoPersonal(values)
            if (!creado) return

            modal.close()
        }

        modal.show({
            title: esEdicion ? "Editar cargo personal" : "Crear cargo personal",
            children: (
                <CargosPersonalForm
                    datosCargoPersonal={cargoPersonal}
                    onSubmit={handleSubmit}
                    onCancel={modal.close}
                />
            ),
        })
    }

    const handleEliminar = async (cargoPersonal: CargoPersonal) => {
        await eliminarCargoPersonal(cargoPersonal.id)
    }

    return (
        <div>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Cargos Personal</h2>
                <label className={tableStyles.searchInput}>
                    <Search size={15} />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre o tipo de contrato..."
                    />
                </label>
                <button type="button" className={tableStyles.addButton} onClick={() => abrirFormulario()}>
                    <Plus size={16} />
                    Agregar Cargo Personal
                </button>
            </div>

            <Tabla
                columns={columns}
                data={cargosPersonalFiltrados}
                rowKey={(cargo) => cargo.id}
                estaActivo={(cargo) => cargo.activo}
                acciones={{ onEditar: abrirFormulario, onEliminar: handleEliminar }}
                emptyTitle="Sin cargos personal"
                emptyMessage="Todavía no hay cargos personal registrados."
            />
        </div>
    )
}
