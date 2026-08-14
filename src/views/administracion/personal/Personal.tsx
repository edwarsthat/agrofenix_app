import styles from "../../modulos.module.css"
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { Plus } from "lucide-react"
import { Empleado } from "../../../types/administracion/personal"
import { PersonalFormType } from "./validations"
import { modal } from "../../../store/useModalStore"
import PersonalForm from "./PersonalForm"
import usePersonalStore from "../../../store/data/administracion/usePersonalStore"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import useCargoPersonalStore from "../../../store/data/administracion/useCargoPersonalStore"
import { useEffect, useMemo } from "react"
import PersonalFiltros from "./PersonalFiltros"
import MobileList from "../../../components/funcionalidad/listasMobile/MobileList"
import { CardColumn } from "../../../components/funcionalidad/listasMobile/CardRow"
import useIsMobile from "../../../hooks/useIsMobile"

export default function Personal() {
    const {
        persoonal,
        addPersonal,
        getPersonal,
        updatePersonal,
        deletePersonal,
        activarPersonal
    } = usePersonalStore();
    const { cargosPersonal, getCargoPersonal } = useCargoPersonalStore();
    const isMobile = useIsMobile();

    useEffect(() => {
        if (useCargoPersonalStore.getState().cargosPersonal.length === 0) getCargoPersonal()
    }, [persoonal]);

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

    // En móvil el nombre va en el título de la tarjeta, el cargo en el subtítulo
    // y el estado en la insignia; el resto va al grid de metadatos.
    const columnsMobile: CardColumn<Empleado>[] = useMemo(() => [
        { key: "codigo", header: "Código", mono: true },
        {
            key: "documento",
            header: "Documento",
            render: (e) => `${e.tipo_documento} ${e.documento}`,
        },
        { key: "telefono", header: "Teléfono", render: (e) => e.telefono ?? "—" },
        { key: "fecha_ingreso", header: "Ingreso" },
    ], [])

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
    const handleEliminar = async (empleado: Empleado) => { 
        await deletePersonal(empleado.id)
    }
    const handleActivar = async (empleado: Empleado) => {
        await activarPersonal(empleado.id) 
     }

    // Mismas acciones para escritorio (Tabla) y móvil (MobileList).
    const acciones = {
        onEditar: abrirFormulario,
        onEliminar: handleEliminar,
        onReactivar: handleActivar
    }

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

            {isMobile ? (
                <MobileList
                    columns={columnsMobile}
                    data={persoonal}
                    rowKey={(empleado) => empleado.id}
                    titulo={(e) => `${e.nombre} ${e.apellido}`}
                    subtitulo={(e) => nombrePorCargo.get(e.cargo_id) ?? "—"}
                    estaActivo={(empleado) => empleado.activo}
                    acciones={acciones}
                    emptyMessage="Todavía no hay empleados registrados."
                />
            ) : (
                <Tabla
                    columns={columns}
                    data={persoonal}
                    rowKey={(empleado) => empleado.id}
                    estaActivo={(empleado) => empleado.activo}
                    acciones={acciones}
                    emptyTitle="Sin personal"
                    emptyMessage="Todavía no hay empleados registrados."
                />
            )}
        </div>
    )
}