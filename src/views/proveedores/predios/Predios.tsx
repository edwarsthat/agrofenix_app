import styles from '../../modulos.module.css'
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { Plus } from "lucide-react"
import { useEffect, useMemo } from 'react'
import { modal } from "../../../store/useModalStore"
import useProveedores from '../../../store/data/proveedores/useProveedoresStore'
import PrediosForms from './PrediosForms'
import PrediosFiltros from './PrediosFiltros'
import PredioInfo from './PredioInfo'
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import MobileList from "../../../components/funcionalidad/listasMobile/MobileList"
import { CardColumn } from "../../../components/funcionalidad/listasMobile/CardRow"
import useIsMobile from "../../../hooks/useIsMobile"
import { Predio } from '../../../types/proveedores/predios'
import { PredioFormType, PrediosFiltrosInitialValues, toPrediosReadPayload } from './validations'
import usePredioStore from '../../../store/data/proveedores/usePredioStore'
import { accionEditar, accionEliminar, AccionFila, accionReactivar, accionVer } from '../../../components/funcionalidad/acciones'

const ubicacion = (p: Predio) =>
    [p.vereda, p.municipio, p.departamento].filter(Boolean).join(", ") || "—"

// Las coordenadas o van las dos o no va ninguna, así que basta revisar una.
const coordenadas = (p: Predio) =>
    p.latitud !== null && p.longitud !== null
        ? `${p.latitud.toFixed(6)}, ${p.longitud.toFixed(6)}`
        : "—"

export default function Predios() {
    const { proveedores, getProveedores } = useProveedores();
    const { 
        predios, 
        addPredio, 
        getPredios,
        updatePredios,
        deletePredio,
        activarPredio
    } = usePredioStore();
    const isMobile = useIsMobile();

    // Los proveedores se cargan sin filtros: alimentan tanto el select del
    // formulario como el de los filtros, que también lista los inactivos.
    useEffect(() => {
        if (useProveedores.getState().proveedores.length === 0) getProveedores()
    }, [getProveedores])

    // Carga inicial de la lista. Va con los valores por defecto del formulario
    // de filtros, no sin payload: así lo que se muestra coincide con lo que el
    // formulario dice estar filtrando ("Activos").
    useEffect(() => {
        getPredios(toPrediosReadPayload(PrediosFiltrosInitialValues))
    }, [getPredios])

    // El predio solo trae `proveedor_id`, así que el nombre se resuelve contra
    // la lista de proveedores. Si todavía no cargó, o el proveedor no vino en
    // ella, la celda queda en "—" en vez de mostrar el uuid.
    const nombreProveedor = useMemo(() => {
        const porId = new Map(proveedores.map(p => [p.id, `${p.codigo} - ${p.nombre}`]))
        return (predio: Predio) => porId.get(predio.proveedor_id) ?? "—"
    }, [proveedores])

    const columns: TablaColumn<Predio>[] = useMemo(() => [
        { key: "codigo", header: "Código", width: "0.8fr" },
        { key: "nombre", header: "Nombre", width: "1.6fr" },
        {
            key: "proveedor_id",
            header: "Proveedor",
            width: "1.6fr",
            render: nombreProveedor,
        },
        {
            key: "ubicacion",
            header: "Ubicación",
            width: "1.6fr",
            render: ubicacion,
        },
        {
            key: "responsable_nombre",
            header: "Responsable",
            width: "1.2fr",
            render: (p) => p.responsable_nombre ?? "—",
        },
        {
            key: "responsable_telefono",
            header: "Teléfono",
            width: "1fr",
            render: (p) => p.responsable_telefono ?? "—",
        },
        { key: "activo", header: "Activo", width: "90px", type: "boolean" },
    ], [nombreProveedor])

    // En móvil el nombre va en el título de la tarjeta, el proveedor en el
    // subtítulo y el estado en la insignia; el resto va al grid de metadatos.
    const columnsMobile: CardColumn<Predio>[] = useMemo(() => [
        { key: "codigo", header: "Código", mono: true },
        {
            key: "responsable_nombre",
            header: "Responsable",
            render: (p) => p.responsable_nombre ?? "—",
        },
        {
            key: "responsable_telefono",
            header: "Teléfono",
            render: (p) => p.responsable_telefono ?? "—",
        },
        { key: "coordenadas", header: "Coordenadas", mono: true, render: coordenadas },
        { key: "ubicacion", header: "Ubicación", render: ubicacion, fullWidth: true },
    ], [])

    const abrirFormulario = (predio?: Predio) => {
        const esEdicion = Boolean(predio)

        const handleSubmit = async (values: PredioFormType) => {
            if (esEdicion){
                if(!predio) return 

                const actualizado = await updatePredios(predio.id, predio.version, values)
                if(!actualizado) return

                modal.close()
                return
            }

            const creado = await addPredio(values)
            if (!creado) return

            modal.close()
        }

        modal.show({
            title: esEdicion ? "Editar predio" : "Crear predio",
            children: (
                <PrediosForms
                    esEdicion={esEdicion}
                    datosPredio={predio}
                    handleSubmit={handleSubmit}
                    onCancel={modal.close}
                />
            ),
        })
    }
    const handleEliminar = async (predio: Predio) => {
        await deletePredio(predio.id)
    }
    const handleActivar = async (predio: Predio) => {
        await activarPredio(predio.id)
    }

    // El detalle trae su propio encabezado (nombre, código y estado), así que el
    // modal va sin título para no repetirlo. El proveedor va sin resolver cuando
    // no está en la lista cargada: el detalle lo pinta como "Sin registrar".
    const abrirInfo = (predio: Predio) => {
        const proveedor = nombreProveedor(predio)
        modal.show({
            size: "lg",
            children: <PredioInfo predio={predio} proveedor={proveedor === "—" ? undefined : proveedor} />,
        })
    }

    const acciones: AccionFila<Predio>[] = [
        accionVer(abrirInfo),
        accionEditar(abrirFormulario),
        accionEliminar(handleEliminar),
        accionReactivar(handleActivar)
    ]

    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Predios</h2>

                <div className={styles.toolbarActions}>

                    <button type="button" className={tableStyles.addButton} onClick={() => abrirFormulario()}>
                        <Plus size={16} />
                        Agregar Predio
                    </button>
                </div>
            </div>

            <div className={styles.pageSection}>
                <PrediosFiltros onBuscar={getPredios} />
            </div>

            {isMobile ? (
                <MobileList
                    columns={columnsMobile}
                    data={predios}
                    rowKey={(predio) => predio.id}
                    titulo={(p) => p.nombre}
                    subtitulo={nombreProveedor}
                    estaActivo={(predio) => predio.activo}
                    acciones={acciones}
                    emptyMessage="Todavía no hay predios registrados."
                />
            ) : (
                <Tabla
                    columns={columns}
                    data={predios}
                    rowKey={(predio) => predio.id}
                    acciones={acciones}
                    emptyTitle="Sin predios"
                    emptyMessage="Todavía no hay predios registrados."
                />
            )}

        </div>
    )
}
