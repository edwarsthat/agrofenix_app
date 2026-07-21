import z from "zod"
import useCargoStore from "../../store/data/administracion/useCargoStore"
import { cargoDeletePayloadSchema, cargoSchema } from "../../types/administracion/cargos"
import { ServerEvent } from "../socketRouter"

const cargoEventPayloadSchema = z.object({ data: cargoSchema })

const cargoRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = cargoEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] cargos:add payload inválido", parsed.error)
                break
            }
            useCargoStore.getState().eventAddCargo(parsed.data.data)
            break
        }
        case "update": {
            const parsed = cargoEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] cargos:update payload inválido", parsed.error)
                break
            }
            useCargoStore.getState().eventUpdateCargo(parsed.data.data)
            break
        }
        case "delete": {
            const parsed = cargoDeletePayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] cargos:delete payload inválido", parsed.error)
                break
            }
            useCargoStore.getState().eventDeleteCargo(parsed.data.cargo_id)
            break
        }
    }
}

export default cargoRouter