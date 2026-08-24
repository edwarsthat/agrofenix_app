import z from "zod";
import { ServerEvent } from "../../socketRouter";
import { empleadoSchema } from "../../../types/talento_humano/personal";
import usePersonalStore from "../../../store/data/talento_humano/usePersonalStore";
import { avisarDesincronizado } from "../../../helpers/desincronizado";

const personalEventPayloadSchema = z.object({ data: empleadoSchema })


const personalRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = personalEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("el personal", parsed.error)
                break
            }
            usePersonalStore.getState().eventAddPersonal(parsed.data.data)
            break
        }
        case "update": {
            const parsed = personalEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("el personal", parsed.error)
                break
            }
            usePersonalStore.getState().eventUpdatePersonal(parsed.data.data)
            break
        }
        case "delete": {
            const parsed = personalEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("el personal", parsed.error)
                break
            }
            usePersonalStore.getState().eventDeletePersonal(parsed.data.data.id)
            break
        }
    }
}

export default personalRouter;