import styles from '../../modulos.module.css'
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { Nfc, Plus } from "lucide-react"
import { modal } from '../../../store/useModalStore'
import EscanearLlaveForm from './EscanearLLaveForm'
import useLlaveNfcStore from '../../../store/data/inventarios/useLlavesNfc'
import FiltrosInventariosLlaveNfc from './FiltrosInventariosLlaveNfc'
import { useMemo, useState } from 'react'
import Tabla, { TablaColumn } from '../../../components/funcionalidad/tablas/Tabla'
import MobileList from '../../../components/funcionalidad/listasMobile/MobileList'
import { CardColumn } from '../../../components/funcionalidad/listasMobile/CardRow'
import useIsMobile from '../../../hooks/useIsMobile'
import { AccionFila, accionEditar } from '../../../components/funcionalidad/acciones'
import { ESTADO_LLAVE_NFC_LABELS, LlaveNfc } from '../../../types/inventarios/llaves_nfc'
import LlaveNfcForm from './LlaveNfcForm'
import { LlaveNfcInventarioFormType } from './validations'

export default function InventarioLlaveNfc() {
    const {
        llavesNfc,
        addLlaveNfc,
        getLlavesNfc,
        updateLlavesNfc
    } = useLlaveNfcStore();
    const isMobile = useIsMobile();
    const [uid, setUid] = useState<string>("")

    // El backend entrega `creado_en` como ISO; en la lista basta la fecha.
    const formatearFecha = (iso: string) => new Date(iso).toLocaleDateString()

    const columns: TablaColumn<LlaveNfc>[] = useMemo(() => [
        { key: "codigo", header: "Código", width: "1fr" },
        { key: "uid", header: "UID", width: "1.4fr" },
        {
            key: "descripcion",
            header: "Descripción",
            width: "1.8fr",
            render: (l) => l.descripcion ?? "—",
        },
        {
            key: "estado",
            header: "Estado",
            width: "1fr",
            render: (l) => ESTADO_LLAVE_NFC_LABELS[l.estado],
        },
        {
            // `empleado_codigo` viene null cuando la llave no está asignada.
            key: "empleado_codigo",
            header: "Asignada a",
            width: "1fr",
            render: (l) => l.empleado_codigo ?? "—",
        },
        {
            key: "creado_en",
            header: "Registrada",
            width: "120px",
            render: (l) => formatearFecha(l.creado_en),
        },
    ], [])

    // En móvil el código va en el título, la descripción en el subtítulo y el
    // estado en la insignia; el resto va al grid de metadatos.
    const columnsMobile: CardColumn<LlaveNfc>[] = useMemo(() => [
        { key: "uid", header: "UID", mono: true, fullWidth: true },
        {
            key: "empleado_codigo",
            header: "Asignada a",
            mono: true,
            render: (l) => l.empleado_codigo ?? "—",
        },
        { key: "creado_en", header: "Registrada", render: (l) => formatearFecha(l.creado_en) },
    ], [])

    const abrirLecturaNfc = () => {
        // El modal solo lee: deja el UID en el state y quien lo use decide qué
        // hacer con él (filtrar, mostrar la llave, etc.).
        const handleLeer = (uidLeido: string) => {
            setUid(uidLeido)
            modal.close()
        }

        modal.show({
            title: "Leer llave NFC",
            description: "Acerca la llave al lector para leer su UID",
            children: (
                <EscanearLlaveForm type="read" readData={handleLeer} onCancel={modal.close} />
            ),
        })
    }

    const abrirEscaneo = () => {
        const handleGuardar = async (uid: string, descripcion: string) => {
            const creada = await addLlaveNfc({ uid, descripcion })
            if (!creada) return
            modal.close()
        }

        modal.show({
            title: "Agregar llave NFC",
            description: "Acerca la llave al lector para registrar su UID",
            children: (
                <EscanearLlaveForm type="add" onGuardar={handleGuardar} onCancel={modal.close} />
            ),
        })
    }

    const handleUpdate = (llaveNfc: LlaveNfc) => {
        const handleSubmit = async (values: LlaveNfcInventarioFormType) => {
            const actualizado = await updateLlavesNfc(llaveNfc.id, llaveNfc.version, values)
            if (!actualizado) return

            modal.close()
            return
        }

        modal.show({
            title: "Editar llave NFC",
            children: (
                <LlaveNfcForm
                    datosLlave={llaveNfc}
                    handleSubmit={handleSubmit}
                    onCancel={modal.close}
                />
            ),
        })
    }

    const acciones: AccionFila<LlaveNfc>[] = [
        accionEditar(handleUpdate),
    ]

    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Inventario LLaves NFC</h2>

                <div className={styles.toolbarActions}>
                    <button type="button" className={tableStyles.addButton} onClick={() => abrirLecturaNfc()}>
                        <Nfc size={16} />
                        Leer Llave
                    </button>

                    <button type="button" className={tableStyles.addButton} onClick={() => abrirEscaneo()}>
                        <Plus size={16} />
                        Agregar Llave
                    </button>
                </div>
            </div>
            <div className={styles.pageSection}>
                <FiltrosInventariosLlaveNfc uid={uid} onBuscar={getLlavesNfc} />
            </div>

            {isMobile ? (
                <MobileList
                    columns={columnsMobile}
                    data={llavesNfc}
                    rowKey={(llave) => llave.id}
                    titulo={(llave) => llave.codigo}
                    subtitulo={(llave) => llave.descripcion ?? "—"}
                    // La insignia muestra el estado real, no un activo/inactivo.
                    badge={(llave) => ({
                        texto: ESTADO_LLAVE_NFC_LABELS[llave.estado],
                        activo: llave.estado === "inventario",
                    })}
                    emptyMessage="Todavía no hay llaves registradas."
                    acciones={acciones}
                />
            ) : (
                <Tabla
                    columns={columns}
                    data={llavesNfc}
                    rowKey={(llave) => llave.id}
                    emptyTitle="Sin llaves"
                    emptyMessage="Todavía no hay llaves registradas."
                    acciones={acciones}
                />
            )}
        </div>
    )
}