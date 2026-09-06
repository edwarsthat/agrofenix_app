import { useEffect, useMemo, useState } from "react"
import { CardColumn } from "../../../components/funcionalidad/listasMobile/CardRow"
import MobileList from "../../../components/funcionalidad/listasMobile/MobileList"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import { InventarioMateriaPrima } from "../../../types/inventarios/materias_primas/lotesInventario"
import { formatearFecha, formatearPeso } from "../../../helpers/formatos"
import useMateriaPrima from "../../../store/data/catalogos/useCatalogosStore"
import { Search } from "lucide-react"
import styles from "./ProgramacionProceso.module.css"
import { AccionFila, accionProcesar } from "../../../components/funcionalidad/acciones"
import useInventarioMateriasPrimasStore from "../../../store/data/inventarios/materias_primas/useInventarioMateriasPrimas"
import { modal } from "../../../store/useModalStore"
import ProgramacionProcesarLoteModal from "./ProgramacionProcesarLoteModal"

type propsType = {
    isMobile: boolean
}

export default function ProgramacionProcesoInventario({ isMobile }: propsType) {
    const { getInventarioMateriaPrima, lotesActualMateriasPrimas } = useInventarioMateriasPrimasStore();
    const { getMateriaPrima, materiaPrima } = useMateriaPrima()
    const [buscar, setBuscar] = useState<string>('')
    const [mprima, setMprima] = useState<string>('')

    useEffect(() => {
        getInventarioMateriaPrima();
        if (materiaPrima.length === 0) {
            getMateriaPrima();
        }
    }, [getInventarioMateriaPrima, getMateriaPrima])

    // useMemo y no un useEffect que guarde el resultado en state: la lista
    // filtrada se deriva de lo que ya está en memoria, y pasarla por state
    // obligaría a un render de más y dejaría dos fuentes de verdad que se
    // desincronizan cuando el store recarga el inventario.
    //
    // La materia prima se compara por materia_prima_id y no por el nombre que
    // muestra la tabla: el <option> guarda el uuid del catálogo, que es el
    // mismo que trae el lote, así que dos materias primas con nombres
    // parecidos no se pisan.
    const lotesFiltrados = useMemo(() => {
        const texto = buscar.trim().toLowerCase()
        return lotesActualMateriasPrimas.filter((lote) => {
            if (mprima !== '' && lote.materia_prima_id !== mprima) return false
            if (texto === '') return true
            return (
                lote.codigo.toLowerCase().includes(texto) ||
                lote.predio.toLowerCase().includes(texto) ||
                lote.proveedor.toLowerCase().includes(texto)
            )
        })
    }, [lotesActualMateriasPrimas, buscar, mprima])

    // En móvil la materia prima va en el título de la tarjeta y el predio con el
    // proveedor en el subtítulo, que es como se pide el lote en patio; el resto
    // va al grid de metadatos. El saldo ocupa el ancho completo porque es el dato
    // por el que se abre esta vista.
    const columnsMobile: CardColumn<InventarioMateriaPrima>[] = useMemo(() => [
        { key: "codigo", header: "Código", mono: true },
        {
            key: "llegada_en",
            header: "Llegada",
            render: (lote) => formatearFecha(lote.llegada_en),
        },
        {
            key: "peso_ingreso",
            header: "Peso ingreso",
            render: (lote) => formatearPeso(lote.peso_ingreso),
        },
        {
            key: "consumido",
            header: "Consumido",
            render: (lote) => formatearPeso(lote.consumido),
        },
        {
            key: "saldo",
            header: "Saldo",
            fullWidth: true,
            render: (lote) => formatearPeso(lote.saldo),
        },
    ], [])

    const columns: TablaColumn<InventarioMateriaPrima>[] = useMemo(() => [
        { key: "codigo", header: "Código", width: "0.9fr" },
        { key: "materia_prima", header: "Materia prima", width: "1.4fr" },
        { key: "predio", header: "Predio", width: "1.4fr" },
        { key: "proveedor", header: "Proveedor", width: "1.4fr" },
        {
            key: "llegada_en",
            header: "Llegada",
            width: "1.1fr",
            render: (lote) => formatearFecha(lote.llegada_en),
        },
        {
            key: "peso_ingreso",
            header: "Peso ingreso",
            width: "1fr",
            render: (lote) => formatearPeso(lote.peso_ingreso),
        },
        {
            key: "consumido",
            header: "Consumido",
            width: "1fr",
            render: (lote) => formatearPeso(lote.consumido),
        },
        {
            key: "saldo",
            header: "Saldo",
            width: "1fr",
            render: (lote) => formatearPeso(lote.saldo),
        },
    ], [])

    const abrirModal = (lote: InventarioMateriaPrima) => {
        if(!lote) return modal.close;
        modal.show({
            title: "Procesar Lote",
            children: (
                <ProgramacionProcesarLoteModal
                    lote={lote}
                    onCancel={modal.close} />
            )
        })
    }


    const acciones: AccionFila<InventarioMateriaPrima>[] = [accionProcesar(abrirModal)]

    return (
        <>

            <div className={styles["pl-filtros"]}>
                <div className={`${styles["pl-filtro"]} ${styles["pl-filtro--buscar"]}`}>
                    <label className={styles["pl-filtro__label"]} htmlFor="filtro-buscar">Buscar</label>
                    <div className={styles["pl-buscador"]}>
                        <Search />
                        <input
                            id="filtro-buscar"
                            type="text"
                            placeholder="Código, predio o proveedor"
                            value={buscar}
                            onChange={(e) => setBuscar(e.target.value)}
                        />
                    </div>
                </div>

                <div className={`${styles["pl-filtro"]} ${styles["pl-filtro--materia"]}`}>
                    <label className={styles["pl-filtro__label"]} htmlFor="filtro-materia">Materia prima</label>
                    <select
                        id="filtro-materia"
                        className={styles["pl-select"]}
                        value={mprima}
                        onChange={(e) => setMprima(e.target.value)}
                    >
                        <option value="" >Todas</option>
                        {materiaPrima.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isMobile ? (
                <MobileList
                    columns={columnsMobile}
                    data={lotesFiltrados}
                    rowKey={(lote) => lote.lote_id}
                    acciones={acciones}
                    titulo={(lote) => lote.materia_prima}
                    subtitulo={(lote) => `${lote.predio} · ${lote.proveedor}`}
                    emptyMessage="No hay lotes con saldo en inventario."
                />
            ) : (
                <Tabla
                    columns={columns}
                    data={lotesFiltrados}
                    rowKey={(lote) => lote.lote_id}
                    acciones={acciones}
                    emptyTitle="Sin lotes en inventario"
                    emptyMessage="No hay lotes con saldo en inventario."
                />
            )}
        </>
    )
}