import styles from "../../modulos.module.css"
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { Plus, Search } from "lucide-react"
import { Empleado } from "../../../types/administracion/personal"
import { PersonalFormType } from "./validations"
import { modal } from "../../../store/useModalStore"
import PersonalForm from "./PersonalForm"
import usePersonalStore from "../../../store/data/administracion/usePersonalStore"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import useCargoPersonalStore from "../../../store/data/administracion/useCargoPersonalStore"
import { useEffect, useMemo } from "react"
import PersonalFiltros from "./PersonalFiltros"

export default function Personal() {
    const {
        persoonal,
        addPersonal,
        getPersonal,
        updatePersonal,
    } = usePersonalStore();
    const { cargosPersonal, getCargoPersonal } = useCargoPersonalStore();

    useEffect(() => {
        if (useCargoPersonalStore.getState().cargosPersonal.length === 0) getCargoPersonal()
    }, [persoonal, cargosPersonal])

    const nombrePorCargo = useMemo(() => {
        const mapa = new Map<string, string>()
        cargosPersonal.forEach((c) => mapa.set(c.id, c.nombre))
        return mapa
    }, [cargosPersonal])

    const columns: TablaColumn<Empleado>[] = useMemo(() => [
        { key: "codigo", header: "Código", width: "0.8fr" },
        {
            key: "nombre",
            header: "Nombre",
            width: "1.6fr",
            render: (e) => `${e.nombre} ${e.apellido}`,
        },
        {
            key: "documento",
            header: "Documento",
            width: "1.2fr",
            render: (e) => `${e.tipo_documento} ${e.documento}`,
        },
        {
            key: "cargo_id",
            header: "Cargo",
            width: "1.2fr",
            render: (e) => nombrePorCargo.get(e.cargo_id) ?? "—",
        },
        {
            key: "telefono",
            header: "Teléfono",
            width: "1fr",
            render: (e) => e.telefono ?? "—",
        },
        { key: "fecha_ingreso", header: "Ingreso", width: "110px" },
        { key: "activo", header: "Activo", width: "90px", type: "boolean" },
    ], [nombrePorCargo])

    const abrirFormulario = (empleado?: Empleado) => {
        const esEdicion = Boolean(empleado)

        const handleSubmit = async (values: PersonalFormType) => {
            if (esEdicion) {
                if (!empleado) return

                const actualizado = await updatePersonal(empleado.id, empleado.version, values)
                if (!actualizado) return

                modal.close()
                return
            }

            const creado = await addPersonal(values)
            if (!creado) return

            modal.close()
        }

        modal.show({
            title: esEdicion ? "Editar empleado" : "Crear empleado",
            children: (
                <PersonalForm
                    esEdicion={esEdicion}
                    datosEmpleado={empleado}
                    handleSubmit={handleSubmit}
                    onCancel={modal.close}
                />
            ),
        })
    }
    const handleEliminar = async () => { }
    const handleActivar = async () => { }

    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Personal</h2>

                <button type="button" className={tableStyles.addButton} onClick={() => abrirFormulario()}>
                    <Plus size={16} />
                    Agregar Personal
                </button>
            </div>

            <div className={styles.pageSection}>
                <PersonalFiltros onBuscar={getPersonal} />
            </div>

            <Tabla
                columns={columns}
                data={persoonal}
                rowKey={(empleado) => empleado.id}
                estaActivo={(empleado) => empleado.activo}
                acciones={{
                    onEditar: abrirFormulario,
                    onEliminar: handleEliminar,
                    onReactivar: handleActivar
                }}
                emptyTitle="Sin personal"
                emptyMessage="Todavía no hay empleados registrados."
            />
        </div>
    )
}