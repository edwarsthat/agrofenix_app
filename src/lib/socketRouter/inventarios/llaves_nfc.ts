import z from "zod";
import { ServerEvent } from "../../socketRouter";
import { llaveNfcSchema } from "../../../types/inventarios/llaves_nfc";
import useLlaveNfcStore from "../../../store/data/inventarios/useLlavesNfc";
import usePersonalStore from "../../../store/data/talento_humano/usePersonalStore";

const llaveNfcEventPayloadSchema = z.object({ data: llaveNfcSchema })
const asignacionLLaveEventPayloadSchema = z.object({
    data: z.object({
        llave_id: z.string(),
        empleado_id: z.string()
    })
})
const llavesNfcRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = llaveNfcEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] personal:add payload inválido", parsed.error)
                break
            }
            useLlaveNfcStore.getState().eventAddLlaveNfc(parsed.data.data)
            break
        }
        case "update": {
            const parsed = llaveNfcEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] personal:update payload inválido", parsed.error)
                break
            }
            useLlaveNfcStore.getState().eventUpdateLlaveNfc(parsed.data.data)
            break
        }
        case "asignar": {
            const parsed = asignacionLLaveEventPayloadSchema.safeParse(msg.data)
            console.log(parsed, "datos parseados")
            if (!parsed.success) {
                console.error("[socketRouter] personal:delete payload inválido", parsed.error)
                break
            }
            usePersonalStore.getState().eventLlaveNfc(
                parsed.data.data.empleado_id,
                parsed.data.data.llave_id
            )
            break
        }
    }
}

export default llavesNfcRouter;