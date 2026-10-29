import { useEffect, useMemo } from "react"
import { CardColumn } from "../../../components/funcionalidad/listasMobile/CardRow"
import MobileList from "../../../components/funcionalidad/listasMobile/MobileList"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla"
import { formatearFecha, formatearPeso } from "../../../helpers/formatos"
import { ProgramacionProceso } from "../../../types/proceso/programacionProceso"
import { PesajeBascula } from "../../../types/inventarios/materias_primas/pesajesBascula"
import useMovimientoMateriaPrimaStore from "../../../store/data/proceso/usePesajeStore"

// El backend rechaza rangos de más de 31 días. Una programación que lleve más
// abierta que eso se recorta a los últimos 31 en vez de pedir y recibir un 400.
const RANGO_MAXIMO_MS = 31 * 24 * 60 * 60 * 1000

type propsType = {
    isMobile: boolean
    lotesEnProceso: ProgramacionProceso[]
}

export default function ProgramacionPesajesEnCurso({ isMobile, lotesEnProceso }: propsType) {
    const { getRegistroMovimientoMateriaPrima, registroPesaje } = useMovimientoMateriaPrimaStore()

    // El arreglo del store cambia de identidad en cada set aunque traiga las
    // mismas programaciones: se depende de los ids para no repetir la petición.
    const idsEnProceso = lotesEnProceso.map((p) => p.id).join(",")

    useEffect(() => {
        if (lotesEnProceso.length === 0) return

        const hasta = Date.now()
        const inicio = Math.min(...lotesEnProceso.map((p) => Date.parse(p.inicio_en)))
        const desde = Math.max(inicio, hasta - RANGO_MAXIMO_MS)

        getRegistroMovimientoMateriaPrima({
            medido_en: {
                desde: new Date(desde).toISOString(),
                hasta: new Date(hasta).toISOString(),
            },
            // El filtro admite una sola programación. Con varias líneas
            // corriendo se pide por rango desde la que arrancó primero.
            programacion_id: lotesEnProceso.length === 1 ? lotesEnProceso[0].id : null,
        })
    }, [idsEnProceso, getRegistroMovimientoMateriaPrima])

    // Sin programación abierta no hay pesajes "en curso": no se muestran los
    // que hayan quedado en el store de una consulta anterior.
    const pesajes = lotesEnProceso.length === 0 ? [] : registroPesaje

    const columnsMobile: CardColumn<PesajeBascula>[] = useMemo(() => [
        {
            key: "medido_en",
            header: "Hora",
            render: (pesaje) => formatearFecha(pesaje.medido_en),
        },
        { key: "bascula_codigo", header: "Báscula", mono: true },
        {
            key: "peso",
            header: "Peso",
            fullWidth: true,
            render: (pesaje) => formatearPeso(pesaje.peso),
        },
    ], [])

    const columns: TablaColumn<PesajeBascula>[] = useMemo(() => [
        {
            key: "medido_en",
            header: "Hora",
            width: "1.1fr",
            render: (pesaje) => formatearFecha(pesaje.medido_en),
        },
        { key: "lote_codigo", header: "Lote", width: "0.9fr" },
        { key: "materia_prima_nombre", header: "Materia prima", width: "1.4fr" },
        { key: "bascula_codigo", header: "Báscula", width: "0.9fr" },
        {
            key: "peso",
            header: "Peso",
            width: "1fr",
            render: (pesaje) => formatearPeso(pesaje.peso),
        },
        { key: "operario_codigo", header: "Operario", width: "1fr" },
    ], [])

    return isMobile ? (
        <MobileList
            columns={columnsMobile}
            data={pesajes}
            rowKey={(pesaje) => pesaje.id}
            titulo={(pesaje) => pesaje.lote_codigo}
            subtitulo={(pesaje) => pesaje.operario_codigo}
            emptyMessage="Aún no hay pesajes del lote en proceso."
        />
    ) : (
        <Tabla
            columns={columns}
            data={pesajes}
            rowKey={(pesaje) => pesaje.id}
            emptyTitle="Sin pesajes"
            emptyMessage="Aún no hay pesajes del lote en proceso."
        />
    )
}
