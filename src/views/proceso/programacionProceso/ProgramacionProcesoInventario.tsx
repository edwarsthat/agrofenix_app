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
import { modal } from "../../../store/useModalStore"
import ProgramacionProcesarLoteModal from "./ProgramacionProcesarLoteModal"
import { ProgramacionProceso } from "../../../types/proceso/programacionProceso"

type propsType = {
    isMobile: boolean
    lotesActualMateriasPrimas: InventarioMateriaPrima[]
    lotesEnProceso: ProgramacionProceso[]
    codigoLoteEnProceso: string | null
}

export default function ProgramacionProcesoInventario({ isMobile, lotesActualMateriasPrimas, lotesEnProceso, codigoLoteEnProceso }: propsType) {
    const { getMateriaPrima, materiaPrima } = useMateriaPrima()
    const [buscar, setBuscar] = useState<string>('')
    const [mprima, setMprima] = useState<string>('')

    useEffect(() => {
        if (materiaPrima.length === 0) {
            getMateriaPrima();
        }
    }, [getMateriaPrima])


    // Un Set y no un .some() dentro del filtro: así el descarte es una búsqueda
    // por lote en vez de recorrer las programaciones abiertas en cada fila.
    const idsEnProceso = useMemo(
        () => new Set(lotesEnProceso.map((p) => p.lote_id)),
        [lotesEnProceso]
    )

    const lotesFiltrados = useMemo(() => {
        const texto = buscar.trim().toLowerCase()
        return lotesActualMateriasPrimas.filter((lote) => {
            if (idsEnProceso.has(lote.lote_id)) return false
            if (mprima !== '' && lote.materia_prima_id !== mprima) return false
            if (texto === '') return true
            return (
                lote.codigo.toLowerCase().includes(texto) ||
                lote.predio.toLowerCase().includes(texto) ||
                lote.proveedor.toLowerCase().includes(texto)
            )
        })
    }, [lotesActualMateriasPrimas, idsEnProceso, buscar, mprima])


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
        modal.show({
            title: "Procesar Lote",
            children: (
                <ProgramacionProcesarLoteModal
                    lote={lote}
                    codigoLoteEnProceso={codigoLoteEnProceso}
                    onProcesado={modal.close}
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