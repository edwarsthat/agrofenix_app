import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { CardColumn } from "../../../components/funcionalidad/listasMobile/CardRow"
import MobileList from "../../../components/funcionalidad/listasMobile/MobileList"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import Paginacion from "../../../components/funcionalidad/tablas/Paginacion"
import usePaginacion from "../../../hooks/usePaginacion"
import { formatearFecha, formatearPeso } from "../../../helpers/formatos"
import { InventarioMateriaPrima } from "../../../types/inventarios/materias_primas/lotesInventario"
import filtrosStyles from "../../proceso/programacionProceso/ProgramacionProceso.module.css"
import styles from "./styles/InventarioAllLotes.module.css"

const TAMANO_PAGINA = 20

type propsType = {
    isMobile: boolean
    lotes: InventarioMateriaPrima[]
}

// Lo que queda del lote y de cuánto partió.
function renderSaldo(lote: InventarioMateriaPrima) {
    return (
        <span className={styles.saldo}>
            {formatearPeso(lote.saldo)}
            <span className={styles.saldoDe}>de {formatearPeso(lote.peso_ingreso)}</span>
        </span>
    )
}

export default function InventarioAllLotes({ isMobile, lotes }: propsType) {
    const [buscar, setBuscar] = useState<string>("")

    const lotesFiltrados = useMemo(() => {
        const texto = buscar.trim().toLowerCase()
        if (texto === "") return lotes
        return lotes.filter((lote) =>
            lote.codigo.toLowerCase().includes(texto) ||
            lote.predio.toLowerCase().includes(texto) ||
            lote.proveedor.toLowerCase().includes(texto)
        )
    }, [lotes, buscar])

    const { filas, ...paginacion } = usePaginacion(lotesFiltrados, TAMANO_PAGINA)

    // Sin lotes se oculta: "Página 1 de 1" sobre una tabla vacía no dice nada.
    const pie = lotesFiltrados.length > 0 ? <Paginacion {...paginacion} /> : null

    const columnsMobile: CardColumn<InventarioMateriaPrima>[] = useMemo(() => [
        {
            key: "llegada_en",
            header: "Llegada",
            render: (lote) => formatearFecha(lote.llegada_en),
        },
        { key: "predio", header: "Predio" },
        { key: "proveedor", header: "Proveedor" },
        {
            key: "consumido",
            header: "Consumido",
            render: (lote) => formatearPeso(lote.consumido),
        },
        {
            key: "saldo",
            header: "Disponible",
            fullWidth: true,
            render: renderSaldo,
        },
    ], [])

    const columns: TablaColumn<InventarioMateriaPrima>[] = useMemo(() => [
        {
            key: "codigo",
            header: "Lote",
            width: "0.9fr",
            render: (lote) => <span className={styles.codigo}>{lote.codigo}</span>,
        },
        { key: "materia_prima", header: "Materia prima", width: "1.3fr" },
        { key: "predio", header: "Predio", width: "1.3fr" },
        { key: "proveedor", header: "Proveedor", width: "1.3fr" },
        {
            key: "llegada_en",
            header: "Llegada",
            width: "1.1fr",
            render: (lote) => formatearFecha(lote.llegada_en),
        },
        {
            key: "consumido",
            header: "Consumido",
            width: "1fr",
            render: (lote) => formatearPeso(lote.consumido),
        },
        {
            key: "saldo",
            header: "Disponible",
            width: "1.5fr",
            render: renderSaldo,
        },
    ], [])

    return (
        // El div evita que el gap de .page se sume al margen de la barra de filtros.
        <div>
            <div className={filtrosStyles["pl-filtros"]}>
                <div className={`${filtrosStyles["pl-filtro"]} ${filtrosStyles["pl-filtro--buscar"]}`}>
                    <label className={filtrosStyles["pl-filtro__label"]} htmlFor="lotes-buscar">Buscar</label>
                    <div className={filtrosStyles["pl-buscador"]}>
                        <Search />
                        <input
                            id="lotes-buscar"
                            type="text"
                            placeholder="Lote, predio o proveedor"
                            value={buscar}
                            onChange={(e) => setBuscar(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {isMobile ? (
                <>
                    <MobileList
                        columns={columnsMobile}
                        data={filas}
                        rowKey={(lote) => lote.lote_id}
                        titulo={(lote) => lote.codigo}
                        subtitulo={(lote) => lote.materia_prima}
                        emptyMessage="No hay lotes en inventario."
                    />
                    {pie}
                </>
            ) : (
                <Tabla
                    columns={columns}
                    data={filas}
                    rowKey={(lote) => lote.lote_id}
                    emptyTitle="Sin lotes en inventario"
                    emptyMessage="No hay lotes en inventario."
                    pie={pie}
                />
            )}
        </div>
    )
}
