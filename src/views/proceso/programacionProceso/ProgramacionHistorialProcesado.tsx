import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { CardColumn } from "../../../components/funcionalidad/listasMobile/CardRow"
import MobileList from "../../../components/funcionalidad/listasMobile/MobileList"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import Paginacion from "../../../components/funcionalidad/tablas/Paginacion"
import usePaginacion from "../../../hooks/usePaginacion"
import useProgramacionProcesoStore from "../../../store/data/proceso/useProgramacionProceso"
import { formatearFecha, formatearPeso } from "../../../helpers/formatos"
import { HistorialProcesado } from "../../../types/proceso/historialProcesado"
import filtrosStyles from "./ProgramacionProceso.module.css"
import styles from "./ProgramacionHistorialProcesado.module.css"

const TAMANO_PAGINA = 20

type propsType = {
    isMobile: boolean
}

// "2 h 15 min" a partir del intervalo de la programación. Si alguna fecha no
// parsea se devuelve "—", igual que formatearFecha. Sin `fin` la programación
// sigue montada.
function formatearDuracion(inicio: string, fin: string | null): string {
    if (fin === null) return "En curso"
    const ms = Date.parse(fin) - Date.parse(inicio)
    if (Number.isNaN(ms) || ms < 0) return "—"

    const minutos = Math.round(ms / 60000)
    const horas = Math.floor(minutos / 60)
    const resto = minutos % 60
    if (horas === 0) return `${resto} min`
    return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
}

function formatearFin(registro: HistorialProcesado): string {
    return registro.fin_en === null ? "En curso" : formatearFecha(registro.fin_en)
}

// Lo pesado en este montaje y cuántos pesajes lo componen.
function renderProcesado(registro: HistorialProcesado) {
    return (
        <span className={styles.procesado}>
            {formatearPeso(registro.kg_pesados)}
            <span className={styles.procesadoDe}>
                {registro.cantidad_pesajes} {registro.cantidad_pesajes === 1 ? "pesaje" : "pesajes"}
            </span>
        </span>
    )
}

export default function ProgramacionHistorialProcesado({ isMobile }: propsType) {
    const { getRegistroProcesoLote, registroProgramacionProceso: historial } = useProgramacionProcesoStore()

    useEffect(() => {
        getRegistroProcesoLote()
    }, [getRegistroProcesoLote])

    const [buscar, setBuscar] = useState<string>("")

    const historialFiltrado = useMemo(() => {
        const texto = buscar.trim().toLowerCase()
        if (texto === "") return historial
        return historial.filter((r) =>
            r.lote_codigo.toLowerCase().includes(texto) ||
            r.materia_prima_nombre.toLowerCase().includes(texto) ||
            r.predio_nombre.toLowerCase().includes(texto)
        )
    }, [historial, buscar])

    // PENDIENTE: la paginación es en el front sobre lo que ya llegó. Cuando el
    // historial crezca, lo normal es que el backend pagine (cursor o página) y
    // aquí solo se pinten los controles.
    const { filas, ...paginacion } = usePaginacion(historialFiltrado, TAMANO_PAGINA)

    // PENDIENTE: decidir qué se ve sin registros. Por ahora se sigue a las otras
    // pestañas —la tabla muestra su estado vacío— y la paginación se oculta,
    // porque "Página 1 de 1" sobre una tabla vacía no dice nada.
    const pie = historialFiltrado.length > 0 ? <Paginacion {...paginacion} /> : null

    const columnsMobile: CardColumn<HistorialProcesado>[] = useMemo(() => [
        {
            key: "inicio_en",
            header: "Inicio",
            render: (r) => formatearFecha(r.inicio_en),
        },
        {
            key: "fin_en",
            header: "Fin",
            render: formatearFin,
        },
        {
            key: "duracion",
            header: "Duración",
            render: (r) => formatearDuracion(r.inicio_en, r.fin_en),
        },
        { key: "predio_nombre", header: "Predio" },
        {
            key: "kg_pesados",
            header: "Procesado",
            fullWidth: true,
            render: renderProcesado,
        },
    ], [])

    const columns: TablaColumn<HistorialProcesado>[] = useMemo(() => [
        {
            key: "lote_codigo",
            header: "Lote",
            width: "0.9fr",
            render: (r) => <span className={styles.codigo}>{r.lote_codigo}</span>,
        },
        { key: "materia_prima_nombre", header: "Materia prima", width: "1.3fr" },
        { key: "predio_nombre", header: "Predio", width: "1.3fr" },
        {
            key: "linea",
            header: "Línea",
            width: "0.6fr",
            render: (r) => <span className={styles.linea}>L{r.linea}</span>,
        },
        {
            key: "inicio_en",
            header: "Inicio",
            width: "1.1fr",
            render: (r) => formatearFecha(r.inicio_en),
        },
        {
            key: "fin_en",
            header: "Fin",
            width: "1.1fr",
            render: formatearFin,
        },
        {
            key: "duracion",
            header: "Duración",
            width: "0.9fr",
            render: (r) => formatearDuracion(r.inicio_en, r.fin_en),
        },
        {
            key: "kg_pesados",
            header: "Procesado",
            width: "1.5fr",
            render: renderProcesado,
        },
    ], [])

    return (
        <>
            <div className={filtrosStyles["pl-filtros"]}>
                <div className={`${filtrosStyles["pl-filtro"]} ${filtrosStyles["pl-filtro--buscar"]}`}>
                    <label className={filtrosStyles["pl-filtro__label"]} htmlFor="historial-buscar">Buscar</label>
                    <div className={filtrosStyles["pl-buscador"]}>
                        <Search />
                        <input
                            id="historial-buscar"
                            type="text"
                            placeholder="Lote, materia prima o proveedor"
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
                        rowKey={(r) => r.id}
                        titulo={(r) => r.lote_codigo}
                        subtitulo={(r) => `${r.materia_prima_nombre} · Línea ${r.linea}`}
                        emptyMessage="Aún no hay lotes procesados."
                    />
                    {pie}
                </>
            ) : (
                <Tabla
                    columns={columns}
                    data={filas}
                    rowKey={(r) => r.id}
                    emptyTitle="Sin historial"
                    emptyMessage="Aún no hay lotes procesados."
                    pie={pie}
                />
            )}
        </>
    )
}
