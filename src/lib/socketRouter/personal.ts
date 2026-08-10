import z from "zod";
import { ServerEvent } from "../socketRouter";
import { empleadoSchema } from "../../types/administracion/personal";
import usePersonalStore from "../../store/data/administracion/usePersonalStore";

const personalEventPayloadSchema = z.object({ data: empleadoSchema })

const personalRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = personalEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] personal:add payload inválido", parsed.error)
                break
            }
            usePersonalStore.getState().eventAddPersonal(parsed.data.data)
            break
        }
        case "update": {
            const parsed = personalEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] personal:update payload inválido", parsed.error)
                break
            }
            usePersonalStore.getState().eventUpdatePersonal(parsed.data.data)
            break
        }
        case "delete": {
            const parsed = personalEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] personal:delete payload inválido", parsed.error)
                break
            }
            usePersonalStore.getState().eventDeletePersonal(parsed.data.data.id)
            break
        }
    }
}

export default personalRouter;