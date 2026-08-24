import { ServerEvent } from "../../socketRouter";
import { sesionDeletePayloadSchema } from "../../../types/administracion/sesiones";
import useSesionesStore from "../../../store/data/administracion/useSesionesStore";
import { avisarDesincronizado } from "../../../helpers/desincronizado";

const sesionRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "delete": {
            const parsed = sesionDeletePayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("las sesiones", parsed.error)
                break
            }
            useSesionesStore.getState().eventDeleteSesiones(parsed.data.usuario_id)
            break
        }
    }
}

export default sesionRouter
