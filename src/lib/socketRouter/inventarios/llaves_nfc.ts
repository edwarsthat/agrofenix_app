import z from "zod";
import { ServerEvent } from "../../socketRouter";
import { llaveNfcSchema } from "../../../types/inventarios/llaves_nfc";
import useLlaveNfcStore from "../../../store/data/inventarios/useLlavesNfc";

const llaveNfcEventPayloadSchema = z.object({ data: llaveNfcSchema })

const personalRouter = (msg: ServerEvent) => {
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
        // case "update": {
        //     const parsed = personalEventPayloadSchema.safeParse(msg.data)
        //     if (!parsed.success) {
        //         console.error("[socketRouter] personal:update payload inválido", parsed.error)
        //         break
        //     }
        //     usePersonalStore.getState().eventUpdatePersonal(parsed.data.data)
        //     break
        // }
        // case "delete": {
        //     const parsed = personalEventPayloadSchema.safeParse(msg.data)
        //     if (!parsed.success) {
        //         console.error("[socketRouter] personal:delete payload inválido", parsed.error)
        //         break
        //     }
        //     usePersonalStore.getState().eventDeletePersonal(parsed.data.data.id)
        //     break
        // }
    }
}

export default personalRouter;