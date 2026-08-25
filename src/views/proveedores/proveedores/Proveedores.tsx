import styles from '../../modulos.module.css'
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { Plus } from "lucide-react"
import { useEffect, useMemo } from "react"
import { modal } from "../../../store/useModalStore"
import useProveedores from "../../../store/data/proveedores/useProveedoresStore"
import FormProveedores from "./FormProveedores"
import ProveedoresFiltros from "./ProveedoresFiltros"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import MobileList from "../../../components/funcionalidad/listasMobile/MobileList"
import { CardColumn } from "../../../components/funcionalidad/listasMobile/CardRow"
import useIsMobile from "../../../hooks/useIsMobile"
import { AccionFila, accionEditar, accionEliminar, accionReactivar } from "../../../components/funcionalidad/acciones"
import { Proveedor, TIPO_PROVEEDOR_LABELS } from "../../../types/proveedores/proveedores"
import {
    ProveedorFormType,
    ProveedoresFiltrosInitialValues,
    toProveedoresReadPayload,
} from "./validations"

// El NIT se lee con su dígito de verificación pegado (900123456-7); los demás
// documentos no tienen uno.
const documentoCompleto = (p: Proveedor) =>
    `${p.tipo_documento} ${p.documento}${p.digito_verificacion ? `-${p.digito_verificacion}` : ""}`

const ubicacion = (p: Proveedor) =>
    [p.municipio, p.departamento].filter(Boolean).join(", ") || "—"

export default function Proveedores() {
    const {
        proveedores,
        addProveedor,
        getProveedores,
        updateProveedor,
        deleteProveedor,
        activarProveedor,
    } = useProveedores();
    const isMobile = useIsMobile();

    // Carga inicial de la tabla. Va con los valores por defecto del formulario de
    // filtros, no sin payload: el backend siempre filtra por activo/inactivo, así
    // que la lista tiene que coincidir con lo que el formulario muestra ("Activos").
    useEffect(() => {
        getProveedores(toProveedoresReadPayload(ProveedoresFiltrosInitialValues))
    }, [getProveedores]);

    const columns: TablaColumn<Proveedor>[] = useMemo(() => [
        { key: "codigo", header: "Código", width: "0.8fr" },
        {
            key: "nombre",
            header: "Nombre",
            width: "1.8fr",
            // La razón social solo se muestra si aporta algo distinto al nombre.
            render: (p) =>
                p.razon_social && p.razon_social !== p.nombre
                    ? `${p.nombre} (${p.razon_social})`
                    : p.nombre,
        },
        {
            key: "tipo_proveedor",
            header: "Tipo",
            width: "1fr",
            render: (p) => TIPO_PROVEEDOR_LABELS[p.tipo_proveedor],
        },
        {
            key: "documento",
            header: "Documento",
            width: "1.2fr",
            render: documentoCompleto,
        },
        {
            key: "telefono",
            header: "Teléfono",
            width: "1fr",
            render: (p) => p.telefono ?? "—",
        },
        {
            key: "ubicacion",
            header: "Ubicación",
            width: "1.2fr",
            render: ubicacion,
        },
        { key: "activo", header: "Activo", width: "90px", type: "boolean" },
    ], [])

    // En móvil el nombre va en el título de la tarjeta, el tipo en el subtítulo
    // y el estado en la insignia; el resto va al grid de metadatos.
    const columnsMobile: CardColumn<Proveedor>[] = useMemo(() => [
        { key: "codigo", header: "Código", mono: true },
        { key: "documento", header: "Documento", render: documentoCompleto },
        { key: "telefono", header: "Teléfono", render: (p) => p.telefono ?? "—" },
        { key: "email", header: "Correo", render: (p) => p.email ?? "—" },
        { key: "ubicacion", header: "Ubicación", render: ubicacion, fullWidth: true },
    ], [])

    const abrirFormulario = (proveedor?: Proveedor) => {
        const esEdicion = Boolean(proveedor)

        const handleSubmit = async (values: ProveedorFormType) => {
            if (esEdicion) {
                if (!proveedor) return

                const actualizado = await updateProveedor(proveedor.id, proveedor.version, values)
                if (!actualizado) return

                modal.close()
                return
            }

            const creado = await addProveedor(values)
            if (!creado) return

            modal.close()
        }

        modal.show({
            title: esEdicion ? "Editar proveedor" : "Crear proveedor",
            children: (
                <FormProveedores
                    esEdicion={esEdicion}
                    datosProveedor={proveedor}
                    handleSubmit={handleSubmit}
                    onCancel={modal.close}
                />
            ),
        })
    }

    const handleEliminar = async (proveedor: Proveedor) => {
        await deleteProveedor(proveedor.id)
    }
    const handleActivar = async (proveedor: Proveedor) => {
        await activarProveedor(proveedor.id)
    }

    const acciones: AccionFila<Proveedor>[] = [
        accionEditar(abrirFormulario),
        accionEliminar(handleEliminar),
        accionReactivar(handleActivar),
    ]

    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Proveedores</h2>

                <div className={styles.toolbarActions}>

                    <button type="button" className={tableStyles.addButton} onClick={() => abrirFormulario()}>
                        <Plus size={16} />
                        Agregar Proveedor
                    </button>
                </div>
            </div>

            <div className={styles.pageSection}>
                <ProveedoresFiltros onBuscar={getProveedores} />
            </div>

            {isMobile ? (
                <MobileList
                    columns={columnsMobile}
                    data={proveedores}
                    rowKey={(proveedor) => proveedor.id}
                    titulo={(p) => p.nombre}
                    subtitulo={(p) => TIPO_PROVEEDOR_LABELS[p.tipo_proveedor]}
                    estaActivo={(proveedor) => proveedor.activo}
                    acciones={acciones}
                    emptyMessage="Todavía no hay proveedores registrados."
                />
            ) : (
                <Tabla
                    columns={columns}
                    data={proveedores}
                    rowKey={(proveedor) => proveedor.id}
                    acciones={acciones}
                    emptyTitle="Sin proveedores"
                    emptyMessage="Todavía no hay proveedores registrados."
                />
            )}
        </div>
    )
}
