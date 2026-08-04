import z from "zod";
import { ServerEvent } from "../socketRouter";
import useCargoPersonalStore from "../../store/data/administracion/useCargoPersonalStore";
import { cargoPersonalSchema, cargoPersonalDeletePayloadSchema } from "../../types/administracion/cargoPersonal";


const cargoPersonalEventPayloadSchema = z.object({ data: cargoPersonalSchema })

const cargoPersonalRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = cargoPersonalEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] cargos_personal:add payload inválido", parsed.error)
                break
            }
            useCargoPersonalStore.getState().eventAddCargoPersonal(parsed.data.data)
            break
        }
        case "update": {
            const parsed = cargoPersonalEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] cargos_personal:update payload inválido", parsed.error)
                break
            }
            useCargoPersonalStore.getState().eventUpdateCargoPersonal(parsed.data.data)
            break
        }
        case "delete": {
            const parsed = cargoPersonalDeletePayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] cargos_personal:delete payload inválido", parsed.error)
                break
            }
            useCargoPersonalStore.getState().eventDeleteCargoPersonal(parsed.data.cargo_id)
            break
        }
    }
}

export default cargoPersonalRouter