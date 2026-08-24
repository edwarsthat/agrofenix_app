import z from "zod";
import { ServerEvent } from "../../socketRouter";
import useCargoPersonalStore from "../../../store/data/talento_humano/useCargoPersonalStore";
import { cargoPersonalSchema, cargoPersonalDeletePayloadSchema } from "../../../types/talento_humano/cargoPersonal";
import { avisarDesincronizado } from "../../../helpers/desincronizado";


const cargoPersonalEventPayloadSchema = z.object({ data: cargoPersonalSchema })

const cargoPersonalRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = cargoPersonalEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("los cargos del personal", parsed.error)
                break
            }
            useCargoPersonalStore.getState().eventAddCargoPersonal(parsed.data.data)
            break
        }
        case "update": {
            const parsed = cargoPersonalEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("los cargos del personal", parsed.error)
                break
            }
            useCargoPersonalStore.getState().eventUpdateCargoPersonal(parsed.data.data)
            break
        }
        case "delete": {
            const parsed = cargoPersonalDeletePayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("los cargos del personal", parsed.error)
                break
            }
            useCargoPersonalStore.getState().eventDeleteCargoPersonal(parsed.data.cargo_id)
            break
        }
    }
}

export default cargoPersonalRouter