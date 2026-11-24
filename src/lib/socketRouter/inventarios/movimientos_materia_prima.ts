import z from "zod";
import { ServerEvent } from "../../socketRouter";
import { pesajeBasculaSchema } from "../../../types/inventarios/materias_primas/pesajesBascula";
import useMovimientoMateriaPrimaStore from "../../../store/data/inventarios/materias_primas/usePesajeStore";
import useInventarioMateriasPrimasStore from "../../../store/data/inventarios/materias_primas/useInventarioMateriasPrimas";
import { avisarDesincronizado } from "../../../helpers/desincronizado";

// El listado de pesajes no usa lote_id, pero el inventario lo necesita para
// saber a qué lote descontarle el peso.
const pesajeEventPayloadSchema = z.object({
    data: pesajeBasculaSchema.extend({ lote_id: z.uuidv4() }),
})

const movimientosMateriaPrimaRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        // El evento trae el ingreso con sus ids, sin los nombres ni el saldo que
        // pinta el inventario: se vuelve a pedir en vez de armar la fila a medias.
        case "add": {
            useInventarioMateriasPrimasStore.getState().getInventarioMateriaPrima(false)
            break
        }
        case "consumo": {
            const parsed = pesajeEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("los pesajes de báscula", parsed.error)
                break
            }
            const pesaje = parsed.data.data
            useMovimientoMateriaPrimaStore.getState().eventNewPesaje(pesaje)
            useInventarioMateriasPrimasStore.getState().eventConsumoLote(pesaje.lote_id, pesaje.peso)
            break
        }
    }
}

export default movimientosMateriaPrimaRouter;
